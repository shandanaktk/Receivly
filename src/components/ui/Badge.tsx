import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";

const toneMap: Record<string, string> = {
  draft: "bg-foreground/10 text-foreground/70",
  sent: "bg-sky-500/15 text-sky-200",
  due: "bg-amber-500/15 text-amber-200",
  overdue: "bg-rose-500/15 text-rose-200",
  paid: "bg-emerald-500/15 text-emerald-200",
  disputed: "bg-[#111184]/15 text-[#111184]",
  payment_promised: "bg-[#111184]/15 text-[#111184]",
  payment_claimed: "bg-orange-500/15 text-orange-200",
  partially_paid: "bg-cyan-500/15 text-cyan-200",
  paused: "bg-foreground/10 text-foreground/60",
  active: "bg-emerald-500/15 text-emerald-200",
  past_due: "bg-rose-500/15 text-rose-200",
  trialing: "bg-sky-500/15 text-sky-200",
  cancelled: "bg-foreground/10 text-foreground/50",
  high: "bg-rose-500/15 text-rose-200",
  medium: "bg-amber-500/15 text-amber-200",
  low: "bg-foreground/10 text-foreground/60",
  healthy: "bg-emerald-500/15 text-emerald-200",
  degraded: "bg-amber-500/15 text-amber-200",
  critical: "bg-rose-500/15 text-rose-200",
  failed: "bg-rose-500/15 text-rose-200",
  pending: "bg-amber-500/15 text-amber-200",
};

export function Badge({
  status,
  className,
  children,
}: {
  status?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const key = status || "";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        toneMap[key] || "bg-foreground/10 text-foreground/70",
        className,
      )}
    >
      {children || (status ? statusLabel(status) : null)}
    </span>
  );
}
