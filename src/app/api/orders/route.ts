import { NextResponse } from "next/server";
import { placeKitchenOrder } from "@/lib/toast/place-order";
import { toastApi, toastIsConfigured } from "@/lib/toast/client";
import type { PlaceOrderInput } from "@/lib/toast/types";

export async function POST(request: Request) {
  if (!toastIsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "TOAST_NOT_CONFIGURED",
        error:
          "Toast API credentials are not connected, so this site cannot create a kitchen ticket. Complete checkout on Toast Online Ordering instead.",
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
  return NextResponse.json(result, { status: result.ok ? 201 : 409 });
}
