"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/menu";
import { cn } from "@/lib/utils";

export function CartButton() {
  const { count, lines, subtotal, setQuantity } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }), "relative h-10 gap-2 px-3")}
        aria-label="Open bag"
        onClick={() => setOpen(true)}
      >
        <ShoppingBag className="size-4" />
        <span className="hidden sm:inline">Bag</span>
        {count > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close bag"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-primary/15 bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-primary/15 px-4 py-4">
              <h2 className="font-heading text-2xl text-primary">Your bag</h2>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                aria-label="Close bag"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
              {lines.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  The bag is empty. Add dishes from the menu, then check out. A kitchen ticket is
                  only created after Toast accepts the order.
                </p>
              ) : (
                <>
                  <ul className="space-y-4">
                    {lines.map((line) => (
                      <li key={line.itemId} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{line.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(line.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Remove one ${line.name}`}
                            className={cn(buttonVariants({ variant: "outline", size: "icon-xs" }))}
                            onClick={() => setQuantity(line.itemId, line.quantity - 1)}
                          >
                            <Minus />
                          </button>
                          <span className="w-5 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Add one ${line.name}`}
                            className={cn(buttonVariants({ variant: "outline", size: "icon-xs" }))}
                            onClick={() => setQuantity(line.itemId, line.quantity + 1)}
                          >
                            <Plus />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto border-t border-primary/15 pt-4">
                    <p className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="text-primary">{formatPrice(subtotal)}</span>
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      You will not get an order number until Toast stores the kitchen ticket.
                    </p>
                    <Link
                      href="/order/checkout"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants({ size: "lg" }), "mt-4 h-12 w-full justify-center")}
                    >
                      Checkout
                    </Link>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
