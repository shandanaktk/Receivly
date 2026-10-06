"use client";

import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { PLANS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import type { PlanId, ReminderTone, Workspace } from "@/types";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const STEPS = [
  { title: "Workspace", caption: "Name your workspace" },
  { title: "Location", caption: "Set your locale" },
  { title: "Contact", caption: "Add a support contact" },
  { title: "Plan", caption: "Choose your capacity" },
  { title: "Sender", caption: "Set the sender identity" },
  { title: "Voice", caption: "Choose your collection style" },
  { title: "Schedule", caption: "Set safe sending limits" },
  { title: "Customer", caption: "Add a first customer" },
  { title: "Invoice", caption: "Add an opening invoice" },
  { title: "Launch", caption: "Review and activate" },
];

const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "firm", label: "Firm" },
];

const APPROVAL_OPTIONS = [
  { value: "none", label: "No approval required" },
  { value: "first", label: "First reminder only" },
  { value: "all", label: "All outbound messages" },
  { value: "firm", label: "Firm stage only" },
];

const timezoneOptions = [
  { value: "America/New_York", label: "Eastern (US)" },
  { value: "America/Chicago", label: "Central (US)" },
  { value: "America/Los_Angeles", label: "Pacific (US)" },
  { value: "Europe/London", label: "London" },
  { value: "UTC", label: "UTC" },
];

const currencyOptions = ["USD", "EUR", "GBP", "CAD"].map((value) => ({ value, label: value }));

