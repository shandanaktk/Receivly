"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { formatMoney, formatRelative } from "@/lib/format";
import type { Customer } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);

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

  const filtered = useMemo(() => customers.filter((c) =>
    statusFilter === "all" ? true : c.status === statusFilter,
  ).sort((a, b) => sortBy === "outstanding" ? b.outstandingBalance - a.outstandingBalance : sortBy === "overdue" ? b.overdueBalance - a.overdueBalance : sortBy === "lastContact" ? (b.lastContactDate || "").localeCompare(a.lastContactDate || "") : a.name.localeCompare(b.name)), [customers, statusFilter, sortBy]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const visible = filtered.slice((Math.min(page, pageCount) - 1) * 10, Math.min(page, pageCount) * 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-foreground/55">{filtered.length} customers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/invoices/import">
            <Button variant="outline">Import CSV</Button>
          </Link>
          <Button variant="outline" onClick={() => downloadCsv("receivly-customers.csv", ["name", "email", "phone", "status", "currency", "outstanding", "overdue", "last_contact"], filtered.map((c) => [c.name, c.email, c.phone, c.status, c.currency, c.outstandingBalance, c.overdueBalance, c.lastContactDate]))}>Export CSV</Button>
          <Link href="/app/customers/new">
            <Button>Add customer</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          label="Search customers"
          placeholder="Search name, email, contact…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          aria-label="Customer status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-xl border border-foreground/10 bg-elevated px-3 py-2.5 text-sm text-foreground"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <select aria-label="Sort customers" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-foreground/10 bg-elevated px-3 py-2.5 text-sm text-foreground"><option value="name">Name A–Z</option><option value="outstanding">Outstanding high first</option><option value="overdue">Overdue high first</option><option value="lastContact">Last contacted</option></select>
      </div>

      {loading ? (
        <PageLoader label="Loading customers…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Add your first customer or adjust your search."
          actionLabel="Add customer"
          onAction={() => router.push("/app/customers/new")}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-foreground/10 md:hidden">
              {visible.map((c) => <div key={c.id} className="space-y-3 p-4 text-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`/app/customers/${c.id}`} className="font-semibold hover:text-fuchsia-300">{c.name}</Link><p className="break-all text-foreground/50">{c.email}</p></div><Badge status={c.status} /></div><div className="flex justify-between gap-3"><span className="text-foreground/50">Outstanding</span><strong>{formatMoney(c.outstandingBalance, c.currency)}</strong></div><div className="flex justify-between gap-3"><span className="text-foreground/50">Overdue</span><strong className="text-rose-300">{formatMoney(c.overdueBalance, c.currency)}</strong></div><p className="text-foreground/50">Last contact {formatRelative(c.lastContactDate)}</p></div>)}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-foreground/50">
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Outstanding</th>
                    <th className="px-5 py-3 font-medium text-right">Overdue</th>
                    <th className="px-5 py-3 font-medium">Last contact</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c) => (
                    <tr key={c.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
                      <td className="px-5 py-3">
                        <Link href={`/app/customers/${c.id}`} className="font-medium hover:text-fuchsia-300">
                          {c.name}
                        </Link>
                        <p className="text-xs text-foreground/45">{c.email}</p>
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
                      <td className="px-5 py-3 text-foreground/50">{formatRelative(c.lastContactDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
      {filtered.length > 10 && <div className="flex items-center justify-between gap-3 text-sm text-foreground/60"><span>Page {Math.min(page, pageCount)} of {pageCount}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>}
    </div>
  );
}
