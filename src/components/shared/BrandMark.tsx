import Link from "next/link";

export function BrandMark({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-semibold tracking-[-0.035em] text-foreground" aria-label="Receivly AI home">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[linear-gradient(145deg,#e15cb8,#6637b6_55%,#294cb6)] text-lg font-bold text-white shadow-[0_8px_26px_rgba(118,56,172,.3)]">
        R<span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-200" />
      </span>
      {!compact && <span className="text-[1.23rem]">receivly<span className="ml-1.5 rounded-md border border-fuchsia-400/30 bg-fuchsia-400/10 px-1.5 py-0.5 align-middle text-[.65rem] font-bold uppercase tracking-[.1em] text-fuchsia-300">AI</span></span>}
    </Link>
  );
}
