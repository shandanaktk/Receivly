"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import {
  AccessList,
  AgingBars,
  HiddenModules,
  RecordLink,
  RoleHero,
  RoleSwitcher,
  Section,
  StatCard,
  StatusAside,
  customerName,
  openInvoices,
  useWorkspaceSnapshot,
} from "@/components/app/RolePreview";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import Link from "next/link";

const ACCESS = [
  { label: "Customers", allowed: true },
  { label: "Invoices", allowed: true },
  { label: "Conversations", allowed: true },
  { label: "Reports", allowed: true },
  { label: "Collector settings", allowed: true },
  { label: "Automation approvals", allowed: true },
  { label: "Billing & plan", allowed: false },
  { label: "Team management", allowed: false },
];

export default function FinanceRolePage() {
  const data = useWorkspaceSnapshot();
  if (!data) return <PageLoader label="Loading the finance desk…" />;

  const { workspace, dashboard, invoices, customers, conversations, approvals, reports } = data;
  const books = openInvoices(invoices);
  const queue = conversations.filter(
    (conversation) =>
      conversation.needsApproval ||
      conversation.disputed ||
      conversation.paymentClaimed ||
      conversation.lowConfidence ||
      conversation.promiseMissed ||
      conversation.failed,
  );
  const activity = reports.collectionActivity;

  return (
    <div className="min-w-0 space-y-6">
      <RoleSwitcher />
      <RoleHero
        kicker="Finance manager"
        title="Collections desk for Sam Rivera."
        body="Sam can manage customers, invoices, conversations, reports, and collector settings, and can approve automation. Billing, team invitations, and platform administration stay with the workspace admin."
        meta={["Previewing as Sam Rivera", "Finance manager", "Sample data", "Northwind Studio"]}
      />
      <AccessList items={ACCESS} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Needs a person" value={String(queue.length)} hint="Disputes, claims, and unclear replies" />
        <StatCard label="Approvals waiting" value={String(approvals.length)} hint="Drafts that have not been sent" />
        <StatCard label="USD outstanding" value={formatMoney(dashboard.totalOutstanding, "USD")} hint={`${dashboard.overdueCount} USD invoices overdue`} />
        <StatCard label="Promises kept" value={`${activity.promisesKept}/${activity.promisesCaptured}`} hint={`${activity.promisesMissed} missed in the sample period`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <Section
          title="Approval queue"
          detail="Firm-stage and uncertain replies wait here. Approving sends the stored draft, not a new AI guess."
          action={<Link href="/app/approvals"><Button size="sm">Open queue</Button></Link>}
        >
          {approvals.length === 0 ? (
            <p className="text-sm text-foreground/55">No drafts are waiting.</p>
          ) : (
            <div className="space-y-3">
              {approvals.map((item) => (
                <article key={item.id} className="rounded-xl border border-foreground/10 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.customerName}</p>
                      <p className="mt-0.5 text-xs text-foreground/50">{item.stage} · {formatRelative(item.createdAt)}</p>
                    </div>
                    <Badge status="pending">Needs approval</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/70">{item.draftBody}</p>
                  <Link href={`/app/conversations/${item.conversationId}`} className="brand-ink mt-3 inline-block text-xs font-bold hover:underline">
                    Review thread
                  </Link>
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section title="Work queue" detail="Threads finance should open before the next reminder goes out.">
          <div>
            {queue.map((conversation) => (
              <RecordLink
                key={conversation.id}
                href={`/app/conversations/${conversation.id}`}
                title={conversation.subject}
                meta={conversation.nextAction || conversation.pauseReason || "Open the thread"}
                aside={
                  <Badge
                    status={
                      conversation.disputed
                        ? "disputed"
                        : conversation.paymentClaimed
                          ? "payment_claimed"
                          : conversation.needsApproval
                            ? "pending"
                            : "medium"
                    }
                  />
                }
              />
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Open invoices"
        detail="Amounts keep their own currency. A payment claim never marks an invoice paid by itself."
        action={<Link href="/app/invoices/new"><Button size="sm" variant="outline">Create invoice</Button></Link>}
      >
        <div>
          {books.map((invoice) => (
            <RecordLink
              key={invoice.id}
              href={`/app/invoices/${invoice.id}`}
              title={`${invoice.number} · ${customerName(customers, invoice.customerId)}`}
              meta={`Due ${formatDate(invoice.dueDate)}${invoice.promisedDate ? ` · Promised ${formatDate(invoice.promisedDate)}` : ""}${invoice.collectorPaused ? " · Collector paused" : ""}`}
              aside={<StatusAside status={invoice.status} amount={invoice.balance} currency={invoice.currency} />}
            />
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Customers" detail="Outstanding and overdue stay on the customer record finance already maintains." action={<Link href="/app/customers"><Button size="sm" variant="outline">All customers</Button></Link>}>
          <div>
            {customers.map((customer) => (
              <RecordLink
                key={customer.id}
                href={`/app/customers/${customer.id}`}
                title={customer.name}
                meta={`${customer.primaryContact} · ${customer.currency}${customer.doNotContact ? " · Do not contact" : ""}`}
                aside={<span className="text-sm font-semibold">{formatMoney(customer.outstandingBalance, customer.currency)}</span>}
              />
            ))}
          </div>
        </Section>
        <Section title="USD aging" detail="Used for the finance close. CAD and GBP invoices are excluded from this chart.">
          <AgingBars bands={dashboard.aging} currency="USD" />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Collector settings"
          detail="Finance can change tone, timing, quiet hours, and approval mode. Sender identity still belongs to the workspace."
          action={<Link href="/app/ai-collector"><Button size="sm" variant="outline">Edit collector</Button></Link>}
        >
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Tone", workspace.reminderTone],
              ["Approval mode", workspace.approvalMode.replace("_", " ")],
              ["Quiet hours", `${workspace.quietHoursStart}–${workspace.quietHoursEnd}`],
              ["Max reminders", String(workspace.maxReminders)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-foreground/10 px-3 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[.12em] text-foreground/45">{label}</dt>
                <dd className="mt-1 text-sm font-semibold capitalize">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>
        <Section title="Collection activity" detail="Counts from stored events in the sample period, not an AI estimate." action={<Link href="/app/reports"><Button size="sm" variant="outline">Open reports</Button></Link>}>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Reminders sent", activity.remindersSent],
              ["Replies", activity.repliesReceived],
              ["Disputes", activity.disputes],
              ["Payments recorded", activity.paymentsRecorded],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-foreground/10 px-3 py-3">
                <p className="text-xs text-foreground/50">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Not on this desk" detail="These stay with the workspace admin.">
        <HiddenModules
          items={[
            { title: "Billing & plan", reason: "Plan changes, the billing portal, and renewal status are admin-only." },
            { title: "Team management", reason: "Invitations, role changes, and removing access are admin-only." },
          ]}
        />
      </Section>
    </div>
  );
}
