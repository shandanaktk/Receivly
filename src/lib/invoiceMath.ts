import type { InvoiceLineItem } from "@/types";

export const DEFAULT_INVOICE_ACCENT = "#111184";

export const INVOICE_ACCENTS = ["#111184", "#0f766e", "#b45309", "#9f1239", "#1d4ed8", "#334155"] as const;

function num(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export function invoiceTotals(items: InvoiceLineItem[]) {
  return items.reduce(
    (acc, item) => {
      const net = num(item.quantity) * num(item.rate);
      const tax = net * (num(item.taxRate) / 100);
      const discount = num(item.discount);
      acc.subtotal += net;
      acc.tax += tax;
      acc.discount += discount;
      acc.total += net + tax - discount;
      return acc;
    },
    { subtotal: 0, tax: 0, discount: 0, total: 0 },
  );
}
