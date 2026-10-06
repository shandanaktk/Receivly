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
    "bg-[linear-gradient(115deg,#ff3d9a,#ec2f91_54%,#c92483)] text-white shadow-[0_8px_26px_rgba(225,47,136,0.22)] hover:brightness-110",
  secondary: "bg-foreground/10 text-foreground hover:bg-foreground/15 border border-foreground/10",
  ghost: "bg-transparent text-foreground/80 hover:bg-foreground/5 hover:text-foreground",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
  outline: "border border-foreground/20 text-foreground hover:bg-foreground/5",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-[13px]",
  lg: "h-11 px-6 text-sm",
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
