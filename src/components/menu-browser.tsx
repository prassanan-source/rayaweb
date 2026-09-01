"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, menuCategories, type Dietary } from "@/lib/menu";
import { cn } from "@/lib/utils";

const filters: { id: "all" | Dietary; label: string }[] = [
  { id: "all", label: "All" },
  { id: "veg", label: "Vegetarian" },
  { id: "chicken", label: "Chicken" },
  { id: "mutton", label: "Mutton" },
  { id: "egg", label: "Egg" },
];

export function MenuBrowser() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const categories = useMemo(() => {
    if (filter === "all") return menuCategories;
    return menuCategories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => item.dietary === filter),
      }))
      .filter((category) => category.items.length > 0);
  }, [filter]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs tracking-wide uppercase transition-colors",
              filter === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/25 text-muted-foreground hover:border-primary/60 hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-10 flex flex-wrap gap-x-4 gap-y-2 border-b border-primary/15 pb-4 text-sm">
        {categories.map((category) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="text-muted-foreground hover:text-primary"
          >
            {category.label}
          </a>
        ))}
      </div>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-primary/25 px-6 py-16 text-center text-muted-foreground">
          Nothing in this filter right now. Try another category.
        </p>
      ) : (
        <div className="space-y-16">
          {categories.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-28">
              <div className="mb-6">
                <h2 className="font-heading text-3xl text-primary sm:text-4xl">{category.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{category.blurb}</p>
              </div>
              <ul className="divide-y divide-primary/10 border-y border-primary/10">
                {category.items.map((item) => (
                  <li key={item.name} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium tracking-wide text-foreground">{item.name}</h3>
                        {item.signature ? (
                          <Badge variant="secondary" className="bg-primary/15 text-primary">
                            House favorite
                          </Badge>
                        ) : null}
                        {item.spicy ? (
                          <Badge variant="outline" className="border-orange-400/40 text-orange-300">
                            Spicy
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <p className="shrink-0 font-heading text-lg text-primary">{formatPrice(item.price)}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
