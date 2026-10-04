import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatMoney(amount: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value?: string, pattern = "MMM d, yyyy") {
  if (!value) return "—";
  return format(parseISO(value), pattern);
}

export function formatRelative(value?: string) {
  if (!value) return "—";
  return formatDistanceToNow(parseISO(value), { addSuffix: true });
}

export function statusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
