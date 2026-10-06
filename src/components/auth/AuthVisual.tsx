import { BrandMark } from "@/components/shared/BrandMark";
import { AUTH_PREVIEW } from "@/lib/mock/authPreview";
import { ArrowUpRight, Check, CircleCheck, Clock3, Sparkles } from "lucide-react";

const bars = [31, 39, 35, 49, 43, 59, 55, 70, 65, 76, 72, 88];

export function AuthVisual() {
  return <section className="hero-dark relative isolate flex min-h-[255px] flex-col overflow-hidden bg-[#090816] p-6 text-white sm:p-9 lg:min-h-0 lg:p-8 xl:p-10">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_12%,rgba(17,17,132,.32),transparent_34%),radial-gradient(circle_at_92%_70%,rgba(88,88,210,.3),transparent_42%),linear-gradient(145deg,#0c0c54,#080a1b_65%,#0a0a17)]" />
    <div className="marketing-grid pointer-events-none absolute inset-0 -z-10 opacity-[.08]" />
    <div className="pointer-events-none absolute -right-36 top-[20%] -z-10 h-[490px] w-[490px] rounded-full border border-white/10 shadow-[0_0_0_66px_rgba(255,255,255,.025),0_0_0_140px_rgba(255,255,255,.02)]" />

    <BrandMark inverse />

    <div className="relative my-auto max-w-[570px] pt-8 lg:py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[.19em] text-[#a9a9ff]">The receivables workspace</p>
      <h2 className="mt-3 max-w-lg text-[clamp(3.1rem,5.2vw,5rem)] leading-[.9] text-white">Get paid.<br /><span className="script-accent text-[1.14em]">Stay human.</span></h2>
      <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/70 xl:text-sm">Keep invoices, conversations, and collections in one calm place. Let AI handle the routine. Keep the decisions that matter with your team.</p>

      <div className="relative mt-6 hidden max-w-[510px] lg:block" aria-hidden="true">
        <div className="rounded-[1.4rem] border border-white/15 bg-[#121326]/90 p-4 shadow-[0_30px_100px_rgba(2,3,14,.5)] backdrop-blur-xl">
          <div className="flex items-start justify-between border-b border-white/10 pb-3"><div><p className="text-[10px] font-medium uppercase tracking-[.16em] text-white/45">Your collection picture</p><p className="mt-1 text-2xl font-semibold tracking-tight">{AUTH_PREVIEW.outstanding}<span className="ml-2 text-[11px] font-normal text-white/50">outstanding</span></p></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-200">On track</span></div>
          <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl border border-white/10 bg-white/[.04] p-2.5"><div className="flex items-center gap-2 text-white/50"><Clock3 size={13} /><span className="text-[10px]">Awaiting action</span></div><p className="mt-1 text-base font-semibold">{AUTH_PREVIEW.actionCount} <span className="text-[10px] font-normal text-white/45">invoices</span></p></div><div className="rounded-xl border border-white/10 bg-white/[.04] p-2.5"><div className="flex items-center gap-2 text-white/50"><CircleCheck size={13} /><span className="text-[10px]">Collected this month</span></div><p className="mt-1 text-base font-semibold">{AUTH_PREVIEW.collected}</p></div></div>
          <div className="mt-3 flex h-14 items-end gap-2 rounded-xl border border-white/10 bg-white/[.025] px-4 pb-2 pt-3">{bars.map((height, index) => <span key={index} className="flex-1 rounded-t bg-[linear-gradient(to_top,#111184,#7a7ae5)]" style={{ height: `${height}%`, opacity: .48 + index * .045 }} />)}</div>
        </div>
        <div className="absolute -right-2 -bottom-5 flex items-center gap-3 rounded-xl border border-white/15 bg-[#111184] px-3 py-2 shadow-2xl xl:-right-6"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-white"><Sparkles size={16} /></span><div><p className="text-[11px] font-semibold">Promise captured</p><p className="text-[10px] text-white/50">Follow-up scheduled for {AUTH_PREVIEW.promiseDate}</p></div><Check size={14} className="ml-1 text-emerald-300" /></div>
      </div>

      <div className="mt-8 hidden items-center gap-4 text-[11px] text-white/55 lg:flex"><span className="inline-flex items-center gap-1.5"><Check size={13} className="text-[#a9a9ff]" /> Verified invoice facts</span><span className="inline-flex items-center gap-1.5"><Check size={13} className="text-[#a9a9ff]" /> Human approvals</span><span className="inline-flex items-center gap-1.5">Explore your workspace <ArrowUpRight size={13} /></span></div>
    </div>
  </section>;
}
