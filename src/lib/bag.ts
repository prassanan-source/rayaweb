import { cookies } from "next/headers";
import { findMenuItem, itemId, type MenuItem } from "@/lib/menu";

export type CartLine = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

export const BAG_COOKIE = "raya-bag";

export function parseBagCookie(value?: string | null): CartLine[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line) => line?.itemId && findMenuItem(line.itemId) && line.quantity > 0);
  } catch {
    return [];
  }
}

export async function readBag(): Promise<CartLine[]> {
  const store = await cookies();
  return parseBagCookie(store.get(BAG_COOKIE)?.value);
}

export async function writeBag(lines: CartLine[]) {
  const store = await cookies();
  store.set(BAG_COOKIE, JSON.stringify(lines), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24,
  });
}

export function addLine(lines: CartLine[], item: MenuItem): CartLine[] {
  const id = itemId(item.name);
  const existing = lines.find((line) => line.itemId === id);
  if (existing) {
    return lines.map((line) =>
      line.itemId === id ? { ...line, quantity: line.quantity + 1 } : line
    );
  }
  return [...lines, { itemId: id, name: item.name, price: item.price, quantity: 1 }];
}
