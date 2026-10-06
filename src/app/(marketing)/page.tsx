import { HeroBackground } from "@/components/marketing/HeroBackground";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowUpRight, BellRing, Bot, ChartNoAxesCombined, Check, CircleCheck, Clock3, FileCheck2, FileText, MessageSquareText, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const steps = [
  { number: "01", title: "Bring your invoices together", body: "Create or import customers and invoices. Every amount, due date, and payment link stays tied to a real record.", icon: FileText },
  { number: "02", title: "Set the rules once", body: "Choose your reminder tone, timing, quiet hours, approval mode, and escalation contact before activating the collector.", icon: Bot },
  { number: "03", title: "Focus on the exceptions", body: "Replies become clear actions. Promises, disputes, payment claims, and uncertain messages surface for your team.", icon: MessageSquareText },
  { number: "04", title: "Close the loop with confidence", body: "Verified payment stops follow-up. The full invoice timeline remains visible for every decision.", icon: CircleCheck },
];

const capabilities = [
  { icon: FileCheck2, title: "Invoicing, without the sprawl", body: "Draft, import, track, and organize every invoice in one calm workspace.", href: "/features#invoice-management" },
  { icon: Sparkles, title: "Thoughtful AI reminders", body: "Messages use approved invoice facts and your chosen tone, timing, and rules.", href: "/features#ai-reminders" },
  { icon: MessageSquareText, title: "Every reply has a place", body: "See the conversation, classification, owner, and next action together.", href: "/features#conversation-history" },
  { icon: ChartNoAxesCombined, title: "A clearer picture of cash", body: "Aging, collection activity, and payment trends at a glance.", href: "/features#reporting" },
];

const faqs = [
  { q: "Can AI mark an invoice as paid?", a: "No. A payment is recorded only after authorized manual entry or a verified payment event. A customer's email claim pauses collection for review." },
  { q: "Can our team approve reminders first?", a: "Yes. Choose approval for the first message, every message, or firm-stage messages. You can also pause a customer or invoice." },
  { q: "What happens when a customer disputes an invoice?", a: "Automated collection pauses and the thread moves into your review queue with the reason, history, and suggested next action." },
  { q: "Can we start with existing invoices?", a: "Yes. The workspace includes CSV import with field mapping and a validation preview, plus manual entry for individual records." },
];

