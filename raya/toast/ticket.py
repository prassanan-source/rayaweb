TICKET_PREFIX = "RY"


def guest_ticket_from_toast_order(order: dict | None) -> str | None:
    if not order or not str(order.get("guid") or "").strip():
        return None
    checks = order.get("checks") or []
    if not checks:
        return None
    raw = checks[0].get("displayNumber")
    if raw is None:
        return None
    digits = str(raw).strip()
    if digits.upper().startswith("RY-"):
        digits = digits[3:]
    elif digits.upper().startswith("RY"):
        digits = digits[2:]
    digits = digits.lstrip("#").strip()
    if not digits:
        return None
    return f"{TICKET_PREFIX}-{digits}"
