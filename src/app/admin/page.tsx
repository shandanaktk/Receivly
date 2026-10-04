"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { PlatformOverview } from "@/types";
import { useEffect, useState } from "react";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardBody className="space-y-1">
        <p className="text-sm text-white/55">{label}</p>
        <p className={`text-2xl font-semibold tracking-tight ${accent || "text-white"}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {sub ? <p className="text-xs text-white/40">{sub}</p> : null}
      </CardBody>
    </Card>
  );
}

function healthTone(health: PlatformOverview["workflowHealth"]) {
  if (health === "healthy") return "text-emerald-300";
  if (health === "degraded") return "text-amber-300";
  return "text-rose-300";
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPlatformOverview()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Loading platform overview…" />;
  if (!data) return null;

  const subscriptionTotal =
    data.activeSubscriptions +
    data.trialSubscriptions +
    data.pastDue +
    data.cancelled;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform overview</h1>
          <p className="mt-1 text-sm text-white/55">
            Cross-tenant health, usage, and automation signals — updated{" "}
            {formatDate(new Date().toISOString(), "MMM d, yyyy h:mm a")}
          </p>
        </div>
        <Badge status={data.workflowHealth}>{data.workflowHealth}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total businesses" value={data.totalBusinesses} sub="All workspaces" />
        <StatCard
          label="Active subscriptions"
          value={data.activeSubscriptions}
          sub={`${Math.round((data.activeSubscriptions / subscriptionTotal) * 100)}% of billed`}
          accent="text-emerald-300"
        />
        <StatCard
          label="Trial workspaces"
          value={data.trialSubscriptions}
          sub="On starter trial"
          accent="text-sky-300"
        />
        <StatCard
          label="Past due"
          value={data.pastDue}
          sub="Needs billing attention"
          accent="text-rose-300"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cancelled" value={data.cancelled} sub="Churned accounts" />
        <StatCard
          label="Active invoices"
          value={data.activeInvoices}
          sub="Across all tenants"
        />
        <StatCard
          label="Reminder volume"
          value={data.reminderVolume}
          sub="Last 30 days"
        />
        <StatCard
          label="Email failures"
          value={data.emailFailures}
          sub="Delivery & bounce errors"
          accent={data.emailFailures > 30 ? "text-rose-300" : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-medium">Usage & automation</h2>
          </CardHeader>
          <CardBody className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-white/55">AI tokens consumed</p>
              <p className="mt-1 text-3xl font-semibold">{data.aiUsage.toLocaleString()}</p>
              <p className="mt-1 text-xs text-white/40">Drafting, classification, summaries</p>
            </div>
            <div>
              <p className="text-sm text-white/55">Reminders per active invoice</p>
              <p className="mt-1 text-3xl font-semibold">
                {(data.reminderVolume / Math.max(data.activeInvoices, 1)).toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-white/40">Rolling 30-day average</p>
            </div>
            <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Workflow health</p>
                  <p className="text-xs text-white/45">
                    n8n orchestration, webhooks, and email pipeline
                  </p>
                </div>
                <span className={`text-lg font-semibold capitalize ${healthTone(data.workflowHealth)}`}>
                  {data.workflowHealth}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.workflowHealth === "healthy"
                      ? "w-[92%] bg-emerald-500"
                      : data.workflowHealth === "degraded"
                        ? "w-[68%] bg-amber-500"
                        : "w-[38%] bg-rose-500"
                  }`}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Subscription mix</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {[
              { label: "Active", value: data.activeSubscriptions, color: "bg-emerald-500" },
              { label: "Trial", value: data.trialSubscriptions, color: "bg-sky-500" },
              { label: "Past due", value: data.pastDue, color: "bg-rose-500" },
              { label: "Cancelled", value: data.cancelled, color: "bg-white/30" },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-white/70">{row.label}</span>
                  <span>{row.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{
                      width: `${Math.max((row.value / Math.max(subscriptionTotal, 1)) * 100, 4)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
