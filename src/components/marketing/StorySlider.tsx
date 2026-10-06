"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

const stories = [
  { image: "/images/story-2.webp", number: "01", title: "Start with the full picture", body: "See customers, invoices, and the details behind every balance." },
  { image: "/images/story-3.webp", number: "02", title: "Make each follow-up count", body: "Build a thoughtful rhythm around real amounts and due dates." },
  { image: "/images/story-4.webp", number: "03", title: "Turn data into decisions", body: "Understand what is moving, what is overdue, and what needs you." },
  { image: "/images/story-1.webp", number: "04", title: "Keep the work connected", body: "From an invoice sent to a promise made, nothing gets lost." },
  { image: "/images/story-5.webp", number: "05", title: "Close the loop clearly", body: "Verified payments and a complete timeline help teams move forward." },
];

export function StorySlider() {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => {
    const node = track.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>(".story-card");
    node.scrollBy({ left: direction * ((card?.offsetWidth ?? 360) + 16), behavior: "smooth" });
  };

  return <div className="relative mt-10">
    <div ref={track} className="story-scroll flex gap-4 overflow-x-auto pb-3" aria-label="Receivly workflow stories" tabIndex={0} onKeyDown={(event) => { if (event.key === "ArrowRight") move(1); if (event.key === "ArrowLeft") move(-1); }}>
      {stories.map((story) => <article key={story.number} className="story-card group relative h-[390px] w-[82vw] max-w-[420px] shrink-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#1b102a] sm:w-[44vw] lg:w-[31vw]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={story.image} alt="" loading="lazy" width={1200} height={800} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,8,49,.48)_0%,rgba(31,8,55,.45)_38%,rgba(20,5,40,.96)_100%)]" />
        <div className="absolute inset-4 rounded-[1rem] border border-white/30" />
        <div className="absolute inset-x-8 top-8 flex items-center justify-between text-white/80"><span className="text-[11px] font-bold tracking-[.2em]">RECEIVLY / {story.number}</span><span className="h-2 w-2 rounded-full bg-[#f3a0cd]" /></div>
        <div className="absolute inset-x-8 bottom-9 text-white"><span className="script-accent text-4xl">{story.number}</span><h3 className="mt-1 max-w-[310px] font-['Cormorant_Garamond'] text-[2.4rem] leading-[.98]">{story.title}</h3><p className="mt-3 max-w-[310px] text-[13px] leading-relaxed text-white/78">{story.body}</p></div>
      </article>)}
    </div>
    <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => move(-1)} aria-label="Previous story" className="grid h-11 w-11 place-items-center rounded-full border border-foreground/20 transition hover:bg-foreground/10"><ArrowLeft size={18} /></button><button type="button" onClick={() => move(1)} aria-label="Next story" className="grid h-11 w-11 place-items-center rounded-full border border-foreground/20 transition hover:bg-foreground/10"><ArrowRight size={18} /></button></div>
  </div>;
}
