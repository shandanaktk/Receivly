"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { INVOICE_STATUSES } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import type { Customer, Invoice } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [invs, custs] = await Promise.all([
      api.getInvoices({ status: status === "all" ? undefined : status, q: query || undefined }),
      api.getCustomers(),
    ]);
    setInvoices(invs);
    setCustomers(Object.fromEntries(custs.map((c) => [c.id, c])));
    setLoading(false);
  }, [query, status]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  const toggleAll = () => {
    if (selected.size === invoices.length) setSelected(new Set());
    else setSelected(new Set(invoices.map((i) => i.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const bulkPause = async () => {
    await Promise.all(
      [...selected].map((id) => {
        const inv = invoices.find((i) => i.id === id);
        if (!inv) return Promise.resolve(null);
        return api.saveInvoice({ id, customerId: inv.customerId, collectorPaused: true });
      }),
    );
    setSelected(new Set());
    void load();
  };

  const bulkExport = () => {
    alert(`Demo: would export ${selected.size} invoice(s) to CSV.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-white/55">{invoices.length} invoices</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/invoices/import">
            <Button variant="outline" size="sm">
              Import CSV
            </Button>
          </Link>
          <Link href="/app/invoices/new">
            <Button size="sm">Create invoice</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search number, customer, PO…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "all", label: "All statuses" },
            ...INVOICE_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
          ]}
        />
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm">
          <span>{selected.size} selected</span>
          <Button size="sm" variant="secondary" onClick={() => void bulkPause()}>
            Pause collector
          </Button>
          <Button size="sm" variant="outline" onClick={bulkExport}>
            Export CSV
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      ) : null}

      {loading ? (
        <PageLoader label="Loading invoices…" />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices"
          description="Create an invoice or import from CSV."
          actionLabel="Create invoice"
          onAction={() => (window.location.href = "/app/invoices/new")}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="-mx-4 overflow-x-auto md:mx-0">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selected.size === invoices.length && invoices.length > 0}
                        onChange={toggleAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-5 py-3 font-medium">Invoice</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Due</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(inv.id)}
                          onChange={() => toggleOne(inv.id)}
                          aria-label={`Select ${inv.number}`}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/app/invoices/${inv.id}`} className="font-medium hover:text-fuchsia-300">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-white/70">
                        {customers[inv.customerId]?.name || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-white/60">{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-3 text-right">{formatMoney(inv.amount, inv.currency)}</td>
                      <td className="px-5 py-3 text-right">{formatMoney(inv.balance, inv.currency)}</td>
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
