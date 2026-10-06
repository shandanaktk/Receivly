"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Customer, Invoice, InvoiceLineItem } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Form = Pick<Invoice, "customerId" | "issueDate" | "dueDate" | "currency" | "notes" | "terms" | "poReference" | "paymentLink">;
const blankLine = (): InvoiceLineItem => ({ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, taxRate: 0, discount: 0 });

export function InvoiceEditor({ invoiceId }: { invoiceId?: string }) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [existing, setExisting] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Form>({ customerId: "", issueDate: new Date().toISOString().slice(0, 10), dueDate: new Date(new Date().getTime() + 30 * 86400000).toISOString().slice(0, 10), currency: "USD", notes: "", terms: "Net 30", poReference: "", paymentLink: "" });
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([{ id: "line-initial", description: "", quantity: 1, rate: 0, taxRate: 0, discount: 0 }]);

  useEffect(() => {
    void Promise.all([api.getCustomers(), api.getWorkspace(), invoiceId ? api.getInvoice(invoiceId) : Promise.resolve(null)])
      .then(([list, workspace, invoice]) => {
        setCustomers(list.filter((c) => c.status === "active" || c.id === invoice?.customerId));
        if (invoice) {
          setExisting(invoice);
          setForm({ customerId: invoice.customerId, issueDate: invoice.issueDate, dueDate: invoice.dueDate, currency: invoice.currency, notes: invoice.notes || "", terms: invoice.terms || "", poReference: invoice.poReference || "", paymentLink: invoice.paymentLink || "" });
          setLineItems(invoice.lineItems.length ? invoice.lineItems : [{ id: "line-initial", description: "Invoice balance", quantity: 1, rate: invoice.amount, taxRate: 0, discount: 0 }]);
        } else setForm((current) => ({ ...current, currency: workspace.currency }));
      }).catch((err) => setError(err instanceof Error ? err.message : "Could not load invoice editor."))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.rate * (1 + item.taxRate / 100) - item.discount, 0);
  const patch = (values: Partial<Form>) => setForm((current) => ({ ...current, ...values }));
  const updateLine = (id: string, values: Partial<InvoiceLineItem>) => setLineItems((current) => current.map((item) => item.id === id ? { ...item, ...values } : item));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!form.customerId) { setError("Choose a customer."); return; }
    if (!form.issueDate || !form.dueDate || form.dueDate < form.issueDate) { setError("Due date must be on or after the issue date."); return; }
    if (!lineItems.length || lineItems.some((item) => !item.description.trim() || item.quantity <= 0 || item.rate < 0 || item.taxRate < 0 || item.discount < 0) || total <= 0) { setError("Add valid line items with a positive total."); return; }
    setSaving(true);
    try {
      const invoice = await api.saveInvoice({ ...form, id: existing?.id, lineItems, amount: total, balance: total - (existing?.amountPaid || 0), status: existing?.status || "draft" });
      router.push(`/app/invoices/${invoice.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save invoice."); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader label="Loading invoice editor…" />;
  if (invoiceId && !existing) return <p role="alert" className="text-rose-300">{error || "Invoice not found."}</p>;
  if (existing && existing.status !== "draft") return <div className="mx-auto max-w-xl space-y-4"><h1 className="text-2xl font-semibold">Sent invoice fields are protected</h1><p className="text-foreground/60">This invoice can’t be edited as a draft. Record a payment or create a corrected replacement with a new invoice number so the history stays clear.</p><Link href={`/app/invoices/${existing.id}`}><Button variant="outline">Back to invoice</Button></Link></div>;

  return <div className="mx-auto max-w-4xl space-y-6"><div><Link href={existing ? `/app/invoices/${existing.id}` : "/app/invoices"} className="text-sm text-foreground/55 hover:text-foreground">← Back to invoices</Link><h1 className="mt-2 text-3xl font-semibold tracking-tight">{existing ? `Edit ${existing.number}` : "Create invoice"}</h1><p className="mt-1 text-sm text-foreground/55">Draft details, line items, taxes, and payment instructions.</p></div>
    {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
    <form className="space-y-6" onSubmit={(e) => void submit(e)}><Card><CardHeader><h2 className="font-semibold">Invoice details</h2></CardHeader><CardBody className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Select label="Customer" value={form.customerId} onChange={(e) => { const customer = customers.find((c) => c.id === e.target.value); patch({ customerId: e.target.value, currency: customer?.currency || form.currency }); }} options={[{ value: "", label: "Select customer" }, ...customers.map((c) => ({ value: c.id, label: c.name }))]} /></div><Input label="Issue date" type="date" value={form.issueDate} onChange={(e) => patch({ issueDate: e.target.value })} /><Input label="Due date" type="date" value={form.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} /><Select label="Currency" value={form.currency} onChange={(e) => patch({ currency: e.target.value })} options={["USD", "CAD", "GBP", "EUR"].map((v) => ({ value: v, label: v }))} /><Input label="PO reference" value={form.poReference || ""} onChange={(e) => patch({ poReference: e.target.value })} /><div className="sm:col-span-2"><Input label="Payment link (optional)" type="url" value={form.paymentLink || ""} onChange={(e) => patch({ paymentLink: e.target.value })} /></div><div className="sm:col-span-2"><Textarea label="Terms" value={form.terms || ""} onChange={(e) => patch({ terms: e.target.value })} /></div><div className="sm:col-span-2"><Textarea label="Internal / invoice notes" value={form.notes || ""} onChange={(e) => patch({ notes: e.target.value })} /></div></CardBody></Card>
    <Card><CardHeader className="flex items-center justify-between gap-3"><h2 className="font-semibold">Line items</h2><Button type="button" size="sm" variant="outline" onClick={() => setLineItems((items) => [...items, blankLine()])}><Plus size={15} /> Add line</Button></CardHeader><CardBody className="space-y-4">{lineItems.map((item, index) => <div key={item.id} className="rounded-xl border border-foreground/10 p-4"><div className="mb-3 flex items-center justify-between text-sm font-medium"><span>Line {index + 1}</span><Button type="button" size="sm" variant="ghost" disabled={lineItems.length === 1} aria-label={`Remove line ${index + 1}`} onClick={() => setLineItems((items) => items.filter((i) => i.id !== item.id))}><Trash2 size={15} /></Button></div><Input label="Description" value={item.description} onChange={(e) => updateLine(item.id, { description: e.target.value })} /><div className="mt-3 grid gap-3 sm:grid-cols-4"><Input label="Quantity" type="number" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateLine(item.id, { quantity: Number(e.target.value) })} /><Input label="Rate" type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateLine(item.id, { rate: Number(e.target.value) })} /><Input label="Tax %" type="number" min="0" step="0.01" value={item.taxRate} onChange={(e) => updateLine(item.id, { taxRate: Number(e.target.value) })} /><Input label="Discount" type="number" min="0" step="0.01" value={item.discount} onChange={(e) => updateLine(item.id, { discount: Number(e.target.value) })} /></div></div>)}<div className="flex justify-between border-t border-foreground/10 pt-4 text-lg font-semibold"><span>Total</span><span>{formatMoney(total, form.currency)}</span></div></CardBody></Card><div className="flex flex-wrap gap-3"><Button type="submit" disabled={saving}>{saving ? "Saving…" : existing ? "Save draft" : "Create draft"}</Button><Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button></div></form>
  </div>;
}
