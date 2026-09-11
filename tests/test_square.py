import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from raya.square.errors import classify_square_http
from raya.square.diagnose import missing_credential_message, privilege_message
from raya.square.place_order import place_kitchen_order
from raya.square.ticket import guest_ticket_from_square_order


class FakeSquare:
    def __init__(self, configured=True, posted=None, fetched=None, raise_post=None, location="LTEST"):
        self.configured = configured
        self.posted = posted
        self.fetched = fetched
        self.raise_post = raise_post
        self._location = location

    def is_configured(self):
        return self.configured

    def location_id(self):
        return self._location

    def resolve_fulfillment_type(self, mode):
        return "DELIVERY" if mode == "delivery" else "PICKUP"

    def resolve_menu_item(self, _name):
        return {"name": "Chicken 65", "itemName": "Chicken 65", "variationId": "var-guid"}

    def post_order(self, _order):
        if self.raise_post:
            raise self.raise_post
        return self.posted

    def get_order(self, order_id):
        if callable(self.fetched):
            return self.fetched(order_id)
        return self.fetched


INPUT = {
    "diningOption": "pickup",
    "guest": {
        "firstName": "Asha",
        "lastName": "Kumar",
        "phone": "925-235-3672",
        "email": "asha@example.com",
    },
    "lines": [{"itemId": "chicken-65", "name": "Chicken 65", "quantity": 1}],
}


def test_no_ticket_when_square_not_configured():
    result = place_kitchen_order(INPUT, FakeSquare(configured=False))
    assert result["ok"] is False
    assert result["code"] == "SQUARE_NOT_CONFIGURED"


def test_no_ticket_when_square_rejects_post():
    result = place_kitchen_order(
        INPUT,
        FakeSquare(posted=None, fetched={"id": "should-not-use", "ticket_name": "1004"}),
    )
    assert result["ok"] is False
    assert result["code"] == "SQUARE_REJECTED"


def test_no_ticket_when_get_cannot_load_order():
    result = place_kitchen_order(
        INPUT,
        FakeSquare(posted={"id": "square-order-id", "ticket_name": "1004"}, fetched=None),
    )
    assert result["ok"] is False
    assert result["code"] == "SQUARE_NOT_CONFIRMED"


def test_issues_ry_number_only_after_get_confirms_same_id():
    def fetch(order_id):
        assert order_id == "square-order-id"
        return {"id": order_id, "ticket_name": "1004"}

    result = place_kitchen_order(INPUT, FakeSquare(posted={"id": "square-order-id"}, fetched=fetch))
    assert result["ok"] is True
    assert result["orderId"] == "square-order-id"
    assert result["displayNumber"] == "RY-1004"


def test_pickup_order_is_explicitly_asap():
    square = FakeSquare(
        posted={"id": "square-order-id"},
        fetched={"id": "square-order-id", "ticket_name": "1004"},
    )
    captured = {}

    def post_order(order):
        captured.update(order)
        return square.posted

    square.post_order = post_order
    result = place_kitchen_order(INPUT, square)

    assert result["ok"] is True
    pickup = captured["order"]["fulfillments"][0]["pickup_details"]
    assert pickup["schedule_type"] == "ASAP"
    assert "pickup_at" not in pickup


def test_delivery_order_is_explicitly_asap():
    square = FakeSquare(
        posted={"id": "square-order-id"},
        fetched={"id": "square-order-id", "ticket_name": "1004"},
    )
    captured = {}

    def post_order(order):
        captured.update(order)
        return square.posted

    square.post_order = post_order
    delivery_input = {
        **INPUT,
        "diningOption": "delivery",
        "delivery": {
            "address1": "7150 Village Pkwy",
            "address2": "",
            "city": "Dublin",
            "state": "CA",
            "zipCode": "94568",
        },
    }
    result = place_kitchen_order(delivery_input, square)

    assert result["ok"] is True
    delivery = captured["order"]["fulfillments"][0]["delivery_details"]
    assert delivery["schedule_type"] == "ASAP"
    assert "deliver_at" not in delivery


