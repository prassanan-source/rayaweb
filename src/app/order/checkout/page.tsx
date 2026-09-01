import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Send a pickup or delivery ticket to Raya’s Toast kitchen. Order numbers are issued only after Toast confirms.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-xs tracking-[0.3em] text-primary uppercase">Toast kitchen</p>
      <h1 className="mt-3 font-heading text-5xl sm:text-6xl">Checkout</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Place order posts this bag to Toast for Raya — 7150 Village Pkwy. If Toast does not
        accept and store the ticket, you will not get an RY number and the restaurant will not
        see an order.
      </p>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
