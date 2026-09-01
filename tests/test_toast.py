import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from raya.toast.errors import classify_toast_http
from raya.toast.diagnose import missing_credential_message, privilege_message, read_token_scopes
from raya.toast.place_order import place_kitchen_order
from raya.toast.ticket import guest_ticket_from_toast_order


class FakeToast:
    def __init__(self, configured=True, posted=None, fetched=None, raise_post=None):
        self.configured = configured
        self.posted = posted
        self.fetched = fetched
        self.raise_post = raise_post

    def is_configured(self):
        return self.configured

    def resolve_dining_option_guid(self, _mode):
        return "dining-takeout"

    def resolve_menu_item(self, _name):
        return {"name": "Chicken 65", "itemGuid": "item-guid", "groupGuid": "group-guid"}

    def post_order(self, _order):
        if self.raise_post:
            raise self.raise_post
        return self.posted

    def get_order(self, guid):
        if callable(self.fetched):
            return self.fetched(guid)
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


def test_no_ticket_when_toast_not_configured():
    result = place_kitchen_order(INPUT, FakeToast(configured=False))
    assert result["ok"] is False
    assert result["code"] == "TOAST_NOT_CONFIGURED"


def test_no_ticket_when_toast_rejects_post():
    result = place_kitchen_order(
        INPUT,
        FakeToast(posted=None, fetched={"guid": "should-not-use", "checks": [{"displayNumber": "1004"}]}),
    )
    assert result["ok"] is False
    assert result["code"] == "TOAST_REJECTED"


def test_no_ticket_when_get_cannot_load_order():
    result = place_kitchen_order(
        INPUT,
        FakeToast(posted={"guid": "toast-order-guid", "checks": [{"displayNumber": "1004"}]}, fetched=None),
    )
    assert result["ok"] is False
    assert result["code"] == "TOAST_NOT_CONFIRMED"


def test_issues_ry_number_only_after_get_confirms_same_guid():
    def fetch(guid):
        assert guid == "toast-order-guid"
        return {"guid": guid, "checks": [{"displayNumber": 1004}]}

    result = place_kitchen_order(INPUT, FakeToast(posted={"guid": "toast-order-guid"}, fetched=fetch))
    assert result["ok"] is True
    assert result["toastGuid"] == "toast-order-guid"
    assert result["displayNumber"] == "RY-1004"


def test_guest_ticket_requires_guid_and_check_number():
    assert guest_ticket_from_toast_order(None) is None
    assert guest_ticket_from_toast_order({}) is None
    assert guest_ticket_from_toast_order({"guid": "abc"}) is None
    assert guest_ticket_from_toast_order({"guid": "abc", "checks": [{"displayNumber": ""}]}) is None
    assert guest_ticket_from_toast_order({"guid": "abc", "checks": [{"displayNumber": "1004"}]}) == "RY-1004"


def test_http_401_means_wrong_secret():
    error = classify_toast_http(401, "login")
    assert error.code == "TOAST_AUTH_FAILED"
    assert "client ID or client secret is wrong" in error.args[0]


def test_http_403_means_no_write_privilege():
    error = classify_toast_http(403, "order create")
    assert error.code == "TOAST_FORBIDDEN"
    assert "does not have write/read privilege" in error.args[0]
    assert "orders.orders:write" in error.args[0]


def test_missing_credentials_message():
    message = missing_credential_message()
    assert "not a wrong-password error" in message
    assert "TOAST_CLIENT_ID" in message
    assert "TOAST_CLIENT_SECRET" in message


def test_privilege_message_flags_missing_write():
    message = privilege_message(["menus.channel:read", "config:read"])
    assert "does not have write privilege" in message
    assert "orders.orders:write" in message


def test_read_token_scopes():
    import base64
    import json

    payload = base64.urlsafe_b64encode(
        json.dumps({"scope": "orders.orders:write menus.channel:read"}).encode()
    ).decode().rstrip("=")
    token = f"header.{payload}.sig"
    assert read_token_scopes(token) == ["orders.orders:write", "menus.channel:read"]
