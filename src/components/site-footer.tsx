import Link from "next/link";
import { restaurant, formattedAddress, toastOrderUrl } from "@/lib/restaurant";
import { Kolam } from "@/components/kolam";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-primary/15 bg-[#120c09]">
      <Kolam className="pointer-events-none absolute -right-8 -bottom-8 size-40 opacity-20" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-heading text-3xl text-primary">{restaurant.name}</p>
          <p className="mt-1 text-sm tracking-[0.2em] text-muted-foreground uppercase">
            {restaurant.tagline}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            South Indian cooking on Village Parkway — biryani, dosa, and Chettinad spice for
            dine-in, pickup, and delivery across the Tri-Valley.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-primary uppercase">Visit</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            {formattedAddress()}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{restaurant.hours.display} daily</p>
          <a href={restaurant.phoneHref} className="mt-2 block text-sm text-primary hover:underline">
            {restaurant.phone}
          </a>
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-primary uppercase">Order</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={toastOrderUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                Toast online ordering
              </a>
            </li>
            <li>
              <Link href="/menu" className="hover:text-primary">
                Full menu
              </Link>
            </li>
            <li>
              <Link href="/visit" className="hover:text-primary">
                Hours & directions
              </Link>
            </li>
            <li>
              <a href={restaurant.emailHref} className="hover:text-primary">
                {restaurant.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {restaurant.name} · {formattedAddress()}
        </p>
      </div>
    </footer>
  );
}
