"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { PLANS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import type { PlanId, ReminderTone, Workspace } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const STEPS = [
  "Company profile",
  "Choose plan",
  "Sender identity",
  "Reminder defaults",
  "First data",
  "Activate collector",
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

export default function OnboardingPage() {
  const { updateUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [ws, setWs] = useState<Partial<Workspace>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    void api.getWorkspace().then(setWs);
  }, []);

  const patch = useCallback((p: Partial<Workspace>) => {
    setWs((prev) => ({ ...prev, ...p }));
  }, []);

  const saveStep = async () => {
    setSaving(true);
    try {
      if (step === 4 && customerName && customerEmail) {
        await api.saveCustomer({
          name: customerName,
          email: customerEmail,
          primaryContact: customerName,
        });
      }
      await api.updateWorkspace(ws);
      if (step < STEPS.length - 1) setStep((s) => s + 1);
      else {
        await api.updateWorkspace({ aiCollectorActive: true });
        updateUser({ onboardingCompleted: true });
        router.push("/app/dashboard");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm text-fuchsia-300/80">Welcome to Receivly AI</p>
        <h1 className="mt-1 text-2xl font-semibold">Set up your workspace</h1>
        <p className="mt-2 text-sm text-white/55">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <div className="mt-4 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-gradient-to-r from-fuchsia-500 to-blue-600" : "bg-white/10"}`}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">{STEPS[step]}</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {step === 0 && (
            <>
              <Input
                label="Company name"
                value={ws.companyName || ""}
                onChange={(e) => patch({ companyName: e.target.value })}
                placeholder="Acme Inc."
              />
              <Input
                label="Legal name (optional)"
                value={ws.legalName || ""}
                onChange={(e) => patch({ legalName: e.target.value })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Country"
                  value={ws.country || ""}
                  onChange={(e) => patch({ country: e.target.value })}
                />
                <Select
                  label="Timezone"
                  value={ws.timezone || "America/New_York"}
                  onChange={(e) => patch({ timezone: e.target.value })}
                  options={[
                    { value: "America/New_York", label: "Eastern (US)" },
                    { value: "America/Chicago", label: "Central (US)" },
                    { value: "America/Los_Angeles", label: "Pacific (US)" },
                    { value: "Europe/London", label: "London" },
                    { value: "UTC", label: "UTC" },
                  ]}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Currency"
                  value={ws.currency || "USD"}
                  onChange={(e) => patch({ currency: e.target.value })}
                  options={[
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                    { value: "CAD", label: "CAD" },
                  ]}
                />
                <Input
                  label="Support email"
                  type="email"
                  value={ws.supportEmail || ""}
                  onChange={(e) => patch({ supportEmail: e.target.value })}
                />
              </div>
              <Input
                label="Business address"
                value={ws.address || ""}
                onChange={(e) => patch({ address: e.target.value })}
              />
              <Input
                label="Tax ID (optional)"
                value={ws.taxId || ""}
                onChange={(e) => patch({ taxId: e.target.value })}
              />
            </>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => patch({ planId: plan.id as PlanId })}
                  className={`rounded-2xl border p-4 text-left transition ${
                    ws.planId === plan.id
                      ? "border-fuchsia-500/60 bg-fuchsia-500/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.highlighted ? (
                    <span className="text-xs font-medium text-fuchsia-300">Popular</span>
                  ) : null}
                  <p className="mt-1 font-semibold">{plan.name}</p>
                  <p className="text-2xl font-bold">
                    {formatMoney(plan.priceMonthly)}
                    <span className="text-sm font-normal text-white/50">/mo</span>
                  </p>
                  <p className="mt-2 text-xs text-white/50">
                    Up to {plan.invoiceAllowance} active invoices
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-white/60">
                    {plan.features.slice(0, 3).map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <>
              <Input
                label="Sender display name"
                value={ws.senderName || ""}
                onChange={(e) => patch({ senderName: e.target.value })}
                hint="Shown in reminder emails"
              />
              <Input
                label="Reply-to email"
                type="email"
                value={ws.replyTo || ""}
                onChange={(e) => patch({ replyTo: e.target.value })}
              />
              <Textarea
                label="Email signature"
                value={ws.signature || ""}
                onChange={(e) => patch({ signature: e.target.value })}
                rows={4}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Select
                label="Default reminder tone"
                value={ws.reminderTone || "professional"}
                onChange={(e) => patch({ reminderTone: e.target.value as ReminderTone })}
                options={TONE_OPTIONS}
              />
              <Select
                label="Approval mode"
                value={ws.approvalMode || "firm"}
                onChange={(e) =>
                  patch({ approvalMode: e.target.value as Workspace["approvalMode"] })
                }
                options={APPROVAL_OPTIONS}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Quiet hours start"
                  type="time"
                  value={ws.quietHoursStart || "20:00"}
                  onChange={(e) => patch({ quietHoursStart: e.target.value })}
                />
                <Input
                  label="Quiet hours end"
                  type="time"
                  value={ws.quietHoursEnd || "08:00"}
                  onChange={(e) => patch({ quietHoursEnd: e.target.value })}
                />
              </div>
              <Input
                label="Max reminders per invoice"
                type="number"
                min={1}
                max={10}
                value={ws.maxReminders ?? 5}
                onChange={(e) => patch({ maxReminders: Number(e.target.value) })}
              />
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={ws.autoSend ?? true}
                  onChange={(e) => patch({ autoSend: e.target.checked })}
                  className="rounded border-white/20"
                />
                <span className="text-white/80">Auto-send approved reminders</span>
              </label>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-sm text-white/60">
                Add your first customer now, or skip and import later via CSV from the Invoices
                section.
              </p>
              <Input
                label="Customer name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                label="Customer email (optional)"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-sm text-white/55">
                <p className="font-medium text-white/80">CSV import</p>
                <p className="mt-1">
                  After onboarding, go to Invoices → Import CSV to bulk-load customers and
                  invoices. Template columns: customer_name, email, invoice_number, amount,
                  due_date.
                </p>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <Input
                label="Escalation email"
                type="email"
                value={ws.escalationEmail || ""}
                onChange={(e) => patch({ escalationEmail: e.target.value })}
                hint="Disputes and sensitive replies route here"
              />
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
                <p className="font-medium text-white/90">Review</p>
                <ul className="mt-2 space-y-1 text-white/60">
                  <li>Company: {ws.companyName || "—"}</li>
                  <li>Plan: {ws.planId || "professional"}</li>
                  <li>Sender: {ws.senderName || "—"}</li>
                  <li>Tone: {ws.reminderTone || "professional"}</li>
                </ul>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={ws.aiCollectorActive ?? true}
                  onChange={(e) => patch({ aiCollectorActive: e.target.checked })}
                  className="rounded border-white/20"
                />
                <span className="text-white/80">Activate AI Collector on finish</span>
              </label>
            </>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              disabled={step === 0 || saving}
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
            <Button onClick={() => void saveStep()} disabled={saving}>
              {saving ? "Saving…" : step === STEPS.length - 1 ? "Finish & go to dashboard" : "Continue"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
