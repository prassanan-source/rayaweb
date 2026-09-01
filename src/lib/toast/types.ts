export type DiningMode = "pickup" | "delivery";

export type OrderGuest = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type OrderLine = {
  itemId: string;
  name: string;
  quantity: number;
};

export type DeliveryAddress = {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
};

export type PlaceOrderInput = {
  diningOption: DiningMode;
  guest: OrderGuest;
  lines: OrderLine[];
  notes?: string;
  delivery?: DeliveryAddress;
};

export type ToastCheck = {
  guid?: string;
  displayNumber?: string | number | null;
  paymentStatus?: string;
};

export type ToastOrder = {
  guid?: string;
  checks?: ToastCheck[];
};

export type ToastMenuMapping = {
  name: string;
  itemGuid: string;
  groupGuid: string;
};

export type ToastPort = {
  isConfigured(): boolean;
  postOrder(order: Record<string, unknown>): Promise<ToastOrder | null>;
  getOrder(guid: string): Promise<ToastOrder | null>;
  resolveDiningOptionGuid(mode: DiningMode): Promise<string>;
  resolveMenuItem(name: string): Promise<ToastMenuMapping>;
};

export type PlaceOrderSuccess = {
  ok: true;
  toastGuid: string;
  displayNumber: string;
};

export type PlaceOrderFailure = {
  ok: false;
  code:
    | "TOAST_NOT_CONFIGURED"
    | "TOAST_AUTH_FAILED"
    | "TOAST_FORBIDDEN"
    | "TOAST_REJECTED"
    | "TOAST_NOT_CONFIRMED"
    | "TOAST_NO_TICKET"
    | "INVALID_CART"
    | "INVALID_GUEST";
  error: string;
};

export type PlaceOrderResult = PlaceOrderSuccess | PlaceOrderFailure;
