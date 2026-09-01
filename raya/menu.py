from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent / "data" / "menu.json"


@lru_cache
def _data() -> dict:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def menu_categories() -> list[dict]:
    return _data()["menuCategories"]


def featured_dishes() -> list[dict]:
    return _data()["featuredDishes"]


def format_price(price: float) -> str:
    return f"${price:,.2f}"


def item_id(name: str) -> str:
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in name)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def find_menu_item(item_key: str) -> dict | None:
    for category in menu_categories():
        for item in category["items"]:
            if item_id(item["name"]) == item_key:
                return item
    return None


def filtered_categories(diet: str | None) -> list[dict]:
    if not diet or diet == "all":
        return menu_categories()
    result = []
    for category in menu_categories():
        items = [item for item in category["items"] if item.get("dietary") == diet]
        if items:
            result.append({**category, "items": items})
    return result
