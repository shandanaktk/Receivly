"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import {
  AccessList,
  AgingBars,
  RecordLink,
  RoleHero,
  RoleSwitcher,
  Section,
  StatCard,
  currencyBuckets,
  customerName,
  openInvoices,
  roleLabel,
  useWorkspaceSnapshot,
} from "@/components/app/RolePreview";
import { PLANS } from "@/lib/constants";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import Link from "next/link";

const ACCESS = [
  { label: "Workspace settings", allowed: true },
  { label: "Billing & plan", allowed: true },
  { label: "Team & invitations", allowed: true },
  { label: "Customers & invoices", allowed: true },
  { label: "Conversations", allowed: true },
  { label: "AI Collector rules", allowed: true },
  { label: "Approvals", allowed: true },
  { label: "Reports", allowed: true },
];

export default function AdminRolePage() {
  const data = useWorkspaceSnapshot();
  if (!data) return <PageLoader label="Loading the admin workspace…" />;

  const { workspace, dashboard, invoices, customers, team, approvals } = data;
  const plan = PLANS.find((item) => item.id === workspace.planId);
  const activeCount = invoices.filter((invoice) => !["paid", "void", "written_off"].includes(invoice.status)).length;
  const usage = plan ? Math.min((activeCount / plan.invoiceAllowance) * 100, 100) : 0;
  const buckets = currencyBuckets(invoices);
  const books = openInvoices(invoices).slice(0, 4);

  return (
    <div className="min-w-0 space-y-6">
      <RoleSwitcher />
      <RoleHero
        kicker="Workspace admin"
        title={`Full control for ${workspace.companyName}.`}
        body="Company settings, billing, team invitations, customers, invoices, collector rules, and reports. Platform-owner tools — every business, plan catalog, and workflow monitor — stay in a separate console."
        meta={["Previewing as Alex Morgan", "Admin", "Sample data", workspace.timezone]}
      />
      <AccessList items={ACCESS} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="USD outstanding" value={formatMoney(dashboard.totalOutstanding, "USD")} hint="Open balances in USD only" />
        <StatCard label="USD overdue" value={formatMoney(dashboard.overdueAmount, "USD")} hint={`${dashboard.overdueCount} USD invoices past due`} />
        <StatCard label="Promised in USD" value={formatMoney(dashboard.promisedAmount, "USD")} hint="Collected this month follows verified payments" />
        <StatCard label="Collector" value={workspace.aiCollectorActive ? "Active" : "Paused"} hint={`${workspace.reminderTone} tone · ${workspace.approvalMode} approval`} />
      </div>

      <Section title="Balances by currency" detail="USD, CAD, and GBP stay in their own totals. They are never added together.">
        <div className="grid gap-3 sm:grid-cols-3">
          {buckets.map((bucket) => (
            <div key={bucket.currency} className="rounded-xl border border-foreground/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-foreground/45">{bucket.currency}</p>
              <p className="mt-1 text-xl font-semibold">{formatMoney(bucket.outstanding, bucket.currency)}</p>
              <p className="mt-1 text-xs text-foreground/50">{bucket.count} open {bucket.count === 1 ? "invoice" : "invoices"}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Billing & plan"
          detail="Admins review the plan, allowance, and renewal. Checkout itself stays with the billing provider."
          action={<Link href="/app/billing"><Button size="sm" variant="outline">Open billing</Button></Link>}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{plan?.name} · {plan ? formatMoney(plan.priceMonthly, "USD") : "—"}/month</p>
              <p className="mt-1 text-sm text-foreground/55">Renews {formatDate(workspace.periodEnd)} · {workspace.subscriptionStatus}</p>
            </div>
            <Badge status={workspace.subscriptionStatus} />
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-foreground/55">
              <span>Active invoices</span>
              <span>{activeCount} / {plan?.invoiceAllowance ?? "—"}</span>
            </div>
            <div className="brand-track h-2 overflow-hidden rounded-full">
              <div className="brand-bar h-full rounded-full" style={{ width: `${usage}%` }} />
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-foreground/50">A failed or cancelled subscription becomes read-only after the grace period. Customer records are not deleted.</p>
        </Section>

        <Section
          title="Team"
          detail="Invite people, change roles, and remove access. Pending invites stay visible."
          action={<Link href="/app/settings"><Button size="sm" variant="outline">Manage team</Button></Link>}
        >
          <div>
            {team.map((member) => (
              <div key={member.id} className="flex flex-col gap-2 border-b border-foreground/10 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{member.name}</p>
                  <p className="truncate text-xs text-foreground/50">{member.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="brand-chip rounded-full px-2.5 py-0.5 text-xs font-semibold">{roleLabel(member.role)}</span>
                  <Badge status={member.status} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <Section title="USD aging" detail="Current, 1–30, 31–60, 61–90, and 90+ days. Other currencies are listed above.">
          <AgingBars bands={dashboard.aging} currency="USD" />
        </Section>
        <Section title="Attention required" detail="Disputes, payment claims, and low-confidence replies waiting on a person.">
          <div>
            {dashboard.attentionRequired.map((item) => (
              <RecordLink key={item.id} href={item.href} title={item.label} meta="Open the thread" aside={<Badge status={item.severity} />} />
            ))}
          </div>
          <p className="mt-3 text-xs text-foreground/50">{approvals.length} draft {approvals.length === 1 ? "message is" : "messages are"} waiting in the approval queue.</p>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Collector rules"
          detail="Tone, quiet hours, and who must approve a send. Changing these affects every eligible invoice."
          action={<Link href="/app/ai-collector"><Button size="sm" variant="outline">Edit rules</Button></Link>}
        >
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Tone", workspace.reminderTone],
              ["Approval", workspace.approvalMode],
              ["Auto-send", workspace.autoSend ? "On" : "Off"],
              ["Quiet hours", `${workspace.quietHoursStart}–${workspace.quietHoursEnd}`],
              ["Max reminders", String(workspace.maxReminders)],
              ["Escalation", workspace.escalationEmail],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-foreground/10 px-3 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[.12em] text-foreground/45">{label}</dt>
                <dd className="mt-1 truncate text-sm font-semibold capitalize">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>
        <Section title="Open invoices" detail="A short cut of the book. Drafts and paid invoices stay out of outstanding totals.">
          <div>
            {books.map((invoice) => (
              <RecordLink
                key={invoice.id}
                href={`/app/invoices/${invoice.id}`}
                title={invoice.number}
                meta={`${customerName(customers, invoice.customerId)} · Due ${formatDate(invoice.dueDate)}`}
                aside={<span className="text-sm font-semibold">{formatMoney(invoice.balance, invoice.currency)}</span>}
              />
            ))}
          </div>
        </Section>
      </div>

      <Section title="Recent activity" detail="Reminders, replies, payments, and status changes already stored for this workspace.">
        <ul>
          {dashboard.recentActivity.map((item) => (
            <li key={item.id} className="flex flex-col gap-1 border-b border-foreground/10 py-3 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <span>{item.label}</span>
              <span className="text-xs text-foreground/45">{formatRelative(item.time)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Quick actions" detail="The same moves an admin can take from the live workspace.">
        <div className="flex flex-wrap gap-2">
          <Link href="/app/customers/new"><Button size="sm">Add customer</Button></Link>
          <Link href="/app/invoices/new"><Button size="sm" variant="secondary">Create invoice</Button></Link>
          <Link href="/app/invoices/import"><Button size="sm" variant="outline">Import CSV</Button></Link>
          <Link href="/app/approvals"><Button size="sm" variant="outline">Review approvals</Button></Link>
          <Link href="/app/settings"><Button size="sm" variant="outline">Workspace settings</Button></Link>
        </div>
      </Section>
    </div>
  );
}
