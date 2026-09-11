# Raya — South Indian restaurant site (Flask)

Python / Flask website for **Raya** at 7150 Village Pkwy, Dublin, CA. Production host: [rayarestaurant.com](https://www.rayarestaurant.com). On the server this project lives at `/home/rayarest/rayaweb`.

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

Needed in `/home/rayarest/rayaweb/.env` as **equals**, not colons:

```
SQUARE_ACCESS_TOKEN=EAAA...
SQUARE_LOCATION_ID=L...
SQUARE_API_HOST=https://connect.squareup.com
SQUARE_SITE_SLUG=raya-7150-village-pkwy
SQUARE_ORDER_URL=
```

Then restart Passenger:

```bash
cd /home/rayarest/rayaweb
touch tmp/restart.txt
```

Create those credentials in the Square Developer Dashboard with `ORDERS_WRITE`, `ORDERS_READ`, `ITEMS_READ`, and `ITEMS_WRITE`. Without them, checkout will not invent a ticket — it tells the guest to finish on Square instead.

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
SQUARE_SITE_SLUG=raya-7150-village-pkwy
SQUARE_ORDER_URL=
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
