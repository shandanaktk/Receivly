"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { PLANS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { PlatformBusiness, SubscriptionStatus } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

function planName(planId: string) {
  return PLANS.find((p) => p.id === planId)?.name ?? planId;
}

function usagePercent(business: PlatformBusiness) {
  const plan = PLANS.find((p) => p.id === business.planId);
  if (!plan) return 0;
  return Math.min(100, Math.round((business.usage / plan.invoiceAllowance) * 100));
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<PlatformBusiness[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await api.getPlatformBusinesses();
    setBusinesses(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businesses.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.companyName.toLowerCase().includes(q) ||
        b.ownerEmail.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    });
  }, [businesses, query, statusFilter]);

  const toggleSuspend = async (id: string) => {
    const business = businesses.find((b) => b.id === id);
    if (!business || !window.confirm(`${business.suspended ? "Reactivate" : "Suspend"} ${business.companyName}? ${business.suspended ? "Workspace access will resume." : "Workspace access will be restricted, while records remain intact."}`)) return;
    setActionId(id);
    await api.updatePlatformBusiness(id, { suspended: !business.suspended });
    setBusinesses(await api.getPlatformBusinesses());
    setActionId(null);
  };

  if (loading && businesses.length === 0) {
    return <PageLoader label="Loading businesses…" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Businesses</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Search and manage tenant workspaces — suspend/reactivate is demo-only local state.
        </p>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Company, owner email, or ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium text-foreground/80">Status</span>
              <select
                className="w-full rounded-xl border border-foreground/10 bg-elevated px-3.5 py-2.5 text-foreground outline-none focus:border-[#a855f7]/50 focus:ring-2 focus:ring-[#a855f7]/20"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as SubscriptionStatus | "all")
                }
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past due</option>
                <option value="cancelled">Cancelled</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
        </CardBody>
      </Card>

      <div className="hidden overflow-hidden rounded-2xl border border-foreground/10 md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-foreground/10 bg-foreground/[0.03] text-foreground/55">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium">Users</th>
              <th className="px-4 py-3 font-medium">Last active</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const isSuspended = Boolean(b.suspended);
              const pct = usagePercent(b);
              return (
                <tr key={b.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/businesses/${b.id}`} className="font-medium hover:text-violet-300 hover:underline">{b.companyName}</Link>
                    <div className="text-xs text-foreground/45">{b.ownerEmail}</div>
                    {isSuspended ? (
                      <Badge status="paused" className="mt-1">
                        Suspended
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{planName(b.planId)}</td>
                  <td className="px-4 py-3">
                    <Badge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      {b.usage} / {PLANS.find((p) => p.id === b.planId)?.invoiceAllowance ?? "—"}
                    </div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-foreground/10">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">{b.users}</td>
                  <td className="px-4 py-3 text-foreground/60">{formatDate(b.lastActiveAt, "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant={isSuspended ? "secondary" : "outline"}
                      disabled={actionId === b.id}
                      onClick={() => toggleSuspend(b.id)}
                    >
                      {actionId === b.id
                        ? "…"
                        : isSuspended
                          ? "Reactivate"
                          : "Suspend"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-foreground/50">No businesses match your filters.</p>
        ) : null}
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((b) => {
          const isSuspended = Boolean(b.suspended);
          const pct = usagePercent(b);
          return (
            <Card key={b.id}>
              <CardHeader className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium"><Link href={`/admin/businesses/${b.id}`} className="hover:underline">{b.companyName}</Link></h3>
                  <p className="text-xs text-foreground/45">{b.ownerEmail}</p>
                </div>
                <Badge status={b.status} />
              </CardHeader>
              <CardBody className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/55">Plan</span>
                  <span>{planName(b.planId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/55">Usage</span>
                  <span>
                    {b.usage} invoices ({pct}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/55">Users</span>
                  <span>{b.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/55">Last active</span>
                  <span>{formatDate(b.lastActiveAt, "MMM d, yyyy")}</span>
                </div>
                {isSuspended ? <Badge status="paused">Suspended (demo)</Badge> : null}
                <Button
                  size="sm"
                  variant={isSuspended ? "secondary" : "outline"}
                  className="w-full"
                  disabled={actionId === b.id}
                  onClick={() => toggleSuspend(b.id)}
                >
                  {actionId === b.id ? "Working…" : isSuspended ? "Reactivate" : "Suspend"}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-foreground/40">
        Showing {filtered.length} of {businesses.length} businesses · Created dates from{" "}
        {formatDate(businesses[0]?.createdAt)} onward
      </p>
    </div>
  );
}
