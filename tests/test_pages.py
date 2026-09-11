import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from raya import create_app


def test_home_and_menu_render():
    app = create_app()
    client = app.test_client()
    assert client.get("/").status_code == 200
    menu = client.get("/menu")
    assert menu.status_code == 200
    assert b"Chicken Biryani" in menu.data
    assert client.get("/visit").status_code == 200
    assert client.get("/order").status_code == 200
    assert b"raya-7150-village-pkwy.square.site" not in client.get("/").data
    empty = client.get("/order/checkout")
    assert empty.status_code == 200
    assert b"bag is empty" in empty.data


def test_unconfigured_square_online_url_falls_back_to_web_menu(monkeypatch):
    from raya.restaurant import square_order_url

    monkeypatch.delenv("SQUARE_ORDER_URL", raising=False)
    assert square_order_url() == "/menu"

    monkeypatch.setenv("SQUARE_ORDER_URL", "https://order.example.square.site/")
    assert square_order_url("delivery") == "https://order.example.square.site"


def test_delivery_checkout_requires_published_square_online(monkeypatch):
    monkeypatch.delenv("SQUARE_ORDER_URL", raising=False)
    app = create_app()
    client = app.test_client()

    response = client.get("/order/checkout?dining=delivery", follow_redirects=True)

    assert response.status_code == 200
    assert b"requires a published Square Online URL" in response.data


def test_add_to_bag_then_checkout():
    app = create_app()
    client = app.test_client()
    response = client.post(
        "/cart/add",
        data={"itemId": "chicken-65", "next": "/order/checkout"},
        follow_redirects=True,
    )
    assert response.status_code == 200
    assert b"Chicken 65" in response.data
    assert b"Continue to Square payment" in response.data


def test_confirmed_without_guid_does_not_mint_ticket():
    app = create_app()
    client = app.test_client()
    response = client.get("/order/confirmed?ticket=RY-1004")
    assert response.status_code == 200
    assert b"No kitchen ticket yet" in response.data
    assert b"RY-1004" not in response.data
