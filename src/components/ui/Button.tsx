import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#902177,#5b2d8e_45%,#172B76)] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:brightness-110",
  secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
  ghost: "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
  outline: "border border-white/20 text-white hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050f] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
