"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatMoney, formatRelative } from "@/lib/format";
import type { Customer } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    const list = await api.getCustomers(q);
    setCustomers(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void load(query || undefined), 250);
    return () => clearTimeout(t);
  }, [query, load]);

  const filtered = customers.filter((c) =>
    statusFilter === "all" ? true : c.status === statusFilter,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-white/55">{filtered.length} customers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/invoices/import">
            <Button variant="outline">Import CSV</Button>
          </Link>
          <Link href="/app/customers/new">
            <Button>Add customer</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search name, email, contact…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-xl border border-white/10 bg-[#0c0c18] px-3 py-2.5 text-sm text-white"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <PageLoader label="Loading customers…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Add your first customer or adjust your search."
          actionLabel="Add customer"
          onAction={() => (window.location.href = "/app/customers/new")}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="-mx-4 overflow-x-auto md:mx-0">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Outstanding</th>
                    <th className="px-5 py-3 font-medium text-right">Overdue</th>
                    <th className="px-5 py-3 font-medium">Last contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <Link href={`/app/customers/${c.id}`} className="font-medium hover:text-fuchsia-300">
                          {c.name}
                        </Link>
                        <p className="text-xs text-white/45">{c.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={c.status} />
                        {c.collectorPaused ? (
                          <Badge status="paused" className="ml-1">
                            Paused
                          </Badge>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-right">{formatMoney(c.outstandingBalance, c.currency)}</td>
                      <td className="px-5 py-3 text-right text-rose-300">
                        {formatMoney(c.overdueBalance, c.currency)}
                      </td>
                      <td className="px-5 py-3 text-white/50">{formatRelative(c.lastContactDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
