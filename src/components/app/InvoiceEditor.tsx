"use client";

import { InvoicePreview, type PreviewFlash } from "@/components/app/InvoicePreview";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { invoiceTotals } from "@/lib/invoiceMath";
import { readLogoFile } from "@/lib/logo";
import { cn } from "@/lib/utils";
import type { Customer, Invoice, InvoiceLineItem, Workspace } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

type Form = Pick<Invoice, "customerId" | "issueDate" | "dueDate" | "currency" | "notes" | "terms" | "poReference" | "paymentLink">;
const blankLine = (): InvoiceLineItem => ({ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, taxRate: 0, discount: 0 });

export function InvoiceEditor({ invoiceId }: { invoiceId?: string }) {
  const router = useRouter();
  const logoInput = useRef<HTMLInputElement>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingBrand = useRef<Partial<Workspace>>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [existing, setExisting] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [flash, setFlash] = useState<PreviewFlash>(null);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const [form, setForm] = useState<Form>({ customerId: "", issueDate: new Date().toISOString().slice(0, 10), dueDate: new Date(new Date().getTime() + 30 * 86400000).toISOString().slice(0, 10), currency: "USD", notes: "", terms: "Net 30", poReference: "", paymentLink: "" });
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([{ id: "line-initial", description: "", quantity: 1, rate: 0, taxRate: 0, discount: 0 }]);

  useEffect(() => {
    void Promise.all([api.getCustomers(), api.getWorkspace(), invoiceId ? api.getInvoice(invoiceId) : Promise.resolve(null)])
      .then(([list, nextWorkspace, invoice]) => {
        setWorkspace(nextWorkspace);
        setCustomers(list.filter((c) => c.status === "active" || c.id === invoice?.customerId));
        if (invoice) {
          setExisting(invoice);
          setForm({ customerId: invoice.customerId, issueDate: invoice.issueDate, dueDate: invoice.dueDate, currency: invoice.currency, notes: invoice.notes || "", terms: invoice.terms || "", poReference: invoice.poReference || "", paymentLink: invoice.paymentLink || "" });
          setLineItems(invoice.lineItems.length ? invoice.lineItems : [{ id: "line-initial", description: "Invoice balance", quantity: 1, rate: invoice.amount, taxRate: 0, discount: 0 }]);
        } else setForm((current) => ({ ...current, currency: nextWorkspace.currency }));
      }).catch((err) => setError(err instanceof Error ? err.message : "Could not load invoice editor."))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    if (brandTimer.current) clearTimeout(brandTimer.current);
    const pending = pendingBrand.current;
    pendingBrand.current = {};
    if (Object.keys(pending).length) void api.updateWorkspace(pending);
  }, []);

  const totals = invoiceTotals(lineItems);
  const customer = customers.find((item) => item.id === form.customerId);
  const invoiceNumber = existing?.number || `${workspace?.invoicePrefix || ""}${workspace?.nextInvoiceNumber ?? ""}`;

  const bump = (section: Exclude<PreviewFlash, null>) => {
    setFlash(section);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 700);
  };

  const patch = (values: Partial<Form>, section: Exclude<PreviewFlash, null>) => {
    setForm((current) => ({ ...current, ...values }));
    bump(section);
  };

  const updateLine = (id: string, values: Partial<InvoiceLineItem>) => {
    setLineItems((current) => current.map((item) => item.id === id ? { ...item, ...values } : item));
    bump("items");
  };

  const commitBrand = (values: Partial<Workspace>) => {
    setWorkspace((current) => current ? { ...current, ...values } : current);
    pendingBrand.current = { ...pendingBrand.current, ...values };
    if (brandTimer.current) clearTimeout(brandTimer.current);
    brandTimer.current = setTimeout(() => {
      const next = pendingBrand.current;
      pendingBrand.current = {};
      void api.updateWorkspace(next);
    }, 350);
    bump("brand");
  };

  const uploadLogo = async (file: File) => {
    setLogoError("");
    try {
      commitBrand({ logoUrl: await readLogoFile(file) });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Could not upload that logo.");
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!workspace) return;
    if (!workspace.companyName.trim()) { setError("Add the company name that should appear on the invoice."); return; }
    if (!form.customerId) { setError("Choose a customer."); return; }
    if (!form.issueDate || !form.dueDate || form.dueDate < form.issueDate) { setError("Due date must be on or after the issue date."); return; }
    if (!lineItems.length || lineItems.some((item) => !item.description.trim() || item.quantity <= 0 || item.rate < 0 || item.taxRate < 0 || item.discount < 0) || totals.total <= 0) { setError("Add valid line items with a positive total."); return; }
    setSaving(true);
    try {
      if (brandTimer.current) clearTimeout(brandTimer.current);
      pendingBrand.current = {};
      await api.updateWorkspace({
        companyName: workspace.companyName,
        legalName: workspace.legalName,
        address: workspace.address,
        supportEmail: workspace.supportEmail,
        taxId: workspace.taxId,
        logoUrl: workspace.logoUrl,
        brandColor: workspace.brandColor,
      });
      const invoice = await api.saveInvoice({ ...form, id: existing?.id, lineItems, amount: totals.total, balance: totals.total - (existing?.amountPaid || 0), status: existing?.status || "draft" });
      router.push(`/app/invoices/${invoice.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save invoice."); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader label="Loading invoice editor…" />;
  if (!workspace) return <p role="alert" className="text-rose-300">{error || "Could not load invoice editor."}</p>;
  if (invoiceId && !existing) return <p role="alert" className="text-rose-300">{error || "Invoice not found."}</p>;
  if (existing && existing.status !== "draft") return <div className="mx-auto max-w-xl space-y-4"><h1 className="text-2xl font-semibold">Sent invoice fields are protected</h1><p className="text-foreground/60">This invoice can’t be edited as a draft. Record a payment or create a corrected replacement with a new invoice number so the history stays clear.</p><Link href={`/app/invoices/${existing.id}`}><Button variant="outline">Back to invoice</Button></Link></div>;

  const preview = (
    <InvoicePreview
      workspace={workspace}
      customer={customer}
      invoiceNumber={invoiceNumber}
      issueDate={form.issueDate}
      dueDate={form.dueDate}
      currency={form.currency}
      poReference={form.poReference}
      paymentLink={form.paymentLink}
      notes={form.notes}
      terms={form.terms}
      lineItems={lineItems}
      flash={flash}
      logoError={logoError}
      onPickLogo={() => logoInput.current?.click()}
      onLogoFile={(file) => void uploadLogo(file)}
      onClearLogo={() => commitBrand({ logoUrl: "" })}
      onBrandColor={(brandColor) => commitBrand({ brandColor })}
    />
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href={existing ? `/app/invoices/${existing.id}` : "/app/invoices"} className="text-sm text-foreground/55 hover:text-foreground">← Back to invoices</Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{existing ? `Edit ${existing.number}` : "Create invoice"}</h1>
        <p className="mt-1 text-sm text-foreground/55">Draft the invoice on the left. The preview on the right updates as you type, including your logo and accent.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
      <input
        ref={logoInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="sr-only"
        aria-label="Upload invoice logo"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void uploadLogo(file);
        }}
      />
      <div className="sticky top-16 z-20 -mx-4 flex gap-2 border-b border-foreground/10 bg-background/95 px-4 py-2 backdrop-blur xl:hidden sm:-mx-6 sm:px-6">
        {(["edit", "preview"] as const).map((pane) => (
          <button
            key={pane}
            type="button"
            aria-pressed={mobilePane === pane}
            onClick={() => setMobilePane(pane)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-medium capitalize", mobilePane === pane ? "bg-[#111184] text-white" : "text-foreground/60")}
          >
            {pane === "edit" ? "Details" : "Preview"}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,460px)]">
        <form className={cn("space-y-6", mobilePane === "preview" && "hidden xl:block")} onSubmit={(event) => void submit(event)}>
          <Card>
            <CardHeader><h2 className="font-semibold">From</h2></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Input label="Company name" value={workspace.companyName} onChange={(event) => commitBrand({ companyName: event.target.value })} />
              <Input label="Support email" type="email" value={workspace.supportEmail} onChange={(event) => commitBrand({ supportEmail: event.target.value })} />
              <div className="sm:col-span-2"><Input label="Address" value={workspace.address || ""} onChange={(event) => commitBrand({ address: event.target.value })} /></div>
              <Input label="Tax ID" value={workspace.taxId || ""} onChange={(event) => commitBrand({ taxId: event.target.value })} />
              <Input label="Invoice number" value={invoiceNumber} readOnly hint={existing ? "This number stays with the draft." : "Reserved for this draft."} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader><h2 className="font-semibold">Invoice details</h2></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Select label="Customer" value={form.customerId} onChange={(event) => { const next = customers.find((item) => item.id === event.target.value); patch({ customerId: event.target.value, currency: next?.currency || form.currency }, "customer"); }} options={[{ value: "", label: "Select customer" }, ...customers.map((item) => ({ value: item.id, label: item.name }))]} />
              </div>
              <Input label="Issue date" type="date" value={form.issueDate} onChange={(event) => patch({ issueDate: event.target.value }, "schedule")} />
              <Input label="Due date" type="date" value={form.dueDate} onChange={(event) => patch({ dueDate: event.target.value }, "schedule")} />
              <Select label="Currency" value={form.currency} onChange={(event) => patch({ currency: event.target.value }, "items")} options={["USD", "CAD", "GBP", "EUR"].map((value) => ({ value, label: value }))} />
              <Input label="PO reference" value={form.poReference || ""} onChange={(event) => patch({ poReference: event.target.value }, "schedule")} />
              <div className="sm:col-span-2"><Input label="Payment link (optional)" type="url" value={form.paymentLink || ""} onChange={(event) => patch({ paymentLink: event.target.value }, "notes")} /></div>
              <div className="sm:col-span-2"><Textarea label="Terms" value={form.terms || ""} onChange={(event) => patch({ terms: event.target.value }, "notes")} /></div>
              <div className="sm:col-span-2"><Textarea label="Notes" value={form.notes || ""} onChange={(event) => patch({ notes: event.target.value }, "notes")} /></div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Line items</h2>
              <Button type="button" size="sm" variant="outline" onClick={() => { setLineItems((items) => [...items, blankLine()]); bump("items"); }}><Plus size={15} /> Add line</Button>
            </CardHeader>
            <CardBody className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-foreground/10 p-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-medium">
                    <span>Line {index + 1}</span>
                    <Button type="button" size="sm" variant="ghost" disabled={lineItems.length === 1} aria-label={`Remove line ${index + 1}`} onClick={() => { setLineItems((items) => items.filter((line) => line.id !== item.id)); bump("items"); }}><Trash2 size={15} /></Button>
                  </div>
                  <Input label="Description" value={item.description} onChange={(event) => updateLine(item.id, { description: event.target.value })} />
                  <div className="mt-3 grid gap-3 sm:grid-cols-4">
                    <Input label="Quantity" type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateLine(item.id, { quantity: Number(event.target.value) })} />
                    <Input label="Rate" type="number" min="0" step="0.01" value={item.rate} onChange={(event) => updateLine(item.id, { rate: Number(event.target.value) })} />
                    <Input label="Tax %" type="number" min="0" step="0.01" value={item.taxRate} onChange={(event) => updateLine(item.id, { taxRate: Number(event.target.value) })} />
                    <Input label="Discount" type="number" min="0" step="0.01" value={item.discount} onChange={(event) => updateLine(item.id, { discount: Number(event.target.value) })} />
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t border-foreground/10 pt-4 text-lg font-semibold">
                <span>Total</span>
                <span>{formatMoney(totals.total, form.currency)}</span>
              </div>
            </CardBody>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : existing ? "Save draft" : "Create draft"}</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
        <div className={cn("xl:sticky xl:top-24 xl:max-h-[calc(100vh-7.5rem)] xl:overflow-y-auto xl:pr-1", mobilePane === "edit" && "hidden xl:block")}>
          {preview}
        </div>
      </div>
    </div>
  );
}
