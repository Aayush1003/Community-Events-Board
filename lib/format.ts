export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(value))
    .replace(/\b(am|pm)\b/i, (period) => period.toUpperCase());
}

export function formatEventDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}
