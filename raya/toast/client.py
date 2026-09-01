from __future__ import annotations

import re
import time

import requests

from raya.config import Config
from raya.toast.diagnose import privilege_message, read_token_scopes
from raya.toast.errors import ToastApiError, classify_toast_http

_cached_token: dict | None = None
_cached_menu: list[dict] | None = None
_cached_dining: dict | None = None


def toast_config() -> dict:
    return {
        "host": Config.TOAST_API_HOST.rstrip("/"),
        "client_id": Config.TOAST_CLIENT_ID,
        "client_secret": Config.TOAST_CLIENT_SECRET,
        "restaurant_guid": Config.TOAST_RESTAURANT_GUID,
    }


def toast_is_configured() -> bool:
    cfg = toast_config()
    return bool(cfg["client_id"] and cfg["client_secret"] and cfg["restaurant_guid"])


def _toast_fetch(path: str, token: str, method: str = "GET", json_body=None) -> requests.Response:
    cfg = toast_config()
    return requests.request(
        method,
        f"{cfg['host']}{path}",
        json=json_body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "Toast-Restaurant-External-ID": cfg["restaurant_guid"],
        },
        timeout=30,
    )


def authenticate() -> str:
    global _cached_token
    cfg = toast_config()
    if not cfg["client_id"] or not cfg["client_secret"]:
        raise ToastApiError("Toast API credentials are not configured.", "TOAST_NOT_CONFIGURED")
    now_ms = int(time.time() * 1000)
    if _cached_token and _cached_token["expires_at"] > now_ms + 30_000:
        return _cached_token["access_token"]

    response = requests.post(
        f"{cfg['host']}/authentication/v1/authentication/login",
        json={
            "clientId": cfg["client_id"],
            "clientSecret": cfg["client_secret"],
            "userAccessType": "TOAST_MACHINE_CLIENT",
        },
        headers={"Content-Type": "application/json"},
        timeout=30,
    )
    if not response.ok:
        raise classify_toast_http(response.status_code, "login", response.text)

    body = response.json()
    access_token = (body.get("token") or {}).get("accessToken")
    if not access_token:
        raise ToastApiError(
            "Toast login HTTP was OK but no access token came back. The client ID/secret may be for a different API product.",
            "TOAST_AUTH_FAILED",
            response.status_code,
        )

    scopes = read_token_scopes(access_token)
    if scopes and "orders.orders:write" not in scopes:
        raise ToastApiError(
            f"{privilege_message(scopes)} No kitchen ticket was created.",
            "TOAST_FORBIDDEN",
        )

    expires_in = (body.get("token") or {}).get("expiresIn") or 3600
    _cached_token = {
        "access_token": access_token,
        "expires_at": now_ms + expires_in * 1000,
    }
    return access_token


def _normalize_name(value: str) -> str:
    value = value.lower().replace("biriyani", "biryani")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def _as_record(value) -> dict | None:
    return value if isinstance(value, dict) else None


def flatten_menu_items(node, group_guid: str = "") -> list[dict]:
    record = _as_record(node)
    if not record:
        return []

    items: list[dict] = []
    guid = record.get("guid") if isinstance(record.get("guid"), str) else ""
    name = record.get("name") if isinstance(record.get("name"), str) else ""
    groups = record.get("menuGroups") or record.get("groups") or record.get("subgroups") or []
    menu_items = record.get("menuItems") or record.get("items") or []
    next_group = guid if record.get("itemType") == "GROUP" or record.get("entityType") == "MenuGroup" else group_guid

    for item in menu_items:
        row = _as_record(item)
        if not row:
            continue
        item_guid = row.get("guid") if isinstance(row.get("guid"), str) else ""
        item_name = row.get("name") if isinstance(row.get("name"), str) else ""
        if item_guid and item_name:
            items.append({"name": item_name, "itemGuid": item_guid, "groupGuid": next_group or group_guid})
        items.extend(flatten_menu_items(item, next_group or group_guid))

    for group in groups:
        items.extend(flatten_menu_items(group, next_group or group_guid or guid))

    if isinstance(record.get("menus"), list):
        for menu in record["menus"]:
            items.extend(flatten_menu_items(menu, group_guid))

    if (
        guid
        and name
        and group_guid
        and (record.get("itemType") == "ITEM" or record.get("entityType") == "MenuItem")
    ):
        items.append({"name": name, "itemGuid": guid, "groupGuid": group_guid})

    return items


def load_menu(token: str) -> list[dict]:
    global _cached_menu
    if _cached_menu:
        return _cached_menu
    response = _toast_fetch("/menus/v3/menus", token)
    if not response.ok:
        raise classify_toast_http(response.status_code, "menu read", response.text)
    _cached_menu = flatten_menu_items(response.json())
    if not _cached_menu:
        raise RuntimeError("Toast returned an empty menu.")
    return _cached_menu


def load_dining_options(token: str) -> dict:
    global _cached_dining
    if _cached_dining and _cached_dining.get("pickup") and _cached_dining.get("delivery"):
        return _cached_dining
    response = _toast_fetch("/config/v2/diningOptions", token)
    if not response.ok:
        raise classify_toast_http(response.status_code, "dining-option read", response.text)
    body = response.json()
    pickup = next((row.get("guid") for row in body if row.get("behavior") == "TAKE_OUT"), None)
    if not pickup:
        pickup = next(
            (row.get("guid") for row in body if re.search(r"take\s*out|pickup", row.get("name") or "", re.I)),
            None,
        )
    delivery = next((row.get("guid") for row in body if row.get("behavior") == "DELIVERY"), None)
    if not delivery:
        delivery = next(
            (row.get("guid") for row in body if re.search(r"delivery", row.get("name") or "", re.I)),
            None,
        )
    _cached_dining = {"pickup": pickup, "delivery": delivery}
    return _cached_dining


class ToastApi:
    def is_configured(self) -> bool:
        return toast_is_configured()

    def resolve_dining_option_guid(self, mode: str) -> str:
        token = authenticate()
        options = load_dining_options(token)
        guid = options.get("delivery") if mode == "delivery" else options.get("pickup")
        if not guid:
            raise RuntimeError(f"Toast has no {mode} dining option configured.")
        return guid

    def resolve_menu_item(self, name: str) -> dict:
        token = authenticate()
        items = load_menu(token)
        needle = _normalize_name(name)
        match = next((item for item in items if _normalize_name(item["name"]) == needle), None)
        if not match:
            raise RuntimeError(
                f"“{name}” is not on the Toast menu, so it cannot be sent to the kitchen."
            )
        return match

    def post_order(self, order: dict) -> dict | None:
        token = authenticate()
        response = _toast_fetch("/orders/v2/orders", token, method="POST", json_body=order)
        if not response.ok:
            raise classify_toast_http(response.status_code, "order create", response.text)
        return response.json()

    def get_order(self, guid: str) -> dict | None:
        token = authenticate()
        response = _toast_fetch(f"/orders/v2/orders/{guid}", token)
        if response.status_code == 404:
            return None
        if not response.ok:
            raise classify_toast_http(response.status_code, "order lookup", response.text)
        return response.json()


toast_api = ToastApi()


def load_confirmed_toast_order(guid: str) -> dict | None:
    if not toast_is_configured():
        return None
    order = toast_api.get_order(guid)
    if not order or order.get("guid") != guid:
        return None
    return order
