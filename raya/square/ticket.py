import re

TICKET_PREFIX = "RY"


def guest_ticket_from_square_order(order: dict | None) -> str | None:
    if not order:
        return None
    order_id = str(order.get("id") or "").strip()
    if not order_id:
        return None
    raw = str(order.get("ticket_name") or "").strip()
    if raw.upper().startswith("RY-"):
        raw = raw[3:]
    elif raw.upper().startswith("RY"):
        raw = raw[2:]
    raw = raw.lstrip("#").strip()
    if raw.isdigit():
        return f"{TICKET_PREFIX}-{raw}"
    code = re.sub(r"[^A-Za-z0-9]", "", order_id)[-4:]
    if not code:
        return None
    return f"{TICKET_PREFIX}-{code.upper()}"
