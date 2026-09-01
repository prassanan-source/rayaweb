"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <Accordion className="w-full">
      {faqs.map((item) => (
        <AccordionItem key={item.q} value={item.q} className="border-primary/15">
          <AccordionTrigger className="py-4 text-left font-heading text-lg text-foreground hover:no-underline hover:text-primary">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
