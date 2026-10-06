"use client";

import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import {
  AccessList,
  HiddenModules,
  RoleHero,
  RoleSwitcher,
  Section,
  StatCard,
  customerName,
  useWorkspaceSnapshot,
} from "@/components/app/RolePreview";
import { formatDate, formatMoney } from "@/lib/format";
import Link from "next/link";

const ACCESS = [
  { label: "Assigned invoices", allowed: true },
  { label: "Assigned threads", allowed: true },
  { label: "Company reports", allowed: false },
  { label: "All customers", allowed: false },
  { label: "Collector rules", allowed: false },
  { label: "Approvals", allowed: false },
  { label: "Billing", allowed: false },
  { label: "Team management", allowed: false },
];

const ASSIGNMENTS: { invoiceId: string; conversationId?: string; task: string; next: string }[] = [
  {
    invoiceId: "inv_1",
    conversationId: "conv_4",
    task: "Casey answered too vaguely to classify. Read the thread and leave finance a note before any firm reminder goes out.",
    next: "Needs your note",
  },
  {
    invoiceId: "inv_4",
    conversationId: "conv_5",
    task: "The due-date reminder is already scheduled. Confirm Avery Brooks is still the billing contact. Do not change collector rules.",
    next: "Watch only",
  },
  {
    invoiceId: "inv_8",
    task: "CAD 2,000 is already recorded. Ask Lumen for a reference on the remainder. You cannot mark the invoice paid.",
    next: "Follow up",
  },
];

export default function MemberRolePage() {
  const data = useWorkspaceSnapshot();
  if (!data) return <PageLoader label="Loading assigned work…" />;

  const { invoices, customers, conversations } = data;
  const items = ASSIGNMENTS.map((assignment) => {
    const invoice = invoices.find((item) => item.id === assignment.invoiceId);
    const conversation = assignment.conversationId
      ? conversations.find((item) => item.id === assignment.conversationId)
      : undefined;
    return { ...assignment, invoice, conversation };
  }).filter((item) => item.invoice);

  return (
    <div className="min-w-0 space-y-6">
      <RoleSwitcher />
      <RoleHero
        kicker="Member"
        title="Taylor's assigned work."
        body="A member sees only the invoices and threads assigned to them. Company-wide reports, every customer, collector rules, approvals, billing, and team management are outside this role."
        meta={["Previewing as Taylor Brooks", "Member", "Assigned items only", "Sample data"]}
      />
      <AccessList items={ACCESS} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned invoices" value={String(items.length)} hint="Not the full Northwind book" />
        <StatCard label="Open threads" value={String(items.filter((item) => item.conversation).length)} hint="Only threads on those invoices" />
        <StatCard label="Waiting on Taylor" value={String(items.filter((item) => item.next !== "Watch only").length)} hint="Notes and follow-ups, not sends" />
      </div>

      <Section title="Assigned to you" detail="These three records are Taylor's queue for the walkthrough. The rest of the workspace is hidden.">
        <div className="grid gap-3">
          {items.map((item) => {
            const invoice = item.invoice!;
            const customer = customerName(customers, invoice.customerId);
            return (
              <article key={invoice.id} className="min-w-0 rounded-2xl border border-foreground/10 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{invoice.number} · {customer}</p>
                    <p className="mt-1 text-xs text-foreground/50">Due {formatDate(invoice.dueDate)} · {formatMoney(invoice.balance, invoice.currency)} remaining</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge status={invoice.status} />
                    <span className="brand-chip rounded-full px-2.5 py-0.5 text-xs font-semibold">{item.next}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground/70">{item.task}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link href={`/app/invoices/${invoice.id}`} className="brand-ink text-xs font-bold hover:underline">
                    Open {invoice.number}
                  </Link>
                  {item.conversation ? (
                    <Link href={`/app/conversations/${item.conversation.id}`} className="brand-ink text-xs font-bold hover:underline sm:ml-4">
                      Open thread
                    </Link>
                  ) : (
                    <span className="text-xs text-foreground/45 sm:ml-4">No thread on this invoice</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section title="What you can do with an assignment" detail="Basic access. Irreversible money and automation actions stay with finance.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            "Read the invoice facts, due date, and balance.",
            "Read the email thread tied to that invoice.",
            "See why a reminder is paused.",
            "Leave a note for the finance manager.",
          ].map((line) => (
            <li key={line} className="rounded-xl border border-foreground/10 px-3 py-3 text-sm leading-6 text-foreground/75">
              {line}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Hidden from members" detail="Taylor is not shown the company book or the controls that change it.">
        <HiddenModules
          items={[
            { title: "Company reports", reason: "Aging, collected totals, and customer-wide outstanding balances are for viewers, finance, and admin." },
            { title: "Every customer and invoice", reason: "Unassigned records, including Harbor, Orbit, and the draft invoice, are not on this desk." },
            { title: "Collector rules", reason: "Tone, quiet hours, approval mode, and test sends are configuration, not an assignment." },
            { title: "Approvals, billing, and team", reason: "Sending a draft, changing the plan, or inviting someone requires finance or admin." },
          ]}
        />
      </Section>
    </div>
  );
}
