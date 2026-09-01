"use client";

import { addToCartAction } from "@/app/actions/cart";
import { buttonVariants } from "@/components/ui/button";
import { itemId, type MenuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";

export function AddToCartButton({ item }: { item: MenuItem }) {
  return (
    <form action={addToCartAction}>
      <input type="hidden" name="itemId" value={itemId(item.name)} />
      <button
        type="submit"
        className={cn(buttonVariants({ variant: "outline" }), "h-9 shrink-0 px-3")}
      >
        Add
      </button>
    </form>
  );
}
