"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { api } from "@/lib/api";
import type { ReminderTone, Workspace } from "@/types";
import {
  Check,
  Clock3,
  ListChecks,
  MailCheck,
  Send,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";

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

const STAGES = [
  { title: "Pre-due", detail: "A friendly heads-up before payment is due" },
  { title: "Due date", detail: "A clear reminder with the invoice facts" },
  { title: "Early overdue", detail: "A polite follow-up after the due date" },
  { title: "Mid overdue", detail: "A direct request for a payment update" },
  { title: "Late overdue", detail: "A firm reminder sent for approval" },
  { title: "Promise follow-up", detail: "Verifies payment before following up" },
];

type TabId = "tone" | "hours" | "stages" | "identity" | "preview";

interface CollectorTab {
  id: TabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

const TABS: CollectorTab[] = [
  {
    id: "tone",
    label: "Tone & sending",
    description: "Voice, approvals, and delivery rules",
    icon: Send,
  },
  {
    id: "hours",
    label: "Quiet hours",
    description: "Choose when reminders may be sent",
    icon: Clock3,
  },
  {
    id: "stages",
    label: "Stages & exclusions",
    description: "Timing, sequences, and skip rules",
    icon: ListChecks,
  },
  {
    id: "identity",
    label: "Identity & escalation",
    description: "Sender details and team handoff",
    icon: UserRound,
  },
  {
    id: "preview",
    label: "Test send",
    description: "Preview the customer experience",
    icon: MailCheck,
  },
];

interface MessagePreview {
  subject: string;
  body: string;
}

export default function AiCollectorPage() {
  const [ws, setWs] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("tone");
  const [preview, setPreview] = useState<MessagePreview | null>(null);
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

  const patch = (next: Partial<Workspace>) => {
    setWs((current) => (current ? { ...current, ...next } : current));
    setSaved(false);
  };

  const moveBetweenTabs = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = TABS[nextIndex];
    setActiveTab(nextTab.id);
    window.requestAnimationFrame(() => document.getElementById(`collector-tab-${nextTab.id}`)?.focus());
  };

  const save = async () => {
    if (!ws) return;
    setSaving(true);
    setSaved(false);
    try {
      const reminderDays = stageDaysText
        .split(",")
        .map((value) => Number(value.trim()))
        .filter(Number.isFinite);
      const updated = await api.updateWorkspace({ ...ws, reminderDays });
      setWs(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!ws) return;
    setSaving(true);
    try {
      const updated = await api.updateWorkspace({ aiCollectorActive: !ws.aiCollectorActive });
      setWs(updated);
    } finally {
      setSaving(false);
    }
  };

  const testSend = async () => {
    if (!ws) return;
    setTesting(true);
    setTestMessage("");
    try {
      const invoices = await api.getInvoices();
      const invoice = invoices.find((item) => item.balance > 0);
      if (!invoice) {
        setPreview({
          subject: "Preview unavailable",
          body: "Add an open invoice to preview a reminder.",
        });
        return;
      }
      const customer = await api.getCustomer(invoice.customerId);
      const amount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency,
      }).format(invoice.balance);
      setPreview({
        subject: `Invoice ${invoice.number} from ${ws.companyName}`,
        body: `Hi ${customer.primaryContact},\n\nThis is a ${ws.reminderTone} reminder about invoice ${invoice.number} for ${amount}, due ${invoice.dueDate}. ${invoice.paymentLink ? `Payment link: ${invoice.paymentLink}` : "Please contact us for payment details."}\n\n${ws.signature}`,
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading || !ws) return <PageLoader label="Loading AI Collector settings…" />;

  const currentTab = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];
  const CurrentIcon = currentTab.icon;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl space-y-6">
      <header className="relative overflow-hidden rounded-[28px] border border-[#111184]/15 bg-[linear-gradient(135deg,rgba(17,17,132,.12),rgba(17,17,132,.025)_52%,transparent)] px-5 py-6 sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-[#111184]/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#111184] dark:text-[#a9a9ff]">
              <Sparkles size={14} aria-hidden />
              Automation workspace
            </div>
            <h1 className="text-3xl font-bold tracking-[-.055em] sm:text-4xl">AI Collector</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-foreground/60 sm:text-[15px]">
              Shape how Receivly follows up, when it sends, and how every reminder sounds to your customers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Badge status={ws.aiCollectorActive ? "active" : "paused"}>
              {ws.aiCollectorActive ? "Collector active" : "Collector paused"}
            </Badge>
            <Button
              variant={ws.aiCollectorActive ? "outline" : "primary"}
              onClick={() => void toggleActive()}
              disabled={saving}
            >
              {ws.aiCollectorActive ? "Pause collector" : "Activate collector"}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <aside className="lg:sticky lg:top-24" aria-label="AI Collector sections">
          <div className="workspace-card overflow-hidden rounded-2xl border border-foreground/10 bg-elevated">
            <div className="hidden border-b border-foreground/10 px-4 py-4 lg:block">
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-foreground/40">Collector settings</p>
              <p className="mt-1 text-xs leading-5 text-foreground/55">Move between sections without losing your changes.</p>
            </div>
            <div
              className="sidebar-nav flex gap-2 overflow-x-auto p-2 lg:flex-col lg:overflow-visible"
              role="tablist"
              aria-label="Collector settings"
            >
              {TABS.map((tab, index) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`collector-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="collector-settings-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(event) => moveBetweenTabs(event, index)}
                    className={`group flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-left transition lg:min-w-0 ${
                      selected
                        ? "bg-[#111184] text-white shadow-[0_10px_28px_rgba(17,17,132,.22)]"
                        : "text-foreground/65 hover:bg-foreground/[0.05] hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        selected ? "bg-white/15" : "bg-[#111184]/8 text-[#111184] dark:text-[#a9a9ff]"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.9} aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold leading-5">{tab.label}</span>
                      <span className={`hidden text-[11px] leading-4 lg:block ${selected ? "text-white/65" : "text-foreground/45"}`}>
                        {tab.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <Card
          id="collector-settings-panel"
          role="tabpanel"
          aria-labelledby={`collector-tab-${activeTab}`}
          className="overflow-hidden rounded-[26px]"
        >
          <div className="border-b border-foreground/10 bg-[linear-gradient(120deg,rgba(17,17,132,.075),transparent_60%)] px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#111184] text-white shadow-[0_10px_26px_rgba(17,17,132,.2)]">
                <CurrentIcon size={22} strokeWidth={1.8} aria-hidden />
              </div>
              <div>
                <p className="ai-collector-label text-[10px] font-bold uppercase tracking-[.2em] text-[#111184]/70">AI Collector</p>
                <h2 className="mt-1 text-2xl font-bold tracking-[-.045em] sm:text-[1.8rem]">{currentTab.label}</h2>
                <p className="mt-1 text-sm leading-6 text-foreground/55">{currentTab.description}</p>
              </div>
            </div>
          </div>

          <CardBody className="p-5 sm:p-8">
            {activeTab === "tone" ? (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    label="Reminder tone"
                    value={ws.reminderTone}
                    onChange={(event) => patch({ reminderTone: event.target.value as ReminderTone })}
                    options={TONE_OPTIONS}
                  />
                  <Select
                    label="Approval mode"
                    value={ws.approvalMode}
                    onChange={(event) => patch({ approvalMode: event.target.value as Workspace["approvalMode"] })}
                    options={APPROVAL_OPTIONS}
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[#111184]/15 bg-[#111184]/[0.035] p-4 transition hover:border-[#111184]/30">
                  <input
                    type="checkbox"
                    checked={ws.autoSend}
                    onChange={(event) => patch({ autoSend: event.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-foreground/20 accent-[#111184]"
                  />
                  <span>
                    <span className="block text-sm font-bold text-foreground">Auto-send approved reminders</span>
                    <span className="mt-1 block text-xs leading-5 text-foreground/50">
                      Messages that meet your approval rules can be delivered without another manual step.
                    </span>
                  </span>
                </label>

                <div className="max-w-sm">
                  <Input
                    label="Max reminders per invoice"
                    type="number"
                    min={1}
                    max={10}
                    value={ws.maxReminders}
                    onChange={(event) => patch({ maxReminders: Number(event.target.value) })}
                    hint="Choose between 1 and 10 reminders."
                  />
                </div>
              </div>
            ) : null}

            {activeTab === "hours" ? (
              <div className="space-y-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Quiet hours start"
                    type="time"
                    value={ws.quietHoursStart}
                    onChange={(event) => patch({ quietHoursStart: event.target.value })}
                  />
                  <Input
                    label="Quiet hours end"
                    type="time"
                    value={ws.quietHoursEnd}
                    onChange={(event) => patch({ quietHoursEnd: event.target.value })}
                  />
                </div>

                <div className="rounded-2xl border border-foreground/10 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-base font-bold">Permitted sending days</h3>
                    <p className="mt-1 text-xs text-foreground/50">Times are interpreted in {ws.timezone}.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {DAYS.map((day, value) => {
                      const checked = ws.permittedDays.includes(value);
                      return (
                        <label
                          key={day}
                          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-bold transition ${
                            checked
                              ? "border-[#111184] bg-[#111184] text-white shadow-sm"
                              : "border-foreground/10 text-foreground/55 hover:border-[#111184]/35"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              patch({
                                permittedDays: event.target.checked
                                  ? [...ws.permittedDays, value].sort()
                                  : ws.permittedDays.filter((item) => item !== value),
                              })
                            }
                            className="sr-only"
                          />
                          {checked ? <Check size={14} aria-hidden /> : <span className="h-3.5" />}
                          {day}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "stages" ? (
              <div className="space-y-6">
                <Input
                  label="Stage timing (comma-separated days)"
                  value={stageDaysText}
                  onChange={(event) => {
                    setStageDaysText(event.target.value);
                    setSaved(false);
                  }}
                  hint="Use negative numbers before the due date and positive numbers after it, for example: -3, 0, 5, 21, 35."
                />

                <div>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <h3 className="text-base font-bold">Reminder sequence</h3>
                    <span className="text-[11px] font-medium text-foreground/40">Due-date relative</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {STAGES.map((stage, index) => (
                      <div key={stage.title} className="flex gap-3 rounded-2xl border border-foreground/10 p-4">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#111184]/10 font-mono text-xs font-bold text-[#111184] dark:text-[#a9a9ff]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="text-sm font-bold">{stage.title}</p>
                          <p className="mt-1 text-xs leading-5 text-foreground/50">{stage.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 border-t border-foreground/10 pt-6 sm:grid-cols-2">
                  <Input
                    label="Exclusion tags"
                    value={(ws.exclusionTags || []).join(", ")}
                    onChange={(event) =>
                      patch({
                        exclusionTags: event.target.value
                          .split(",")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      })
                    }
                    hint="Customers or invoices with these tags are skipped."
                  />
                  <Select
                    label="CC policy"
                    value={ws.ccPolicy || "none"}
                    onChange={(event) => patch({ ccPolicy: event.target.value as Workspace["ccPolicy"] })}
                    options={[
                      { value: "none", label: "No CC recipients" },
                      { value: "billing_contacts", label: "Verified billing contacts only" },
                    ]}
                  />
                </div>
              </div>
            ) : null}

            {activeTab === "identity" ? (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Sender name"
                    value={ws.senderName}
                    onChange={(event) => patch({ senderName: event.target.value })}
                  />
                  <Input
                    label="Reply-to email"
                    type="email"
                    value={ws.replyTo}
                    onChange={(event) => patch({ replyTo: event.target.value })}
                  />
                </div>
                <Input
                  label="Escalation email"
                  type="email"
                  value={ws.escalationEmail}
                  onChange={(event) => patch({ escalationEmail: event.target.value })}
                  hint="Replies that need a person will be routed here."
                />
                <Textarea
                  label="Email signature"
                  value={ws.signature}
                  onChange={(event) => patch({ signature: event.target.value })}
                  rows={5}
                />
              </div>
            ) : null}

            {activeTab === "preview" ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-2xl border border-[#111184]/15 bg-[#111184]/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div>
                    <h3 className="text-base font-bold">Generate a realistic reminder</h3>
                    <p className="mt-1 text-xs leading-5 text-foreground/50">Uses an open invoice and your current settings. No email is sent.</p>
                  </div>
                  <Button variant="secondary" onClick={() => void testSend()} disabled={testing} className="shrink-0">
                    <Sparkles size={15} aria-hidden />
                    {testing ? "Generating…" : "Generate preview"}
                  </Button>
                </div>

                {preview ? (
                  <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-elevated shadow-[0_18px_50px_rgba(31,36,83,.08)]">
                    <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-3 sm:px-5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#111184] text-xs font-bold text-white">
                        {ws.senderName.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{ws.senderName}</p>
                        <p className="truncate text-[11px] text-foreground/45">Reply to {ws.replyTo}</p>
                      </div>
                    </div>
                    <div className="border-b border-foreground/10 px-4 py-4 sm:px-5">
                      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-foreground/40">Subject</p>
                      <p className="mt-1 text-sm font-bold sm:text-base">{preview.subject}</p>
                    </div>
                    <p className="whitespace-pre-wrap px-4 py-5 text-sm leading-7 text-foreground/75 sm:px-5 sm:py-6">{preview.body}</p>
                  </div>
                ) : (
                  <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-foreground/15 px-5 text-center">
                    <div>
                      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-foreground/[0.05] text-foreground/45">
                        <MailCheck size={22} aria-hidden />
                      </span>
                      <p className="mt-3 text-sm font-bold">Your preview will appear here</p>
                      <p className="mt-1 text-xs text-foreground/45">Generate one to check the tone, details, and signature.</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <Input
                    label="Test recipient"
                    type="email"
                    placeholder="you@company.com"
                    value={testEmail}
                    onChange={(event) => {
                      setTestEmail(event.target.value);
                      setTestMessage("");
                    }}
                  />
                  <Button
                    variant="outline"
                    disabled={!preview || !/^\S+@\S+\.\S+$/.test(testEmail)}
                    onClick={() => setTestMessage(`Demo test prepared for ${testEmail}. No email was sent.`)}
                  >
                    Test send
                  </Button>
                </div>
                {testMessage ? <p role="status" className="text-sm text-emerald-300">{testMessage}</p> : null}
              </div>
            ) : null}
          </CardBody>

          <div className="flex flex-col gap-3 border-t border-foreground/10 bg-foreground/[0.018] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-xs text-foreground/45" role="status">
              {saved ? "Settings saved. Future reminders will use these changes." : "Changes apply to future reminders after you save."}
            </p>
            <Button onClick={() => void save()} disabled={saving} className="w-full sm:w-auto">
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
}
