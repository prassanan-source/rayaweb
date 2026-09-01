"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartButton() {
  const { count } = useCart();

  return (
    <Link
      href="/order/checkout"
      className={cn(buttonVariants({ variant: "outline" }), "relative h-10 gap-2 px-3")}
      aria-label={count ? `Bag, ${count} items` : "Bag"}
    >
      <ShoppingBag className="size-4" />
      <span className="hidden sm:inline">Bag</span>
      {count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
