# Raya — South Indian restaurant site (Flask)

Python / Flask website for **Raya** at 7150 Village Pkwy, Dublin, CA. Intended host: [rayaweb.hemashaninc.com](https://rayaweb.hemashaninc.com). On the server this project lives at `/home/hemashan/rayaweb` (or `/rayaweb` on `rayarest@rayarestaurant.com`).

This is **not** a Node.js app. Run it with Python 3 and Flask.

Kitchen tickets go to Square for **Raya - 7150 Village Pkwy**.

## Order numbers

An `RY-` number is **never** created locally. Checkout POSTs the bag to Square, then GETs that same order ID back. Only if Square returns the stored order do we show:

> Order placed! Your order is live in our kitchen. Pick up at 7150 Village Pkwy, Dublin CA  
> RY-1004

If Square rejects the POST, or GET cannot load the order, the guest sees an error and **no ticket number**. Visiting `/order/confirmed` without a Square order ID, or with an ID Square does not have, also shows no number.

## What’s included

- Home, full menu with bag, checkout, visit (map + hours)
- Square-verified confirmation page
- Branded Square Online Ordering fallback: `https://raya-7150-village-pkwy.square.site` (override with `SQUARE_ORDER_URL`)

## Run locally

You need **Python 3.12+**. If the terminal says `python3: command not found`, install Python first — see `START-STOP.txt` or run `./install-python.sh`.

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# fill SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID
python -m flask --app raya run --host 0.0.0.0 --port 43127
```

Or `./start.sh` (Linux/macOS) / `start.bat` (Windows).

The app listens on [http://127.0.0.1:43127](http://127.0.0.1:43127).

```bash
source .venv/bin/activate
pytest
```

## Square

| | |
| --- | --- |
| Location | Raya - 7150 Village Pkwy |
| Branded ordering | `https://raya-7150-village-pkwy.square.site` |
| API host | `https://connect.squareup.com` |

Needed in `.env` for on-site checkout to reach the POS:

```
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_API_HOST=https://connect.squareup.com
SQUARE_SITE_SLUG=raya-7150-village-pkwy
SQUARE_ORDER_URL=
```

Create those credentials in the Square Developer Dashboard with `ORDERS_WRITE`, `ORDERS_READ`, and `ITEMS_READ`. Without them, checkout will not invent a ticket — it tells the guest to finish on Square instead.

## Deploy to the server

Copy the project to `/home/hemashan/rayaweb` (or `/rayaweb`), then:

```bash
cd /home/hemashan/rayaweb
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:43127 wsgi:app
```

Point nginx for `rayaweb.hemashaninc.com` at that process.

## Contact (restaurant)

- 7150 Village Pkwy, Dublin, CA 94568
- (925) 235-3672
- rayacuisines@gmail.com
- Open daily 11:30 AM – 10:00 PM (Square until 9:45 PM)
