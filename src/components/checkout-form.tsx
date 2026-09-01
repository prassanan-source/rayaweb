"use client";

import { useActionState, useState } from "react";
import { placeOrderAction } from "@/app/actions/order";
import { useCart } from "@/components/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/menu";
import { formattedAddress, toastOrderUrl } from "@/lib/restaurant";
import type { DiningMode, PlaceOrderResult } from "@/lib/toast/types";
import { cn } from "@/lib/utils";

const initialState: PlaceOrderResult | null = null;

export function CheckoutForm() {
  const { lines, subtotal } = useCart();
  const [diningOption, setDiningOption] = useState<DiningMode>("pickup");
  const [state, action, pending] = useActionState(placeOrderAction, initialState);

  if (!lines.length) {
    return (
      <p className="rounded-xl border border-dashed border-primary/25 px-6 py-12 text-sm text-muted-foreground">
        Your bag is empty. Add dishes on the menu, then return here to send them to Toast.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <input type="hidden" name="diningOption" value={diningOption} />
      <div className="space-y-6">
        <fieldset className="grid gap-3">
          <legend className="font-heading text-2xl text-primary">How you’ll get it</legend>
          <div className="flex flex-wrap gap-2">
            {(["pickup", "delivery"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDiningOption(mode)}
                className={`rounded-full border px-4 py-1.5 text-xs tracking-wide uppercase ${
                  diningOption === mode
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/25 text-muted-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          {diningOption === "pickup" ? (
            <p className="text-sm text-muted-foreground">Pick up at {formattedAddress()}.</p>
          ) : null}
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-heading text-2xl text-primary sm:col-span-2">Guest</legend>
          <Field name="firstName" label="First name" required />
          <Field name="lastName" label="Last name" required />
          <Field name="phone" label="Phone" type="tel" required autoComplete="tel" />
          <Field name="email" label="Email" type="email" required autoComplete="email" />
        </fieldset>

        {diningOption === "delivery" ? (
          <fieldset className="grid gap-4">
            <legend className="mb-2 font-heading text-2xl text-primary">Delivery address</legend>
            <Field name="address1" label="Street" required />
            <Field name="address2" label="Apt / suite" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="city" label="City" required />
              <Field name="state" label="State" required defaultValue="CA" />
              <Field name="zipCode" label="ZIP" required />
            </div>
          </fieldset>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="notes">Kitchen notes</Label>
          <textarea
            id="notes"
            name="notes"
            placeholder="Spice level, allergies, extra raita…"
            className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          />
        </div>
      </div>

      <aside className="h-fit rounded-2xl bg-card p-6 ring-1 ring-primary/15">
        <h2 className="font-heading text-2xl text-primary">Ticket</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((line) => (
            <li key={line.itemId} className="flex justify-between gap-3">
              <span>
                {line.quantity} × {line.name}
              </span>
              <span>{formatPrice(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-primary/15 pt-4 text-sm">
          <span>Subtotal</span>
          <span className="text-primary">{formatPrice(subtotal)}</span>
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          We do not invent an order number here. The ticket is posted to Toast for 7150 Village
          Pkwy; only if Toast stores the order and returns a check number do we show RY-xxxx.
        </p>
        {state && !state.ok ? (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <p>{state.error}</p>
            <a
              href={toastOrderUrl(diningOption)}
              className="mt-2 inline-block underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Finish on Toast instead
            </a>
          </div>
        ) : null}
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "mt-6 h-12 w-full")}
          disabled={pending}
        >
          {pending ? "Sending to Toast…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  autoComplete,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
      />
    </div>
  );
}
