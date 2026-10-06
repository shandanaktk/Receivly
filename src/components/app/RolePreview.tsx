"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type {
  ApprovalItem,
  Conversation,
  Customer,
  DashboardSummary,
  Invoice,
  ReportSummary,
  TeamMember,
  UserRole,
  Workspace,
} from "@/types";
import { Eye, Landmark, Lock, Shield, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export interface WorkspaceSnapshot {
  workspace: Workspace;
  dashboard: DashboardSummary;
  invoices: Invoice[];
  customers: Customer[];
  conversations: Conversation[];
  approvals: ApprovalItem[];
  team: TeamMember[];
  reports: ReportSummary;
}

const CLOSED = new Set(["draft", "paid", "void", "written_off"]);

export const ROLE_LINKS: { href: string; label: string; detail: string; icon: LucideIcon }[] = [
  { href: "/app/admin", label: "Admin", detail: "Full workspace", icon: Shield },
  { href: "/app/finance", label: "Finance", detail: "Collections", icon: Landmark },
  { href: "/app/viewer", label: "Viewer", detail: "Read only", icon: Eye },
  { href: "/app/member", label: "Member", detail: "Assigned work", icon: UserRound },
];

const ROLE_LABELS: Record<UserRole, string> = {
  platform_admin: "Platform admin",
  admin: "Admin",
  finance_manager: "Finance manager",
  viewer: "Viewer",
  member: "Member",
};

export function roleLabel(role: UserRole) {
  return ROLE_LABELS[role];
}

export function useWorkspaceSnapshot() {
  const [data, setData] = useState<WorkspaceSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      api.getWorkspace(),
      api.getDashboard("USD"),
      api.getInvoices(),
      api.getCustomers(),
      api.getConversations(),
      api.getApprovals(),
      api.getTeam(),
      api.getReports("USD"),
    ]).then(([workspace, dashboard, invoices, customers, conversations, approvals, team, reports]) => {
      if (!cancelled) setData({ workspace, dashboard, invoices, customers, conversations, approvals, team, reports });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

export function customerName(customers: Customer[], id: string) {
  return customers.find((customer) => customer.id === id)?.name || "Customer";
}

export function openInvoices(invoices: Invoice[]) {
  return invoices.filter((invoice) => !CLOSED.has(invoice.status) && invoice.balance > 0);
}

export function currencyBuckets(invoices: Invoice[]) {
  const buckets = new Map<string, { outstanding: number; count: number }>();
  for (const invoice of openInvoices(invoices)) {
    const current = buckets.get(invoice.currency) || { outstanding: 0, count: 0 };
    current.outstanding += invoice.balance;
    current.count += 1;
    buckets.set(invoice.currency, current);
  }
  return [...buckets.entries()].map(([currency, value]) => ({ currency, ...value }));
}

export function RoleSwitcher() {
  const pathname = usePathname();

  return (
    <nav aria-label="Role previews" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {ROLE_LINKS.map((role) => {
        const active = pathname === role.href;
        const Icon = role.icon;
        return (
          <Link
            key={role.href}
            href={role.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3 transition ${
              active
                ? "border-[#111184] bg-[#111184] text-white shadow-[0_10px_28px_rgba(17,17,132,.22)]"
                : "border-foreground/10 bg-elevated text-foreground hover:border-[#111184]/30"
            }`}
          >
            <span className={`role-mark grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? "is-active" : ""}`}>
              <Icon size={16} strokeWidth={1.9} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{role.label}</span>
              <span className={`block truncate text-[11px] ${active ? "text-white/75" : "text-foreground/50"}`}>{role.detail}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function RoleHero({
  kicker,
  title,
  body,
  meta,
}: {
  kicker: string;
  title: string;
  body: string;
  meta: string[];
}) {
  return (
    <header className="relative overflow-hidden rounded-[1.7rem] border border-foreground/10 bg-background p-6 shadow-[0_18px_60px_rgba(17,17,132,.06)] sm:p-8">
      <p className="brand-ink text-xs font-semibold uppercase tracking-[.16em]">{kicker}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/55">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {meta.map((item) => (
          <span key={item} className="brand-chip rounded-full px-3 py-1 text-xs font-semibold">
            {item}
          </span>
        ))}
      </div>
    </header>
  );
}

export function AccessList({ items }: { items: { label: string; allowed: boolean }[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.label} className="flex min-w-0 items-center gap-2 rounded-xl border border-foreground/10 px-3 py-2.5 text-xs">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.allowed ? "bg-emerald-400" : "bg-foreground/25"}`} aria-hidden />
          <span className="min-w-0 truncate font-semibold">{item.label}</span>
          <span className="ml-auto shrink-0 text-foreground/45">{item.allowed ? "Visible" : "Hidden"}</span>
        </li>
      ))}
    </ul>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-foreground/55">{label}</p>
        <p className="mt-1 break-words text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-foreground/45">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}

export function AgingBars({ bands, currency }: { bands: { label: string; amount: number }[]; currency: string }) {
  const max = Math.max(...bands.map((band) => band.amount), 1);
  return (
    <div className="space-y-3">
      {bands.map((band) => (
        <div key={band.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-foreground/70">{band.label}</span>
            <span className="shrink-0 font-medium">{formatMoney(band.amount, currency)}</span>
          </div>
          <div className="brand-track h-2 overflow-hidden rounded-full">
            <div className="brand-bar h-full rounded-full" style={{ width: `${band.amount ? Math.max(8, (band.amount / max) * 100) : 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HiddenModules({ items }: { items: { title: string; reason: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className="flex min-w-0 gap-3 rounded-2xl border border-dashed border-foreground/15 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-foreground/10 text-foreground/60">
            <Lock size={16} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-foreground/55">{item.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Section({ title, detail, children, action }: { title: string; detail?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-medium">{title}</h2>
          {detail ? <p className="mt-1 text-xs leading-5 text-foreground/50">{detail}</p> : null}
        </div>
        {action}
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

export function RecordLink({
  href,
  title,
  meta,
  aside,
}: {
  href: string;
  title: string;
  meta: string;
  aside?: ReactNode;
}) {
  return (
    <Link href={href} className="flex min-w-0 flex-col gap-2 border-b border-foreground/10 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-foreground/50">{meta}</span>
      </span>
      {aside ? <span className="flex shrink-0 flex-wrap items-center gap-2">{aside}</span> : null}
    </Link>
  );
}

export function StatusAside({ status, amount, currency }: { status: string; amount: number; currency: string }) {
  return (
    <>
      <Badge status={status} />
      <span className="text-sm font-semibold">{formatMoney(amount, currency)}</span>
    </>
  );
}