function InvoiceScene() {
  return <div className="float-card relative mx-auto w-full max-w-[610px] lg:rotate-[1.5deg]" aria-label="Preview of the Receivly workspace">
    <div className="absolute -inset-7 rounded-[3rem] bg-[radial-gradient(ellipse,#9d42d24a,transparent_68%)] blur-3xl" />
    <div className="relative overflow-hidden rounded-[1.45rem] border border-white/20 bg-[#101427]/95 shadow-[0_35px_100px_rgba(0,0,0,.6)] backdrop-blur-xl">
      <div className="flex h-11 items-center justify-between border-b border-white/10 px-4"><div className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ff7c83]" /><i className="h-2 w-2 rounded-full bg-[#ffd379]" /><i className="h-2 w-2 rounded-full bg-[#7ee1b8]" /></div><span className="text-[.7rem] font-medium tracking-[.08em] text-white/50">RECEIVLY / WORKSPACE</span><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" /></div>
      <div className="grid grid-cols-[68px_1fr] sm:grid-cols-[132px_1fr]">
        <div className="border-r border-white/10 bg-white/[0.02] px-2 py-5 sm:px-3">
          <div className="mb-7 flex items-center justify-center gap-2 sm:justify-start"><span className="grid h-6 w-6 place-items-center rounded-md bg-fuchsia-500 text-xs font-bold text-white">R</span><span className="hidden text-xs font-semibold text-white sm:inline">receivly</span></div>
          {["Overview", "Invoices", "Conversations", "AI Collector", "Reports"].map((item, i) => <div key={item} className={`mb-2 flex h-8 items-center gap-2 rounded-lg px-2 text-[.68rem] ${i === 0 ? "bg-violet-500/20 text-white" : "text-white/45"}`}><span className="h-2.5 w-2.5 rounded-[3px] border border-current" /><span className="hidden sm:inline">{item}</span></div>)}
        </div>
        <div className="min-w-0 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2"><div><p className="text-[.67rem] uppercase tracking-[.15em] text-white/40">Tuesday, October 6</p><p className="mt-1 text-lg font-semibold text-white sm:text-xl">Good morning, Alex</p></div><span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[.67rem] text-emerald-200 sm:block">● Collector active</span></div>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-[.65rem] text-white/50">Outstanding</p><p className="mt-1 text-base font-semibold text-white sm:text-xl">$128,450</p><p className="mt-1 text-[.65rem] text-emerald-300">↗ 8.2% collected</p></div><div className="rounded-xl border border-white/10 bg-white/[0.05] p-3"><p className="text-[.65rem] text-white/50">Overdue</p><p className="mt-1 text-base font-semibold text-white sm:text-xl">$32,710</p><p className="mt-1 text-[.65rem] text-amber-300">12 invoices</p></div><div className="hidden rounded-xl border border-white/10 bg-white/[0.05] p-3 sm:block"><p className="text-[.65rem] text-white/50">Promised</p><p className="mt-1 text-xl font-semibold text-white">$18,200</p><p className="mt-1 text-[.65rem] text-sky-300">4 payments due</p></div></div>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3.5"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-white">Collection flow</p><p className="text-[.65rem] text-white/40">Last 30 days</p></div><div className="mt-4 flex h-20 items-end justify-between gap-1.5">{[28,41,34,57,50,64,48,69,61,78,74,92,84,96,88,100].map((h, i) => <span key={i} className="min-w-0 flex-1 rounded-t-[3px] bg-gradient-to-t from-blue-600/70 to-fuchsia-400/90" style={{ height: `${h}%` }} />)}</div><div className="mt-2 flex justify-between text-[.62rem] text-white/40"><span>Sep 7</span><span>Sep 21</span><span>Today</span></div></div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-fuchsia-300/15 bg-fuchsia-400/[0.07] p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-fuchsia-500/20 text-fuchsia-200"><Sparkles size={14} /></span><div className="min-w-0"><p className="text-[.72rem] font-medium text-white">3 conversations need your review</p><p className="text-[.65rem] text-white/45">Dispute · Payment claim · Promise follow-up</p></div><ArrowUpRight size={13} className="ml-auto shrink-0 text-white/50" /></div>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-7 -left-4 hidden w-52 rounded-2xl border border-white/20 bg-[#20213b]/95 p-3.5 shadow-2xl backdrop-blur-md sm:block"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300"><Check size={14} /></span><div><p className="text-[.7rem] font-semibold text-white">Payment verified</p><p className="text-[.65rem] text-white/45">Collection stopped</p></div></div></div>
  </div>;
}

function CollectorVisual() {
  return <div className="relative mx-auto flex min-h-[340px] w-full max-w-lg items-center justify-center overflow-hidden rounded-[2rem] border border-foreground/10 bg-[radial-gradient(circle_at_50%_45%,rgba(130,60,193,.22),transparent_55%)] p-5 sm:min-h-[440px]">
    <div className="marketing-grid absolute inset-0 opacity-20" />
    <div className="absolute h-72 w-72 rounded-full border border-violet-400/15 sm:h-[370px] sm:w-[370px]" /><div className="absolute h-52 w-52 rounded-full border border-violet-400/25 sm:h-[270px] sm:w-[270px]" /><div className="absolute h-32 w-32 rounded-full border border-violet-400/35 sm:h-[170px] sm:w-[170px]" />
    <div className="relative z-10 grid h-20 w-20 place-items-center rounded-[1.6rem] border border-violet-300/30 bg-gradient-to-br from-fuchsia-500 via-violet-600 to-blue-700 text-white shadow-[0_0_80px_rgba(146,79,230,.5)]"><Bot size={38} strokeWidth={1.4} /></div>
    <div className="absolute left-4 top-8 flex items-center gap-2 rounded-xl border border-foreground/15 bg-elevated/90 p-2.5 text-xs shadow-xl sm:left-8"><FileText size={15} className="text-violet-400" /> Invoice facts</div>
    <div className="absolute right-3 top-20 flex items-center gap-2 rounded-xl border border-foreground/15 bg-elevated/90 p-2.5 text-xs shadow-xl sm:right-6"><ShieldCheck size={15} className="text-emerald-400" /> Rules checked</div>
    <div className="absolute bottom-8 left-5 flex items-center gap-2 rounded-xl border border-foreground/15 bg-elevated/90 p-2.5 text-xs shadow-xl sm:left-8"><MessageSquareText size={15} className="text-fuchsia-400" /> Reply understood</div>
    <div className="absolute bottom-16 right-3 flex items-center gap-2 rounded-xl border border-foreground/15 bg-elevated/90 p-2.5 text-xs shadow-xl sm:right-7"><BellRing size={15} className="text-amber-400" /> Human review</div>
  </div>;
}

