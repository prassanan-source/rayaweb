import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ShoppingBag, Truck } from "lucide-react";
import { OpenBadge } from "@/components/open-badge";
import { OrderButton } from "@/components/order-button";
import { buttonVariants } from "@/components/ui/button";
import { restaurant, toastOrderUrl } from "@/lib/restaurant";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order online",
  description:
    "Order Raya pickup or delivery. Kitchen tickets are created only after Toast confirms the order for 7150 Village Pkwy.",
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.3em] text-primary uppercase">Toast</p>
        <h1 className="mt-3 font-heading text-5xl sm:text-6xl">Order for pickup or delivery</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          An RY ticket number is issued only after Toast stores the order for{" "}
          {restaurant.toast.locationName}. If Toast does not accept the ticket, you will not see
          “Order placed” and the kitchen will not see a ticket.
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
          <h2 className="mt-5 font-heading text-3xl">Order on this site</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Add dishes from the menu, then checkout. We POST the ticket to Toast and only show a
            number after Toast returns the same order on GET.
          </p>
          <Link
            href="/menu"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 px-6 text-base")}
          >
            Start with the menu
          </Link>
        </article>

        <article className="rounded-2xl bg-card p-8 ring-1 ring-primary/15">
          <Truck className="size-6 text-primary" />
          <h2 className="mt-5 font-heading text-3xl">Pay on Toast</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Card checkout runs on Toast’s branded ordering page for this location — that is the
            channel that fires tickets into the POS.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <OrderButton mode="pickup" />
            <OrderButton mode="delivery" variant="outline" />
          </div>
        </article>
      </div>

      <aside className="mt-10 rounded-2xl border border-dashed border-primary/25 bg-card/40 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-heading text-2xl">Prefer to call?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Phone orders at{" "}
              <a href={restaurant.phoneHref} className="text-primary hover:underline">
                {restaurant.phone}
              </a>
              . Catering — email{" "}
              <a href={restaurant.emailHref} className="text-primary hover:underline">
                {restaurant.email}
              </a>
              .
            </p>
            <a
              href={toastOrderUrl()}
              className="mt-2 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Toast Online Ordering
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
