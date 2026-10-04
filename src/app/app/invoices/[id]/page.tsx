"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import type { Customer, Invoice, TimelineEvent } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState({ amount: "", date: new Date().toISOString().slice(0, 10), method: "bank_transfer", reference: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const inv = await api.getInvoice(id);
    const [cust, tl] = await Promise.all([
      api.getCustomer(inv.customerId),
      api.getTimeline(id),
    ]);
    setInvoice(inv);
    setCustomer(cust);
    setTimeline(tl);
    setPayment((p) => ({ ...p, amount: String(inv.balance) }));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePause = async () => {
    if (!invoice) return;
    const updated = await api.saveInvoice({
      id: invoice.id,
      customerId: invoice.customerId,
      collectorPaused: !invoice.collectorPaused,
    });
    setInvoice(updated);
  };

  const recordPayment = async () => {
    if (!invoice) return;
    setSaving(true);
    try {
      const updated = await api.recordPayment(invoice.id, {
        amount: Number(payment.amount),
        date: payment.date,
        method: payment.method,
        reference: payment.reference || undefined,
      });
      setInvoice(updated);
      const tl = await api.getTimeline(id);
      setTimeline(tl);
      setPaymentOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !invoice) return <PageLoader label="Loading invoice…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/app/invoices" className="text-sm text-white/50 hover:text-white">
            ← Invoices
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{invoice.number}</h1>
            <Badge status={invoice.status} />
            {invoice.collectorPaused ? <Badge status="paused">Collector paused</Badge> : null}
          </div>
          <p className="text-sm text-white/55">
            {customer?.name} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/invoice/${invoice.id}`} target="_blank">
            <Button variant="outline" size="sm">
              Public view
            </Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={() => setPaymentOpen(true)}>
            Record payment
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void togglePause()}>
            {invoice.collectorPaused ? "Resume collector" : "Pause collector"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Amount", value: invoice.amount },
          { label: "Paid", value: invoice.amountPaid },
          { label: "Balance", value: invoice.balance },
          { label: "Promised", value: invoice.promisedDate ? formatDate(invoice.promisedDate) : "—", text: true },
        ].map((item) => (
          <Card key={item.label}>
            <CardBody>
              <p className="text-sm text-white/55">{item.label}</p>
              <p className="text-xl font-semibold">
                {item.text ? item.value : formatMoney(item.value as number, invoice.currency)}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-medium">Line items</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 text-right">Qty</th>
                    <th className="px-5 py-3 text-right">Rate</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((li) => (
                    <tr key={li.id} className="border-b border-white/5">
                      <td className="px-5 py-3">{li.description}</td>
                      <td className="px-5 py-3 text-right">{li.quantity}</td>
                      <td className="px-5 py-3 text-right">{formatMoney(li.rate, invoice.currency)}</td>
                      <td className="px-5 py-3 text-right">
                        {formatMoney(li.quantity * li.rate * (1 + li.taxRate / 100) - li.discount, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Timeline</h2>
          </CardHeader>
          <CardBody>
            {timeline.length === 0 ? (
              <p className="text-sm text-white/50">No activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {timeline.map((event) => (
                  <li key={event.id} className="relative border-l border-white/15 pl-4">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.description ? (
                      <p className="text-xs text-white/55">{event.description}</p>
                    ) : null}
                    <p className="text-xs text-white/40">
                      {formatRelative(event.createdAt)}
                      {event.actor ? ` · ${event.actor}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {(invoice.notes || invoice.terms) && (
        <Card>
          <CardBody className="space-y-2 text-sm text-white/70">
            {invoice.terms ? <p><span className="text-white/45">Terms: </span>{invoice.terms}</p> : null}
            {invoice.notes ? <p><span className="text-white/45">Notes: </span>{invoice.notes}</p> : null}
          </CardBody>
        </Card>
      )}

      <Modal
        open={paymentOpen}
        title="Record payment"
        onClose={() => setPaymentOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void recordPayment()} disabled={saving}>
              {saving ? "Saving…" : "Record payment"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={payment.amount}
            onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
          />
          <Input
            label="Date"
            type="date"
            value={payment.date}
            onChange={(e) => setPayment({ ...payment, date: e.target.value })}
          />
          <Input
            label="Method"
            value={payment.method}
            onChange={(e) => setPayment({ ...payment, method: e.target.value })}
          />
          <Input
            label="Reference"
            value={payment.reference}
            onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
