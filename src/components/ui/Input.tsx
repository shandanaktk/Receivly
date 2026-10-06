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
      <label className="block space-y-1.5 text-xs">
        {label ? (
          <span className="font-medium text-foreground/80">{label}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border border-foreground/10 bg-foreground/[0.04] px-3.5 text-[13px] text-foreground placeholder:text-foreground/35 outline-none transition focus:border-[#ec2f91]/50 focus:ring-2 focus:ring-[#ec2f91]/20",
            error && "border-rose-400/60 focus:border-rose-400 focus:ring-rose-400/20",
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs text-rose-300">{error}</span> : null}
        {!error && hint ? <span className="text-xs text-foreground/45">{hint}</span> : null}
      </label>
    );
  },
);
Input.displayName = "Input";
