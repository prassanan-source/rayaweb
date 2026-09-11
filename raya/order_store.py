from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import current_app


def _db_path() -> Path:
    return Path(current_app.config["ORDER_DB_PATH"]).expanduser()


def _connect() -> sqlite3.Connection:
    path = _db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=15)
    connection.row_factory = sqlite3.Row
    return connection


def init_order_store() -> None:
    with _connect() as db:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS customer_orders (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                status TEXT NOT NULL,
                dining_option TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                address1 TEXT,
                address2 TEXT,
                city TEXT,
                state TEXT,
                zip_code TEXT,
                notes TEXT,
                subtotal_cents INTEGER NOT NULL,
                lines_json TEXT NOT NULL,
                square_order_id TEXT,
                square_checkout_url TEXT,
                square_error TEXT
            )
            """
        )
        db.execute(
            "CREATE INDEX IF NOT EXISTS idx_customer_orders_created "
            "ON customer_orders(created_at DESC)"
        )
        db.execute(
            "CREATE INDEX IF NOT EXISTS idx_customer_orders_square "
            "ON customer_orders(square_order_id)"
        )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def create_order(snapshot: dict) -> str:
    order_id = f"RAYA-{uuid.uuid4().hex[:8].upper()}"
    now = _now()
    delivery = snapshot.get("delivery") or {}
    lines = snapshot.get("lines") or []
    subtotal_cents = sum(
        round(float(line.get("price") or 0) * 100) * int(line.get("quantity") or 0)
        for line in lines
    )
    guest = snapshot.get("guest") or {}
    with _connect() as db:
        db.execute(
            """
            INSERT INTO customer_orders (
                id, created_at, updated_at, status, dining_option,
                first_name, last_name, phone, email,
                address1, address2, city, state, zip_code, notes,
                subtotal_cents, lines_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                order_id,
                now,
                now,
                "SUBMITTED",
                snapshot.get("diningOption") or "pickup",
                str(guest.get("firstName") or "").strip(),
                str(guest.get("lastName") or "").strip(),
                str(guest.get("phone") or "").strip(),
                str(guest.get("email") or "").strip(),
                str(delivery.get("address1") or "").strip() or None,
                str(delivery.get("address2") or "").strip() or None,
                str(delivery.get("city") or "").strip() or None,
                str(delivery.get("state") or "").strip() or None,
                str(delivery.get("zipCode") or "").strip() or None,
                str(snapshot.get("notes") or "").strip() or None,
                subtotal_cents,
                json.dumps(lines, separators=(",", ":")),
            ),
        )
    return order_id


def update_order(
    order_id: str,
    *,
    status: str,
    square_order_id: str | None = None,
    square_checkout_url: str | None = None,
    square_error: str | None = None,
) -> None:
    with _connect() as db:
        db.execute(
            """
            UPDATE customer_orders
            SET updated_at = ?, status = ?,
                square_order_id = COALESCE(?, square_order_id),
                square_checkout_url = COALESCE(?, square_checkout_url),
                square_error = ?
            WHERE id = ?
            """,
            (
                _now(),
                status,
                square_order_id,
                square_checkout_url,
                square_error,
                order_id,
            ),
        )


def _as_order(row: sqlite3.Row | None) -> dict | None:
    if row is None:
        return None
    order = dict(row)
    order["lines"] = json.loads(order.pop("lines_json") or "[]")
    return order


def list_orders(limit: int = 500) -> list[dict]:
    with _connect() as db:
        rows = db.execute(
            "SELECT * FROM customer_orders ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [_as_order(row) for row in rows]


def get_order(order_id: str) -> dict | None:
    with _connect() as db:
        row = db.execute(
            "SELECT * FROM customer_orders WHERE id = ?", (order_id,)
        ).fetchone()
    return _as_order(row)
