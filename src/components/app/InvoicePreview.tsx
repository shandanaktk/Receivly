"use client";

import { Button } from "@/components/ui/Button";
import { DEFAULT_INVOICE_ACCENT, INVOICE_ACCENTS, invoiceTotals } from "@/lib/invoiceMath";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Customer, InvoiceLineItem, Workspace } from "@/types";
import { ImagePlus, Trash2 } from "lucide-react";
import { useState, type CSSProperties } from "react";

export type PreviewFlash = "customer" | "schedule" | "items" | "notes" | "brand" | "from" | null;

function money(amount: number, currency: string) {
  try {
    return formatMoney(Number.isFinite(amount) ? amount : 0, currency || "USD");
  } catch {
    return formatMoney(Number.isFinite(amount) ? amount : 0, "USD");
  }
}

export function InvoicePreview({
  workspace,
  customer,
  invoiceNumber,
  issueDate,
  dueDate,
  currency,
  poReference,
  paymentLink,
  notes,
  terms,
  lineItems,
  flash,
  logoError,
  onPickLogo,
  onLogoFile,
  onClearLogo,
  onBrandColor,
}: {
  workspace: Workspace;
  customer?: Customer;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  poReference?: string;
  paymentLink?: string;
  notes?: string;
  terms?: string;
  lineItems: InvoiceLineItem[];
  flash: PreviewFlash;
  logoError?: string;
  onPickLogo: () => void;
  onLogoFile: (file: File) => void;
  onClearLogo: () => void;
  onBrandColor: (color: string) => void;
}) {
  const accent = workspace.brandColor || DEFAULT_INVOICE_ACCENT;
  const totals = invoiceTotals(lineItems);
  const [dragOver, setDragOver] = useState(false);
  const glow = (section: Exclude<PreviewFlash, null>) => cn("rounded-lg", flash === section && "invoice-flash");

  return (
    <aside className="space-y-3" aria-label="Invoice preview">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Live preview</p>
          <p className="text-xs text-foreground/50">Updates on this page as you edit.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-2.5 py-1 text-[11px] font-medium text-foreground/60">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          Draft
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onPickLogo}>
          <ImagePlus size={14} /> {workspace.logoUrl ? "Replace logo" : "Upload logo"}
        </Button>
        {workspace.logoUrl ? (
          <Button type="button" size="sm" variant="ghost" onClick={onClearLogo}>
            <Trash2 size={14} /> Remove
          </Button>
        ) : null}
        <div className="ml-auto flex items-center gap-1.5" role="group" aria-label="Invoice accent color">
          {INVOICE_ACCENTS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Use accent ${color}`}
              aria-pressed={accent.toLowerCase() === color}
              onClick={() => onBrandColor(color)}
              className="h-6 w-6 rounded-full border border-black/10 ring-offset-2 ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111184]"
              style={{ background: color, boxShadow: accent.toLowerCase() === color ? `0 0 0 2px ${color}` : undefined }}
            />
          ))}
          <label className="sr-only" htmlFor="invoice-accent">Custom accent</label>
          <input
            id="invoice-accent"
            type="color"
            value={accent}
            aria-label="Custom accent color"
            onChange={(event) => onBrandColor(event.target.value)}
            className="h-7 w-7 cursor-pointer rounded-full border border-foreground/15 bg-transparent p-0.5"
          />
        </div>
      </div>
      {logoError ? <p role="alert" className="text-xs text-rose-300">{logoError}</p> : null}

      <div
        className="invoice-sheet overflow-hidden rounded-2xl border border-black/10 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
        style={{ "--sheet-accent": accent } as CSSProperties}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) onLogoFile(file);
        }}
      >
        <div className="h-2" style={{ background: accent }} />
        <div className={cn("space-y-6 p-5 sm:p-6", dragOver && "outline outline-2 outline-offset-[-8px]")} style={dragOver ? { outlineColor: accent } : undefined}>
          <div className={cn("flex items-start justify-between gap-4", glow("brand"))}>
            <button
              type="button"
              onClick={onPickLogo}
              aria-label={workspace.logoUrl ? "Replace logo" : "Add logo"}
              className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-[10px] font-medium leading-tight text-slate-500"
            >
              {workspace.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={workspace.logoUrl} alt={`${workspace.companyName || "Company"} logo`} className="h-full w-full object-contain" />
              ) : (
                <span className="px-1 text-center">Add logo</span>
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="invoice-ink truncate text-lg font-semibold">{workspace.companyName || "Your company"}</p>
              {workspace.address ? <p className="invoice-faint mt-0.5 text-xs">{workspace.address}</p> : null}
              {workspace.supportEmail ? <p className="invoice-faint text-xs">{workspace.supportEmail}</p> : null}
              {workspace.taxId ? <p className="invoice-faint text-xs">Tax ID {workspace.taxId}</p> : null}
            </div>
            <div className="text-right">
              <p className="font-['Cormorant_Garamond'] text-3xl leading-none" style={{ color: accent }}>Invoice</p>
              <p className="invoice-ink mt-1 text-sm font-semibold">{invoiceNumber}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={glow("customer")}>
              <p className="invoice-faint text-[10px] font-semibold uppercase tracking-[.14em]">Bill to</p>
              <p className="invoice-ink mt-1 font-semibold">{customer?.name || "Select a customer"}</p>
              {customer?.email ? <p className="invoice-faint text-xs">{customer.email}</p> : null}
              {customer?.billingAddress ? <p className="invoice-faint mt-1 text-xs">{customer.billingAddress}</p> : null}
            </div>
            <div className={cn("sm:text-right", glow("schedule"))}>
              <p className="invoice-faint text-xs">Issued {formatDate(issueDate)}</p>
              <p className="invoice-faint text-xs">Due {formatDate(dueDate)}</p>
              {poReference?.trim() ? <p className="invoice-faint text-xs">PO {poReference}</p> : null}
            </div>
          </div>

          <div className={glow("items")}>
            <div className="invoice-line grid grid-cols-[minmax(0,1.4fr)_auto] gap-3 border-b pb-2 text-[10px] font-semibold uppercase tracking-[.12em]">
              <span className="invoice-faint">Description</span>
              <span className="invoice-faint text-right">Amount</span>
            </div>
            {lineItems.length === 0 ? <p className="invoice-faint py-4 text-sm">Add a line item to see it here.</p> : lineItems.map((item) => {
              const net = (Number.isFinite(item.quantity) ? item.quantity : 0) * (Number.isFinite(item.rate) ? item.rate : 0);
              const lineTotal = net * (1 + (Number.isFinite(item.taxRate) ? item.taxRate : 0) / 100) - (Number.isFinite(item.discount) ? item.discount : 0);
              return (
                <div key={item.id} className="invoice-line grid grid-cols-[minmax(0,1.4fr)_auto] gap-3 border-b py-3 text-sm">
                  <div className="min-w-0">
                    <p className="invoice-ink font-medium">{item.description.trim() || "Line item"}</p>
                    <p className="invoice-faint mt-0.5 text-xs">
                      {item.quantity || 0} × {money(item.rate, currency)}
                      {item.taxRate ? ` · ${item.taxRate}% tax` : ""}
                      {item.discount ? ` · ${money(item.discount, currency)} off` : ""}
                    </p>
                  </div>
                  <p className="invoice-ink text-right font-medium">{money(lineTotal, currency)}</p>
                </div>
              );
            })}
            <div className="ml-auto mt-3 w-full max-w-[220px] space-y-1.5 text-sm">
              <div className="flex justify-between gap-4"><span className="invoice-faint">Subtotal</span><span className="invoice-ink">{money(totals.subtotal, currency)}</span></div>
              {totals.tax > 0 ? <div className="flex justify-between gap-4"><span className="invoice-faint">Tax</span><span className="invoice-ink">{money(totals.tax, currency)}</span></div> : null}
              {totals.discount > 0 ? <div className="flex justify-between gap-4"><span className="invoice-faint">Discount</span><span className="invoice-ink">−{money(totals.discount, currency)}</span></div> : null}
              <div className="invoice-line flex justify-between gap-4 border-t pt-2 text-base font-semibold">
                <span className="invoice-ink">Total</span>
                <span style={{ color: accent }}>{money(totals.total, currency)}</span>
              </div>
            </div>
            <p className="sr-only" aria-live="polite">Invoice total {money(totals.total, currency)}</p>
          </div>

          {(notes?.trim() || terms?.trim() || paymentLink?.trim()) && (
            <div className={cn("invoice-line space-y-2 border-t pt-4 text-xs", glow("notes"))}>
              {terms?.trim() ? <p><span className="invoice-faint">Terms </span><span className="invoice-ink">{terms}</span></p> : null}
              {notes?.trim() ? <p><span className="invoice-faint">Notes </span><span className="invoice-ink">{notes}</span></p> : null}
              {paymentLink?.trim() ? (
                <div className="pt-1">
                  <span className="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold text-white" style={{ background: accent }}>
                    Pay {money(totals.total, currency)}
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
