import Link from "next/link";

export function BrandMark({ href = "/", compact = false, inverse = false }: { href?: string; compact?: boolean; inverse?: boolean }) {
  return (
    <Link href={href} className={`inline-flex items-start gap-1.5 ${inverse ? "text-white" : "text-foreground"}`} aria-label="Receivly AI home">
      <span className="font-sans text-[1.52rem] font-semibold leading-none tracking-[-.085em]">receivly<span className="text-[#f13b99]">.</span></span>
      {!compact && <span className={`pt-0.5 text-[10px] font-semibold uppercase tracking-[.12em] ${inverse ? "text-white/55" : "text-foreground/55"}`}>ai</span>}
    </Link>
  );
}
