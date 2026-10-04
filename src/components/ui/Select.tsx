import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ className, label, options, ...props }, ref) => (
    <label className="block space-y-1.5 text-sm">
      {label ? <span className="font-medium text-white/80">{label}</span> : null}
      <select
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-[#0c0c18] px-3.5 py-2.5 text-white outline-none transition focus:border-[#a855f7]/50 focus:ring-2 focus:ring-[#a855f7]/20",
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  ),
);
Select.displayName = "Select";
