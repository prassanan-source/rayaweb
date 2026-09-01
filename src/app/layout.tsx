import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/components/cart-provider";
import { restaurant } from "@/lib/restaurant";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Raya | South Indian Restaurant in Dublin, CA",
    template: "%s | Raya Dublin",
  },
  description: restaurant.description,
  keywords: [
    "Raya",
    "South Indian restaurant Dublin CA",
    "biryani Dublin",
    "dosa Dublin",
    "7150 Village Pkwy",
  ],
  openGraph: {
    title: "Raya | Essence of South India",
    description: restaurant.description,
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${cormorant.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader />
          <main id="content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </CartProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              name: restaurant.name,
              description: restaurant.description,
              telephone: restaurant.phoneHref.replace("tel:", ""),
              email: restaurant.email,
              servesCuisine: ["South Indian", "Indian"],
              address: {
                "@type": "PostalAddress",
                streetAddress: restaurant.address.line1,
                addressLocality: restaurant.address.city,
                addressRegion: restaurant.address.state,
                postalCode: restaurant.address.zip,
                addressCountry: "US",
              },
              url: "https://rayaweb.hemashaninc.com",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "11:30",
                closes: "22:00",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
