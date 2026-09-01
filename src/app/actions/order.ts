"use server";

import { redirect } from "next/navigation";
import { clearCartAction } from "@/app/actions/cart";
import { readBag } from "@/lib/bag";
import { missingCredentialMessage, credentialInventory } from "@/lib/toast/diagnose";
import { toastApi, toastIsConfigured } from "@/lib/toast/client";
import { placeKitchenOrder } from "@/lib/toast/place-order";
import type { DiningMode, PlaceOrderResult } from "@/lib/toast/types";

export async function placeOrderAction(
  _prev: PlaceOrderResult | null,
  formData: FormData
): Promise<PlaceOrderResult> {
  const diningOption = (String(formData.get("diningOption") ?? "pickup") === "delivery"
    ? "delivery"
    : "pickup") as DiningMode;

  const lines = (await readBag()).map((line) => ({
    itemId: line.itemId,
    name: line.name,
    quantity: line.quantity,
  }));

  if (!toastIsConfigured()) {
    return {
      ok: false,
      code: "TOAST_NOT_CONFIGURED",
      error: missingCredentialMessage(),
    };
  }

  const result = await placeKitchenOrder(
    {
      diningOption,
      guest: {
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
      },
      notes: String(formData.get("notes") ?? ""),
      lines,
      delivery:
        diningOption === "delivery"
          ? {
              address1: String(formData.get("address1") ?? ""),
              address2: String(formData.get("address2") ?? ""),
              city: String(formData.get("city") ?? ""),
              state: String(formData.get("state") ?? ""),
              zipCode: String(formData.get("zipCode") ?? ""),
            }
          : undefined,
    },
    toastApi
  );

  if (!result.ok) {
    return {
      ...result,
      error: `${result.error}\n\n${credentialInventory()}`,
    };
  }

  await clearCartAction();
  redirect(`/order/confirmed?guid=${encodeURIComponent(result.toastGuid)}`);
}
