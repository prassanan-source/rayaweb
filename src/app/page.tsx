import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone, Truck, UtensilsCrossed } from "lucide-react";
import { FaqList } from "@/components/faq-list";
import { Kolam } from "@/components/kolam";
import { OpenBadge } from "@/components/open-badge";
import { MenuLink, OrderButton } from "@/components/order-button";
import { featuredDishes, formatPrice } from "@/lib/menu";
import {
  formattedAddress,
  googleMapsUrl,
  restaurant,
} from "@/lib/restaurant";

export default function HomePage() {
  return (
    <div>
      <section className="relative isolate min-h-[88vh] overflow-hidden">
        <Image
          src="/images/biryani.jpg"
          alt="A platter of dum biryani"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <Kolam className="mb-6 size-16 opacity-80" />
          <p className="text-xs tracking-[0.35em] text-primary uppercase">
            {restaurant.tagline} · Village Parkway
          </p>
          <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[0.95] text-balance sm:text-7xl lg:text-8xl">
            {restaurant.headline}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg">
            Dum biryani on seeraga samba rice, dosas off the stone, and Chettinad heat —
            cooked for Dublin tables and Tri-Valley takeout.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <OrderButton />
            <MenuLink />
            <OpenBadge className="ml-1" />
          </div>
        </div>
      </section>

      <section className="border-y border-primary/10 bg-card/40">
        <div className="mx-auto grid max-w-6xl divide-y divide-primary/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <InfoStrip
            icon={<Clock className="size-4 text-primary" />}
            title="Hours"
            body={`${restaurant.hours.display} daily`}
          />
          <InfoStrip
            icon={<MapPin className="size-4 text-primary" />}
            title="Find us"
            body={formattedAddress()}
            href={googleMapsUrl()}
          />
          <InfoStrip
            icon={<Phone className="size-4 text-primary" />}
            title="Call"
            body={restaurant.phone}
            href={restaurant.phoneHref}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/4] lg:aspect-[4/5]">
          <Image
            src="/images/spices.jpg"
            alt="Bowls of Indian spices"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
        </div>
        <div>
          <p className="text-xs tracking-[0.3em] text-primary uppercase">Our story</p>
          <h2 className="mt-3 font-heading text-4xl text-balance sm:text-5xl">A taste of tradition on Village Parkway</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            At Raya, every dish tells a South Indian kitchen story. We slow-cook biryanis with
            fragrant seeraga samba rice, hand-ground spice blends, and techniques passed through
            generations. From the fiery crunch of Chicken 65 to the depth of mutton biryani, each
            plate is built with care, heat, and the warmth of home.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Come in for dosa and filter coffee, take a combo for the table, or order on Toast for
            pickup and delivery. Welcome to our table.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/visit" className="text-sm text-primary underline-offset-4 hover:underline">
              Hours, parking & directions →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#140f0c] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs tracking-[0.3em] text-primary uppercase">The table</p>
              <h2 className="mt-2 font-heading text-4xl sm:text-5xl">House favorites</h2>
            </div>
            <Link href="/menu" className="text-sm text-primary hover:underline">
              See the full menu →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDishes.map((dish) => (
              <Link
                key={dish.name}
                href={dish.href}
                className="group overflow-hidden rounded-2xl bg-card ring-1 ring-primary/15"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading text-2xl leading-tight">{dish.name}</h3>
                    <span className="shrink-0 text-sm text-primary">{formatPrice(dish.price)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{dish.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-6 md:grid-cols-2">
          <OrderCard
            icon={<UtensilsCrossed className="size-5 text-primary" />}
            title="Pickup"
            body="Skip the line. Order on Toast and we’ll have it ready at 7150 Village Pkwy."
            action={<OrderButton mode="pickup" className="w-full sm:w-auto" />}
          />
          <OrderCard
            icon={<Truck className="size-5 text-primary" />}
            title="Delivery"
            body={`Commission-free delivery through Toast across ${restaurant.serviceArea.slice(0, 4).join(", ")}, and the rest of the Tri-Valley.`}
            action={<OrderButton mode="delivery" className="w-full sm:w-auto" />}
          />
        </div>
      </section>

      <section className="border-t border-primary/10 bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <p className="text-xs tracking-[0.3em] text-primary uppercase">Good to know</p>
          <h2 className="mt-2 font-heading text-4xl">Questions before you come in</h2>
          <div className="mt-8">
            <FaqList />
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoStrip({
  icon,
  title,
  body,
  href,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="flex items-center gap-2 text-xs tracking-[0.22em] text-primary uppercase">
        {icon}
        {title}
      </span>
      <span className="mt-2 block text-sm text-foreground/90">{body}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="px-6 py-6 transition-colors hover:bg-primary/5" target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return <div className="px-6 py-6">{inner}</div>;
}

function OrderCard({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card p-8 ring-1 ring-primary/15">
      <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">{icon}</div>
      <h3 className="mt-5 font-heading text-3xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
