import { restaurant } from "@/lib/restaurant";
import type { DiningMode, ToastMenuMapping, ToastOrder, ToastPort } from "@/lib/toast/types";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || null;
}

export function toastConfig() {
  return {
    host: (process.env.TOAST_API_HOST?.trim() || "https://ws-api.toasttab.com").replace(/\/$/, ""),
    clientId: requiredEnv("TOAST_CLIENT_ID"),
    clientSecret: requiredEnv("TOAST_CLIENT_SECRET"),
    restaurantGuid:
      requiredEnv("TOAST_RESTAURANT_GUID") || restaurant.toast.guid,
  };
}

export function toastIsConfigured() {
  const { clientId, clientSecret, restaurantGuid } = toastConfig();
  return Boolean(clientId && clientSecret && restaurantGuid);
}

type Token = { accessToken: string; expiresAt: number };

let cachedToken: Token | null = null;
let cachedMenu: ToastMenuMapping[] | null = null;
let cachedDining: { pickup?: string; delivery?: string } | null = null;

async function toastFetch(path: string, init: RequestInit & { token: string }) {
  const { host, restaurantGuid } = toastConfig();
  const response = await fetch(`${host}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${init.token}`,
      "Toast-Restaurant-External-ID": restaurantGuid,
      ...(init.headers ?? {}),
    },
  });
  return response;
}

async function authenticate() {
  const { host, clientId, clientSecret } = toastConfig();
  if (!clientId || !clientSecret) {
    throw new Error("Toast API credentials are not configured.");
  }
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }

  const response = await fetch(`${host}/authentication/v1/authentication/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId,
      clientSecret,
      userAccessType: "TOAST_MACHINE_CLIENT",
    }),
  });

  if (!response.ok) {
    throw new Error(`Toast authentication failed (${response.status}).`);
  }

  const body = (await response.json()) as {
    token?: { accessToken?: string; expiresIn?: number };
  };
  const accessToken = body.token?.accessToken;
  if (!accessToken) {
    throw new Error("Toast authentication did not return an access token.");
  }

  cachedToken = {
    accessToken,
    expiresAt: Date.now() + (body.token?.expiresIn ?? 3600) * 1000,
  };
  return accessToken;
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/biriyani/g, "biryani")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function flattenMenuItems(node: unknown, groupGuid = ""): ToastMenuMapping[] {
  const record = asRecord(node);
  if (!record) return [];

  const items: ToastMenuMapping[] = [];
  const guid = typeof record.guid === "string" ? record.guid : "";
  const name = typeof record.name === "string" ? record.name : "";
  const groups =
    (record.menuGroups as unknown[]) ||
    (record.groups as unknown[]) ||
    (record.subgroups as unknown[]) ||
    [];
  const menuItems =
    (record.menuItems as unknown[]) ||
    (record.items as unknown[]) ||
    [];

  const nextGroup = record.itemType === "GROUP" || record.entityType === "MenuGroup" ? guid : groupGuid;

  for (const item of menuItems) {
    const row = asRecord(item);
    if (!row) continue;
    const itemGuid = typeof row.guid === "string" ? row.guid : "";
    const itemName = typeof row.name === "string" ? row.name : "";
    if (itemGuid && itemName) {
      items.push({ name: itemName, itemGuid, groupGuid: nextGroup || groupGuid });
    }
    items.push(...flattenMenuItems(item, nextGroup || groupGuid));
  }

  for (const group of groups) {
    items.push(...flattenMenuItems(group, nextGroup || groupGuid || guid));
  }

  if (Array.isArray(record.menus)) {
    for (const menu of record.menus) items.push(...flattenMenuItems(menu, groupGuid));
  }

  if (guid && name && (record.itemType === "ITEM" || record.entityType === "MenuItem") && groupGuid) {
    items.push({ name, itemGuid: guid, groupGuid });
  }

  return items;
}

async function loadMenu(token: string) {
  if (cachedMenu) return cachedMenu;
  const response = await toastFetch("/menus/v3/menus", { method: "GET", token });
  if (!response.ok) {
    throw new Error(`Toast menu lookup failed (${response.status}).`);
  }
  const body = await response.json();
  cachedMenu = flattenMenuItems(body);
  if (!cachedMenu.length) {
    throw new Error("Toast returned an empty menu.");
  }
  return cachedMenu;
}

async function loadDiningOptions(token: string) {
  if (cachedDining?.pickup && cachedDining.delivery) return cachedDining;
  const response = await toastFetch("/config/v2/diningOptions", { method: "GET", token });
  if (!response.ok) {
    throw new Error(`Toast dining options failed (${response.status}).`);
  }
  const body = (await response.json()) as Array<{ guid?: string; behavior?: string; name?: string }>;
  const pickup =
    body.find((row) => row.behavior === "TAKE_OUT")?.guid ||
    body.find((row) => /take\s*out|pickup/i.test(row.name ?? ""))?.guid;
  const delivery =
    body.find((row) => row.behavior === "DELIVERY")?.guid ||
    body.find((row) => /delivery/i.test(row.name ?? ""))?.guid;
  cachedDining = { pickup, delivery };
  return cachedDining;
}

export const toastApi: ToastPort = {
  isConfigured() {
    return toastIsConfigured();
  },

  async resolveDiningOptionGuid(mode: DiningMode) {
    const token = await authenticate();
    const options = await loadDiningOptions(token);
    const guid = mode === "delivery" ? options.delivery : options.pickup;
    if (!guid) {
      throw new Error(`Toast has no ${mode} dining option configured.`);
    }
    return guid;
  },

  async resolveMenuItem(name: string) {
    const token = await authenticate();
    const items = await loadMenu(token);
    const needle = normalizeName(name);
    const match = items.find((item) => normalizeName(item.name) === needle);
    if (!match) {
      throw new Error(`“${name}” is not on the Toast menu, so it cannot be sent to the kitchen.`);
    }
    return match;
  },

  async postOrder(order: Record<string, unknown>) {
    const token = await authenticate();
    const response = await toastFetch("/orders/v2/orders", {
      method: "POST",
      token,
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Toast rejected the order (${response.status}): ${detail.slice(0, 280)}`);
    }
    return (await response.json()) as ToastOrder;
  },

  async getOrder(guid: string) {
    const token = await authenticate();
    const response = await toastFetch(`/orders/v2/orders/${guid}`, { method: "GET", token });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Toast could not load the order (${response.status}).`);
    }
    return (await response.json()) as ToastOrder;
  },
};

export async function loadConfirmedToastOrder(guid: string) {
  if (!toastIsConfigured()) return null;
  const order = await toastApi.getOrder(guid);
  if (!order?.guid || order.guid !== guid) return null;
  return order;
}
