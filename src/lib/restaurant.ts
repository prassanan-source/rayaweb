export const restaurant = {
  name: "Raya",
  tagline: "Essence of South India",
  headline: "Spice-kissed & soulful",
  description:
    "Authentic South Indian cuisine in Dublin, CA — dum biryani on seeraga samba rice, crisp dosas, and Chettinad spice, cooked the way it is at home.",
  phone: "925-235-3672",
  phoneHref: "tel:+19252353672",
  email: "rayacuisines@gmail.com",
  emailHref: "mailto:rayacuisines@gmail.com",
  address: {
    line1: "7150 Village Pkwy",
    city: "Dublin",
    state: "CA",
    zip: "94568",
    country: "United States",
  },
  timezone: "America/Los_Angeles",
  hours: {
    label: "Open daily",
    open: "11:30",
    close: "22:00",
    display: "11:30 AM – 10:00 PM",
    toastClose: "21:45",
    toastDisplay: "11:30 AM – 9:45 PM",
  },
  serviceArea: [
    "Dublin",
    "Pleasanton",
    "Livermore",
    "San Ramon",
    "Danville",
    "Castro Valley",
    "Fremont",
    "Union City",
    "Hayward",
    "Sunol",
  ],
  toast: {
    guid: process.env.NEXT_PUBLIC_TOAST_GUID ?? "82a7a0d7-cf2d-4563-b767-0ea0622c5e2f",
    slug: process.env.NEXT_PUBLIC_TOAST_SLUG ?? "raya-7150-village-pkwy",
    locationName: "Raya - 7150 Village Pkwy",
  },
} as const;

export function formattedAddress() {
  const { line1, city, state, zip } = restaurant.address;
  return `${line1}, ${city}, ${state} ${zip}`;
}

export function toastOrderUrl(mode?: "pickup" | "delivery") {
  const { slug } = restaurant.toast;
  const base = `https://order.toasttab.com/online/${slug}`;
  if (mode === "pickup") return `${base}?diningOption=takeout`;
  if (mode === "delivery") return `${base}?diningOption=delivery`;
  return base;
}

export function googleMapsUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress())}`;
}

export function googleMapsEmbedUrl() {
  return `https://maps.google.com/maps?q=${encodeURIComponent(formattedAddress())}&z=16&output=embed`;
}

export function fullAddressLines() {
  const { line1, city, state, zip, country } = restaurant.address;
  return [line1, `${city}, ${state} ${zip}`, country];
}
