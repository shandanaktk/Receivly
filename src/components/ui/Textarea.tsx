import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, label, error, ...props }, ref) => (
    <label className="block space-y-1.5 text-sm">
      {label ? <span className="font-medium text-foreground/80">{label}</span> : null}
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-xl border border-foreground/10 bg-foreground/[0.04] px-3.5 py-2.5 text-foreground placeholder:text-foreground/35 outline-none transition focus:border-[#a855f7]/50 focus:ring-2 focus:ring-[#a855f7]/20",
          error && "border-rose-400/60",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  ),
);
Textarea.displayName = "Textarea";
