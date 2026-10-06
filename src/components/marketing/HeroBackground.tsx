"use client";

import { useEffect, useRef, useState } from "react";

type NetworkInformation = EventTarget & {
  saveData?: boolean;
  effectiveType?: string;
};

type DeferredVideoOptions = {
  source: string;
  mobileSource?: string;
  poster?: string;
  mobilePoster?: string;
  eager?: boolean;
};

function useDeferredVideo({ source, mobileSource, poster, mobilePoster, eager = false }: DeferredVideoOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType ?? "")) return;

    const mobileViewport = window.matchMedia("(max-width: 767px)");
    let isVisible = eager;

    const requestPlayback = () => {
      if (!isVisible) return;
      void node.play().catch(() => setIsPlaying(false));
    };

    const syncSource = () => {
      // Prefer the smaller encode on constrained connections, even on a wide viewport.
      const useMobileAsset = Boolean(mobileSource && (mobileViewport.matches || connection?.effectiveType === "3g"));
      const nextSource = useMobileAsset && mobileSource ? mobileSource : source;
      const nextPoster = useMobileAsset && mobilePoster ? mobilePoster : poster;

      if (nextPoster && node.getAttribute("poster") !== nextPoster) node.poster = nextPoster;
      if (node.getAttribute("src") === nextSource) {
        requestPlayback();
        return;
      }

      setIsPlaying(false);
      node.pause();
      node.src = nextSource;
      node.load();
      requestPlayback();
    };

    const showVideo = () => setIsPlaying(true);
    const showPoster = () => setIsPlaying(false);
    const resumeWhenReady = () => requestPlayback();

    node.addEventListener("playing", showVideo);
    node.addEventListener("waiting", showPoster);
    node.addEventListener("stalled", showPoster);
    node.addEventListener("error", showPoster);
    node.addEventListener("canplay", resumeWhenReady);

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        syncSource();
      } else {
        node.pause();
        setIsPlaying(false);
      }
    }, { rootMargin: "200px 0px" });

    if (eager) syncSource();
    observer.observe(node);
    mobileViewport.addEventListener("change", syncSource);
    connection?.addEventListener("change", syncSource);

    return () => {
      observer.disconnect();
      mobileViewport.removeEventListener("change", syncSource);
      connection?.removeEventListener("change", syncSource);
      node.removeEventListener("playing", showVideo);
      node.removeEventListener("waiting", showPoster);
      node.removeEventListener("stalled", showPoster);
      node.removeEventListener("error", showPoster);
      node.removeEventListener("canplay", resumeWhenReady);
    };
  }, [eager, mobilePoster, mobileSource, poster, source]);

  return { videoRef, isPlaying };
}

export function HeroBackground() {
  const { videoRef, isPlaying } = useDeferredVideo({
    source: "/hero.mp4",
    mobileSource: "/hero-mobile.mp4",
    poster: "/hero-poster.jpg",
    mobilePoster: "/hero-poster-mobile.jpg",
    eager: true,
  });

  return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0 bg-[#080612]" />
    <picture>
      <source media="(max-width: 767px)" srcSet="/hero-poster-mobile.jpg" />
      <img src="/hero-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" decoding="async" />
    </picture>
    <video
      ref={videoRef}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isPlaying ? "opacity-100" : "opacity-0"}`}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/hero-poster.jpg"
    />
    <div className="absolute inset-0 bg-[#111184]/25 mix-blend-multiply" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,17,.48)_0%,rgba(7,5,17,.47)_40%,rgba(7,5,17,.72)_100%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(8,4,24,.35)_72%)]" />
  </div>;
}

export function FlowBackground() {
  const { videoRef } = useDeferredVideo({ source: "/flow.mp4", poster: "/flow-poster.jpg" });

  return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/flow-poster.jpg" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-[.20]" />
    <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover opacity-[.27]" muted loop playsInline preload="none" poster="/flow-poster.jpg" />
    <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/95" />
  </div>;
}
