import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label className="block space-y-1.5 text-sm">
        {label ? (
          <span className="font-medium text-white/80">{label}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-white placeholder:text-white/35 outline-none transition focus:border-[#a855f7]/50 focus:ring-2 focus:ring-[#a855f7]/20",
            error && "border-rose-400/60 focus:border-rose-400 focus:ring-rose-400/20",
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs text-rose-300">{error}</span> : null}
        {!error && hint ? <span className="text-xs text-white/45">{hint}</span> : null}
      </label>
    );
  },
);
Input.displayName = "Input";
