"use client";

import { GmailConnect } from "@/components/app/GmailConnect";
import { GmailLogo } from "@/components/app/GmailLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { collectorEmail, stageKind, stageTitle } from "@/lib/collectorCopy";
import { formatDate, formatMoney } from "@/lib/format";
import type { Customer, Invoice, ReminderTone, Workspace } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "firm", label: "Firm" },
];

const APPROVAL_OPTIONS = [
  { value: "none", label: "No approval" },
  { value: "first", label: "First reminder only" },
  { value: "all", label: "All messages" },
  { value: "firm", label: "Firm stage only" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AiCollectorPage() {
  const router = useRouter();
  const [ws, setWs] = useState<Workspace | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [stageDaysText, setStageDaysText] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [day, setDay] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [data, bills, people] = await Promise.all([api.getWorkspace(), api.getInvoices(), api.getCustomers()]);
    setWs(data);
    setInvoices(bills);
    setCustomers(people);
    const days = data.reminderDays || [-3, 0, 5, 21, 35];
    setStageDaysText(days.join(", "));
    setDay(days.includes(0) ? 0 : days[0]);
    setInvoiceId((current) => current || bills.find((item) => item.balance > 0 && !["draft", "paid", "void", "written_off"].includes(item.status))?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const patch = (values: Partial<Workspace>) => setWs((prev) => (prev ? { ...prev, ...values } : prev));
  const stages = stageDaysText.split(",").map((value) => Number(value.trim())).filter(Number.isFinite);
  const openInvoices = invoices.filter((item) => item.balance > 0 && !["draft", "paid", "void", "written_off"].includes(item.status));
  const selected = openInvoices.find((item) => item.id === invoiceId) || openInvoices[0];
  const customer = customers.find((item) => item.id === selected?.customerId);
  const preview = useMemo(() => {
    if (!ws || !selected) return null;
    return collectorEmail({ tone: ws.reminderTone, day, companyName: ws.companyName, signature: ws.signature, invoice: selected, contact: customer?.primaryContact || "there" });
  }, [ws, selected, day, customer]);

  const save = async () => {
    if (!ws) return;
    setSaving(true);
    setError("");
    const updated = await api.updateWorkspace({ ...ws, reminderDays: stages });
    setWs(updated);
    setNotice("Collector settings saved.");
    setSaving(false);
  };

  const toggleActive = async () => {
    if (!ws) return;
    setSaving(true);
    setWs(await api.updateWorkspace({ aiCollectorActive: !ws.aiCollectorActive }));
    setSaving(false);
  };

  const queueReminder = async () => {
    if (!selected || !preview) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const thread = await api.sendCollectorReminder(selected.id, { ...preview, stage: stageKind(day) });
      setNotice(`Reminder added to the Gmail thread for ${selected.number}.`);
      router.push(`/app/conversations/${thread.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not queue that reminder.");
      setSaving(false);
    }
  };

  if (loading || !ws) return <PageLoader label="Loading AI Collector…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Collector</h1>
          <p className="mt-1 max-w-2xl text-sm text-foreground/55">Reminders for unpaid and late invoices go out from your Gmail. Change the tone or the stage and the email on the right updates immediately.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={ws.aiCollectorActive ? "active" : "paused"}>{ws.aiCollectorActive ? "Active" : "Paused"}</Badge>
          <Button variant={ws.aiCollectorActive ? "outline" : "primary"} onClick={() => void toggleActive()} disabled={saving}>{ws.aiCollectorActive ? "Pause collector" : "Activate collector"}</Button>
        </div>
      </div>

      {error ? <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p> : null}
      {notice ? <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p> : null}
      <GmailConnect email={ws.gmailEmail} onChange={(gmailEmail) => patch({ gmailEmail })} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,440px)]">
        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-medium">Reminder flow</h2><p className="mt-1 text-sm text-foreground/50">Days are counted from the due date. Pick a stage to preview that email.</p></CardHeader>
            <CardBody className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {stages.map((value) => (
                  <button key={value} type="button" onClick={() => setDay(value)} className={`shrink-0 rounded-2xl border px-3 py-2 text-left text-xs ${day === value ? "border-[#111184] bg-[#111184]/10" : "border-foreground/10"}`}>
                    <span className="block font-semibold">{value > 0 ? `+${value}` : value}</span>
                    <span className="text-foreground/55">{stageTitle(value)}</span>
                  </button>
                ))}
              </div>
              <Input label="Stage days" value={stageDaysText} onChange={(event) => setStageDaysText(event.target.value)} hint="Example: -3, 0, 5, 21, 35" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Tone" value={ws.reminderTone} onChange={(event) => patch({ reminderTone: event.target.value as ReminderTone })} options={TONE_OPTIONS} />
                <Select label="Approval" value={ws.approvalMode} onChange={(event) => patch({ approvalMode: event.target.value as Workspace["approvalMode"] })} options={APPROVAL_OPTIONS} />
                <Input label="Max reminders per invoice" type="number" min={1} max={10} value={ws.maxReminders} onChange={(event) => patch({ maxReminders: Number(event.target.value) })} />
                <label className="flex items-end gap-3 pb-3 text-sm"><input type="checkbox" checked={ws.autoSend} onChange={(event) => patch({ autoSend: event.target.checked })} className="rounded border-foreground/20" /><span>Auto-send when approval rules allow it</span></label>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h2 className="font-medium">When it can send</h2></CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Quiet hours start" type="time" value={ws.quietHoursStart} onChange={(event) => patch({ quietHoursStart: event.target.value })} />
                <Input label="Quiet hours end" type="time" value={ws.quietHoursEnd} onChange={(event) => patch({ quietHoursEnd: event.target.value })} />
              </div>
              <div className="flex flex-wrap gap-2">{DAYS.map((label, value) => <label key={label} className="flex items-center gap-2 rounded-lg border border-foreground/10 px-3 py-2 text-sm"><input type="checkbox" checked={ws.permittedDays.includes(value)} onChange={(event) => patch({ permittedDays: event.target.checked ? [...ws.permittedDays, value].sort() : ws.permittedDays.filter((item) => item !== value) })} />{label}</label>)}</div>
              <Input label="Exclusion tags" value={(ws.exclusionTags || []).join(", ")} onChange={(event) => patch({ exclusionTags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} hint="Invoices or customers with these tags are skipped." />
              <Select label="CC policy" value={ws.ccPolicy || "none"} onChange={(event) => patch({ ccPolicy: event.target.value as Workspace["ccPolicy"] })} options={[{ value: "none", label: "No CC recipients" }, { value: "billing_contacts", label: "Verified billing contacts only" }]} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h2 className="font-medium">Sender</h2></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Input label="Sender name" value={ws.senderName} onChange={(event) => patch({ senderName: event.target.value })} />
              <Input label="Reply-to" type="email" value={ws.replyTo} onChange={(event) => patch({ replyTo: event.target.value })} />
              <Input label="Escalation email" type="email" value={ws.escalationEmail} onChange={(event) => patch({ escalationEmail: event.target.value })} />
              <div className="sm:col-span-2"><Textarea label="Signature" value={ws.signature} onChange={(event) => patch({ signature: event.target.value })} rows={3} /></div>
              <Button onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : "Save collector"}</Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h2 className="font-medium">Invoices in this flow</h2><p className="mt-1 text-sm text-foreground/50">Open balances the collector can remind. Paused invoices stay out.</p></CardHeader>
            <CardBody className="space-y-2">
              {openInvoices.length === 0 ? <p className="text-sm text-foreground/50">No open invoices yet. Create and send one first.</p> : openInvoices.map((item) => {
                const person = customers.find((entry) => entry.id === item.customerId);
                const skipped = item.collectorPaused || (item.tags || []).some((tag) => (ws.exclusionTags || []).includes(tag));
                return (
                  <button key={item.id} type="button" onClick={() => setInvoiceId(item.id)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-sm ${selected?.id === item.id ? "border-[#111184] bg-[#111184]/10" : "border-foreground/10"}`}>
                    <span><span className="font-medium">{item.number}</span><span className="mt-0.5 block text-xs text-foreground/50">{person?.name} · due {formatDate(item.dueDate)}</span></span>
                    <span className="text-right"><span className="block font-medium">{formatMoney(item.balance, item.currency)}</span><span className="text-xs text-foreground/45">{skipped ? "Skipped" : "Will remind"}</span></span>
                  </button>
                );
              })}
            </CardBody>
          </Card>
        </div>

        <aside className="gmail-thread sticky top-24 space-y-3 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <GmailLogo size={26} />
            <div>
              <p className="text-sm font-semibold">Live reminder</p>
              <p className="gmail-muted text-xs">{ws.gmailEmail ? `From ${ws.gmailEmail}` : "Connect Gmail to choose the sending account."}</p>
            </div>
          </div>
          {preview && selected ? (
            <article className="gmail-card rounded-xl border border-[#e8eaed] p-4 text-sm shadow-sm">
              <p className="text-xs font-semibold">{ws.senderName} &lt;{ws.gmailEmail || ws.replyTo}&gt;</p>
              <p className="gmail-muted text-xs">to {customer?.name} &lt;{customer?.email}&gt;</p>
              <p className="mt-3 font-semibold">{preview.subject}</p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{preview.body}</p>
            </article>
          ) : <p className="text-sm">Create an open invoice to preview a reminder.</p>}
          <button type="button" disabled={saving || !selected || !preview} onClick={() => void queueReminder()} className="inline-flex h-10 items-center rounded-full bg-[#1a73e8] px-4 text-sm font-medium text-white disabled:opacity-50">Queue this reminder</button>
          {selected ? <Link href={`/app/invoices/${selected.id}`} className="block text-xs text-[#1a73e8]">Open {selected.number}</Link> : null}
        </aside>
      </div>
    </div>
  );
}
