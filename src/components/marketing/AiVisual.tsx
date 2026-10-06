"use client";

import { Bot, MessageCircle, Sparkles } from "lucide-react";

export function AiVisual() {
  return (
    <div className="ai-bubble-scene relative mx-auto min-h-[520px] w-full max-w-lg overflow-hidden rounded-[2rem] border bg-background sm:min-h-[570px]" aria-label="Floating AI conversation examples">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(17,17,132,.10),transparent_55%)]" />
      <div className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#111184]"><Sparkles size={13} /> Conversation insight</div>
      <div className="ai-bubble ai-bubble-one absolute left-[5%] top-[15%] w-[67%] max-w-[330px] rounded-[1.35rem] rounded-bl-md border border-[#111184]/20 bg-white p-4 text-[#111184] shadow-[0_20px_50px_rgba(17,17,132,.16)]"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#111184]/55"><MessageCircle size={13} /> Customer question</div><p className="text-sm font-semibold leading-snug">“Can I pay this Friday?”</p><p className="mt-2 text-[11px] text-[#111184]/55">Promise detected · confidence 96%</p></div>
      <div className="ai-bubble ai-bubble-two absolute right-[4%] top-[39%] w-[72%] max-w-[360px] rounded-[1.35rem] rounded-br-md border border-white/25 bg-[#111184] p-4 text-white shadow-[0_24px_60px_rgba(17,17,132,.32)]"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/65"><Bot size={13} /> AI reply</div><p className="text-sm font-semibold leading-snug">“Absolutely — I’ll note Friday as your promised payment date.”</p><p className="mt-2 text-[11px] text-white/60">Grounded in invoice facts · ready for approval</p></div>
      <div className="ai-bubble ai-bubble-three absolute left-[9%] top-[66%] w-[68%] max-w-[340px] rounded-[1.35rem] rounded-bl-md border border-[#111184]/15 bg-[#eef0ff] p-4 text-[#111184] shadow-[0_18px_46px_rgba(17,17,132,.14)]"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#111184]/55"><Sparkles size={13} /> Human control</div><p className="text-sm font-semibold leading-snug">“Pause follow-up until the promise is verified.”</p><p className="mt-2 text-[11px] text-[#111184]/55">One click · no invented pressure</p></div>
      <div className="ai-approval-badge absolute bottom-4 right-5 flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold shadow-lg backdrop-blur"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Human approval required</div>
    </div>
  );
}
