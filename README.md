# Raya — South Indian restaurant site

Website for **Raya** at 7150 Village Pkwy, Dublin, CA. Intended host: [rayaweb.hemashaninc.com](https://rayaweb.hemashaninc.com). On the server this project lives at `/home/hemashan/rayaweb`.

Online ordering goes to Toast for **Raya - 7150 Village Pkwy** (`82a7a0d7-cf2d-4563-b767-0ea0622c5e2f`).

## What’s included

- Home, full menu, visit (map + hours), and Toast pickup/delivery
- Live open/closed status in Pacific time
- Menu prices from the restaurant list (dosa, biryani, Chettinad, combos)

## Run locally

```bash
npm install
npm run dev
```

The app listens on [http://127.0.0.1:43127](http://127.0.0.1:43127).

```bash
npm run build
npm start
```

## Toast location

| | |
| --- | --- |
| Location | Raya - 7150 Village Pkwy |
| GUID | `82a7a0d7-cf2d-4563-b767-0ea0622c5e2f` |
| Order URL | `https://www.toasttab.com/local/order/raya-7150-village-pkwy/r-82a7a0d7-cf2d-4563-b767-0ea0622c5e2f` |

Override with env if the Toast location changes:

```
NEXT_PUBLIC_TOAST_GUID=82a7a0d7-cf2d-4563-b767-0ea0622c5e2f
NEXT_PUBLIC_TOAST_SLUG=raya-7150-village-pkwy
```

## Deploy to the server

Copy the repo to `/home/hemashan/rayaweb`, then:

```bash
cd /home/hemashan/rayaweb
npm ci
npm run build
PORT=43127 npm start
```

Point nginx for `rayaweb.hemashaninc.com` at that Node process. Example:

```nginx
server {
    listen 80;
    server_name rayaweb.hemashaninc.com;

    location / {
        proxy_pass http://127.0.0.1:43127;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Contact (restaurant)

- 7150 Village Pkwy, Dublin, CA 94568
- (925) 235-3672
- rayacuisines@gmail.com
- Open daily 11:30 AM – 10:00 PM (Toast until 9:45 PM)
