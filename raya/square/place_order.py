from __future__ import annotations

import re
import uuid

from raya.menu import find_menu_item
from raya.square.errors import failure_from_unknown


def ten_digit_phone(phone: str) -> str | None:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if len(digits) == 10 else None


def valid_email(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", (email or "").strip()))


def place_kitchen_order(inp: dict, square) -> dict:
    if not square.is_configured():
        return {
            "ok": False,
            "code": "SQUARE_NOT_CONFIGURED",
            "error": "Square is not connected. No kitchen ticket was created.",
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
            (delivery.get(key) or "").strip()
            for key in ("address1", "city", "state", "zipCode")
        ):
            return {
                "ok": False,
                "code": "INVALID_GUEST",
                "error": "Delivery needs a full street address.",
            }

    try:
        fulfillment_type = square.resolve_fulfillment_type(inp["diningOption"])
    except Exception as error:
        return failure_from_unknown(
            error,
            {"ok": False, "code": "SQUARE_REJECTED", "error": "Square dining option is unavailable."},
        )

    line_items = []
    try:
        notes = (inp.get("notes") or "").strip()
        for index, line in enumerate(lines):
            mapped = square.resolve_menu_item(line["name"])
            item = {
                "catalog_object_id": mapped["variationId"],
                "quantity": str(line["quantity"]),
            }
            if index == 0 and notes:
                item["note"] = notes
            line_items.append(item)
    except Exception as error:
        return failure_from_unknown(
            error,
            {"ok": False, "code": "SQUARE_REJECTED", "error": "A menu item is not available in Square."},
        )

    display_name = f"{guest['firstName'].strip()} {guest['lastName'].strip()}"
    local_order_id = str(inp.get("localOrderId") or "").strip()
    recipient = {
        "display_name": display_name,
        "phone_number": f"+1{phone}",
        "email_address": guest["email"].strip(),
    }

    fulfillment: dict = {"type": fulfillment_type, "state": "PROPOSED"}
    if fulfillment_type == "DELIVERY":
        delivery = inp["delivery"]
        fulfillment["delivery_details"] = {
            "schedule_type": "ASAP",
            "recipient": {
                **recipient,
                "address": {
                    "address_line_1": delivery["address1"].strip(),
                    "address_line_2": (delivery.get("address2") or "").strip() or None,
                    "locality": delivery["city"].strip(),
                    "administrative_district_level_1": delivery["state"].strip(),
                    "postal_code": delivery["zipCode"].strip(),
                    "country": "US",
                },
            }
        }
    else:
        fulfillment["pickup_details"] = {
            "schedule_type": "ASAP",
            "recipient": recipient,
        }

    payload = {
        "idempotency_key": str(uuid.uuid4()),
        "order": {
            "location_id": square.location_id(),
            "reference_id": local_order_id or "raya-web",
            "ticket_name": (
                f"{local_order_id} - {display_name}"
                if local_order_id
                else f"Raya Web - {display_name}"
            ),
            "line_items": line_items,
            "fulfillments": [fulfillment],
        },
    }

    try:
        payment_link = square.create_payment_link(payload)
    except Exception as error:
        return failure_from_unknown(
            error,
            {
                "ok": False,
                "code": "SQUARE_REJECTED",
                "error": "Square could not start secure payment.",
            },
        )

    if not payment_link or not payment_link.get("order_id") or not payment_link.get("url"):
        return {
            "ok": False,
            "code": "SQUARE_REJECTED",
            "error": "Square did not return a secure checkout link. No order was placed.",
        }

    return {
        "ok": True,
        "orderId": payment_link["order_id"],
        "checkoutUrl": payment_link["url"],
    }
