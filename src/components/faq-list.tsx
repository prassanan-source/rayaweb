import { restaurant } from "@/lib/restaurant";

const faqs = [
  {
    q: "What kind of food does Raya serve?",
    a: "South Indian cooking: seeraga samba biryani, dosas and idli, Chettinad and Andhra gravies, kothu parotta, and Tamil Nadu starters like Chicken 65 and Pallipalayam chicken.",
  },
  {
    q: "Do you offer pickup and delivery?",
    a: "Yes. Order pickup or delivery on Toast — orders go straight to the kitchen, with no marketplace commission. You can also call us.",
  },
  {
    q: "Where are you, and what areas do you deliver to?",
    a: `We're at ${restaurant.address.line1} in Dublin. We serve Dublin, Pleasanton, Livermore, San Ramon, Danville, Castro Valley, Fremont, Union City, Hayward, and Sunol.`,
  },
  {
    q: "What are your hours?",
    a: `Dine-in is ${restaurant.hours.display} daily. Online ordering on Toast runs until 9:45 PM.`,
  },
  {
    q: "Is there vegetarian food?",
    a: "Yes — dosas, idli, veg biryani, veg kurma, gobi manchurian, pakora, and a vegetarian combo. Filter the menu for vegetarian dishes.",
  },
];

export function FaqList() {
  return (
    <div className="w-full divide-y divide-primary/15 border-y border-primary/15">
      {faqs.map((item) => (
        <details key={item.q} className="group py-2">
          <summary className="cursor-pointer list-none py-3 font-heading text-lg text-foreground marker:content-none hover:text-primary [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-4">
              {item.q}
              <span className="mt-1 text-primary transition group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
