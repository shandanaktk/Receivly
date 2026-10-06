"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const stories = [
  { image: "/images/story-2.webp", number: "01", title: "Start with the full picture", body: "See customers, invoices, and the details behind every balance." },
  { image: "/images/story-3.webp", number: "02", title: "Make each follow-up count", body: "Build a thoughtful rhythm around real amounts and due dates." },
  { image: "/images/story-4.webp", number: "03", title: "Turn data into decisions", body: "Understand what is moving, what is overdue, and what needs you." },
  { image: "/images/story-1.webp", number: "04", title: "Keep the work connected", body: "From an invoice sent to a promise made, nothing gets lost." },
  { image: "/images/story-5.webp", number: "05", title: "Close the loop clearly", body: "Verified payments and a complete timeline help teams move forward." },
];
const loopedStories = [...stories, ...stories, ...stories];

export function StorySlider() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(stories.length);
  const [paused, setPaused] = useState(false);

  const centerCard = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const node = track.current;
    const card = node?.querySelectorAll<HTMLElement>(".story-card")[index];
    if (!node || !card) return;
    setActive(index);
    node.scrollTo({ left: card.offsetLeft - (node.clientWidth - card.offsetWidth) / 2, behavior });
  }, []);

  const move = useCallback((direction: number) => {
    const target = active + direction;
    const crossingStart = target < stories.length;
    const crossingEnd = target >= stories.length * 2;
    const visualTarget = crossingStart ? target + stories.length : target;
    centerCard(visualTarget);
    if (crossingStart || crossingEnd) {
      window.setTimeout(() => centerCard(direction < 0 ? stories.length * 2 - 1 : stories.length, "auto"), 760);
    }
  }, [active, centerCard]);

  useEffect(() => {
    window.requestAnimationFrame(() => centerCard(stories.length, "auto"));
  }, [centerCard]);

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const timer = window.setInterval(() => {
      if (!paused) move(1);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [active, move, paused]);

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const updateActive = () => {
      const midpoint = node.scrollLeft + node.clientWidth / 2;
      let closest = 0;
      let distance = Number.POSITIVE_INFINITY;
      node.querySelectorAll<HTMLElement>(".story-card").forEach((card, index) => {
        const cardMidpoint = card.offsetLeft + card.offsetWidth / 2;
        if (Math.abs(cardMidpoint - midpoint) < distance) {
          distance = Math.abs(cardMidpoint - midpoint);
          closest = index;
        }
      });
      setActive(closest);
    };
    node.addEventListener("scroll", updateActive, { passive: true });
    return () => node.removeEventListener("scroll", updateActive);
  }, []);

  return <div className="relative mt-10">
    <div ref={track} className="story-scroll flex items-center gap-4 overflow-x-auto px-[9vw] pb-7 pt-4 sm:px-[22vw] lg:px-[27vw]" aria-label="Receivly workflow stories" tabIndex={0} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onKeyDown={(event) => { if (event.key === "ArrowRight") move(1); if (event.key === "ArrowLeft") move(-1); }}>
      {loopedStories.map((story, index) => <article key={`${story.number}-${index}`} className={`story-card group relative h-[390px] w-[82vw] max-w-[420px] shrink-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111184] transition-all duration-700 ease-out sm:w-[44vw] lg:w-[31vw] ${active === index ? "scale-[1.04] opacity-100 shadow-[0_24px_80px_rgba(17,17,132,.35)]" : "scale-[.92] opacity-65"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={story.image} alt="" loading="lazy" width={1200} height={800} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,132,.30)_0%,rgba(17,17,132,.42)_38%,rgba(7,7,55,.96)_100%)]" />
        <div className="absolute inset-4 rounded-[1rem] border border-white/30" />
        <div className="absolute inset-x-8 top-8 flex items-center justify-between text-white/80"><span className="text-[11px] font-bold tracking-[.2em]">RECEIVLY / {story.number}</span><span className="h-2 w-2 rounded-full bg-[#f3a0cd]" /></div>
        <div className="absolute inset-x-8 bottom-9 text-white"><span className="script-accent text-4xl">{story.number}</span><h3 className="mt-1 max-w-[310px] font-['Cormorant_Garamond'] text-[2.4rem] leading-[.98]">{story.title}</h3><p className="mt-3 max-w-[310px] text-[13px] leading-relaxed text-white/78">{story.body}</p></div>
      </article>)}
    </div>
    <div className="mt-1 flex items-center justify-between gap-3"><p className="text-xs text-foreground/45">Auto-moving story {String((active % stories.length) + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}</p><div className="flex gap-2"><button type="button" onClick={() => move(-1)} aria-label="Previous story" className="grid h-11 w-11 place-items-center rounded-full border border-foreground/20 transition hover:border-[#111184]/50 hover:bg-[#111184]/10"><ArrowLeft size={18} /></button><button type="button" onClick={() => move(1)} aria-label="Next story" className="grid h-11 w-11 place-items-center rounded-full border border-foreground/20 transition hover:border-[#111184]/50 hover:bg-[#111184]/10"><ArrowRight size={18} /></button></div></div>
  </div>;
}
