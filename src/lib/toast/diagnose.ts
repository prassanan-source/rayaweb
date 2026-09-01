import { restaurant } from "@/lib/restaurant";

function env(name: string) {
  return process.env[name]?.trim() || null;
}

function toastHost() {
  return (env("TOAST_API_HOST") || "https://ws-api.toasttab.com").replace(/\/$/, "");
}

function mask(value: string | null, kind: "id" | "secret") {
  if (!value) return "not set";
  if (kind === "secret") return `set (${value.length} characters)`;
  if (value.length <= 8) return "set";
  return `set (${value.slice(0, 4)}…${value.slice(-4)})`;
}

export function credentialInventory() {
  const clientId = env("TOAST_CLIENT_ID");
  const clientSecret = env("TOAST_CLIENT_SECRET");
  const restaurantGuid = env("TOAST_RESTAURANT_GUID") || restaurant.toast.guid;
  return [
    `TOAST_API_HOST: ${toastHost()}`,
    `TOAST_CLIENT_ID: ${mask(clientId, "id")}`,
    `TOAST_CLIENT_SECRET: ${mask(clientSecret, "secret")}`,
    `TOAST_RESTAURANT_GUID: ${restaurantGuid}`,
  ].join("\n");
}

export function missingCredentialMessage() {
  const missing = [
    !env("TOAST_CLIENT_ID") ? "TOAST_CLIENT_ID" : null,
    !env("TOAST_CLIENT_SECRET") ? "TOAST_CLIENT_SECRET" : null,
  ].filter((name): name is string => Boolean(name));

  return [
    "Toast API credentials are not connected, so this site cannot create a kitchen ticket.",
    `Missing environment variable${missing.length === 1 ? "" : "s"}: ${missing.join(", ") || "unknown"}.`,
    "This is not a wrong-password error and not a write-privilege error — Toast was never called.",
    "",
    "Set these in .env.local (local) or /home/hemashan/rayaweb/.env.local (server), then restart the app:",
    credentialInventory(),
    "",
    "After they are set, a failed checkout will tell you whether login failed (wrong client ID/secret) or Toast returned 403 (no write privilege / integration not enabled on this restaurant).",
  ].join("\n");
}

export function readTokenScopes(accessToken: string): string[] {
  const parts = accessToken.split(".");
  if (parts.length < 2) return [];
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(json) as { scope?: unknown; scp?: unknown };
    const raw = payload.scope ?? payload.scp;
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === "string") return raw.split(/[\s,]+/).filter(Boolean);
  } catch {
    return [];
  }
  return [];
}

export function privilegeMessage(scopes: string[]) {
  const needed = ["orders.orders:write", "menus.channel:read", "config:read"];
  const missing = needed.filter((scope) => !scopes.includes(scope));
  if (!scopes.length) {
    return "Login succeeded, but the access token did not list scopes. If the kitchen ticket still fails with HTTP 403, the client likely lacks orders.orders:write on this location.";
  }
  if (missing.includes("orders.orders:write")) {
    return `Login succeeded, but this client does not have write privilege. Missing: ${missing.join(", ")}. Current scopes: ${scopes.join(", ") || "(none)"}.`;
  }
  if (missing.length) {
    return `Login succeeded. Write looks present, but some scopes are missing (${missing.join(", ")}). Current scopes: ${scopes.join(", ")}.`;
  }
  return `Login succeeded with write privilege. Scopes: ${scopes.join(", ")}.`;
}
