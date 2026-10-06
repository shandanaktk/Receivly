"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { PLANS } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import type { PlanId, Workspace } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function BillingPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [ws, invoices] = await Promise.all([api.getWorkspace(), api.getInvoices()]);
    setWorkspace(ws);
    setInvoiceCount(invoices.filter((i) => !["paid", "void", "written_off"].includes(i.status)).length);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  if (loading || !workspace) return <PageLoader label="Loading billing…" />;

  const plan = PLANS.find((p) => p.id === workspace.planId)!;
  const usagePct = Math.min((invoiceCount / plan.invoiceAllowance) * 100, 100);
  const pendingPlan = PLANS.find((p) => p.id === selectedPlan);

  const simulatePlanChange = async () => {
    if (!selectedPlan) return;
    setWorkspace(await api.updateWorkspace({ planId: selectedPlan }));
    setMessage(`Demo plan changed to ${pendingPlan?.name}. Hosted checkout and verified subscription events will connect with the backend.`);
    setSelectedPlan(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-foreground/55">Plan, usage, and subscription status</p>
      </div>
      {message && <p role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">{plan.name} plan</h2>
            <p className="text-sm text-foreground/50">
              {formatMoney(plan.priceMonthly)}/month · Renews {formatDate(workspace.periodEnd)}
            </p>
          </div>
          <Badge status={workspace.subscriptionStatus} />
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-foreground/70">Active invoices</span>
              <span>
                {invoiceCount} / {plan.invoiceAllowance}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
              <div
                className={`h-full rounded-full ${usagePct > 90 ? "bg-rose-500" : "bg-gradient-to-r from-fuchsia-500 to-blue-600"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPortalOpen(true)}>
            Manage billing portal
          </Button>
        </CardBody>
      </Card>

      <div>
        <h2 className="mb-4 font-medium">Upgrade options</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((p) => (
            <Card
              key={p.id}
              className={p.id === workspace.planId ? "border-fuchsia-500/40" : undefined}
            >
              <CardBody>
                {p.highlighted ? (
                  <span className="text-xs font-medium text-fuchsia-300">Popular</span>
                ) : null}
                <p className="mt-1 font-semibold">{p.name}</p>
                <p className="text-xl font-bold">
                  {formatMoney(p.priceMonthly)}
                  <span className="text-sm font-normal text-foreground/50">/mo</span>
                </p>
                <p className="mt-2 text-xs text-foreground/50">{p.invoiceAllowance} invoices</p>
                <ul className="mt-3 space-y-1 text-xs text-foreground/60">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                {p.id === workspace.planId ? (
                  <Badge status="active" className="mt-4">
                    Current plan
                  </Badge>
                ) : (
                  <Button
                    className="mt-4 w-full"
                    size="sm"
                    variant={p.highlighted ? "primary" : "secondary"}
                    onClick={() => setSelectedPlan(p.id)}
                  >
                    Upgrade
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
      <Card><CardHeader><h2 className="font-medium">Invoices & receipts</h2></CardHeader><CardBody><p className="text-sm text-foreground/55">Billing receipts and tax invoices will appear here after the payment provider is connected. No payment has been taken in this demo.</p></CardBody></Card>
      <Modal open={Boolean(pendingPlan)} title={`Review ${pendingPlan?.name || "plan"}`} onClose={() => setSelectedPlan(null)} footer={<><Button variant="ghost" onClick={() => setSelectedPlan(null)}>Back</Button><Button onClick={() => void simulatePlanChange()}>Simulate plan change</Button></>}><div className="space-y-3 text-sm text-foreground/70"><p><strong className="text-foreground">{pendingPlan?.name}</strong> · {formatMoney(pendingPlan?.priceMonthly || 0)}/month</p><p>Up to {pendingPlan?.invoiceAllowance.toLocaleString()} active invoices. Current usage: {invoiceCount}.</p><p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">Demo checkout preview. A real plan change will require hosted checkout and verified billing webhooks.</p></div></Modal>
      <Modal open={portalOpen} title="Billing portal preview" onClose={() => setPortalOpen(false)} footer={<Button variant="secondary" onClick={() => setPortalOpen(false)}>Close</Button>}><div className="space-y-3 text-sm text-foreground/70"><p>Current plan: <strong className="text-foreground">{plan.name}</strong></p><p>Subscription: {workspace.subscriptionStatus.replaceAll("_", " ")}</p><p>Period end: {formatDate(workspace.periodEnd)}</p><p>The hosted billing portal will manage payment methods, receipts, upgrades, downgrades, and cancellation when provider integration is complete.</p></div></Modal>
    </div>
  );
}
