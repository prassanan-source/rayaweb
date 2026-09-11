from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, url_for

from raya.bag import add_line, bag_count, bag_subtotal, read_bag, write_bag
from raya.hours import status_copy
from raya.menu import featured_dishes, filtered_categories, find_menu_item, format_price, item_id
from raya.restaurant import (
    formatted_address,
    full_address_lines,
    google_maps_embed_url,
    google_maps_url,
    restaurant,
    square_order_url,
)
from raya.square.client import load_confirmed_square_order, square_api, square_is_configured
from raya.square.diagnose import credential_inventory, missing_credential_message
from raya.square.place_order import place_kitchen_order
from raya.square.ticket import guest_ticket_from_square_order

bp = Blueprint("main", __name__)

FAQS = [
    {
        "q": "What kind of food does Raya serve?",
        "a": "South Indian cooking: seeraga samba biryani, dosas and idli, Chettinad and Andhra gravies, kothu parotta, and Tamil Nadu starters like Chicken 65 and Pallipalayam chicken.",
    },
    {
        "q": "Do you offer pickup and delivery?",
        "a": "Yes. Order pickup or delivery on Square — orders go straight to the kitchen, with no marketplace commission. You can also call us.",
    },
    {
        "q": "Where are you, and what areas do you deliver to?",
        "a": (
            f"We're at {restaurant['address']['line1']} in Dublin. We serve Dublin, Pleasanton, "
            "Livermore, San Ramon, Danville, Castro Valley, Fremont, Union City, Hayward, and Sunol."
        ),
    },
    {
        "q": "What are your hours?",
        "a": f"Dine-in is {restaurant['hours']['display']} daily. Online ordering on Square runs until 9:45 PM.",
    },
    {
        "q": "Is there vegetarian food?",
        "a": "Yes — dosas, idli, veg biryani, veg kurma, gobi manchurian, pakora, and a vegetarian combo. Filter the menu for vegetarian dishes.",
    },
]

DIET_FILTERS = [
    ("all", "All"),
    ("veg", "Vegetarian"),
    ("chicken", "Chicken"),
    ("mutton", "Mutton"),
    ("egg", "Egg"),
]

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _ctx(**extra):
    lines = read_bag()
    base = {
        "restaurant": restaurant,
        "formatted_address": formatted_address(),
        "square_order_url": square_order_url,
        "status": status_copy(),
        "bag_count": bag_count(lines),
        "bag_lines": lines,
        "bag_subtotal": bag_subtotal(lines),
        "format_price": format_price,
        "item_id": item_id,
    }
    base.update(extra)
    return base


@bp.app_context_processor
def inject_globals():
    return {
        "restaurant": restaurant,
        "formatted_address": formatted_address(),
        "square_order_url": square_order_url,
        "status": status_copy(),
        "bag_count": bag_count(),
    }


@bp.get("/")
def home():
    return render_template(
        "home.html",
        featured=featured_dishes(),
        faqs=FAQS,
        google_maps_url=google_maps_url(),
        **_ctx(),
    )


@bp.get("/menu")
def menu():
    diet = request.args.get("diet") or "all"
    if diet not in {key for key, _ in DIET_FILTERS}:
        diet = "all"
    categories = filtered_categories(diet)
    return render_template(
        "menu.html",
        diet=diet,
        filters=DIET_FILTERS,
        categories=categories,
        **_ctx(),
    )


@bp.get("/visit")
def visit():
    return render_template(
        "visit.html",
        days=WEEKDAYS,
        address_lines=full_address_lines(),
        maps_url=google_maps_url(),
        maps_embed=google_maps_embed_url(),
        **_ctx(),
    )


@bp.get("/order")
def order():
    return render_template("order.html", **_ctx())


@bp.get("/order/checkout")
def checkout():
    dining = request.args.get("dining") or "pickup"
    if dining not in {"pickup", "delivery"}:
        dining = "pickup"
    return render_template("checkout.html", dining=dining, **_ctx())


@bp.post("/cart/add")
def cart_add():
    item = find_menu_item(request.form.get("itemId") or "")
    if item:
        write_bag(add_line(read_bag(), item))
        flash(f"Added {item['name']} to your bag.", "ok")
    next_url = request.form.get("next") or url_for("main.menu")
    return redirect(next_url)


@bp.post("/cart/update")
def cart_update():
    item_key = request.form.get("itemId") or ""
    try:
        quantity = int(request.form.get("quantity") or 0)
    except ValueError:
        quantity = 0
    current = read_bag()
    if quantity <= 0:
        write_bag([line for line in current if line["itemId"] != item_key])
    else:
        write_bag(
            [
                {**line, "quantity": quantity} if line["itemId"] == item_key else line
                for line in current
            ]
        )
    return redirect(request.form.get("next") or url_for("main.checkout"))


@bp.post("/order/place")
def place_order():
    dining_option = "delivery" if request.form.get("diningOption") == "delivery" else "pickup"
    lines = [{"itemId": line["itemId"], "name": line["name"], "quantity": line["quantity"]} for line in read_bag()]

    if not square_is_configured():
        flash(missing_credential_message(), "error")
        return redirect(url_for("main.checkout", dining=dining_option))

    result = place_kitchen_order(
        {
            "diningOption": dining_option,
            "guest": {
                "firstName": request.form.get("firstName") or "",
                "lastName": request.form.get("lastName") or "",
                "phone": request.form.get("phone") or "",
                "email": request.form.get("email") or "",
            },
            "notes": request.form.get("notes") or "",
            "lines": lines,
            "delivery": {
                "address1": request.form.get("address1") or "",
                "address2": request.form.get("address2") or "",
                "city": request.form.get("city") or "",
                "state": request.form.get("state") or "",
                "zipCode": request.form.get("zipCode") or "",
            }
            if dining_option == "delivery"
            else None,
        },
        square_api,
    )

    if not result.get("ok"):
        flash(f"{result.get('error')}\n\n{credential_inventory()}", "error")
        return redirect(url_for("main.checkout", dining=dining_option))

    write_bag([])
    return redirect(url_for("main.confirmed", guid=result["orderId"]))


@bp.get("/order/confirmed")
def confirmed():
    order_id = (request.args.get("guid") or "").strip()
    if not order_id:
        return render_template(
            "confirmed.html",
            ok=False,
            title="No kitchen ticket yet",
            body="An order number is only shown after Square accepts the order. We never mint RY numbers from this page’s query string.",
            **_ctx(),
        )

    try:
        order = load_confirmed_square_order(order_id)
        display_number = guest_ticket_from_square_order(order)
    except Exception:
        return render_template(
            "confirmed.html",
            ok=False,
            title="Could not verify with Square",
            body="We could not load this ticket from Square, so no order number is shown. Call the restaurant if you need help.",
            **_ctx(),
        )

    if not display_number:
        return render_template(
            "confirmed.html",
            ok=False,
            title="Square did not confirm this order",
            body="The kitchen ticket is not in Square for 7150 Village Pkwy, so we cannot show an order number. If you think you were charged, call the restaurant.",
            **_ctx(),
        )

    return render_template(
        "confirmed.html",
        ok=True,
        display_number=display_number,
        **_ctx(),
    )
