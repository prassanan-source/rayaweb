from datetime import datetime
from zoneinfo import ZoneInfo

from raya.restaurant import restaurant


def _parse_hm(value: str) -> int:
    hours, minutes = value.split(":")
    return int(hours) * 60 + int(minutes)


def dublin_parts(now: datetime | None = None) -> dict:
    now = now or datetime.now(ZoneInfo(restaurant["timezone"]))
    if now.tzinfo is None:
        now = now.replace(tzinfo=ZoneInfo("UTC")).astimezone(ZoneInfo(restaurant["timezone"]))
    else:
        now = now.astimezone(ZoneInfo(restaurant["timezone"]))
    return {
        "weekday": now.strftime("%A"),
        "minutes": now.hour * 60 + now.minute,
    }


def is_open_now(now: datetime | None = None) -> bool:
    minutes = dublin_parts(now)["minutes"]
    return _parse_hm(restaurant["hours"]["open"]) <= minutes < _parse_hm(restaurant["hours"]["close"])


def is_online_ordering_open(now: datetime | None = None) -> bool:
    minutes = dublin_parts(now)["minutes"]
    return _parse_hm(restaurant["hours"]["open"]) <= minutes < _parse_hm(
        restaurant["hours"]["online_close"]
    )


def status_copy(now: datetime | None = None) -> dict:
    if is_open_now(now):
        close_label = restaurant["hours"]["display"].split("–")[-1].strip()
        return {"open": True, "label": "Open now", "detail": f"Kitchen until {close_label}"}
    return {"open": False, "label": "Closed now", "detail": "We open daily at 11:30 AM"}
