"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { CartLine } from "@/lib/bag";
import { findMenuItem, formatPrice, itemId, type MenuItem } from "@/lib/menu";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  addItem: (item: MenuItem) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialLines,
}: {
  children: React.ReactNode;
  initialLines: CartLine[];
}) {
  const [lines, setLines] = useState<CartLine[]>(initialLines);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    return {
      lines,
      count,
      subtotal,
      addItem(item) {
        const id = itemId(item.name);
        setLines((current) => {
          const existing = current.find((line) => line.itemId === id);
          if (existing) {
            return current.map((line) =>
              line.itemId === id ? { ...line, quantity: line.quantity + 1 } : line
            );
          }
          return [...current, { itemId: id, name: item.name, price: item.price, quantity: 1 }];
        });
      },
      setQuantity(id, quantity) {
        setLines((current) => {
          if (quantity <= 0) return current.filter((line) => line.itemId !== id);
          if (!findMenuItem(id)) return current;
          return current.map((line) => (line.itemId === id ? { ...line, quantity } : line));
        });
      },
      clear() {
        setLines([]);
      },
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used within CartProvider");
  return cart;
}

export function formatCartTotal(amount: number) {
  return formatPrice(amount);
}
