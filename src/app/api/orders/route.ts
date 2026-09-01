import { NextResponse } from "next/server";
import { placeKitchenOrder } from "@/lib/toast/place-order";
import { toastApi, toastIsConfigured } from "@/lib/toast/client";
import { missingCredentialMessage, credentialInventory } from "@/lib/toast/diagnose";
import type { PlaceOrderInput } from "@/lib/toast/types";

export async function POST(request: Request) {
  if (!toastIsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "TOAST_NOT_CONFIGURED",
        error: missingCredentialMessage(),
      },
      { status: 503 }
    );
  }

  let body: PlaceOrderInput;
  try {
    body = (await request.json()) as PlaceOrderInput;
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_CART", error: "The order payload was not valid JSON." },
      { status: 400 }
    );
  }

  const result = await placeKitchenOrder(body, toastApi);
  if (!result.ok) {
    return NextResponse.json(
      { ...result, error: `${result.error}\n\n${credentialInventory()}` },
      { status: 409 }
    );
  }
  return NextResponse.json(result, { status: 201 });
}
