# Raya — South Indian restaurant site

Website for **Raya** at 7150 Village Pkwy, Dublin, CA. Intended host: [rayaweb.hemashaninc.com](https://rayaweb.hemashaninc.com). On the server this project lives at `/home/hemashan/rayaweb`.

Kitchen tickets go to Toast for **Raya - 7150 Village Pkwy** (`82a7a0d7-cf2d-4563-b767-0ea0622c5e2f`).

## Order numbers

An `RY-` number is **never** created locally. Checkout POSTs the bag to Toast, then GETs that same order GUID back. Only if Toast returns the stored check number do we show:

> Order placed! Your order is live in our kitchen. Pick up at 7150 Village Pkwy, Dublin CA  
> RY-1004

If Toast rejects the POST, or GET cannot load the order, the guest sees an error and **no ticket number**. Visiting `/order/confirmed` without a Toast GUID, or with a GUID Toast does not have, also shows no number.

## What’s included

- Home, full menu with bag, checkout, visit (map + hours)
- Toast-verified confirmation page
- Branded Toast Online Ordering fallback: `https://order.toasttab.com/online/raya-7150-village-pkwy`

## Run locally

```bash
npm install
cp .env.example .env.local
# fill TOAST_CLIENT_ID and TOAST_CLIENT_SECRET
npm run dev
```

The app listens on [http://127.0.0.1:43127](http://127.0.0.1:43127).

```bash
npm test
npm run build
npm start
```

## Toast

| | |
| --- | --- |
| Location | Raya - 7150 Village Pkwy |
| Restaurant GUID | `82a7a0d7-cf2d-4563-b767-0ea0622c5e2f` |
| Branded ordering | `https://order.toasttab.com/online/raya-7150-village-pkwy` |
| API host | `https://ws-api.toasttab.com` |

Needed in `.env.local` for on-site checkout to reach the POS:

```
TOAST_CLIENT_ID=
TOAST_CLIENT_SECRET=
TOAST_RESTAURANT_GUID=82a7a0d7-cf2d-4563-b767-0ea0622c5e2f
TOAST_API_HOST=https://ws-api.toasttab.com
```

Create those credentials in Toast Web (Manage integrations) with `orders.orders:write`, `menus.channel:read`, and `config:read`. Without them, checkout will not invent a ticket — it tells the guest to finish on Toast instead.

## Deploy to the server

Copy the repo to `/home/hemashan/rayaweb`, then:

```bash
cd /home/hemashan/rayaweb
npm ci
npm run build
PORT=43127 npm start
```

Point nginx for `rayaweb.hemashaninc.com` at that Node process.

## Contact (restaurant)

- 7150 Village Pkwy, Dublin, CA 94568
- (925) 235-3672
- rayacuisines@gmail.com
- Open daily 11:30 AM – 10:00 PM (Toast until 9:45 PM)
