"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { PLANS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { AuditLogEntry, PlatformBusiness } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<PlatformBusiness | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [limit, setLimit] = useState("");
  const [flags, setFlags] = useState({ aiCollector: true, csvImport: true, approvals: true });

  useEffect(() => { void Promise.all([api.getPlatformBusinesses(), api.getAuditLogs()]).then(([list, audit]) => { const found = list.find((b) => b.id === id) || null; setBusiness(found); setLogs(audit.filter((entry) => entry.workspaceId === id)); setLimit(found?.invoiceLimitOverride ? String(found.invoiceLimitOverride) : ""); setFlags(found?.featureFlags || { aiCollector: true, csvImport: true, approvals: true }); }).finally(() => setLoading(false)); }, [id]);

  const save = async () => {
    if (!business) return;
    const n = limit ? Number(limit) : undefined;
    if (n !== undefined && (!Number.isInteger(n) || n < 1)) { setMessage("Enter a positive whole-number limit."); return; }
    if (!window.confirm(`Save audited support overrides for ${business.companyName}?`)) return;
    setSaving(true);
    try { setBusiness(await api.updatePlatformBusiness(id, { invoiceLimitOverride: n, featureFlags: flags })); setLogs((await api.getAuditLogs()).filter((entry) => entry.workspaceId === id)); setMessage("Demo support settings saved with an audit entry."); }
    finally { setSaving(false); }
  };

  const toggleSuspend = async () => {
    if (!business || !window.confirm(`${business.suspended ? "Reactivate" : "Suspend"} ${business.companyName}? Customer records remain in place.`)) return;
    setBusiness(await api.updatePlatformBusiness(id, { suspended: !business.suspended }));
    setLogs((await api.getAuditLogs()).filter((entry) => entry.workspaceId === id));
  };

  if (loading) return <PageLoader label="Loading business account…" />;
  if (!business) return <p role="alert">Business not found.</p>;
  const plan = PLANS.find((p) => p.id === business.planId);

  return <div className="space-y-6"><div><Link href="/admin/businesses" className="text-sm text-foreground/55 hover:text-foreground">← Businesses</Link><div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-tight">{business.companyName}</h1><Badge status={business.status} />{business.suspended && <Badge status="paused">Suspended</Badge>}</div><p className="mt-1 text-sm text-foreground/55">Workspace {business.id} · {business.ownerEmail}</p></div>
    {message && <p role="status" className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-3 text-sm">{message}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Plan", plan?.name || business.planId], ["Active invoices", String(business.activeInvoices)], ["Usage", `${business.usage} / ${business.invoiceLimitOverride || plan?.invoiceAllowance || "—"}`], ["Team members", String(business.users)]].map(([label, value]) => <Card key={label}><CardBody><p className="text-sm text-foreground/50">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></CardBody></Card>)}</div>
    <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><h2 className="font-semibold">Account details</h2></CardHeader><CardBody className="space-y-3 text-sm"><p><span className="text-foreground/50">Owner email · </span>{business.ownerEmail}</p><p><span className="text-foreground/50">Created · </span>{formatDate(business.createdAt)}</p><p><span className="text-foreground/50">Last active · </span>{formatDate(business.lastActiveAt)}</p><p><span className="text-foreground/50">Subscription · </span>{business.status.replaceAll("_", " ")}</p><p className="rounded-xl border border-foreground/10 p-3 text-foreground/60">Provider record links will appear here after billing integration. Financial records cannot be edited from this panel.</p><div className="flex flex-wrap gap-2"><a href={`mailto:${business.ownerEmail}`} className="rounded-full border border-foreground/20 px-4 py-2 font-medium hover:bg-foreground/[0.05]">Contact owner</a><Button variant={business.suspended ? "secondary" : "danger"} onClick={() => void toggleSuspend()}>{business.suspended ? "Reactivate" : "Suspend workspace"}</Button></div></CardBody></Card>
      <Card><CardHeader><h2 className="font-semibold">Support overrides</h2><p className="mt-1 text-sm text-foreground/50">Changes are recorded in the demo audit log.</p></CardHeader><CardBody className="space-y-4"><Input label="Active invoice limit override" type="number" min="1" placeholder={`Plan default: ${plan?.invoiceAllowance || 0}`} value={limit} onChange={(e) => setLimit(e.target.value)} /><div><p className="mb-2 text-sm font-medium">Feature flags</p><div className="space-y-2">{([ ["aiCollector", "AI Collector"], ["csvImport", "CSV import"], ["approvals", "Approval queue"] ] as const).map(([key, label]) => <label key={key} className="flex items-center justify-between rounded-xl border border-foreground/10 p-3 text-sm"><span>{label}</span><input type="checkbox" checked={flags[key]} onChange={(e) => setFlags((current) => ({ ...current, [key]: e.target.checked }))} /></label>)}</div></div><Button disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save support settings"}</Button></CardBody></Card></div>
    <Card><CardHeader><h2 className="font-semibold">Audit history</h2></CardHeader><CardBody>{logs.length ? <ul className="space-y-3">{logs.slice(0, 10).map((log) => <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 pb-3 text-sm"><span>{log.action} · {log.user}</span><span className="text-foreground/50">{formatDate(log.date)}</span></li>)}</ul> : <p className="text-sm text-foreground/50">No support actions recorded for this workspace.</p>}</CardBody></Card>
  </div>;
}
