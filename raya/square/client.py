from __future__ import annotations

import re

import requests

from raya.config import Config
from raya.square.errors import SquareApiError, classify_square_http

_cached_menu: list[dict] | None = None


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
    return requests.request(
        method,
        f"{cfg['host']}{path}",
        json=json_body,
        params=params,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {cfg['access_token']}",
            "Square-Version": "2024-12-18",
        },
        timeout=30,
    )


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


def load_menu() -> list[dict]:
    global _cached_menu
    if _cached_menu:
        return _cached_menu
    items: list[dict] = []
    cursor = None
    while True:
        params = {"types": "ITEM"}
        if cursor:
            params["cursor"] = cursor
        response = _square_fetch("/v2/catalog/list", params=params)
        if not response.ok:
            raise classify_square_http(response.status_code, "catalog read", response.text)
        body = response.json()
        items.extend(flatten_catalog_items(body.get("objects") or []))
        cursor = body.get("cursor")
        if not cursor:
            break
    if not items:
        raise RuntimeError("Square returned an empty catalog.")
    _cached_menu = items
    return _cached_menu


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

    def post_order(self, order: dict) -> dict | None:
        response = _square_fetch("/v2/orders", method="POST", json_body=order)
        if not response.ok:
            raise classify_square_http(response.status_code, "order create", response.text)
        return (response.json() or {}).get("order")

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
