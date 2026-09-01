import type { ToastOrder } from "@/lib/toast/types";

const TICKET_PREFIX = "RY";

export function guestTicketFromToastOrder(order: ToastOrder | null | undefined): string | null {
  if (!order?.guid?.trim()) return null;

  const raw = order.checks?.[0]?.displayNumber;
  if (raw === undefined || raw === null) return null;

  const digits = String(raw)
    .trim()
    .replace(/^RY-?/i, "")
    .replace(/^#+/, "");

  if (!digits) return null;

  return `${TICKET_PREFIX}-${digits}`;
}
