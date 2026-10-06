"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { ReminderTone, Workspace } from "@/types";
import { useCallback, useEffect, useState } from "react";

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

export default function AiCollectorPage() {
  const [ws, setWs] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [stageDaysText, setStageDaysText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.getWorkspace();
    setWs(data);
    setStageDaysText((data.reminderDays || [-3, 0, 5, 21, 35]).join(", "));
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const patch = (p: Partial<Workspace>) => setWs((prev) => (prev ? { ...prev, ...p } : prev));

  const save = async () => {
    if (!ws) return;
    setSaving(true);
    const updated = await api.updateWorkspace({ ...ws, reminderDays: stageDaysText.split(",").map((v) => Number(v.trim())).filter(Number.isFinite) });
    setWs(updated);
    setSaving(false);
  };

  const toggleActive = async () => {
    if (!ws) return;
    setSaving(true);
    const updated = await api.updateWorkspace({ aiCollectorActive: !ws.aiCollectorActive });
    setWs(updated);
    setSaving(false);
  };

  const testSend = async () => {
    if (!ws) return;
    const invoices = await api.getInvoices();
    const invoice = invoices.find((i) => i.balance > 0);
    if (!invoice) { setPreview("Add an open invoice to preview a reminder."); return; }
    const customer = await api.getCustomer(invoice.customerId);
    setPreview(`Subject: Invoice ${invoice.number} from ${ws.companyName}\n\nHi ${customer.primaryContact},\n\nThis is a ${ws.reminderTone} reminder about invoice ${invoice.number} for ${new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(invoice.balance)}, due ${invoice.dueDate}. ${invoice.paymentLink ? `Payment link: ${invoice.paymentLink}` : "Please contact us for payment details."}\n\n${ws.signature}`);
    setTestMessage("");
  };

  if (loading || !ws) return <PageLoader label="Loading AI Collector settings…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Collector</h1>
          <p className="text-sm text-foreground/55">Configure automated collection behavior</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={ws.aiCollectorActive ? "active" : "paused"}>
            {ws.aiCollectorActive ? "Active" : "Paused"}
          </Badge>
          <Button variant={ws.aiCollectorActive ? "outline" : "primary"} onClick={() => void toggleActive()} disabled={saving}>
            {ws.aiCollectorActive ? "Pause collector" : "Activate collector"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Tone & sending</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="Reminder tone"
            value={ws.reminderTone}
            onChange={(e) => patch({ reminderTone: e.target.value as ReminderTone })}
            options={TONE_OPTIONS}
          />
          <Select
            label="Approval mode"
            value={ws.approvalMode}
            onChange={(e) => patch({ approvalMode: e.target.value as Workspace["approvalMode"] })}
            options={APPROVAL_OPTIONS}
          />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={ws.autoSend}
              onChange={(e) => patch({ autoSend: e.target.checked })}
              className="rounded border-foreground/20"
            />
            <span className="text-foreground/80">Auto-send approved reminders</span>
          </label>
          <Input
            label="Max reminders per invoice"
            type="number"
            min={1}
            max={10}
            value={ws.maxReminders}
            onChange={(e) => patch({ maxReminders: Number(e.target.value) })}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Quiet hours</h2>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start"
            type="time"
            value={ws.quietHoursStart}
            onChange={(e) => patch({ quietHoursStart: e.target.value })}
          />
          <Input
            label="End"
            type="time"
            value={ws.quietHoursEnd}
            onChange={(e) => patch({ quietHoursEnd: e.target.value })}
          />
          <div className="sm:col-span-2"><p className="mb-2 text-sm font-medium">Permitted sending days · {ws.timezone}</p><div className="flex flex-wrap gap-2">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, value) => <label key={day} className="flex items-center gap-2 rounded-lg border border-foreground/10 px-3 py-2 text-sm"><input type="checkbox" checked={ws.permittedDays.includes(value)} onChange={(e) => patch({ permittedDays: e.target.checked ? [...ws.permittedDays, value].sort() : ws.permittedDays.filter((d) => d !== value) })} />{day}</label>)}</div></div>
        </CardBody>
      </Card>

      <Card><CardHeader><h2 className="font-medium">Reminder stages & exclusions</h2><p className="mt-1 text-sm text-foreground/50">Days are relative to the invoice due date. Promise follow-up waits for payment verification.</p></CardHeader><CardBody className="space-y-4"><Input label="Stage timing (comma separated days)" value={stageDaysText} onChange={(e) => setStageDaysText(e.target.value)} hint="Example: -3 before due, 0 on due date, 5 after due" /><div className="grid gap-2 sm:grid-cols-2">{["Pre-due · friendly notice", "Due date · invoice facts", "Early overdue · polite follow-up", "Mid overdue · clear request", "Late overdue · firm approval", "Promise follow-up · verify first"].map((stage, i) => <div key={stage} className="rounded-xl border border-foreground/10 p-3 text-sm"><span className="mr-2 font-mono text-violet-400">{String(i + 1).padStart(2, "0")}</span>{stage}</div>)}</div><Input label="Exclusion tags" value={(ws.exclusionTags || []).join(", ")} onChange={(e) => patch({ exclusionTags: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })} hint="Customers or invoices carrying these tags are excluded from automated reminders." /><Select label="CC policy" value={ws.ccPolicy || "none"} onChange={(e) => patch({ ccPolicy: e.target.value as Workspace["ccPolicy"] })} options={[{ value: "none", label: "No CC recipients" }, { value: "billing_contacts", label: "Verified billing contacts only" }]} /></CardBody></Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Identity & escalation</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Sender name"
            value={ws.senderName}
            onChange={(e) => patch({ senderName: e.target.value })}
          />
          <Input
            label="Reply-to email"
            type="email"
            value={ws.replyTo}
            onChange={(e) => patch({ replyTo: e.target.value })}
          />
          <Input
            label="Escalation email"
            type="email"
            value={ws.escalationEmail}
            onChange={(e) => patch({ escalationEmail: e.target.value })}
          />
          <Textarea
            label="Email signature"
            value={ws.signature}
            onChange={(e) => patch({ signature: e.target.value })}
            rows={4}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-medium">Test send preview</h2>
          <Button size="sm" variant="secondary" onClick={() => void testSend()}>
            Generate preview
          </Button>
        </CardHeader>
        {preview ? (
          <CardBody className="space-y-4">
            <pre className="whitespace-pre-wrap rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm text-foreground/75">
              {preview}
            </pre>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><Input label="Test recipient" type="email" placeholder="you@company.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} /><Button variant="outline" disabled={!/^\S+@\S+\.\S+$/.test(testEmail)} onClick={() => setTestMessage(`Demo test prepared for ${testEmail}. No email was sent.`)}>Test send</Button></div>
            {testMessage && <p role="status" className="text-sm text-emerald-300">{testMessage}</p>}
          </CardBody>
        ) : null}
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
