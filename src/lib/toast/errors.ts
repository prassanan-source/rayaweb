import type { PlaceOrderFailure } from "@/lib/toast/types";

export class ToastApiError extends Error {
  readonly code: PlaceOrderFailure["code"];
  readonly status?: number;

  constructor(message: string, code: PlaceOrderFailure["code"], status?: number) {
    super(message);
    this.name = "ToastApiError";
    this.code = code;
    this.status = status;
  }
}

export function snippet(body: string, max = 220) {
  const text = body.replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function classifyToastHttp(status: number, operation: string, body = ""): ToastApiError {
  const detail = snippet(body);
  const suffix = detail ? ` Toast said: ${detail}` : "";

  if (status === 401) {
    return new ToastApiError(
      `Toast login failed (HTTP 401). The client ID or client secret is wrong, expired, or for a different Toast environment (production vs sandbox).${suffix}`,
      "TOAST_AUTH_FAILED",
      401
    );
  }

  if (status === 403) {
    return new ToastApiError(
      `Toast authenticated but refused ${operation} (HTTP 403). This API client does not have write/read privilege for Raya — 7150 Village Pkwy. In Toast Web, enable the integration on that location and grant orders.orders:write (and menus.channel:read, config:read).${suffix}`,
      "TOAST_FORBIDDEN",
      403
    );
  }

  if (status === 404) {
    return new ToastApiError(
      `Toast could not find that resource during ${operation} (HTTP 404). The restaurant GUID may be wrong or the integration is not installed on this location.${suffix}`,
      "TOAST_REJECTED",
      404
    );
  }

  return new ToastApiError(
    `Toast ${operation} failed (HTTP ${status}).${suffix}`,
    "TOAST_REJECTED",
    status
  );
}

export function failureFromUnknown(error: unknown, fallback: PlaceOrderFailure): PlaceOrderFailure {
  if (error instanceof ToastApiError) {
    return { ok: false, code: error.code, error: error.message };
  }
  if (error instanceof Error) {
    return { ok: false, code: fallback.code, error: error.message };
  }
  return fallback;
}
