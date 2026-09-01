import { NextResponse } from "next/server";
import { loadConfirmedToastOrder } from "@/lib/toast/client";
import { guestTicketFromToastOrder } from "@/lib/toast/ticket";

export async function GET(
  _request: Request,
  context: { params: Promise<{ guid: string }> }
) {
  const { guid } = await context.params;
  if (!guid) {
    return NextResponse.json({ ok: false, error: "Missing Toast order id." }, { status: 400 });
  }

  try {
    const order = await loadConfirmedToastOrder(guid);
    const displayNumber = guestTicketFromToastOrder(order);
    if (!order || !displayNumber) {
      return NextResponse.json(
        {
          ok: false,
          error: "This order is not in Toast. No kitchen ticket number can be shown.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      toastGuid: order.guid,
      displayNumber,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Toast lookup failed.",
      },
      { status: 502 }
    );
  }
}
