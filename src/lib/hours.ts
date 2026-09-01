import { restaurant } from "@/lib/restaurant";

function parseHm(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function getDublinParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: restaurant.timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { weekday, minutes: hour * 60 + minute };
}

export function isOpenNow(now = new Date()) {
  const { minutes } = getDublinParts(now);
  const open = parseHm(restaurant.hours.open);
  const close = parseHm(restaurant.hours.close);
  return minutes >= open && minutes < close;
}

export function isToastOrderingOpen(now = new Date()) {
  const { minutes } = getDublinParts(now);
  const open = parseHm(restaurant.hours.open);
  const close = parseHm(restaurant.hours.toastClose);
  return minutes >= open && minutes < close;
}

export function statusCopy(now = new Date()) {
  if (isOpenNow(now)) {
    return {
      open: true,
      label: "Open now",
      detail: `Kitchen until ${restaurant.hours.display.split("–")[1]?.trim() ?? "10:00 PM"}`,
    };
  }
  return {
    open: false,
    label: "Closed now",
    detail: `We open daily at 11:30 AM`,
  };
}
