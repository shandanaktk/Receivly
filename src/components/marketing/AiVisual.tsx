"use client";

import { Bot, Check, MessageCircle } from "lucide-react";
import { useState } from "react";

export function AiVisual() {
  const [image, setImage] = useState("/ai.jpg");

  return (
    <div className="relative mx-auto min-h-[320px] w-full max-w-lg overflow-hidden rounded-[2rem] border border-foreground/10 bg-[#111184] shadow-[0_25px_80px_rgba(17,17,132,.20)] sm:min-h-[400px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="AI-assisted receivables workflow"
        className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen"
        onError={() => setImage("/flow-poster.jpg")}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,17,132,.94),rgba(17,17,132,.62)_48%,rgba(5,5,51,.92))]" />
      <div className="marketing-grid absolute inset-0 opacity-20" />
      <div className="relative flex min-h-[320px] flex-col justify-between p-6 sm:min-h-[400px] sm:p-8">
        <div className="flex items-center justify-between text-white/70"><div><p className="text-[10px] font-bold uppercase tracking-[.2em]">AI collector / guardrails</p><p className="mt-1 text-xs text-white/50">Conversation insight</p></div><span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10"><Bot size={15} /></span></div>
        <div className="rounded-2xl border border-white/15 bg-black/10 p-3 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between text-[10px] text-white/50"><span>Invoice #NW-1045</span><span className="rounded-full bg-emerald-300/15 px-2 py-1 text-emerald-100">Verified facts</span></div>
          <div className="space-y-3">
            <div className="ml-auto max-w-[230px] rounded-2xl rounded-br-md border border-white/15 bg-white/10 p-3 text-xs text-white/85">I can send a friendly reminder using the verified invoice details.</div>
            <div className="flex max-w-[270px] items-start gap-3 rounded-2xl rounded-bl-md border border-white/20 bg-white p-3 text-xs text-[#111184] shadow-2xl"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#111184]/10"><MessageCircle size={14} /></span><span>Payment claim detected. Should I pause follow-up for review?</span></div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 text-[10px] text-white/75"><span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1"><Check size={12} /> Human approval required</span><span className="rounded-full border border-white/15 px-2.5 py-1 text-white/55">Pause automation</span></div>
      </div>
    </div>
  );
}
