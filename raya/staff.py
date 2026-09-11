from __future__ import annotations

import secrets
from functools import wraps

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)

from raya.order_store import get_order, list_orders, update_order
from raya.square.client import square_api, square_order_is_paid

bp = Blueprint("staff", __name__, url_prefix="/staff")


def staff_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("staff_role"):
            return redirect(url_for("staff.login"))
        return view(*args, **kwargs)

    return wrapped


def _matches(value: str, expected: str | None) -> bool:
    return bool(expected) and secrets.compare_digest(value, str(expected))


@bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = (request.form.get("username") or "").strip()
        password = request.form.get("password") or ""
        accounts = (
            (
                current_app.config.get("RAYA_ADMIN_USERNAME"),
                current_app.config.get("RAYA_ADMIN_PASSWORD"),
                "admin",
            ),
            (
                current_app.config.get("RAYA_USER_USERNAME"),
                current_app.config.get("RAYA_USER_PASSWORD"),
                "user",
            ),
        )
        for expected_user, expected_password, role in accounts:
            if _matches(username, expected_user) and _matches(
                password, expected_password
            ):
                session.clear()
                session["staff_role"] = role
                session["staff_username"] = username
                return redirect(url_for("staff.orders"))
        flash("Invalid staff username or password.", "error")
    return render_template("staff_login.html")


@bp.post("/logout")
def logout():
    session.clear()
    return redirect(url_for("staff.login"))


@bp.get("/orders")
@staff_required
def orders():
    return render_template("staff_orders.html", orders=list_orders())


@bp.get("/orders/<order_id>")
@staff_required
def order_detail(order_id: str):
    order = get_order(order_id)
    if not order:
        return "Order not found", 404
    return render_template("staff_order.html", order=order)


@bp.post("/orders/<order_id>/refresh")
@staff_required
def refresh_order(order_id: str):
    order = get_order(order_id)
    if not order:
        return "Order not found", 404
    square_order_id = order.get("square_order_id")
    if not square_order_id:
        flash("This submission has no Square order ID.", "error")
        return redirect(url_for("staff.order_detail", order_id=order_id))
    try:
        square_order = square_api.get_order(square_order_id)
        status = "PAID" if square_order_is_paid(square_order) else "AWAITING_PAYMENT"
        update_order(order_id, status=status, square_order_id=square_order_id)
        flash(f"Square status refreshed: {status}.", "ok")
    except Exception as error:
        flash(f"Square is unavailable; the locally stored order is unchanged. {error}", "error")
    return redirect(url_for("staff.order_detail", order_id=order_id))