def test_guest_ticket_requires_id():
    assert guest_ticket_from_square_order(None) is None
    assert guest_ticket_from_square_order({}) is None
    assert guest_ticket_from_square_order({"ticket_name": "1004"}) is None
    assert guest_ticket_from_square_order({"id": "abc", "ticket_name": "1004"}) == "RY-1004"
    assert guest_ticket_from_square_order({"id": "abcd1234", "ticket_name": "Raya Web - Asha"}) == "RY-1234"


def test_http_401_means_wrong_token():
    error = classify_square_http(401, "order create")
    assert error.code == "SQUARE_AUTH_FAILED"
    assert "access token is wrong" in error.args[0]


def test_http_403_means_no_write_privilege():
    error = classify_square_http(403, "order create")
    assert error.code == "SQUARE_FORBIDDEN"
    assert "does not have write/read privilege" in error.args[0]
    assert "ORDERS_WRITE" in error.args[0]


def test_parse_env_file_accepts_equals_and_colon(tmp_path):
    from raya.config import parse_env_file

    path = tmp_path / ".env"
    path.write_text(
        "SQUARE_ACCESS_TOKEN=tok_123\n"
        "SQUARE_LOCATION_ID: LXXXX\n"
        "SQUARE_ACCESS_TOKEN: not set\n",
        encoding="utf-8",
    )
    parsed = parse_env_file(path)
    assert parsed["SQUARE_ACCESS_TOKEN"] == "not set"
    assert parsed["SQUARE_LOCATION_ID"] == "LXXXX"


def test_clean_ignores_not_set_placeholder():
    from raya.config import _clean

    assert _clean("not set") is None
    assert _clean("EAAAabc") == "EAAAabc"


def test_missing_credentials_message():
    message = missing_credential_message()
    assert "not a wrong-password error" in message
    assert "SQUARE_ACCESS_TOKEN" in message
    assert "SQUARE_LOCATION_ID" in message


def test_privilege_message_flags_missing_write():
    message = privilege_message(["ITEMS_READ", "ORDERS_READ"])
    assert "does not have write privilege" in message
    assert "ORDERS_WRITE" in message


def test_sync_web_menu_creates_missing_items(monkeypatch):
    from raya.square import client

    calls = []

    class Response:
        ok = True
        status_code = 200
        text = ""

        def __init__(self, body):
            self.body = body

        def json(self):
            return self.body

    def fetch(path, method="GET", json_body=None, params=None):
        calls.append((path, method, json_body, params))
        if method == "GET":
            return Response(
                {
                    "objects": [
                        {
                            "type": "ITEM",
                            "id": "existing",
                            "item_data": {"name": "Chicken 65", "variations": []},
                        }
                    ]
                }
            )
        return Response({"objects": []})

    monkeypatch.setattr(client, "_square_fetch", fetch)
    monkeypatch.setattr(
        client,
        "square_config",
        lambda: {
            "host": "https://connect.squareup.com",
            "access_token": "token",
            "location_id": "LOCATION",
        },
    )

    result = client.sync_web_menu(
        [
            {
                "items": [
                    {"name": "Chicken 65", "description": "Existing", "price": 13.99},
                    {"name": "Mixed Veg Soup", "description": "Vegetable soup", "price": 4.99},
                ]
            }
        ]
    )

    assert result == {
        "created": ["Mixed Veg Soup"],
        "created_count": 1,
        "existing_count": 1,
    }
    payload = calls[-1][2]
    created = payload["batches"][0]["objects"][0]
    assert created["item_data"]["name"] == "Mixed Veg Soup"
    assert created["item_data"]["variations"][0]["item_variation_data"]["price_money"] == {
        "amount": 499,
        "currency": "USD",
    }


def test_square_timeout_returns_clear_network_error(monkeypatch):
    import requests

    from raya.square import client
    from raya.square.errors import SquareApiError

    monkeypatch.setattr(
        client,
        "square_config",
        lambda: {
            "host": "https://connect.squareup.com",
            "access_token": "token",
            "location_id": "LOCATION",
        },
    )

    def timeout(*_args, **_kwargs):
        raise requests.ReadTimeout("timed out")

    monkeypatch.setattr(client._session, "request", timeout)

    try:
        client._square_fetch("/v2/orders/test")
    except SquareApiError as error:
        assert error.code == "SQUARE_NETWORK_ERROR"
        assert "after retries" in str(error)
        assert "connect.squareup.com" in str(error)
    else:
        raise AssertionError("Expected SquareApiError")
