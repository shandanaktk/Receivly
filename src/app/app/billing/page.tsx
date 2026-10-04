"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { PLANS } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import type { Workspace } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function BillingPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [ws, invoices] = await Promise.all([api.getWorkspace(), api.getInvoices()]);
    setWorkspace(ws);
    setInvoiceCount(invoices.filter((i) => !["paid", "void", "written_off"].includes(i.status)).length);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !workspace) return <PageLoader label="Loading billing…" />;

  const plan = PLANS.find((p) => p.id === workspace.planId)!;
  const usagePct = Math.min((invoiceCount / plan.invoiceAllowance) * 100, 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-white/55">Plan, usage, and subscription</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">{plan.name} plan</h2>
            <p className="text-sm text-white/50">
              {formatMoney(plan.priceMonthly)}/month · Renews {formatDate(workspace.periodEnd)}
            </p>
          </div>
          <Badge status={workspace.subscriptionStatus} />
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-white/70">Active invoices</span>
              <span>
                {invoiceCount} / {plan.invoiceAllowance}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${usagePct > 90 ? "bg-rose-500" : "bg-gradient-to-r from-fuchsia-500 to-blue-600"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => alert("Demo: would open Stripe customer portal.")}>
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
                  <span className="text-sm font-normal text-white/50">/mo</span>
                </p>
                <p className="mt-2 text-xs text-white/50">{p.invoiceAllowance} invoices</p>
                <ul className="mt-3 space-y-1 text-xs text-white/60">
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
                    onClick={() => alert(`Demo: would upgrade to ${p.name}.`)}
                  >
                    Upgrade
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
