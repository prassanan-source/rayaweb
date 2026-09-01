import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu-browser";
import { OrderButton } from "@/components/order-button";
import { restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Menu",
  description: `South Indian menu at Raya — biryani, dosa, Chettinad gravies, combos, and more. ${restaurant.address.line1}, Dublin, CA.`,
};

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.3em] text-primary uppercase">Kitchen</p>
        <h1 className="mt-3 font-heading text-5xl sm:text-6xl">The menu</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Add dishes to your bag, then checkout. An RY ticket number appears only after Toast
          stores the order for this kitchen — not before.
        </p>
        <div className="mt-6">
          <OrderButton />
        </div>
      </div>
      <div className="mt-12">
        <MenuBrowser />
      </div>
    </div>
  );
}
