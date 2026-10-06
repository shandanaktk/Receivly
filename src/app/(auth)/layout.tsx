import { AuthVisual } from "@/components/auth/AuthVisual";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-experience min-h-screen bg-elevated text-foreground lg:grid lg:h-dvh lg:min-h-[620px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:overflow-hidden">
      <AuthVisual />
      <main className="relative flex min-h-[calc(100dvh-255px)] items-center justify-center bg-elevated px-5 py-14 sm:px-10 lg:min-h-0 lg:px-10 lg:py-16 xl:px-14">
        <div className="absolute inset-x-5 top-5 flex items-center justify-between sm:inset-x-10 lg:top-6 lg:right-10 lg:left-10"><Link href="/" className="text-xs font-medium text-foreground/50 transition hover:text-foreground">← Back to website</Link><ThemeToggle /></div>
        <div className="w-full max-w-[430px]">{children}</div>
      </main>
    </div>
  );
}
