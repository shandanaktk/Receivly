"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatMoney, formatRelative } from "@/lib/format";
import type { DashboardSummary, Workspace } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState<string[]>(["USD"]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [dash, ws, invoices] = await Promise.all([api.getDashboard(currency), api.getWorkspace(), api.getInvoices()]);
    setSummary(dash);
    setWorkspace(ws);
    setCurrencies([...new Set(invoices.map((i) => i.currency))].sort());
    setLoading(false);
  }, [currency]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const toggleCollector = async () => {
    if (!workspace) return;
    const next = await api.updateWorkspace({ aiCollectorActive: !workspace.aiCollectorActive });
    setWorkspace(next);
  };

  if (loading || !summary) return <PageLoader label="Loading dashboard…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.7rem] border border-violet-500/20 bg-[radial-gradient(circle_at_85%_15%,rgba(135,66,210,.2),transparent_48%)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-300">Receivables overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, {workspace?.companyName || "team"}.</h1>
          <p className="mt-2 text-sm text-foreground/55">Your work queue and financial position, with amounts shown in one currency at a time.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/customers/new">
            <Button size="sm">Add customer</Button>
          </Link>
          <Link href="/app/invoices/new">
            <Button size="sm" variant="secondary">
              Create invoice
            </Button>
          </Link>
          <Link href="/app/invoices/import">
            <Button size="sm" variant="outline">
              Import CSV
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-foreground/60">Financial overview · {workspace?.timezone}</p><label className="flex items-center gap-2 text-sm font-medium">Currency <select aria-label="Dashboard currency" className="rounded-lg border border-foreground/15 bg-elevated px-3 py-2" value={currency} onChange={(e) => setCurrency(e.target.value)}>{currencies.map((c) => <option key={c} value={c}>{c}</option>)}</select></label></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total outstanding", value: summary.totalOutstanding },
          { label: "Overdue", value: summary.overdueAmount, sub: `${summary.overdueCount} invoices` },
          { label: "Collected this month", value: summary.collectedThisMonth },
          { label: "Promised", value: summary.promisedAmount },
          { label: "Disputed", value: summary.disputedAmount },
        ].map((card) => (
          <Card key={card.label}>
            <CardBody>
              <p className="text-sm text-foreground/55">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold">{formatMoney(card.value, currency)}</p>
              {card.sub ? <p className="mt-1 text-xs text-foreground/45">{card.sub}</p> : null}
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-medium">Aging</h2>
            <Badge status={summary.automationStatus}>{summary.automationStatus}</Badge>
          </CardHeader>
          <CardBody>
            {summary.aging.length === 0 ? (
              <EmptyState title="No aging data" description="Outstanding invoices will appear here." />
            ) : (
              <div className="space-y-3">
                {summary.aging.map((band) => (
                  <div key={band.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-foreground/70">{band.label}</span>
                      <span>{formatMoney(band.amount, currency)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-600"
                        style={{
                          width: `${summary.totalOutstanding ? Math.min((band.amount / summary.totalOutstanding) * 100, 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Attention required</h2>
          </CardHeader>
          <CardBody>
            {summary.attentionRequired.length === 0 ? (
              <EmptyState title="All clear" description="No urgent items right now." />
            ) : (
              <ul className="space-y-2">
                {summary.attentionRequired.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between rounded-xl border border-foreground/10 px-3 py-2.5 text-sm transition hover:bg-foreground/5"
                    >
                      <span>{item.label}</span>
                      <Badge status={item.severity} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Upcoming actions</h2>
          </CardHeader>
          <CardBody>
            {summary.upcomingActions.length === 0 ? (
              <EmptyState title="Nothing scheduled" description="Upcoming reminders and promises appear here." />
            ) : (
              <ul className="space-y-2">
                {summary.upcomingActions.map((action) => (
                  <li key={action.id}>
                    <Link
                      href={action.href}
                      className="flex items-center justify-between rounded-xl border border-foreground/10 px-3 py-2.5 text-sm hover:bg-foreground/5"
                    >
                      <span>{action.label}</span>
                      <span className="text-foreground/45">{formatRelative(action.date)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Recent activity</h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {summary.recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-foreground/5 py-2 text-sm last:border-0"
                >
                  <span className="text-foreground/80">{item.label}</span>
                  <span className="text-foreground/45">{formatRelative(item.time)}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Quick actions</h2>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-2">
          <Link href="/app/approvals">
            <Button variant="secondary" size="sm">
              Review escalations
            </Button>
          </Link>
          <Link href="/app/conversations?filter=needs_approval">
            <Button variant="secondary" size="sm">
              Pending approvals
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => void toggleCollector()}>
            {workspace?.aiCollectorActive ? "Pause collector" : "Activate collector"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
