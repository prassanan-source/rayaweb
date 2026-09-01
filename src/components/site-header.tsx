"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { restaurant, toastOrderUrl } from "@/lib/restaurant";
import { CartButton } from "@/components/cart-button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/visit", label: "Visit" },
  { href: "/order/checkout", label: "Checkout" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/15 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
        <Link href="/" className="flex items-baseline gap-2 tracking-tight">
          <span className="font-heading text-2xl font-semibold text-primary sm:text-[1.7rem]">
            {restaurant.name}
          </span>
          <span className="hidden text-[0.7rem] tracking-[0.22em] text-muted-foreground uppercase sm:inline">
            Dublin, CA
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links
            .filter((link) => link.href !== "/order/checkout")
            .map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm tracking-wide uppercase transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          <a
            href={toastOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}
          >
            Order on Toast
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <CartButton />
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "icon" }), "md:hidden")}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-primary/15 bg-background px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-3 text-base",
                pathname === link.href ? "bg-muted text-primary" : "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={toastOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "mt-2 h-12 w-full justify-center")}
          >
            Order on Toast
          </a>
        </nav>
      ) : null}
    </header>
  );
}
