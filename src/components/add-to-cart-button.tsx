"use client";

import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/lib/menu";

export function AddToCartButton({ item }: { item: MenuItem }) {
  const { addItem } = useCart();

  return (
    <Button
      variant="outline"
      className="h-9 shrink-0 px-3"
      onClick={() => addItem(item)}
    >
      Add
    </Button>
  );
}
