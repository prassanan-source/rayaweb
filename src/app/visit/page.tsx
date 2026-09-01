import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { OpenBadge } from "@/components/open-badge";
import { OrderButton } from "@/components/order-button";
import {
  formattedAddress,
  fullAddressLines,
  googleMapsEmbedUrl,
  googleMapsUrl,
  restaurant,
} from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Visit",
  description: `Find Raya at ${formattedAddress()}. Open daily ${restaurant.hours.display}.`,
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function VisitPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.3em] text-primary uppercase">Dublin, CA</p>
        <h1 className="mt-3 font-heading text-5xl sm:text-6xl">Come sit with us</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          We are on Village Parkway, a short hop from Dublin Boulevard. Parking is in the lot
          beside the shops. Call ahead for large groups.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <OpenBadge />
          <OrderButton />
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl ring-1 ring-primary/15">
          <iframe
            title={`Map of ${restaurant.name}`}
            src={googleMapsEmbedUrl()}
            className="h-[360px] w-full border-0 sm:h-[460px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-card p-6 ring-1 ring-primary/15 sm:p-8">
            <h2 className="font-heading text-2xl text-primary">Address</h2>
            <p className="mt-3 flex items-start gap-3 text-sm leading-relaxed">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                {fullAddressLines().map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </p>
            <a
              href={googleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              Open in Google Maps
            </a>
          </section>

          <section className="rounded-2xl bg-card p-6 ring-1 ring-primary/15 sm:p-8">
            <h2 className="font-heading text-2xl text-primary">Hours</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {days.map((day) => (
                <li key={day} className="flex items-center justify-between gap-4 border-b border-primary/10 py-2 last:border-0">
                  <span className="text-muted-foreground">{day}</span>
                  <span>{restaurant.hours.display}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Toast pickup and delivery close at 9:45 PM.
            </p>
          </section>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl bg-card p-6 ring-1 ring-primary/15 sm:p-8">
          <h2 className="font-heading text-2xl text-primary">Call or email</h2>
          <p className="mt-4 flex items-center gap-3 text-sm">
            <Phone className="size-4 text-primary" />
            <a href={restaurant.phoneHref} className="hover:text-primary">
              {restaurant.phone}
            </a>
          </p>
          <p className="mt-3 flex items-center gap-3 text-sm">
            <Mail className="size-4 text-primary" />
            <a href={restaurant.emailHref} className="hover:text-primary">
              {restaurant.email}
            </a>
          </p>
        </section>
        <section className="rounded-2xl bg-card p-6 ring-1 ring-primary/15 sm:p-8">
          <h2 className="font-heading text-2xl text-primary">We deliver to</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {restaurant.serviceArea.join(" · ")}
          </p>
        </section>
      </div>
    </div>
  );
}
