"use client";

import { useEffect, useRef } from "react";

function useDeferredVideo(source: string, mobileSource?: string) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType ?? "")) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!node.getAttribute("src")) node.src = mobileSource && window.matchMedia("(max-width: 767px)").matches ? mobileSource : source;
        void node.play().catch(() => {});
      } else {
        node.pause();
      }
    }, { rootMargin: "80px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [source, mobileSource]);

  return videoRef;
}

export function HeroBackground() {
  const videoRef = useDeferredVideo("/hero.mp4", "/hero-mobile.mp4");

  return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0 bg-[#080612]" />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/hero-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" decoding="async" />
    <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload="none" poster="/hero-poster.jpg" />
    <div className="absolute inset-0 bg-[#111184]/25 mix-blend-multiply" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,17,.48)_0%,rgba(7,5,17,.47)_40%,rgba(7,5,17,.72)_100%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(8,4,24,.35)_72%)]" />
  </div>;
}

export function FlowBackground() {
  const videoRef = useDeferredVideo("/flow.mp4");

  return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/flow-poster.jpg" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-[.20]" />
    <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover opacity-[.27]" muted loop playsInline preload="none" poster="/flow-poster.jpg" />
    <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/95" />
  </div>;
}
