import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Invoice management, AI reminders, reply understanding, promise tracking, conversation history, reporting, and human control — all in one workspace.",
};

const sections = [
  {
    id: "invoice-management",
    title: "Invoice management",
    tagline: "Every receivable, one source of truth",
    body: "Create, import, and manage invoices with full lifecycle tracking — from draft through paid, paused, or written off. Line items, taxes, discounts, PDFs, payment links, and attachments stay tied to each customer record.",
    bullets: [
      "Statuses from draft to paid with audit-aware transitions",
      "CSV import and export for customers and invoices",
      "Per-invoice collector pause and assignment",
      "Timeline of every edit, send, reminder, and payment",
    ],
  },
  {
    id: "ai-reminders",
    title: "AI reminders",
    tagline: "Grounded follow-up, not invented pressure",
    body: "The AI Collector drafts concise reminders from approved invoice facts — amounts, due dates, and terms you control. Choose tone, quiet hours, max reminders, and whether messages send automatically or wait for approval.",
    bullets: [
      "Friendly, professional, or firm tone presets",
      "Quiet hours and permitted send days",
      "Approval modes: none, first, all, or firm-stage only",
      "Never invents fees, threats, or unverified payment details",
    ],
  },
  {
    id: "reply-understanding",
    title: "Reply understanding",
    tagline: "Classify every inbound response",
    body: "When customers reply, Receivly classifies intent — payment promises, disputes, claims of payment, extension requests, wrong contacts, and more — with confidence scores so your team knows what needs attention.",
    bullets: [
      "Categories: promise, dispute, paid claim, extension, unclear",
      "Confidence scores surface low-certainty replies",
      "Sensitive or abusive content flagged for review",
      "Automatic routing to approval queue when rules match",
    ],
  },
  {
    id: "promise-tracking",
    title: "Promise tracking",
    tagline: "Hold customers to their word",
    body: "When a debtor promises payment by a date, Receivly captures it on the invoice, updates status, and schedules follow-up if the promise is missed — without your team manually chasing spreadsheets.",
    bullets: [
      "Promised dates linked to invoice records",
      "Missed-promise alerts and conversation filters",
      "Upcoming promise notifications for finance teams",
      "Collector pauses while promises are active",
    ],
  },
  {
    id: "conversation-history",
    title: "Conversation history",
    tagline: "Unified inbox for every collection thread",
    body: "All outbound reminders and inbound replies live in a workspace-scoped conversation center. Filter by unread, needs approval, disputed, payment claimed, failed delivery, or low confidence.",
    bullets: [
      "Threaded email history per invoice and customer",
      "Internal notes visible only to your team",
      "Assignment and escalation to finance managers",
      "Full message status: queued, sent, delivered, bounced",
    ],
  },
  {
    id: "reporting",
    title: "Reporting",
    tagline: "Visibility without spreadsheet gymnastics",
    body: "Dashboard summaries, aging bands, collection activity metrics, and customer-level outstanding balances give finance leaders a clear picture — reminders sent, promises kept or missed, disputes, and payments recorded.",
    bullets: [
      "Outstanding and overdue totals at a glance",
      "Aging bands and customer-level breakdowns",
      "Collection activity: reminders, replies, promises, disputes",
      "Export-friendly data for month-end close",
    ],
  },
  {
    id: "user-control",
    title: "User control",
    tagline: "AI assists — your rules decide",
    body: "Workspace isolation, role-based access, approval queues, and deterministic payment recording keep humans in charge. AI never marks invoices paid without verified webhooks or authorized manual entry.",
    bullets: [
      "Roles: admin, finance manager, viewer, member",
      "Team invitations and workspace-scoped data",
      "Escalation contacts and notification preferences",
      "Audit-friendly action history across the workspace",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="border-b border-foreground/10 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.18em] text-foreground/45">{APP_NAME}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Everything you need to collect with clarity
            </h1>
            <p className="mt-4 max-w-2xl text-base text-foreground/60 sm:text-lg">
              From invoice creation to settled payment — AI-powered follow-up with deterministic
              control at every step.
            </p>
          </Reveal>
        </div>
      </section>

      {sections.map((section, i) => (
        <section
          key={section.id}
          id={section.id}
          className="border-b border-foreground/10 py-16 sm:py-24 even:bg-foreground/[0.015]"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <Reveal delay={i * 0.03}>
              <p className="font-mono text-xs uppercase tracking-widest text-[#c084fc]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {section.title}
              </h2>
              <p className="mt-2 text-lg text-foreground/70">{section.tagline}</p>
            </Reveal>
            <Reveal delay={i * 0.03 + 0.05}>
              <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.05] to-transparent p-6 sm:p-8">
                <p className="text-sm leading-relaxed text-foreground/65">{section.body}</p>
                <ul className="mt-6 space-y-3">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm text-foreground/75">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#902177]"
                        aria-hidden
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to see it in action?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground/60">
              Start with a demo workspace or explore plans that match your invoice volume.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup">
                <Button size="lg">Get started</Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View pricing
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
