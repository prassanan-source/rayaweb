"use server";

import { revalidatePath } from "next/cache";
import { addLine, readBag, writeBag } from "@/lib/bag";
import { findMenuItem } from "@/lib/menu";

export async function addToCartAction(formData: FormData) {
  const id = String(formData.get("itemId") ?? "");
  const item = findMenuItem(id);
  if (!item) return;
  const lines = addLine(await readBag(), item);
  await writeBag(lines);
  revalidatePath("/", "layout");
}

export async function setCartQuantityAction(formData: FormData) {
  const id = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  if (!findMenuItem(id)) return;
  const current = await readBag();
  const next =
    quantity <= 0
      ? current.filter((line) => line.itemId !== id)
      : current.map((line) => (line.itemId === id ? { ...line, quantity } : line));
  await writeBag(next);
  revalidatePath("/", "layout");
}

export async function clearCartAction() {
  await writeBag([]);
  revalidatePath("/", "layout");
}
