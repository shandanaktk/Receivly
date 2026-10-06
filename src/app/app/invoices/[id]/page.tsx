"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import type { Customer, Invoice, TeamMember, TimelineEvent } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState({ amount: "", date: new Date().toISOString().slice(0, 10), method: "bank_transfer", reference: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const inv = await api.getInvoice(id);
    const [cust, tl, members] = await Promise.all([
      api.getCustomer(inv.customerId),
      api.getTimeline(id),
      api.getTeam(),
    ]);
    setInvoice(inv);
    setCustomer(cust);
    setTimeline(tl);
    setTeam(members);
    setPayment((p) => ({ ...p, amount: String(inv.balance) }));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const togglePause = async () => {
    if (!invoice) return;
    const updated = await api.saveInvoice({
      id: invoice.id,
      customerId: invoice.customerId,
      collectorPaused: !invoice.collectorPaused,
    });
    setInvoice(updated);
    setTimeline(await api.getTimeline(id));
  };

  const assignInvoice = async (userId: string) => {
    if (!invoice) return;
    try {
      setInvoice(await api.saveInvoice({ id: invoice.id, customerId: invoice.customerId, assignedTo: userId === "unassigned" ? undefined : userId }));
      setTimeline(await api.getTimeline(id));
      setMessage("Invoice assignment updated in this demo.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update assignment."); }
  };

  const sendInvoice = async () => {
    if (!window.confirm("Simulate sending this invoice? The status and timeline will update, but no email will be delivered.")) return;
    try { setInvoice(await api.sendInvoice(id)); setTimeline(await api.getTimeline(id)); setMessage("Invoice send simulated. No email was delivered."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not send invoice."); }
  };

  const voidInvoice = async () => {
    if (!window.confirm("Void this invoice? Its financial history will remain visible and collection will stop.")) return;
    try { setInvoice(await api.voidInvoice(id)); setTimeline(await api.getTimeline(id)); setMessage("Invoice voided in this demo."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not void invoice."); }
  };

  const deleteDraft = async () => {
    if (!window.confirm("Delete this draft? This action removes the draft from the demo workspace.")) return;
    try { await api.deleteDraft(id); router.push("/app/invoices"); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not delete draft."); }
  };

  const attach = async (file?: File) => {
    if (!file) return;
    try { setInvoice(await api.addInvoiceAttachment(id, { name: file.name, size: file.size, type: file.type })); setTimeline(await api.getTimeline(id)); setMessage("Attachment metadata added to the demo. File storage will connect with the backend."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not add attachment."); }
  };

  const recordPayment = async () => {
    if (!invoice) return;
    if (!window.confirm(`Record a ${invoice.currency} ${payment.amount} payment? This changes the invoice balance and may stop collection.`)) return;
    setSaving(true);
    setError("");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record payment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !invoice) return <PageLoader label="Loading invoice…" />;

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/app/invoices" className="text-sm text-foreground/50 hover:text-foreground">
            ← Invoices
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{invoice.number}</h1>
            <Badge status={invoice.status} />
            {invoice.collectorPaused ? <Badge status="paused">Collector paused</Badge> : null}
          </div>
          <p className="text-sm text-foreground/55">
            {customer?.name} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoice.status === "draft" && <Link href={`/app/invoices/${id}/edit`}><Button variant="outline" size="sm">Edit draft</Button></Link>}
          <Link href={`/invoice/${invoice.id}`} target="_blank">
            <Button variant="outline" size="sm">
              Public view
            </Button>
          </Link>
          {invoice.status === "draft" && <Button size="sm" onClick={() => void sendInvoice()}>Simulate send</Button>}
          <Button size="sm" variant="secondary" disabled={invoice.balance <= 0 || ["void", "written_off"].includes(invoice.status)} onClick={() => setPaymentOpen(true)}>
            Record payment
          </Button>
          <Button size="sm" variant="ghost" disabled={["paid", "void"].includes(invoice.status)} onClick={() => void togglePause()}>
            {invoice.collectorPaused ? "Resume collector" : "Pause collector"}
          </Button>
          {invoice.status === "draft" ? <Button size="sm" variant="danger" onClick={() => void deleteDraft()}>Delete draft</Button> : !["paid", "void"].includes(invoice.status) ? <Button size="sm" variant="outline" onClick={() => void voidInvoice()}>Void invoice</Button> : null}
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
              <p className="text-sm text-foreground/55">{item.label}</p>
              <p className="text-xl font-semibold">
                {item.text ? item.value : formatMoney(item.value as number, invoice.currency)}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card><CardBody className="grid gap-4 sm:grid-cols-2 sm:items-end"><Select label="Assigned staff member" value={invoice.assignedTo || "unassigned"} onChange={(e) => void assignInvoice(e.target.value)} options={[{ value: "unassigned", label: "Unassigned" }, ...team.filter((member) => member.status === "active").map((member) => ({ value: member.userId, label: member.name }))]} /><div><p className="text-sm text-foreground/55">Tags</p><p className="mt-1 text-sm">{invoice.tags.length ? invoice.tags.join(", ") : "No tags"}</p></div></CardBody></Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-medium">Line items</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-foreground/10 sm:hidden">
              {invoice.lineItems.length === 0 ? <p className="p-5 text-sm text-foreground/50">No line items on this invoice.</p> : invoice.lineItems.map((li) => <div key={li.id} className="flex justify-between gap-4 p-5 text-sm"><div className="min-w-0"><p className="font-medium">{li.description}</p><p className="mt-1 text-foreground/50">{li.quantity} × {formatMoney(li.rate, invoice.currency)}</p></div><strong className="shrink-0">{formatMoney(li.quantity * li.rate * (1 + li.taxRate / 100) - li.discount, invoice.currency)}</strong></div>)}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-foreground/50">
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 text-right">Qty</th>
                    <th className="px-5 py-3 text-right">Rate</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((li) => (
                    <tr key={li.id} className="border-b border-foreground/5">
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
              <p className="text-sm text-foreground/50">No activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {timeline.map((event) => (
                  <li key={event.id} className="relative border-l border-foreground/15 pl-4">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.description ? (
                      <p className="text-xs text-foreground/55">{event.description}</p>
                    ) : null}
                    <p className="text-xs text-foreground/40">
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
          <CardBody className="space-y-2 text-sm text-foreground/70">
            {invoice.terms ? <p><span className="text-foreground/45">Terms: </span>{invoice.terms}</p> : null}
            {invoice.notes ? <p><span className="text-foreground/45">Notes: </span>{invoice.notes}</p> : null}
          </CardBody>
        </Card>
      )}

      <Card><CardHeader><h2 className="font-medium">Supporting files</h2></CardHeader><CardBody className="space-y-3"><p className="text-sm text-foreground/55">PDF, PNG, or JPEG · up to 10 MB. File metadata is stored in this demo; binary storage connects with the backend.</p>{invoice.attachments?.length ? <ul className="space-y-2">{invoice.attachments.map((file) => <li key={file.id} className="rounded-xl border border-foreground/10 p-3 text-sm">{file.name} · {(file.size / 1024).toFixed(1)} KB</li>)}</ul> : <p className="text-sm text-foreground/45">No attachments yet.</p>}<label className="inline-flex cursor-pointer items-center rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/[0.05]">Add attachment<input type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={(e) => void attach(e.target.files?.[0])} /></label></CardBody></Card>

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
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
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
          <p className="text-sm text-foreground/55">Only authorized manual or verified provider payments should be recorded. A full payment stops collection.</p>
        </div>
      </Modal>
    </div>
  );
}
