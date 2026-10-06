import { formatDate, formatMoney } from "@/lib/format";
import type { Invoice, ReminderTone } from "@/types";

export function stageKind(day: number): "upcoming" | "due" | "overdue" {
  if (day < 0) return "upcoming";
  if (day === 0) return "due";
  return "overdue";
}

export function stageTitle(day: number) {
  if (day < 0) return `${Math.abs(day)} days before due`;
  if (day === 0) return "On the due date";
  return `${day} days overdue`;
}

export function collectorEmail({
  tone,
  day,
  companyName,
  signature,
  invoice,
  contact,
}: {
  tone: ReminderTone;
  day: number;
  companyName: string;
  signature: string;
  invoice: Pick<Invoice, "number" | "balance" | "currency" | "dueDate" | "paymentLink">;
  contact: string;
}) {
  const amount = formatMoney(invoice.balance, invoice.currency);
  const due = formatDate(invoice.dueDate);
  const pay = invoice.paymentLink ? `\n\nPay here: ${invoice.paymentLink}` : "";
  const subject = day < 0 ? `Coming due — Invoice ${invoice.number}` : day === 0 ? `Due today — Invoice ${invoice.number}` : `Overdue — Invoice ${invoice.number}`;
  const opening = tone === "friendly" ? `Hope you're well.` : tone === "firm" ? `This is a payment notice from ${companyName}.` : `I'm writing from ${companyName} accounts.`;
  const fact = day < 0
    ? `Invoice ${invoice.number} for ${amount} is due on ${due}.`
    : day === 0
      ? `Invoice ${invoice.number} for ${amount} is due today.`
      : `Invoice ${invoice.number} for ${amount} was due on ${due} and is ${day} days overdue.`;
  const ask = tone === "firm"
    ? "Please pay the outstanding balance."
    : tone === "friendly"
      ? "Whenever you have a moment, the link below settles it."
      : "Please use the link below to settle the balance.";
  return {
    subject,
    body: `Hi ${contact},\n\n${opening} ${fact} ${ask}${pay}\n\n${signature}`.trim(),
  };
}
