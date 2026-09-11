import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from raya import create_app
from raya.order_store import get_order, list_orders


def make_app(tmp_path):
    class TestConfig:
        TESTING = True
        SECRET_KEY = "test-secret"
        ORDER_DB_PATH = str(tmp_path / "orders.db")
        RAYA_ADMIN_USERNAME = "admin"
        RAYA_ADMIN_PASSWORD = "admin-pass"
        RAYA_USER_USERNAME = "employee"
        RAYA_USER_PASSWORD = "user-pass"

    return create_app(TestConfig)


def test_staff_login_protects_customer_orders(tmp_path):
    app = make_app(tmp_path)
    client = app.test_client()

    response = client.get("/staff/orders")
    assert response.status_code == 302
    assert "/staff/login" in response.headers["Location"]

    response = client.post(
        "/staff/login",
        data={"username": "employee", "password": "user-pass"},
        follow_redirects=True,
    )
    assert response.status_code == 200
    assert b"Customer orders" in response.data


def test_submission_is_saved_before_square_is_called(tmp_path, monkeypatch):
    app = make_app(tmp_path)
    client = app.test_client()

    from raya import views

    monkeypatch.setattr(views, "square_is_configured", lambda: False)
    with client.session_transaction() as session:
        session["raya_bag"] = [
            {
                "itemId": "chicken-65",
                "name": "Chicken 65",
                "price": 13.99,
                "quantity": 2,
            }
        ]

    response = client.post(
        "/order/place",
        data={
            "diningOption": "delivery",
            "firstName": "Asha",
            "lastName": "Kumar",
            "phone": "925-235-3672",
            "email": "asha@example.com",
            "address1": "1 Main St",
            "city": "Dublin",
            "state": "CA",
            "zipCode": "94568",
            "notes": "Mild",
        },
    )
    assert response.status_code == 302

    with app.app_context():
        orders = list_orders()
        assert len(orders) == 1
        saved = get_order(orders[0]["id"])
        assert saved["status"] == "SQUARE_ERROR"
        assert saved["first_name"] == "Asha"
        assert saved["address1"] == "1 Main St"
        assert saved["lines"][0]["name"] == "Chicken 65"
        assert saved["subtotal_cents"] == 2798
