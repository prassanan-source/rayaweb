from __future__ import annotations

from flask import session

from raya.menu import find_menu_item, item_id

BAG_KEY = "raya_bag"


def parse_bag(raw: list | None) -> list[dict]:
    if not isinstance(raw, list):
        return []
    lines = []
    for line in raw:
        if not isinstance(line, dict):
            continue
        key = line.get("itemId")
        qty = int(line.get("quantity") or 0)
        item = find_menu_item(key) if key else None
        if not item or qty < 1:
            continue
        lines.append(
            {
                "itemId": item_id(item["name"]),
                "name": item["name"],
                "price": item["price"],
                "quantity": qty,
            }
        )
    return lines


def read_bag() -> list[dict]:
    return parse_bag(session.get(BAG_KEY))


def write_bag(lines: list[dict]) -> None:
    session[BAG_KEY] = lines
    session.modified = True


def add_line(lines: list[dict], item: dict) -> list[dict]:
    key = item_id(item["name"])
    for line in lines:
        if line["itemId"] == key:
            line["quantity"] += 1
            return lines
    return lines + [
        {"itemId": key, "name": item["name"], "price": item["price"], "quantity": 1}
    ]


def bag_count(lines: list[dict] | None = None) -> int:
    return sum(line["quantity"] for line in (lines if lines is not None else read_bag()))


def bag_subtotal(lines: list[dict] | None = None) -> float:
    return sum(line["price"] * line["quantity"] for line in (lines if lines is not None else read_bag()))
