from raya.config import Config

restaurant = {
    "name": "Raya",
    "tagline": "Essence of South India",
    "headline": "Spice-kissed & soulful",
    "description": (
        "Authentic South Indian cuisine in Dublin, CA — dum biryani on seeraga samba rice, "
        "crisp dosas, and Chettinad spice, cooked the way it is at home."
    ),
    "phone": "925-235-3672",
    "phone_href": "tel:+19252353672",
    "email": "rayacuisines@gmail.com",
    "email_href": "mailto:rayacuisines@gmail.com",
    "address": {
        "line1": "7150 Village Pkwy",
        "city": "Dublin",
        "state": "CA",
        "zip": "94568",
        "country": "United States",
    },
    "timezone": "America/Los_Angeles",
    "hours": {
        "label": "Open daily",
        "open": "11:30",
        "close": "22:00",
        "display": "11:30 AM – 10:00 PM",
        "toast_close": "21:45",
        "toast_display": "11:30 AM – 9:45 PM",
    },
    "service_area": [
        "Dublin",
        "Pleasanton",
        "Livermore",
        "San Ramon",
        "Danville",
        "Castro Valley",
        "Fremont",
        "Union City",
        "Hayward",
        "Sunol",
    ],
    "toast": {
        "guid": Config.TOAST_RESTAURANT_GUID,
        "slug": Config.TOAST_SLUG,
        "location_name": "Raya - 7150 Village Pkwy",
    },
}


def formatted_address() -> str:
    addr = restaurant["address"]
    return f"{addr['line1']}, {addr['city']}, {addr['state']} {addr['zip']}"


def full_address_lines() -> list[str]:
    addr = restaurant["address"]
    return [addr["line1"], f"{addr['city']}, {addr['state']} {addr['zip']}", addr["country"]]


def toast_order_url(mode: str | None = None) -> str:
    base = f"https://order.toasttab.com/online/{restaurant['toast']['slug']}"
    if mode == "pickup":
        return f"{base}?diningOption=takeout"
    if mode == "delivery":
        return f"{base}?diningOption=delivery"
    return base


def google_maps_url() -> str:
    from urllib.parse import quote

    return f"https://www.google.com/maps/search/?api=1&query={quote(formatted_address())}"


def google_maps_embed_url() -> str:
    from urllib.parse import quote

    return f"https://maps.google.com/maps?q={quote(formatted_address())}&z=16&output=embed"
