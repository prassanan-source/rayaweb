"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { restaurant, toastOrderUrl } from "@/lib/restaurant";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/visit", label: "Visit" },
];

export function SiteHeader() {
  const pathname = usePathname();

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
          {links.map((link) => {
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
            Order online
          </a>
        </nav>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu" />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="bg-background">
            <SheetHeader>
              <SheetTitle className="font-heading text-2xl text-primary">{restaurant.name}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-2">
              {links.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-lg px-3 py-3 text-base",
                        pathname === link.href ? "bg-muted text-primary" : "text-foreground"
                      )}
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
              <SheetClose
                render={
                  <a
                    href={toastOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: "lg" }), "mt-4 h-12 justify-center")}
                  />
                }
              >
                Order online
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
