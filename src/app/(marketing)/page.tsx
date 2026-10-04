import { HeroBackground } from "@/components/marketing/HeroBackground";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

const workflow = [
  "Create or import customers & invoices",
  "Activate AI Collector with your tone & rules",
  "Reminders send when invoices are due or overdue",
  "Replies are classified — promises, disputes, claims",
  "Sensitive cases escalate for human approval",
  "Verified payment stops collection immediately",
];

const features = [
  {
    title: "Invoice management",
    body: "Drafts, statuses, PDFs, payments, attachments, and a full audit-aware timeline.",
  },
  {
    title: "AI reminders",
    body: "Concise, grounded reminders from approved invoice facts — never invented fees or threats.",
  },
  {
    title: "Reply understanding",
    body: "Promises, disputes, payment claims, and unclear replies routed with confidence scores.",
  },
  {
    title: "Human control",
    body: "Approval queues, pause rules, quiet hours, and escalation contacts stay in your hands.",
  },
];

const faqs = [
  {
    q: "Does AI mark invoices as paid?",
    a: "No. Payment status only changes from verified webhooks or authorized manual recording.",
  },
  {
    q: "Can I approve reminders before they send?",
    a: "Yes. Choose automatic sending, approve the first message, all messages, or firm-stage only.",
  },
  {
    q: "Is customer data isolated?",
    a: "Every record is workspace-scoped. Businesses cannot see each other's invoices or conversations.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — brand first, one composition, full-bleed visual */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <HeroBackground />
        <div className="grain absolute inset-0 opacity-60" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-24 pt-28 sm:px-6">
          <Reveal>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-white/55">
              {APP_NAME}
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
              Collect invoices in real time — without losing control
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/65 sm:text-lg">
              Automate overdue follow-up with an AI collector that drafts, classifies, and escalates —
              while your rules stay the source of truth.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg">Try it now</Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline">
                  See features
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.18em] text-white/45">Why Receivly</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Production speed without collection chaos
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["2–4s", "Focused workflows"],
              ["AI + rules", "Deterministic control"],
              ["Multi-tenant", "Workspace isolation"],
              ["Human review", "When confidence dips"],
            ].map(([k, v], i) => (
              <Reveal key={k} delay={i * 0.05}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-2xl font-semibold text-white">{k}</p>
                  <p className="mt-2 text-sm text-white/55">{v}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(144,33,119,0.18),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.18em] text-white/45">Product flow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              From signup to settled — one clear path
            </h2>
            <p className="mt-4 max-w-xl text-white/60">
              Businesses onboard, import invoices, activate the collector, and resolve exceptions in a
              unified conversation center.
            </p>
          </Reveal>
          <div className="space-y-3">
            {workflow.map((step, i) => (
              <Reveal key={step} delay={i * 0.04}>
                <div className="flex gap-4 rounded-2xl border border-white/10 bg-[#0c0c18]/80 p-4">
                  <span className="font-mono text-sm text-[#d8b4fe]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-white/80">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Key capabilities</h2>
            <p className="mt-3 max-w-2xl text-white/60">
              Everything finance teams need to manage receivables — with AI as an assistant, not the
              authority.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <article className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6">
                  <h3 className="text-xl font-semibold">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{f.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/features">
              <Button variant="secondary">Explore all features</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Built for trust</h2>
            <p className="mt-3 max-w-2xl text-white/60">
              Tenant isolation, audited actions, plan entitlements, and graceful handling when
              subscriptions lapse — without deleting customer records.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["Workspace isolation", "Approval & quiet hours", "Audit-friendly history"].map(
              (item, i) => (
                <Reveal key={item} delay={i * 0.05}>
                  <div className="rounded-2xl border border-white/10 px-5 py-8 text-center text-white/80">
                    {item}
                  </div>
                </Reveal>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">FAQs</h2>
          </Reveal>
          <div className="mt-8 space-y-4">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.04}>
                <details className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <summary className="cursor-pointer list-none font-medium text-white marker:content-none">
                    {faq.q}
                  </summary>
                  <p className="mt-3 text-sm text-white/60">{faq.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Start collecting with clarity
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              Create a workspace, import invoices, and activate the AI collector in minutes.
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
