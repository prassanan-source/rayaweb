from __future__ import annotations

import re

from raya.menu import find_menu_item
from raya.toast.errors import failure_from_unknown
from raya.toast.ticket import guest_ticket_from_toast_order


def ten_digit_phone(phone: str) -> str | None:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if len(digits) == 10 else None


def valid_email(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", (email or "").strip()))


def place_kitchen_order(inp: dict, toast) -> dict:
    if not toast.is_configured():
        return {
            "ok": False,
            "code": "TOAST_NOT_CONFIGURED",
            "error": "Toast is not connected. No kitchen ticket was created.",
        }

    lines = inp.get("lines") or []
    if not lines or any(int(line.get("quantity") or 0) < 1 for line in lines):
        return {"ok": False, "code": "INVALID_CART", "error": "Add at least one item before placing an order."}

    for line in lines:
        if not find_menu_item(line.get("itemId")):
            return {
                "ok": False,
                "code": "INVALID_CART",
                "error": f"Unknown menu item: {line.get('name')}",
            }

    guest = inp.get("guest") or {}
    phone = ten_digit_phone(guest.get("phone") or "")
    if not (guest.get("firstName") or "").strip() or not (guest.get("lastName") or "").strip() or not phone or not valid_email(
        guest.get("email") or ""
    ):
        return {
            "ok": False,
            "code": "INVALID_GUEST",
            "error": "Name, a 10-digit phone number, and email are required.",
        }

    if inp.get("diningOption") == "delivery":
        delivery = inp.get("delivery") or {}
        if not all(
            (delivery.get(key) or "").strip() for key in ("address1", "city", "state", "zipCode")
        ):
            return {
                "ok": False,
                "code": "INVALID_GUEST",
                "error": "Delivery needs a full street address.",
            }

    try:
        dining_option_guid = toast.resolve_dining_option_guid(inp["diningOption"])
    except Exception as error:
        return failure_from_unknown(
            error,
            {"ok": False, "code": "TOAST_REJECTED", "error": "Toast dining option is unavailable."},
        )

    selections = []
    try:
        notes = (inp.get("notes") or "").strip()
        for index, line in enumerate(lines):
            mapped = toast.resolve_menu_item(line["name"])
            selection = {
                "entityType": "MenuItemSelection",
                "item": {"guid": mapped["itemGuid"], "entityType": "MenuItem"},
                "itemGroup": {"guid": mapped["groupGuid"], "entityType": "MenuGroup"},
                "quantity": line["quantity"],
            }
            if index == 0 and notes:
                selection["specialRequest"] = notes
            selections.append(selection)
    except Exception as error:
        return failure_from_unknown(
            error,
            {"ok": False, "code": "TOAST_REJECTED", "error": "A menu item is not available in Toast."},
        )

    payload = {
        "entityType": "Order",
        "diningOption": {"guid": dining_option_guid, "entityType": "DiningOption"},
        "checks": [
            {
                "entityType": "Check",
                "tabName": f"Raya Web - {guest['firstName'].strip()} {guest['lastName'].strip()}",
                "customer": {
                    "firstName": guest["firstName"].strip(),
                    "lastName": guest["lastName"].strip(),
                    "phone": phone,
                    "email": guest["email"].strip(),
                },
                "selections": selections,
            }
        ],
    }

    if inp.get("diningOption") == "delivery" and inp.get("delivery"):
        delivery = inp["delivery"]
        payload["deliveryInfo"] = {
            "address1": delivery["address1"].strip(),
            "address2": (delivery.get("address2") or "").strip() or None,
            "city": delivery["city"].strip(),
            "state": delivery["state"].strip(),
            "zipCode": delivery["zipCode"].strip(),
        }

    try:
        posted = toast.post_order(payload)
    except Exception as error:
        return failure_from_unknown(
            error,
            {"ok": False, "code": "TOAST_REJECTED", "error": "Toast rejected the order."},
        )

    if not posted or not posted.get("guid"):
        return {
            "ok": False,
            "code": "TOAST_REJECTED",
            "error": "Toast did not accept the order. No kitchen ticket was created.",
        }

    try:
        verified = toast.get_order(posted["guid"])
    except Exception as error:
        return failure_from_unknown(
            error,
            {"ok": False, "code": "TOAST_NOT_CONFIRMED", "error": "Toast did not confirm the kitchen ticket."},
        )

    if not verified or verified.get("guid") != posted["guid"]:
        return {
            "ok": False,
            "code": "TOAST_NOT_CONFIRMED",
            "error": "Toast did not confirm the kitchen ticket. No order number was issued.",
        }

    display_number = guest_ticket_from_toast_order(verified)
    if not display_number:
        return {
            "ok": False,
            "code": "TOAST_NO_TICKET",
            "error": "Toast saved the order but did not return a check number yet.",
        }

    return {"ok": True, "toastGuid": verified["guid"], "displayNumber": display_number}
