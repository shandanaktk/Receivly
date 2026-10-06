"use client";

import { GmailConnect } from "@/components/app/GmailConnect";
import { GmailLogo } from "@/components/app/GmailLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { api } from "@/lib/api";
import { collectorEmail, stageKind, stageTitle } from "@/lib/collectorCopy";
import { formatDate, formatMoney } from "@/lib/format";
import type { Customer, Invoice, ReminderTone, Workspace } from "@/types";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function AiCollectorPage() {
  const router = useRouter();
  const [ws, setWs] = useState<Workspace | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("tone");
  const [stageDaysText, setStageDaysText] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [day, setDay] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [data, bills, people] = await Promise.all([
      api.getWorkspace(),
      api.getInvoices(),
      api.getCustomers(),
    ]);
    const reminderDays = data.reminderDays || [-3, 0, 5, 21, 35];
    setWs(data);
    setInvoices(bills);
    setCustomers(people);
    setStageDaysText(reminderDays.join(", "));
    setDay(reminderDays.includes(0) ? 0 : reminderDays[0]);
    setInvoiceId(
      (current) =>
        current ||
        bills.find(
          (item) =>
            item.balance > 0 &&
            !["draft", "paid", "void", "written_off"].includes(item.status),
        )?.id ||
        "",
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const patch = (values: Partial<Workspace>) => {
    setWs((current) => (current ? { ...current, ...values } : current));
    setNotice("");
    setError("");
  };

  const stages = stageDaysText
    .split(",")
    .map((value) => Number(value.trim()))
    .filter(Number.isFinite);
  const openInvoices = invoices.filter(
    (item) =>
      item.balance > 0 &&
      !["draft", "paid", "void", "written_off"].includes(item.status),
  );
  const selected = openInvoices.find((item) => item.id === invoiceId) || openInvoices[0];
  const customer = customers.find((item) => item.id === selected?.customerId);
  const preview = ws && selected
    ? collectorEmail({
        tone: ws.reminderTone,
        day,
        companyName: ws.companyName,
        signature: ws.signature,
        invoice: selected,
        contact: customer?.primaryContact || "there",
      })
    : null;

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
    setNotice("");
    setError("");
    try {
      const updated = await api.updateWorkspace({ ...ws, reminderDays: stages });
      setWs(updated);
      setNotice("Collector settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save collector settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!ws) return;
    setSaving(true);
    setNotice("");
    setError("");
    try {
      setWs(await api.updateWorkspace({ aiCollectorActive: !ws.aiCollectorActive }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the collector.");
    } finally {
      setSaving(false);
    }
  };

  const queueReminder = async () => {
    if (!selected || !preview) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const thread = await api.sendCollectorReminder(selected.id, {
        ...preview,
        stage: stageKind(day),
      });
      setNotice(`Reminder added to the Gmail thread for ${selected.number}.`);
      router.push(`/app/conversations/${thread.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not queue that reminder.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !ws) return <PageLoader label="Loading AI Collector settings…" />;

  const currentTab = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];
  const CurrentIcon = currentTab.icon;

  return (
    <div className="ai-collector-page w-full">
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

        {error ? (
          <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {notice}
          </p>
        ) : null}

        <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
          <aside className="lg:sticky lg:top-24" aria-label="AI Collector sections">
            <div className="workspace-card overflow-hidden rounded-2xl border border-foreground/10 bg-elevated">
              <div
                className="sidebar-nav flex gap-2 overflow-x-auto p-2 lg:flex-col lg:overflow-visible"
                role="tablist"
                aria-label="Collector settings"
              >
                {TABS.map((tab, index) => {
                  const Icon = tab.icon;
                  const selectedTab = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`collector-tab-${tab.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selectedTab}
                      aria-controls="collector-settings-panel"
                      tabIndex={selectedTab ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      onKeyDown={(event) => moveBetweenTabs(event, index)}
                      className={`group flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-left transition lg:min-w-0 ${
                        selectedTab
                          ? "bg-[#111184] text-white shadow-[0_10px_28px_rgba(17,17,132,.22)]"
                          : "text-foreground/65 hover:bg-foreground/[0.05] hover:text-foreground"
                      }`}
                    >
                      <span className={`collector-tab-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg ${selectedTab ? "is-active" : ""}`}>
                        <Icon size={18} strokeWidth={1.9} aria-hidden />
                      </span>
                      <span className="text-[13px] font-bold leading-5">{tab.label}</span>
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
                      {DAYS.map((label, value) => {
                        const checked = ws.permittedDays.includes(value);
                        return (
                          <label
                            key={label}
                            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-xs font-bold transition ${
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
                            {label}
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
                      setNotice("");
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
                  <GmailConnect email={ws.gmailEmail} onChange={(gmailEmail) => patch({ gmailEmail })} />
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
                <div className="min-w-0 space-y-6">
                  <div className="max-w-xl">
                    <Select
                      label="Invoice"
                      value={selected?.id || ""}
                      onChange={(event) => setInvoiceId(event.target.value)}
                      options={openInvoices.map((invoice) => ({
                        value: invoice.id,
                        label: `${invoice.number} · ${formatMoney(invoice.balance, invoice.currency)}`,
                      }))}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-medium text-foreground/80">Reminder stage</p>
                    {stages.length === 0 ? (
                      <p className="text-xs text-foreground/50">Add stage timing under Stages & exclusions to preview a reminder.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {stages.map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setDay(value)}
                            className={`min-w-0 rounded-lg border px-3 py-2.5 text-left text-xs transition ${
                              day === value
                                ? "border-[#111184] bg-[#111184] text-white"
                                : "border-foreground/10 text-foreground/70 hover:border-[#111184]/35"
                            }`}
                          >
                            <span className="block font-bold">{value > 0 ? `+${value}` : value}</span>
                            <span className={`mt-0.5 block leading-4 ${day === value ? "text-white/80" : "text-foreground/55"}`}>{stageTitle(value)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {preview && selected ? (
                    <div className="gmail-thread overflow-hidden rounded-2xl border border-[#e8eaed] p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <GmailLogo size={28} />
                        <div>
                          <p className="text-sm font-bold">Live reminder</p>
                          <p className="gmail-muted text-xs">
                            {ws.gmailEmail ? `From ${ws.gmailEmail}` : "Connect Gmail in Identity & escalation to send."}
                          </p>
                        </div>
                      </div>
                      <article className="gmail-card rounded-xl border border-[#e8eaed] p-4 text-sm shadow-sm">
                        <p className="text-xs font-semibold">{ws.senderName} &lt;{ws.gmailEmail || ws.replyTo}&gt;</p>
                        <p className="gmail-muted text-xs">to {customer?.name} &lt;{customer?.email}&gt;</p>
                        <p className="mt-3 font-semibold">{preview.subject}</p>
                        <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed">{preview.body}</p>
                      </article>
                    </div>
                  ) : (
                    <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-foreground/15 px-5 text-center">
                      <div>
                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-foreground/[0.05] text-foreground/45">
                          <MailCheck size={22} aria-hidden />
                        </span>
                        <p className="mt-3 text-sm font-bold">No open invoice to preview</p>
                        <p className="mt-1 text-xs text-foreground/45">Create and send an invoice with an open balance first.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-foreground/55">
                      {selected ? (
                        <>
                          Due {formatDate(selected.dueDate)} ·{" "}
                          <Link href={`/app/invoices/${selected.id}`} className="brand-ink font-bold hover:underline">
                            Open {selected.number}
                          </Link>
                        </>
                      ) : (
                        "No eligible invoices are available."
                      )}
                    </div>
                    <Button
                      type="button"
                      disabled={saving || !selected || !preview}
                      onClick={() => void queueReminder()}
                    >
                      <Send size={15} aria-hidden />
                      Queue this reminder
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardBody>

            <div className="flex flex-col gap-3 border-t border-foreground/10 bg-foreground/[0.018] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-xs text-foreground/45">Save changes before they are used for future reminders.</p>
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
