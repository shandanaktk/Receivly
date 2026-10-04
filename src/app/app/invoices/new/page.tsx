"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Customer, InvoiceLineItem } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function newLineItem(): InvoiceLineItem {
  return {
    id: `li_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    description: "",
    quantity: 1,
    rate: 0,
    taxRate: 0,
    discount: 0,
  };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    notes: "",
    terms: "Net 30",
    poReference: "",
    paymentLink: "",
    status: "draft" as const,
  });
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([newLineItem()]);

  useEffect(() => {
    void api.getCustomers().then(setCustomers);
  }, []);

  const total = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.rate * (1 + li.taxRate / 100) - li.discount,
    0,
  );

  const updateLine = (id: string, patch: Partial<InvoiceLineItem>) => {
    setLineItems((items) => items.map((li) => (li.id === id ? { ...li, ...patch } : li)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) return;
    setSaving(true);
    try {
      const invoice = await api.saveInvoice({
        ...form,
        lineItems,
        amount: total,
      });
      router.push(`/app/invoices/${invoice.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create invoice</h1>
        <p className="text-sm text-white/55">Add line items and customer details</p>
      </div>

      <form onSubmit={(e) => void submit(e)} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-medium">Invoice details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Select
              label="Customer"
              required
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              options={[
                { value: "", label: "Select customer…" },
                ...customers.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Issue date"
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              />
              <Input
                label="Due date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <Input
              label="PO reference"
              value={form.poReference}
              onChange={(e) => setForm({ ...form, poReference: e.target.value })}
            />
            <Input
              label="Payment link (optional)"
              value={form.paymentLink}
              onChange={(e) => setForm({ ...form, paymentLink: e.target.value })}
            />
            <Textarea
              label="Terms"
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
            />
            <Textarea
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-medium">Line items</h2>
            <Button type="button" size="sm" variant="secondary" onClick={() => setLineItems([...lineItems, newLineItem()])}>
              Add line
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            {lineItems.map((li, idx) => (
              <div key={li.id} className="rounded-xl border border-white/10 p-4 space-y-3">
                <p className="text-xs text-white/45">Line {idx + 1}</p>
                <Input
                  label="Description"
                  value={li.description}
                  onChange={(e) => updateLine(li.id, { description: e.target.value })}
                />
                <div className="grid gap-3 sm:grid-cols-4">
                  <Input
                    label="Qty"
                    type="number"
                    min={0}
                    value={li.quantity}
                    onChange={(e) => updateLine(li.id, { quantity: Number(e.target.value) })}
                  />
                  <Input
                    label="Rate"
                    type="number"
                    min={0}
                    step="0.01"
                    value={li.rate}
                    onChange={(e) => updateLine(li.id, { rate: Number(e.target.value) })}
                  />
                  <Input
                    label="Tax %"
                    type="number"
                    min={0}
                    value={li.taxRate}
                    onChange={(e) => updateLine(li.id, { taxRate: Number(e.target.value) })}
                  />
                  <Input
                    label="Discount"
                    type="number"
                    min={0}
                    value={li.discount}
                    onChange={(e) => updateLine(li.id, { discount: Number(e.target.value) })}
                  />
                </div>
                {lineItems.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLineItems(lineItems.filter((x) => x.id !== li.id))}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            ))}
            <p className="text-right text-lg font-semibold">Total: {formatMoney(total)}</p>
          </CardBody>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving || !form.customerId}>
            {saving ? "Creating…" : "Create invoice"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