export default function HomePage() {
  return <>
    <section className="hero-dark relative flex min-h-[760px] overflow-hidden bg-[#070914] text-foreground lg:min-h-[min(900px,100svh)]">
      <HeroBackground /><div className="marketing-grid pointer-events-none absolute inset-0 opacity-[.12]" />
      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-12 px-4 pb-24 pt-32 sm:px-7 lg:grid-cols-[.9fr_1.1fr] lg:gap-5 lg:px-10 lg:pt-24">
        <Reveal className="relative z-10 max-w-[610px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200"><span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_10px_#e879f9]" /> Meet your new collection workspace <ArrowUpRight size={13} /></div>
          <h1 className="text-[clamp(3.15rem,6vw,6.3rem)] font-semibold leading-[.99] tracking-[-.075em] text-white">Get paid.<br /><span className="bg-gradient-to-r from-[#ef9adf] via-[#b19afa] to-[#9bb8ff] bg-clip-text text-transparent">Stay human.</span></h1>
          <p className="mt-7 max-w-[520px] text-base leading-relaxed text-white/68 sm:text-lg">The intelligent receivables workspace that follows up on invoices, understands replies, and brings the right moments back to your team.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup"><Button size="lg">Start collecting smarter <ArrowUpRight size={17} /></Button></Link><Link href="/features"><Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10">Explore the platform <ArrowRight size={17} /></Button></Link></div>
          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/55"><span className="flex items-center gap-2"><Check size={15} className="text-emerald-300" /> Verified invoice facts</span><span className="flex items-center gap-2"><Check size={15} className="text-emerald-300" /> Human approvals</span><span className="flex items-center gap-2"><Check size={15} className="text-emerald-300" /> Clear audit trail</span></div>
        </Reveal>
        <Reveal delay={.15} className="relative z-10 mt-3 lg:mt-0"><InvoiceScene /></Reveal>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent" />
    </section>

    <section className="relative overflow-hidden border-b border-foreground/10 py-20 sm:py-28"><div className="mx-auto max-w-[1260px] px-4 sm:px-7">
      <Reveal><p className="section-kicker">Built for the real work</p><div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end"><h2 className="max-w-[750px] text-[clamp(2.5rem,5vw,4.8rem)] font-semibold leading-[1.05] tracking-[-.06em]">From overdue to under control.</h2><p className="max-w-md text-base leading-relaxed text-foreground/60">Receivly keeps the moving parts of collection connected, so finance teams spend less time chasing and more time resolving.</p></div></Reveal>
      <div className="mt-11 grid gap-3 md:grid-cols-3">{[{ icon: Clock3, title: "Time back", body: "Routine follow-up moves with your rules." }, { icon: ShieldCheck, title: "Control intact", body: "Sensitive decisions stay with your team." }, { icon: Zap, title: "Momentum visible", body: "Every action, reply, and payment has context." }].map(({ icon: Icon, title, body }, i) => <Reveal key={title} delay={i * .07}><div className="glass-panel h-full rounded-2xl p-6"><Icon size={22} className="text-violet-400" /><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-foreground/60">{body}</p></div></Reveal>)}</div>
    </div></section>

    <section className="border-b border-foreground/10 py-20 sm:py-28"><div className="mx-auto grid max-w-[1260px] gap-10 px-4 sm:px-7 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
      <div className="lg:sticky lg:top-28 lg:self-start"><Reveal><p className="section-kicker">One connected flow</p><h2 className="mt-4 max-w-[540px] text-[clamp(2.5rem,4.8vw,4.5rem)] font-semibold leading-[1.06] tracking-[-.06em]">A better way to move money forward.</h2><p className="mt-5 max-w-md text-foreground/60">Every step is visible. Every message is grounded in your data. Every exception has a next action.</p><div className="mt-8 hidden lg:block"><CollectorVisual /></div></Reveal></div>
      <div className="space-y-4 lg:pt-20">{steps.map(({ number, title, body, icon: Icon }, i) => <Reveal key={number} delay={i * .04}><article className="glass-panel flex min-h-[190px] gap-5 rounded-[1.5rem] p-6 sm:p-8 lg:min-h-[240px]"><span className="text-xs font-semibold text-violet-400">{number}</span><div><span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-400"><Icon size={22} /></span><h3 className="text-xl font-semibold sm:text-2xl">{title}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/60 sm:text-base">{body}</p></div></article></Reveal>)}</div>
    </div></section>

    <section className="relative overflow-hidden border-b border-foreground/10 py-20 sm:py-28"><div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(123,64,194,.13),transparent_65%)]" /><div className="relative mx-auto max-w-[1260px] px-4 sm:px-7">
      <Reveal><p className="section-kicker">Your whole receivables picture</p><div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end"><h2 className="max-w-[730px] text-[clamp(2.5rem,4.8vw,4.5rem)] font-semibold leading-[1.07] tracking-[-.06em]">One place for every moving part.</h2><Link href="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:underline">Explore all features <ArrowUpRight size={17} /></Link></div></Reveal>
      <div className="mt-11 grid gap-4 sm:grid-cols-2">{capabilities.map(({ icon: Icon, title, body, href }, i) => <Reveal key={title} delay={i * .05}><Link href={href} className="group glass-panel block h-full min-h-[235px] rounded-[1.5rem] p-7 transition-transform hover:-translate-y-1 sm:p-8"><div className="flex justify-between"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-blue-500/20 text-violet-400"><Icon size={24} /></span><ArrowUpRight size={18} className="text-foreground/35 transition group-hover:text-violet-400" /></div><h3 className="mt-8 text-xl font-semibold sm:text-2xl">{title}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/60 sm:text-base">{body}</p></Link></Reveal>)}</div>
    </div></section>

    <section className="border-b border-foreground/10 py-20 sm:py-28"><div className="mx-auto grid max-w-[1260px] gap-10 px-4 sm:px-7 lg:grid-cols-2 lg:items-center lg:gap-20"><Reveal><CollectorVisual /></Reveal><Reveal delay={.1}><p className="section-kicker">Intelligence with guardrails</p><h2 className="mt-4 text-[clamp(2.5rem,4.6vw,4.3rem)] font-semibold leading-[1.07] tracking-[-.06em]">AI that knows when to ask.</h2><p className="mt-5 text-base leading-relaxed text-foreground/60">The AI Collector drafts from verified invoice details. Clear business rules decide eligibility and timing. Disputes, payment claims, and uncertain replies move to human review.</p><div className="mt-7 space-y-3">{["No invented fees, threats, or payment claims", "Approval modes and quiet hours you control", "Verified payment stops collection"].map((item) => <p key={item} className="flex gap-3 text-sm text-foreground/80"><Check size={18} className="shrink-0 text-emerald-400" />{item}</p>)}</div><Link href="/features#user-control" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:underline">See how control works <ArrowRight size={16} /></Link></Reveal></div></section>

    <section className="border-b border-foreground/10 py-20 sm:py-28"><div className="mx-auto max-w-[980px] px-4 sm:px-7"><Reveal><p className="section-kicker">Good questions</p><h2 className="mt-4 text-[clamp(2.5rem,4vw,4rem)] font-semibold tracking-[-.06em]">Frequently asked.</h2></Reveal><div className="mt-10 space-y-3">{faqs.map((faq, i) => <Reveal key={faq.q} delay={i * .04}><details className="group glass-panel rounded-2xl p-5 sm:p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold marker:content-none">{faq.q}<span className="text-2xl font-light text-violet-400 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl pr-5 text-sm leading-relaxed text-foreground/60 sm:text-base">{faq.a}</p></details></Reveal>)}</div></div></section>

    <section className="relative overflow-hidden bg-[#0a0d1e] py-24 text-white sm:py-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(135,60,203,.45),transparent_45%),radial-gradient(circle_at_5%_5%,rgba(40,62,154,.3),transparent_35%)]" /><div className="marketing-grid absolute inset-0 opacity-[.09]" /><div className="relative mx-auto max-w-[900px] px-4 text-center sm:px-7"><Reveal><p className="section-kicker">The next chapter in receivables</p><h2 className="mt-4 text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[1.03] tracking-[-.07em]">Make every follow-up count.</h2><p className="mx-auto mt-6 max-w-xl text-base text-white/65 sm:text-lg">Start with your invoices, set your rules, and give your team one clear place to work.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/signup"><Button size="lg">Get started <ArrowUpRight size={17} /></Button></Link><Link href="/pricing"><Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10">See pricing <ArrowRight size={17} /></Button></Link></div></Reveal></div></section>
  </>;
}