export default function OnboardingPage() {
  const { updateUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [ws, setWs] = useState<Partial<Workspace>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [firstAmount, setFirstAmount] = useState("");
  const [firstDueDate, setFirstDueDate] = useState("");
  const [createdCustomerId, setCreatedCustomerId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void api.getWorkspace().then((data) => {
      const pendingPlan = window.sessionStorage.getItem("receivly_pending_plan");
      setWs({ ...data, planId: PLANS.some((p) => p.id === pendingPlan) ? pendingPlan as PlanId : data.planId });
    });
  }, []);

  const patch = useCallback((value: Partial<Workspace>) => setWs((current) => ({ ...current, ...value })), []);

  const saveStep = async () => {
    setError("");
    if (step === 0 && !ws.companyName?.trim()) { setError("Add a workspace name to continue."); return; }
    if (step === 2 && !ws.supportEmail?.trim()) { setError("Add a support email to continue."); return; }
    if (step === 7 && ((customerName && !customerEmail) || (!customerName && customerEmail))) { setError("Enter both customer name and email, or leave both blank."); return; }
    if (step === 8 && firstAmount && (!createdCustomerId || !firstDueDate || Number(firstAmount) <= 0)) { setError("Add a customer, due date, and positive amount before creating an invoice."); return; }
    setSaving(true);
    try {
      await api.updateWorkspace(ws);
      if (step === 7 && customerName && customerEmail) {
        const customer = await api.saveCustomer({ name: customerName, email: customerEmail, primaryContact: customerName });
        setCreatedCustomerId(customer.id);
      }
      if (step === 8 && firstAmount && createdCustomerId) {
        await api.saveInvoice({ customerId: createdCustomerId, amount: Number(firstAmount), dueDate: firstDueDate, lineItems: [{ id: `li_${Date.now()}`, description: "Opening invoice", quantity: 1, rate: Number(firstAmount), taxRate: 0, discount: 0 }] });
      }
      if (step === STEPS.length - 1) {
        await api.updateWorkspace({ aiCollectorActive: Boolean(ws.aiCollectorActive) });
        updateUser({ onboardingCompleted: true });
        window.sessionStorage.removeItem("receivly_pending_plan");
        router.push("/app/dashboard");
      } else setStep((current) => current + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this step.");
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    if (step === 0) return <div className="grid gap-4 sm:grid-cols-2"><Input label="Workspace name" value={ws.companyName || ""} onChange={(e) => patch({ companyName: e.target.value })} placeholder="Acme Inc." /><Input label="Legal name (optional)" value={ws.legalName || ""} onChange={(e) => patch({ legalName: e.target.value })} /></div>;
    if (step === 1) return <div className="grid gap-4 sm:grid-cols-3"><Input label="Country" value={ws.country || ""} onChange={(e) => patch({ country: e.target.value })} placeholder="United States" /><Select label="Timezone" value={ws.timezone || "America/New_York"} onChange={(e) => patch({ timezone: e.target.value })} options={timezoneOptions} /><Select label="Currency" value={ws.currency || "USD"} onChange={(e) => patch({ currency: e.target.value })} options={currencyOptions} /></div>;
    if (step === 2) return <div className="grid gap-4 sm:grid-cols-2"><Input label="Support email" type="email" value={ws.supportEmail || ""} onChange={(e) => patch({ supportEmail: e.target.value })} placeholder="finance@acme.com" /><Input label="Business address (optional)" value={ws.address || ""} onChange={(e) => patch({ address: e.target.value })} /></div>;
    if (step === 3) return <div className="grid gap-3 sm:grid-cols-3">{PLANS.map((plan) => <button key={plan.id} type="button" onClick={() => patch({ planId: plan.id as PlanId })} className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 ${ws.planId === plan.id ? "border-[#111184] bg-[#111184]/10 shadow-[0_12px_30px_rgba(17,17,132,.14)]" : "border-foreground/10 hover:border-[#111184]/35"}`}><span className="step-number text-3xl text-[#111184]">0{PLANS.indexOf(plan) + 1}</span>{plan.highlighted ? <span className="ml-2 rounded-full bg-[#111184]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#111184]">Popular</span> : null}<p className="mt-3 font-semibold">{plan.name}</p><p className="mt-1 text-xl font-bold">{formatMoney(plan.priceMonthly)}<span className="text-xs font-normal text-foreground/50"> /mo</span></p><p className="mt-2 text-xs text-foreground/50">Up to {plan.invoiceAllowance} active invoices</p></button>)}</div>;
    if (step === 4) return <div className="grid gap-4 sm:grid-cols-2"><Input label="Sender display name" value={ws.senderName || ""} onChange={(e) => patch({ senderName: e.target.value })} placeholder="Acme Finance" /><Input label="Reply-to email" type="email" value={ws.replyTo || ""} onChange={(e) => patch({ replyTo: e.target.value })} placeholder="receivables@acme.com" /></div>;
    if (step === 5) return <div className="grid gap-4 sm:grid-cols-2"><Select label="Reminder tone" value={ws.reminderTone || "professional"} onChange={(e) => patch({ reminderTone: e.target.value as ReminderTone })} options={TONE_OPTIONS} /><Select label="Approval mode" value={ws.approvalMode || "firm"} onChange={(e) => patch({ approvalMode: e.target.value as Workspace["approvalMode"] })} options={APPROVAL_OPTIONS} /></div>;
    if (step === 6) return <div className="grid gap-4 sm:grid-cols-3"><Input label="Quiet hours start" type="time" value={ws.quietHoursStart || "20:00"} onChange={(e) => patch({ quietHoursStart: e.target.value })} /><Input label="Quiet hours end" type="time" value={ws.quietHoursEnd || "08:00"} onChange={(e) => patch({ quietHoursEnd: e.target.value })} /><Input label="Max reminders" type="number" min={1} max={10} value={ws.maxReminders ?? 5} onChange={(e) => patch({ maxReminders: Number(e.target.value) })} /><label className="flex items-center gap-3 text-sm sm:col-span-3"><input type="checkbox" checked={ws.autoSend ?? true} onChange={(e) => patch({ autoSend: e.target.checked })} className="rounded border-foreground/20" /><span className="text-foreground/75">Auto-send approved reminders</span></label></div>;
    if (step === 7) return <div className="grid gap-4 sm:grid-cols-2"><Input label="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Northwind Works" /><Input label="Customer email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="billing@northwind.com" /></div>;
    if (step === 8) return <div className="grid gap-4 sm:grid-cols-2"><Input label="Opening invoice amount" type="number" min="0" step="0.01" value={firstAmount} onChange={(e) => setFirstAmount(e.target.value)} placeholder="1250.00" /><Input label="Due date" type="date" value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} /></div>;
    return <div className="space-y-4"><Input label="Escalation email" type="email" value={ws.escalationEmail || ""} onChange={(e) => patch({ escalationEmail: e.target.value })} placeholder="finance-lead@acme.com" /><div className="grid gap-3 rounded-2xl border border-foreground/10 p-4 text-sm sm:grid-cols-2"><p><span className="block text-xs text-foreground/45">Workspace</span><strong>{ws.companyName || "—"}</strong></p><p><span className="block text-xs text-foreground/45">Plan</span><strong>{ws.planId || "professional"}</strong></p><p><span className="block text-xs text-foreground/45">Tone</span><strong className="capitalize">{ws.reminderTone || "professional"}</strong></p><p><span className="block text-xs text-foreground/45">Customer</span><strong>{customerName || "Add later"}</strong></p></div><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={ws.aiCollectorActive ?? true} onChange={(e) => patch({ aiCollectorActive: e.target.checked })} className="rounded border-foreground/20" /><span className="text-foreground/75">Activate AI Collector when I finish</span></label></div>;
  };

  return <main className="onboarding-page h-[100svh] overflow-hidden bg-background px-4 py-4 text-foreground sm:px-8 sm:py-6"><div className="mx-auto flex h-full max-w-6xl flex-col"><header className="flex shrink-0 items-center justify-between"><BrandMark /><div className="flex items-center gap-3"><div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-foreground/45 sm:flex"><Sparkles size={14} className="text-[#111184]" /> Workspace setup</div><ThemeToggle /></div></header><div className="onboarding-mobile-steps mb-3 mt-4 grid grid-cols-5 gap-2 lg:hidden">{STEPS.map((item, index) => <button key={item.title} type="button" title={item.title} onClick={() => index <= step && setStep(index)} className={`grid h-8 place-items-center rounded-lg border text-xs font-bold transition ${index === step ? "border-[#111184] bg-[#111184] text-white" : index < step ? "border-[#111184]/30 bg-[#111184]/10 text-[#111184]" : "border-foreground/10 text-foreground/40"}`}>{index < step ? <Check size={14} /> : index + 1}</button>)}</div><div className="grid min-h-0 flex-1 items-center gap-5 lg:grid-cols-[minmax(0,1fr)_290px]"><Card className="mx-auto w-full max-w-3xl overflow-hidden border-[#111184]/15 shadow-[0_24px_80px_rgba(17,17,132,.10)]"><CardBody className="p-5 sm:p-8"><div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#111184]">Step {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</p><h1 className="mt-2 text-4xl leading-none sm:text-6xl">{STEPS[step].title}</h1><p className="mt-2 text-sm text-foreground/55">{STEPS[step].caption}</p></div><div className="step-number text-6xl leading-none text-[#111184]/20 sm:text-8xl">{String(step + 1).padStart(2, "0")}</div></div>{error && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}<div className="min-h-[150px]">{renderStep()}</div><div className="mt-8 flex items-center justify-between border-t border-foreground/10 pt-5"><Button variant="ghost" disabled={step === 0 || saving} onClick={() => setStep((current) => current - 1)}>Back</Button><Button onClick={() => void saveStep()} disabled={saving}>{saving ? "Saving…" : step === STEPS.length - 1 ? "Finish setup" : "Continue"}<ArrowRight size={16} /></Button></div></CardBody></Card><aside className="hidden lg:block"><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-foreground/45">Your setup map</p><div className="grid gap-2">{STEPS.map((item, index) => <button key={item.title} type="button" onClick={() => index <= step && setStep(index)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${index === step ? "border-[#111184] bg-[#111184] text-white shadow-[0_12px_30px_rgba(17,17,132,.18)]" : index < step ? "border-[#111184]/20 bg-[#111184]/5 text-[#111184]" : "border-foreground/10 bg-background text-foreground/45"}`}><span className={`step-number text-2xl ${index === step ? "text-white" : "text-[#111184]/45"}`}>{String(index + 1).padStart(2, "0")}</span><span><strong className="block text-sm">{item.title}</strong><small className={index === step ? "text-white/70" : "text-foreground/45"}>{item.caption}</small></span>{index < step ? <Check size={15} className="ml-auto" /> : null}</button>)}</div></aside></div></div></main>;
}
