from __future__ import annotations

import re
import uuid

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from raya.config import Config
from raya.square.errors import SquareApiError, classify_square_http

_cached_menu: list[dict] | None = None
_session = requests.Session()
_session.mount(
    "https://",
    HTTPAdapter(
        max_retries=Retry(
            total=3,
            connect=3,
            read=3,
            status=3,
            backoff_factor=0.75,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=None,
            respect_retry_after_header=True,
        )
    ),
)


def square_config() -> dict:
    return {
        "host": Config.SQUARE_API_HOST.rstrip("/"),
        "access_token": Config.SQUARE_ACCESS_TOKEN,
        "location_id": Config.SQUARE_LOCATION_ID,
    }


def square_is_configured() -> bool:
    cfg = square_config()
    return bool(cfg["access_token"] and cfg["location_id"])


def _square_fetch(path: str, method: str = "GET", json_body=None, params=None) -> requests.Response:
    cfg = square_config()
    if not cfg["access_token"]:
        raise SquareApiError("Square API credentials are not configured.", "SQUARE_NOT_CONFIGURED")
    try:
        return _session.request(
            method,
            f"{cfg['host']}{path}",
            json=json_body,
            params=params,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {cfg['access_token']}",
                "Square-Version": Config.SQUARE_API_VERSION,
            },
            timeout=(10, 60),
        )
    except requests.RequestException as error:
        raise SquareApiError(
            "Square could not be reached after retries. Check outbound HTTPS access to "
            "connect.squareup.com from the web server, then try again.",
            "SQUARE_NETWORK_ERROR",
        ) from error


def _normalize_name(value: str) -> str:
    value = value.lower().replace("biriyani", "biryani")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def flatten_catalog_items(objects: list) -> list[dict]:
    items: list[dict] = []
    for obj in objects or []:
        if not isinstance(obj, dict):
            continue
        data = obj.get("item_data") or {}
        name = data.get("name") if isinstance(data.get("name"), str) else ""
        for variation in data.get("variations") or []:
            if not isinstance(variation, dict):
                continue
            variation_id = variation.get("id") if isinstance(variation.get("id"), str) else ""
            variation_name = (variation.get("item_variation_data") or {}).get("name") or "Regular"
            if variation_id and name:
                display = name if str(variation_name).lower() in {"regular", "default", ""} else f"{name} {variation_name}"
                items.append({"name": display, "itemName": name, "variationId": variation_id})
    return items


def load_catalog_objects() -> list[dict]:
    objects: list[dict] = []
    cursor = None
    while True:
        params = {"types": "ITEM,CATEGORY"}
        if cursor:
            params["cursor"] = cursor
        response = _square_fetch("/v2/catalog/list", params=params)
        if not response.ok:
            raise classify_square_http(response.status_code, "catalog read", response.text)
        body = response.json()
        objects.extend(body.get("objects") or [])
        cursor = body.get("cursor")
        if not cursor:
            break
    return objects


def load_menu() -> list[dict]:
    global _cached_menu
    if _cached_menu:
        return _cached_menu
    items = flatten_catalog_items(load_catalog_objects())
    if not items:
        raise RuntimeError("Square returned an empty catalog.")
    _cached_menu = items
    return _cached_menu


def sync_web_menu(categories: list[dict]) -> dict:
    """Create website items that do not already exist in the Square catalog."""
    global _cached_menu
    existing_objects = load_catalog_objects()
    existing_names = {
        _normalize_name((obj.get("item_data") or {}).get("name") or "")
        for obj in existing_objects
        if obj.get("type") == "ITEM"
    }
    location_id = square_config()["location_id"]
    if not location_id:
        raise SquareApiError("Square location ID is not configured.", "SQUARE_NOT_CONFIGURED")

    creates: list[dict] = []
    created_names: list[str] = []
    existing_count = 0
    for category in categories:
        for item in category.get("items") or []:
            name = str(item.get("name") or "").strip()
            if not name:
                continue
            if _normalize_name(name) in existing_names:
                existing_count += 1
                continue
            item_ref = f"#{uuid.uuid4().hex}"
            creates.append(
                {
                    "type": "ITEM",
                    "id": item_ref,
                    "present_at_all_locations": False,
                    "present_at_location_ids": [location_id],
                    "item_data": {
                        "name": name,
                        "description": str(item.get("description") or "").strip(),
                        "variations": [
                            {
                                "type": "ITEM_VARIATION",
                                "id": f"#{uuid.uuid4().hex}",
                                "present_at_all_locations": False,
                                "present_at_location_ids": [location_id],
                                "item_variation_data": {
                                    "item_id": item_ref,
                                    "name": "Regular",
                                    "pricing_type": "FIXED_PRICING",
                                    "price_money": {
                                        "amount": round(float(item["price"]) * 100),
                                        "currency": "USD",
                                    },
                                },
                            }
                        ],
                    },
                }
            )
            created_names.append(name)

    if creates:
        response = _square_fetch(
            "/v2/catalog/batch-upsert",
            method="POST",
            json_body={
                "idempotency_key": str(uuid.uuid4()),
                "batches": [{"objects": creates}],
            },
        )
        if not response.ok:
            raise classify_square_http(response.status_code, "catalog sync", response.text)
        _cached_menu = None

    return {
        "created": created_names,
        "created_count": len(created_names),
        "existing_count": existing_count,
    }


class SquareApi:
    def is_configured(self) -> bool:
        return square_is_configured()

    def location_id(self) -> str:
        location_id = square_config()["location_id"]
        if not location_id:
            raise RuntimeError("Square location ID is not configured.")
        return location_id

    def resolve_fulfillment_type(self, mode: str) -> str:
        return "DELIVERY" if mode == "delivery" else "PICKUP"

    def resolve_menu_item(self, name: str) -> dict:
        items = load_menu()
        needle = _normalize_name(name)
        match = next(
            (
                item
                for item in items
                if _normalize_name(item["name"]) == needle or _normalize_name(item["itemName"]) == needle
            ),
            None,
        )
        if not match:
            raise RuntimeError(
                f"“{name}” is not on the Square catalog, so it cannot be sent to the kitchen."
            )
        return match

    def create_payment_link(self, checkout: dict) -> dict | None:
        response = _square_fetch(
            "/v2/online-checkout/payment-links",
            method="POST",
            json_body=checkout,
        )
        if not response.ok:
            raise classify_square_http(
                response.status_code, "payment-link create", response.text
            )
        return (response.json() or {}).get("payment_link")

    def get_order(self, order_id: str) -> dict | None:
        response = _square_fetch(f"/v2/orders/{order_id}")
        if response.status_code == 404:
            return None
        if not response.ok:
            raise classify_square_http(response.status_code, "order lookup", response.text)
        return (response.json() or {}).get("order")


square_api = SquareApi()


def load_confirmed_square_order(order_id: str) -> dict | None:
    if not square_is_configured():
        return None
    order = square_api.get_order(order_id)
    if not order or order.get("id") != order_id:
        return None
    return order


def square_order_is_paid(order: dict | None) -> bool:
    if not order:
        return False
    tenders = order.get("tenders") or []
    if not any(tender.get("payment_id") for tender in tenders):
        return False
    amount_due = (order.get("net_amounts_due_money") or {}).get("amount")
    return amount_due in (None, 0)
