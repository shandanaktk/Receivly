"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { INVOICE_STATUSES } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import type { Customer, Invoice, TeamMember } from "@/types";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("all");
  const [collector, setCollector] = useState("all");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [promisedFrom, setPromisedFrom] = useState("");
  const [promisedTo, setPromisedTo] = useState("");
  const [assignedTo, setAssignedTo] = useState("all");
  const [bulkTag, setBulkTag] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const [invs, custs, members] = await Promise.all([
      api.getInvoices({ status: status === "all" ? undefined : status, q: query || undefined }),
      api.getCustomers(),
      api.getTeam(),
    ]);
    setInvoices(invs);
    setCustomers(Object.fromEntries(custs.map((c) => [c.id, c])));
    setTeam(members);
    setLoading(false);
  }, [query, status]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  const filtered = useMemo(() => invoices.filter((i) =>
    (currency === "all" || i.currency === currency) &&
    (collector === "all" || (collector === "paused") === i.collectorPaused) &&
    (!dueFrom || i.dueDate >= dueFrom) && (!dueTo || i.dueDate <= dueTo) &&
    (!promisedFrom || Boolean(i.promisedDate && i.promisedDate >= promisedFrom)) &&
    (!promisedTo || Boolean(i.promisedDate && i.promisedDate <= promisedTo)) &&
    (assignedTo === "all" || (assignedTo === "unassigned" ? !i.assignedTo : i.assignedTo === assignedTo)) &&
    (!minAmount || i.amount >= Number(minAmount)) && (!maxAmount || i.amount <= Number(maxAmount))
  ).sort((a, b) => {
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "customer") return (customers[a.customerId]?.name || "").localeCompare(customers[b.customerId]?.name || "");
    if (sortBy === "createdAt") return b.createdAt.localeCompare(a.createdAt);
    if (sortBy === "lastAction") return b.updatedAt.localeCompare(a.updatedAt);
    return a.dueDate.localeCompare(b.dueDate);
  }), [invoices, currency, collector, dueFrom, dueTo, promisedFrom, promisedTo, assignedTo, minAmount, maxAmount, sortBy, customers]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const visible = filtered.slice((Math.min(page, pageCount) - 1) * 10, Math.min(page, pageCount) * 10);

  const toggleAll = () => {
    if (selected.size === visible.length) setSelected(new Set());
    else setSelected(new Set(visible.map((i) => i.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const bulkCollector = async (paused: boolean) => {
    if (!window.confirm(`${paused ? "Pause" : "Resume"} automated reminders for ${selected.size} selected invoices?`)) return;
    await Promise.all(
      [...selected].map((id) => {
        const inv = invoices.find((i) => i.id === id);
        if (!inv) return Promise.resolve(null);
        return api.saveInvoice({ id, customerId: inv.customerId, collectorPaused: paused });
      }),
    );
    setSelected(new Set());
    void load();
  };

  const bulkExport = () => {
    const rows = invoices.filter((i) => selected.has(i.id));
    downloadCsv("receivly-invoices.csv", ["invoice_number", "customer", "status", "issue_date", "due_date", "currency", "amount", "balance", "collector_paused"], rows.map((i) => [i.number, customers[i.customerId]?.name, i.status, i.issueDate, i.dueDate, i.currency, i.amount, i.balance, i.collectorPaused ? "yes" : "no"]));
  };

  const assignTag = async () => {
    const tag = bulkTag.trim();
    if (!tag || !window.confirm(`Add the tag "${tag}" to ${selected.size} selected invoices?`)) return;
    await Promise.all([...selected].map((id) => {
      const inv = invoices.find((i) => i.id === id);
      return inv ? api.saveInvoice({ id, customerId: inv.customerId, tags: [...new Set([...inv.tags, tag])] }) : Promise.resolve(null);
    }));
    setBulkTag("");
    setSelected(new Set());
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-foreground/55">{filtered.length} of {invoices.length} invoices</p>
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

      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Search"
          placeholder="Search number, customer, PO…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "all", label: "All statuses" },
            ...INVOICE_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
          ]}
        />
        <Select label="Currency" value={currency} onChange={(e) => { setCurrency(e.target.value); setPage(1); }} options={[{ value: "all", label: "All currencies" }, ...[...new Set(invoices.map((i) => i.currency))].map((c) => ({ value: c, label: c }))]} />
        <Select label="Collector" value={collector} onChange={(e) => { setCollector(e.target.value); setPage(1); }} options={[{ value: "all", label: "Any state" }, { value: "active", label: "Active" }, { value: "paused", label: "Paused" }]} />
        <div className="col-span-full"><Button className="w-full sm:w-auto" variant="outline" size="sm" onClick={() => setShowAdvancedFilters((open) => !open)} aria-expanded={showAdvancedFilters}>
          {showAdvancedFilters ? "Hide advanced filters" : "More filters"}{dueFrom || dueTo || promisedFrom || promisedTo || assignedTo !== "all" || minAmount || maxAmount ? " · active" : ""}
        </Button></div>
        <div className={`${showAdvancedFilters ? "grid" : "hidden"} col-span-full items-end gap-3 sm:grid-cols-2 xl:grid-cols-4`}>
        <Input label="Due from" type="date" value={dueFrom} onChange={(e) => setDueFrom(e.target.value)} />
        <Input label="Due to" type="date" value={dueTo} onChange={(e) => setDueTo(e.target.value)} />
        <Input label="Promised from" type="date" value={promisedFrom} onChange={(e) => setPromisedFrom(e.target.value)} />
        <Input label="Promised to" type="date" value={promisedTo} onChange={(e) => setPromisedTo(e.target.value)} />
        <Select label="Assigned staff" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} options={[{ value: "all", label: "Anyone" }, { value: "unassigned", label: "Unassigned" }, ...team.filter((member) => member.status === "active").map((member) => ({ value: member.userId, label: member.name }))]} />
        <Input label="Min amount" type="number" min="0" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
        <Input label="Max amount" type="number" min="0" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
        <Select label="Sort by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={[{ value: "dueDate", label: "Due date" }, { value: "amount", label: "Amount (high first)" }, { value: "customer", label: "Customer" }, { value: "createdAt", label: "Created date" }, { value: "lastAction", label: "Last action" }]} />
        </div>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm">
          <span>{selected.size} selected</span>
          <Button size="sm" variant="secondary" onClick={() => void bulkCollector(true)}>
            Pause collector
          </Button>
          <Button size="sm" variant="outline" onClick={() => void bulkCollector(false)}>Resume collector</Button>
          <div className="flex min-w-[240px] flex-1 items-end gap-2 sm:max-w-sm"><Input label="Tag selected" value={bulkTag} onChange={(e) => setBulkTag(e.target.value)} placeholder="e.g. priority" /><Button size="sm" variant="outline" disabled={!bulkTag.trim()} onClick={() => void assignTag()}>Add tag</Button></div>
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
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No invoices"
          description="Create an invoice or import from CSV."
          actionLabel="Create invoice"
          onAction={() => router.push("/app/invoices/new")}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-foreground/10 md:hidden">
              {visible.map((inv) => <div key={inv.id} className="invoice-dark-text space-y-3 p-4 text-sm"><div className="flex items-start justify-between gap-3"><label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggleOne(inv.id)} aria-label={`Select ${inv.number}`} /><Link href={`/app/invoices/${inv.id}`} className="hover:text-fuchsia-300">{inv.number}</Link></label><Badge status={inv.status} /></div><p className="text-foreground/65">{customers[inv.customerId]?.name || "Unknown customer"} · Due {formatDate(inv.dueDate)}</p><div className="flex items-end justify-between gap-3"><span className="text-foreground/50">Amount {formatMoney(inv.amount, inv.currency)}</span><strong>Due {formatMoney(inv.balance, inv.currency)}</strong></div><div className="flex justify-end"><Link href={`/app/invoices/${inv.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-3 py-1.5 text-xs font-semibold transition hover:border-[#111184]/45 hover:bg-[#111184]/10"><Eye size={14} /> View</Link></div></div>)}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-foreground/50">
                    <th className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selected.size === visible.length && visible.length > 0}
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
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((inv) => (
                    <tr key={inv.id} className="invoice-dark-text border-b border-foreground/5 hover:bg-foreground/[0.02]">
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
                      <td className="px-5 py-3 text-foreground/70">
                        {customers[inv.customerId]?.name || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-foreground/60">{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-3 text-right">{formatMoney(inv.amount, inv.currency)}</td>
                      <td className="px-5 py-3 text-right">{formatMoney(inv.balance, inv.currency)}</td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/app/invoices/${inv.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-3 py-1.5 text-xs font-semibold transition hover:border-[#111184]/45 hover:bg-[#111184]/10"><Eye size={14} /> View</Link>
                      </td>
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
