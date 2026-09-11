# Raya — South Indian restaurant site (Flask)

Python / Flask website for **Raya** at 7150 Village Pkwy, Dublin, CA. Production host: [rayarestaurant.com](https://www.rayarestaurant.com). On the server this project lives at `/home/rayarest/rayaweb`.

This is **not** a Node.js app. Run it with Python 3 and Flask.

Kitchen tickets go to Square for **Raya - 7150 Village Pkwy**.

## Order and payment flow

Checkout creates a Square-hosted payment link containing the pickup
fulfillment, then redirects the guest to `square.link` to pay. Square only
pushes a fulfillment to POS, Order Manager, and KDS after payment. Merely
creating and retrieving an unpaid Orders API record is not confirmation that
the kitchen received it.

The site never fabricates an `RY-` ticket from a Square order ID. A local
confirmation page only treats an order as confirmed when Square returns a
payment tender and no remaining amount due.

## What’s included

- Home, full menu with bag, checkout, visit (map + hours)
- Square-hosted card payment and paid-order verification
- Password-protected staff order portal backed by local SQLite
- Optional branded Square Online store, used only when a verified `SQUARE_ORDER_URL` is configured

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
| Branded ordering | Set `SQUARE_ORDER_URL` only after publishing a Square Online store |
| API host | `https://connect.squareup.com` |

Needed in `/home/rayarest/rayaweb/.env` as **equals**, not colons:

```
SQUARE_ACCESS_TOKEN=EAAA...
SQUARE_LOCATION_ID=L...
SQUARE_API_HOST=https://connect.squareup.com
SQUARE_API_VERSION=2026-08-19
SQUARE_ORDER_URL=           # optional, only if Square Online is published
ORDER_DB_PATH=/home/rayarest/rayaweb/instance/raya-orders.db
RAYA_ADMIN_USERNAME=admin
RAYA_ADMIN_PASSWORD=choose-a-long-unique-password
RAYA_USER_USERNAME=user
RAYA_USER_PASSWORD=choose-another-long-unique-password
```

Then restart Passenger:

```bash
cd /home/rayarest/rayaweb
touch tmp/restart.txt
```

Create those credentials in the Square Developer Dashboard with
`ORDERS_WRITE`, `ORDERS_READ`, `PAYMENTS_WRITE`, `ITEMS_READ`, and
`ITEMS_WRITE`. Without `PAYMENTS_WRITE`, the app cannot create the secure
Square checkout that turns the fulfillment into a paid POS/KDS order.

After deploying a website menu change, sync any missing dishes and prices into
the Square catalog:

```bash
cd /home/rayarest/rayaweb
source .venv/bin/activate
python -m flask --app raya square-sync-menu
touch tmp/restart.txt
```

The command is additive: it creates website dishes that are missing from
Square and leaves existing Square catalog items unchanged. This prevents
duplicate dishes and preserves modifiers or taxes already configured in
Square.

## Staff order portal

Every customer submission is written to the local SQLite database before the
Square API is called. It includes customer contact information, fulfillment
type, contact details, notes, line items, subtotal, Square IDs, and error
status. Restaurant employees can sign in at:

`https://www.rayarestaurant.com/staff/login`

Both the admin and user accounts can view order details and refresh an order's
payment status from Square. Set strong, different passwords in `.env`; no
default password is provided. Back up the file configured by `ORDER_DB_PATH`
because it contains customer personal information.

### Square On-Demand Delivery

Square's built-in third-party courier dispatch is a Square Online feature, not
an Orders API feature. A custom API `DELIVERY` fulfillment can carry an
address, but it does not request a DoorDash/Uber courier. Set
`SQUARE_ORDER_URL` to the exact URL of Raya's published Square Online store;
the site's Delivery button then opens that store, where Square collects the
address, charges the delivery fee, and dispatches its courier.

## Deploy to the server

Production is **not** a git clone today. That is why this fails:

```text
cd /home/rayarest/rayaweb
git pull
fatal: not a git repository (or any of the parent directories): .git
```

On `s3838` as `rayarest`, turn the folder into a clone **without deleting `.env` or `.venv`**:

```bash
cd /home/rayarest/rayaweb

# keep secrets and the running virtualenv
cp -a .env /tmp/rayaweb.env.bak 2>/dev/null || true

git init
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/prassanan-source/rayaweb.git
git fetch origin
git checkout -f -B square origin/cursor/square-order-4130

# restore .env if git checkout replaced it
test -f /tmp/rayaweb.env.bak && cp /tmp/rayaweb.env.bak .env

# Square keys (create the file if it did not exist)
grep -q SQUARE_ACCESS_TOKEN .env 2>/dev/null || cat >> .env << 'EOF'
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_API_HOST=https://connect.squareup.com
SQUARE_API_VERSION=2026-08-19
SQUARE_ORDER_URL=
ORDER_DB_PATH=/home/rayarest/rayaweb/instance/raya-orders.db
RAYA_ADMIN_USERNAME=admin
RAYA_ADMIN_PASSWORD=
RAYA_USER_USERNAME=user
RAYA_USER_PASSWORD=
EOF

# cPanel Passenger restart
mkdir -p tmp
touch tmp/restart.txt
```

After that, `git pull` works:

```bash
cd /home/rayarest/rayaweb
git fetch origin
git merge --ff-only origin/cursor/square-order-4130
touch tmp/restart.txt
```

If the app uses a venv already:

```bash
source .venv/bin/activate   # or whatever path cPanel shows
pip install -r requirements.txt
```

## Contact (restaurant)

- 7150 Village Pkwy, Dublin, CA 94568
- (925) 235-3672
- rayacuisines@gmail.com
- Open daily 11:30 AM – 10:00 PM (Square until 9:45 PM)
