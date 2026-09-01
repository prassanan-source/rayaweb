import assert from "node:assert/strict";
import test from "node:test";
import { placeKitchenOrder } from "@/lib/toast/place-order";
import { guestTicketFromToastOrder } from "@/lib/toast/ticket";
import type { PlaceOrderInput, ToastOrder, ToastPort } from "@/lib/toast/types";

const input: PlaceOrderInput = {
  diningOption: "pickup",
  guest: {
    firstName: "Asha",
    lastName: "Kumar",
    phone: "925-235-3672",
    email: "asha@example.com",
  },
  lines: [{ itemId: "chicken-65", name: "Chicken 65", quantity: 1 }],
};

function port(overrides: Partial<ToastPort> & Pick<ToastPort, "postOrder" | "getOrder">): ToastPort {
  return {
    isConfigured: () => true,
    resolveDiningOptionGuid: async () => "dining-takeout",
    resolveMenuItem: async () => ({
      name: "Chicken 65",
      itemGuid: "item-guid",
      groupGuid: "group-guid",
    }),
    ...overrides,
  };
}

test("does not mint a ticket when Toast is not configured", async () => {
  const result = await placeKitchenOrder(input, port({
    isConfigured: () => false,
    postOrder: async () => {
      throw new Error("should not post");
    },
    getOrder: async () => null,
  }));

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "TOAST_NOT_CONFIGURED");
});

test("does not mint a ticket when Toast rejects the post", async () => {
  const result = await placeKitchenOrder(input, port({
    postOrder: async () => null,
    getOrder: async () => ({ guid: "should-not-use", checks: [{ displayNumber: "1004" }] }),
  }));

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "TOAST_REJECTED");
});

test("does not mint a ticket when Toast post succeeds but GET cannot load the order", async () => {
  const result = await placeKitchenOrder(input, port({
    postOrder: async () => ({ guid: "toast-order-guid", checks: [{ displayNumber: "1004" }] }),
    getOrder: async () => null,
  }));

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "TOAST_NOT_CONFIRMED");
});

test("issues RY-{Toast check number} only after GET confirms the same guid", async () => {
  const result = await placeKitchenOrder(input, port({
    postOrder: async () => ({ guid: "toast-order-guid" }),
    getOrder: async (guid) => {
      assert.equal(guid, "toast-order-guid");
      return { guid, checks: [{ displayNumber: 1004 }] };
    },
  }));

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.toastGuid, "toast-order-guid");
    assert.equal(result.displayNumber, "RY-1004");
  }
});

test("guestTicketFromToastOrder requires a persisted Toast guid and check number", () => {
  assert.equal(guestTicketFromToastOrder(null), null);
  assert.equal(guestTicketFromToastOrder({}), null);
  assert.equal(guestTicketFromToastOrder({ guid: "abc" }), null);
  assert.equal(guestTicketFromToastOrder({ guid: "abc", checks: [{ displayNumber: "" }] }), null);

  const confirmed: ToastOrder = { guid: "abc", checks: [{ displayNumber: "1004" }] };
  assert.equal(guestTicketFromToastOrder(confirmed), "RY-1004");
});
