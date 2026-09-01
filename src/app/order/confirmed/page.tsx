import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formattedAddress, restaurant } from "@/lib/restaurant";
import { loadConfirmedToastOrder } from "@/lib/toast/client";
import { guestTicketFromToastOrder } from "@/lib/toast/ticket";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order status",
};

export default async function ConfirmedOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ guid?: string }>;
}) {
  const { guid } = await searchParams;
  const toastGuid = guid?.trim();

  if (!toastGuid) {
    return (
      <Status
        title="No kitchen ticket yet"
        body="An order number is only shown after Toast accepts the order. We never mint RY numbers from this page’s query string."
      />
    );
  }

  let displayNumber: string | null = null;
  let lookupError = false;

  try {
    const order = await loadConfirmedToastOrder(toastGuid);
    displayNumber = guestTicketFromToastOrder(order);
  } catch {
    lookupError = true;
  }

  if (lookupError) {
    return (
      <Status
        title="Could not verify with Toast"
        body="We could not load this ticket from Toast, so no order number is shown. Call the restaurant if you need help."
      />
    );
  }

  if (!displayNumber) {
    return (
      <Status
        title="Toast did not confirm this order"
        body="The kitchen ticket is not in Toast for 7150 Village Pkwy, so we cannot show an order number. If you think you were charged, call the restaurant."
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs tracking-[0.3em] text-primary uppercase">Toast confirmed</p>
      <h1 className="mt-4 font-heading text-5xl">Order placed!</h1>
      <p className="mt-4 text-lg text-foreground/90">Your order is live in our kitchen.</p>
      <p className="mt-2 text-sm text-muted-foreground">Pick up at {formattedAddress()}</p>
      <p className="mt-8 font-heading text-6xl text-primary">{displayNumber}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        Check number from Toast · {restaurant.toast.locationName}
      </p>
      <Link href="/menu" className={cn(buttonVariants({ variant: "outline" }), "mt-10 h-11 px-5")}>
        Back to menu
      </Link>
    </div>
  );
}

function Status({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs tracking-[0.3em] text-destructive uppercase">Not in the kitchen</p>
      <h1 className="mt-4 font-heading text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <p className="mt-4 text-sm">
        <a href={restaurant.phoneHref} className="text-primary hover:underline">
          {restaurant.phone}
        </a>
      </p>
      <Link href="/order/checkout" className={cn(buttonVariants({ variant: "outline" }), "mt-10 h-11 px-5")}>
        Return to checkout
      </Link>
    </div>
  );
}
