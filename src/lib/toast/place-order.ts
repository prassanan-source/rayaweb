import { findMenuItem } from "@/lib/menu";
import { guestTicketFromToastOrder } from "@/lib/toast/ticket";
import type {
  PlaceOrderInput,
  PlaceOrderResult,
  ToastPort,
} from "@/lib/toast/types";

function tenDigitPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const trimmed = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return trimmed.length === 10 ? trimmed : null;
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function placeKitchenOrder(
  input: PlaceOrderInput,
  toast: ToastPort
): Promise<PlaceOrderResult> {
  if (!toast.isConfigured()) {
    return {
      ok: false,
      code: "TOAST_NOT_CONFIGURED",
      error: "Toast is not connected. No kitchen ticket was created.",
    };
  }

  if (!input.lines.length || input.lines.some((line) => line.quantity < 1)) {
    return { ok: false, code: "INVALID_CART", error: "Add at least one item before placing an order." };
  }

  for (const line of input.lines) {
    if (!findMenuItem(line.itemId)) {
      return { ok: false, code: "INVALID_CART", error: `Unknown menu item: ${line.name}` };
    }
  }

  const phone = tenDigitPhone(input.guest.phone);
  if (!input.guest.firstName.trim() || !input.guest.lastName.trim() || !phone || !validEmail(input.guest.email)) {
    return {
      ok: false,
      code: "INVALID_GUEST",
      error: "Name, a 10-digit phone number, and email are required.",
    };
  }

  if (input.diningOption === "delivery") {
    const d = input.delivery;
    if (!d?.address1?.trim() || !d.city?.trim() || !d.state?.trim() || !d.zipCode?.trim()) {
      return { ok: false, code: "INVALID_GUEST", error: "Delivery needs a full street address." };
    }
  }

  let diningOptionGuid: string;
  try {
    diningOptionGuid = await toast.resolveDiningOptionGuid(input.diningOption);
  } catch (error) {
    return {
      ok: false,
      code: "TOAST_REJECTED",
      error: error instanceof Error ? error.message : "Toast dining option is unavailable.",
    };
  }

  const selections = [];
  try {
    for (const [index, line] of input.lines.entries()) {
      const mapped = await toast.resolveMenuItem(line.name);
      selections.push({
        entityType: "MenuItemSelection",
        item: { guid: mapped.itemGuid, entityType: "MenuItem" },
        itemGroup: { guid: mapped.groupGuid, entityType: "MenuGroup" },
        quantity: line.quantity,
        ...(index === 0 && input.notes?.trim()
          ? { specialRequest: input.notes.trim() }
          : {}),
      });
    }
  } catch (error) {
    return {
      ok: false,
      code: "TOAST_REJECTED",
      error: error instanceof Error ? error.message : "A menu item is not available in Toast.",
    };
  }

  const payload: Record<string, unknown> = {
    entityType: "Order",
    diningOption: { guid: diningOptionGuid, entityType: "DiningOption" },
    checks: [
      {
        entityType: "Check",
        tabName: `Raya Web - ${input.guest.firstName.trim()} ${input.guest.lastName.trim()}`,
        customer: {
          firstName: input.guest.firstName.trim(),
          lastName: input.guest.lastName.trim(),
          phone,
          email: input.guest.email.trim(),
        },
        selections,
      },
    ],
  };

  if (input.diningOption === "delivery" && input.delivery) {
    payload.deliveryInfo = {
      address1: input.delivery.address1.trim(),
      address2: input.delivery.address2?.trim() || undefined,
      city: input.delivery.city.trim(),
      state: input.delivery.state.trim(),
      zipCode: input.delivery.zipCode.trim(),
    };
  }

  let posted;
  try {
    posted = await toast.postOrder(payload);
  } catch (error) {
    return {
      ok: false,
      code: "TOAST_REJECTED",
      error: error instanceof Error ? error.message : "Toast rejected the order.",
    };
  }

  if (!posted?.guid) {
    return {
      ok: false,
      code: "TOAST_REJECTED",
      error: "Toast did not accept the order. No kitchen ticket was created.",
    };
  }

  let verified;
  try {
    verified = await toast.getOrder(posted.guid);
  } catch (error) {
    return {
      ok: false,
      code: "TOAST_NOT_CONFIRMED",
      error: error instanceof Error ? error.message : "Toast did not confirm the kitchen ticket.",
    };
  }

  if (!verified?.guid || verified.guid !== posted.guid) {
    return {
      ok: false,
      code: "TOAST_NOT_CONFIRMED",
      error: "Toast did not confirm the kitchen ticket. No order number was issued.",
    };
  }

  const displayNumber = guestTicketFromToastOrder(verified);
  if (!displayNumber) {
    return {
      ok: false,
      code: "TOAST_NO_TICKET",
      error: "Toast saved the order but did not return a check number yet.",
    };
  }

  return {
    ok: true,
    toastGuid: verified.guid,
    displayNumber,
  };
}
