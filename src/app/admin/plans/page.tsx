"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PLANS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import type { PlanId } from "@/types";
import { useState } from "react";
import { INITIAL_ANNOUNCEMENTS, INITIAL_LIMITS, INITIAL_PROMPTS, INITIAL_SUPPORT, INITIAL_TEMPLATES, type EmailTemplate, type PlanLimits } from "@/lib/mock/adminPlans";

export default function AdminPlansPage() {
  const [limits, setLimits] = useState(INITIAL_LIMITS);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [prompts, setPrompts] = useState(INITIAL_PROMPTS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [support, setSupport] = useState(INITIAL_SUPPORT);
  const [saved, setSaved] = useState(false);

  const updateLimit = (planId: PlanId, patch: Partial<PlanLimits>) => {
    setLimits((prev) => prev.map((l) => (l.planId === planId ? { ...l, ...patch } : l)));
    setSaved(false);
  };

  const updateTemplate = (id: string, patch: Partial<EmailTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setSaved(false);
  };

  const activatePrompt = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) => ({
        ...p,
        active: p.id === id ? true : p.name === prev.find((x) => x.id === id)?.name ? false : p.active,
      })),
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plans & settings</h1>
          <p className="mt-1 text-sm text-foreground/55">
            Configure plan visibility, limits, templates, and platform messaging â€” local demo state only.
          </p>
        </div>
        <Button onClick={handleSave}>{saved ? "Saved âœ“" : "Save changes"}</Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Plan display & limits</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          {PLANS.map((plan) => {
            const cfg = limits.find((l) => l.planId === plan.id)!;
            return (
              <div
                key={plan.id}
                className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{plan.name}</h3>
                    <p className="text-sm text-foreground/50">
                      {formatMoney(plan.priceMonthly)}/mo Â· {plan.features.length} features
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-foreground/70">
                    <input
                      type="checkbox"
                      checked={cfg.visible}
                      onChange={(e) => updateLimit(plan.id, { visible: e.target.checked })}
                      className="rounded border-foreground/20 bg-foreground/5"
                    />
                    Visible on pricing
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Invoice allowance"
                    type="number"
                    value={cfg.invoiceAllowance}
                    onChange={(e) =>
                      updateLimit(plan.id, { invoiceAllowance: Number(e.target.value) || 0 })
                    }
                  />
                  <Input
                    label="Team seats"
                    type="number"
                    value={cfg.teamSeats}
                    onChange={(e) =>
                      updateLimit(plan.id, { teamSeats: Number(e.target.value) || 0 })
                    }
                  />
                  <Input
                    label="AI tokens / month"
                    type="number"
                    value={cfg.aiTokensMonthly}
                    onChange={(e) =>
                      updateLimit(plan.id, { aiTokensMonthly: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                {plan.highlighted ? (
                  <Badge status="active" className="mt-3">
                    Highlighted plan
                  </Badge>
                ) : null}
              </div>
            );
          })}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Email templates</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="space-y-3 rounded-xl border border-foreground/10 p-4">
              <Input
                label="Template name"
                value={tpl.name}
                onChange={(e) => updateTemplate(tpl.id, { name: e.target.value })}
              />
              <Input
                label="Subject line"
                value={tpl.subject}
                onChange={(e) => updateTemplate(tpl.id, { subject: e.target.value })}
              />
              <Textarea
                label="Body"
                value={tpl.body}
                onChange={(e) => updateTemplate(tpl.id, { body: e.target.value })}
                rows={5}
              />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium">System prompt versions</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{prompt.name}</p>
                  <span className="font-mono text-xs text-foreground/45">v{prompt.version}</span>
                  {prompt.active ? <Badge status="active">Active</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-foreground/55 line-clamp-2">{prompt.preview}</p>
              </div>
              {!prompt.active ? (
                <Button size="sm" variant="outline" onClick={() => activatePrompt(prompt.id)}>
                  Activate
                </Button>
              ) : null}
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-medium">Announcement banners</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setAnnouncements((prev) => [
                  ...prev,
                  { id: `ann_${Date.now()}`, message: "", enabled: false },
                ])
              }
            >
              Add banner
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="space-y-2 rounded-xl border border-foreground/10 p-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={ann.enabled}
                    onChange={(e) =>
                      setAnnouncements((prev) =>
                        prev.map((a) => (a.id === ann.id ? { ...a, enabled: e.target.checked } : a)),
                      )
                    }
                  />
                  Enabled
                </label>
                <Textarea
                  value={ann.message}
                  onChange={(e) =>
                    setAnnouncements((prev) =>
                      prev.map((a) => (a.id === ann.id ? { ...a, message: e.target.value } : a)),
                    )
                  }
                  placeholder="Banner messageâ€¦"
                  rows={2}
                />
                <Input
                  label="Link (optional)"
                  value={ann.link || ""}
                  onChange={(e) =>
                    setAnnouncements((prev) =>
                      prev.map((a) => (a.id === ann.id ? { ...a, link: e.target.value } : a)),
                    )
                  }
                />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Support contacts</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Display label"
              value={support.label}
              onChange={(e) => {
                setSupport((s) => ({ ...s, label: e.target.value }));
                setSaved(false);
              }}
            />
            <Input
              label="Support email"
              type="email"
              value={support.email}
              onChange={(e) => {
                setSupport((s) => ({ ...s, email: e.target.value }));
                setSaved(false);
              }}
            />
            <Input
              label="Hours"
              value={support.hours}
              onChange={(e) => {
                setSupport((s) => ({ ...s, hours: e.target.value }));
                setSaved(false);
              }}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

