import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";

const toneMap: Record<string, string> = {
  draft: "bg-white/10 text-white/70",
  sent: "bg-sky-500/15 text-sky-200",
  due: "bg-amber-500/15 text-amber-200",
  overdue: "bg-rose-500/15 text-rose-200",
  paid: "bg-emerald-500/15 text-emerald-200",
  disputed: "bg-fuchsia-500/15 text-fuchsia-200",
  payment_promised: "bg-violet-500/15 text-violet-200",
  payment_claimed: "bg-orange-500/15 text-orange-200",
  partially_paid: "bg-cyan-500/15 text-cyan-200",
  paused: "bg-white/10 text-white/60",
  active: "bg-emerald-500/15 text-emerald-200",
  past_due: "bg-rose-500/15 text-rose-200",
  trialing: "bg-sky-500/15 text-sky-200",
  cancelled: "bg-white/10 text-white/50",
  high: "bg-rose-500/15 text-rose-200",
  medium: "bg-amber-500/15 text-amber-200",
  low: "bg-white/10 text-white/60",
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
        toneMap[key] || "bg-white/10 text-white/70",
        className,
      )}
    >
      {children || (status ? statusLabel(status) : null)}
    </span>
  );
}
