"use client";

import { useCart } from "@/components/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import type { MenuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";

export function AddToCartButton({ item }: { item: MenuItem }) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "outline" }), "h-9 shrink-0 px-3")}
      onClick={() => addItem(item)}
    >
      Add
    </button>
  );
}
