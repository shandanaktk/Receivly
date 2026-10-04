"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mobile-first media strategy:
 * - Always show a lightweight poster + CSS atmosphere (instant paint)
 * - Load video only on desktop, when in view, and when the user allows motion
 * - Respect prefers-reduced-motion and Save-Data
 */
export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 768px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const saveData = Boolean(connection?.saveData);
    const slowNet = ["slow-2g", "2g"].includes(connection?.effectiveType || "");

    const eligible =
      mqDesktop.matches && !mqMotion.matches && !saveData && !slowNet;

    if (!eligible) {
      setShouldPlayVideo(false);
      return;
    }

    const node = videoRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldPlayVideo(true);
          void node.play().catch(() => setShouldPlayVideo(false));
        } else {
          node.pause();
        }
      },
      { rootMargin: "80px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Instant CSS atmosphere — works on all devices */}
      <div className="absolute inset-0 bg-[#05050f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(144,33,119,0.45),transparent_45%),radial-gradient(ellipse_at_80%_20%,rgba(23,43,118,0.55),transparent_50%),radial-gradient(ellipse_at_50%_90%,rgba(91,45,142,0.35),transparent_55%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#902177]/25 blur-3xl" />
      <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-[#172B76]/40 blur-3xl" />

      {/* Poster always available for LCP */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-poster.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-screen"
        fetchPriority="high"
        decoding="async"
      />

      {/* Desktop-only deferred video */}
      <video
        ref={videoRef}
        className="absolute inset-0 hidden h-full w-full object-cover opacity-50 mix-blend-screen md:block"
        muted
        loop
        playsInline
        preload="none"
        poster="/hero-poster.jpg"
        src={shouldPlayVideo ? "/hero.mp4" : undefined}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#05050f]/20 via-[#05050f]/55 to-[#05050f]" />
    </div>
  );
}
