"use client";

import { Badge } from "@/components/ui/Badge";
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

const ACCESS = [
  { label: "Dashboard", allowed: true },
  { label: "Invoices", allowed: true },
  { label: "Conversations", allowed: true },
  { label: "Reports", allowed: true },
  { label: "Create or edit", allowed: false },
  { label: "Send or approve", allowed: false },
  { label: "Billing & team", allowed: false },
  { label: "Collector rules", allowed: false },
];

export default function ViewerRolePage() {
  const data = useWorkspaceSnapshot();
  if (!data) return <PageLoader label="Loading the read-only view…" />;

  const { dashboard, invoices, customers, conversations, reports } = data;
  const books = openInvoices(invoices);
  const activity = reports.collectionActivity;

  return (
    <div className="min-w-0 space-y-6">
      <RoleSwitcher />
      <RoleHero
        kicker="Viewer"
        title="Read-only books for Jordan Lee."
        body="Jordan can review the dashboard, invoices, conversations, and reports. This screen has no send, edit, approve, or billing actions. Exports and collector changes stay with finance and admin."
        meta={["Previewing as Jordan Lee", "Viewer", "Read only", "Sample data"]}
      />
      <AccessList items={ACCESS} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="USD outstanding" value={formatMoney(dashboard.totalOutstanding, "USD")} hint="View only" />
        <StatCard label="USD overdue" value={formatMoney(dashboard.overdueAmount, "USD")} hint={`${dashboard.overdueCount} invoices`} />
        <StatCard label="USD promised" value={formatMoney(dashboard.promisedAmount, "USD")} hint="Stored promise dates" />
        <StatCard label="Avg. days to payment" value={`${reports.avgDaysToPayment} days`} hint="From verified payment events" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="USD aging" detail="Current through 90+ days. Figures are stored balances, not a forecast.">
          <AgingBars bands={dashboard.aging} currency="USD" />
        </Section>
        <Section title="Collection activity" detail="Reminders, replies, promises, disputes, and payments already on record.">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Reminders", activity.remindersSent],
              ["Replies", activity.repliesReceived],
              ["Promises kept", activity.promisesKept],
              ["Disputes", activity.disputes],
              ["Failures", activity.failures],
              ["Payments", activity.paymentsRecorded],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-foreground/10 px-3 py-3">
                <p className="text-xs text-foreground/50">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Invoices" detail="Open a record to read it. Status changes, payments, and collector pauses are not available here.">
        <div>
          {books.map((invoice) => (
            <RecordLink
              key={invoice.id}
              href={`/app/invoices/${invoice.id}`}
              title={`${invoice.number} · ${customerName(customers, invoice.customerId)}`}
              meta={`Due ${formatDate(invoice.dueDate)} · View only`}
              aside={<StatusAside status={invoice.status} amount={invoice.balance} currency={invoice.currency} />}
            />
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Conversations" detail="Threads can be read. Replies, approvals, and internal assignment stay with finance.">
          <div>
            {conversations.map((conversation) => (
              <RecordLink
                key={conversation.id}
                href={`/app/conversations/${conversation.id}`}
                title={conversation.subject}
                meta={`${customerName(customers, conversation.customerId)} · ${formatRelative(conversation.lastMessageAt)}`}
                aside={conversation.unread ? <Badge status="pending">Unread</Badge> : <Badge status="paused">Read</Badge>}
              />
            ))}
          </div>
        </Section>
        <Section title="Outstanding by customer" detail="Each row uses that customer's currency. Totals are not converted on this screen.">
          <div>
            {customers.map((customer) => (
              <div key={customer.id} className="flex flex-col gap-1 border-b border-foreground/10 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{customer.name}</p>
                  <p className="text-xs text-foreground/50">{customer.currency} · Overdue {formatMoney(customer.overdueBalance, customer.currency)}</p>
                </div>
                <p className="text-sm font-semibold">{formatMoney(customer.outstandingBalance, customer.currency)}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Upcoming, view only" detail="Scheduled reminders and promised dates. A viewer cannot send or reschedule them.">
        <div>
          {dashboard.upcomingActions.map((action) => (
            <RecordLink key={action.id} href={action.href} title={action.label} meta={formatDate(action.date)} aside={<Badge status="due">Scheduled</Badge>} />
          ))}
        </div>
      </Section>

      <Section title="Hidden from viewers" detail="Jordan can see the books. These controls are not part of the role.">
        <HiddenModules
          items={[
            { title: "Create, edit, or import", reason: "New invoices, customer edits, and CSV import belong to finance and admin." },
            { title: "Send, approve, or pause", reason: "Reminder approval, manual sends, and collector changes are not read-only actions." },
            { title: "Billing and team", reason: "Plans, invitations, and role changes are workspace-admin only." },
            { title: "Collector rules", reason: "Tone, quiet hours, and escalation contacts are configuration, not a report." },
          ]}
        />
      </Section>
    </div>
  );
}
