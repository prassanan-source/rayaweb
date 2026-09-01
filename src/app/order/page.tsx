import type { Metadata } from "next";
import { Clock, ShoppingBag, Truck } from "lucide-react";
import { OpenBadge } from "@/components/open-badge";
import { OrderButton } from "@/components/order-button";
import { restaurant, toastOrderUrl } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Order online",
  description:
    "Order Raya pickup or delivery on Toast. Commission-free tickets go straight to the kitchen at 7150 Village Pkwy, Dublin.",
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.3em] text-primary uppercase">Toast</p>
        <h1 className="mt-3 font-heading text-5xl sm:text-6xl">Order for pickup or delivery</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Checkout happens on Toast for {restaurant.toast.locationName}. There is no extra
          marketplace fee — your order lands in our kitchen as soon as you pay.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <OpenBadge />
          <span className="text-sm text-muted-foreground">
            Online ordering {restaurant.hours.toastDisplay}
          </span>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl bg-card p-8 ring-1 ring-primary/15">
          <ShoppingBag className="size-6 text-primary" />
          <h2 className="mt-5 font-heading text-3xl">Pickup</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Place the order, drive to 7150 Village Pkwy, and walk in when it is ready. Use the
            Toast status updates for timing.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li>Ready for pickup at the restaurant counter</li>
            <li>Same menu as dine-in, priced on Toast</li>
          </ul>
          <div className="mt-8">
            <OrderButton mode="pickup" />
          </div>
        </article>

        <article className="rounded-2xl bg-card p-8 ring-1 ring-primary/15">
          <Truck className="size-6 text-primary" />
          <h2 className="mt-5 font-heading text-3xl">Delivery</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Toast delivery covers Dublin and the surrounding Tri-Valley. Enter your address on
            Toast to confirm we can reach you.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li>Dublin, Pleasanton, Livermore, San Ramon, and nearby cities</li>
            <li>Kitchen cutoff 9:45 PM</li>
          </ul>
          <div className="mt-8">
            <OrderButton mode="delivery" />
          </div>
        </article>
      </div>

      <aside className="mt-10 rounded-2xl border border-dashed border-primary/25 bg-card/40 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-heading text-2xl">Prefer to call?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We take phone orders at{" "}
              <a href={restaurant.phoneHref} className="text-primary hover:underline">
                {restaurant.phone}
              </a>
              . Catering and large trays — email{" "}
              <a href={restaurant.emailHref} className="text-primary hover:underline">
                {restaurant.email}
              </a>
              .
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Location GUID {restaurant.toast.guid}
            </p>
            <a
              href={toastOrderUrl()}
              className="mt-2 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open the full Toast menu
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
