"use client";

import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Activity, Building2, ClipboardList, LayoutDashboard, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/monitoring", label: "Monitoring", icon: Activity },
  { href: "/admin/plans", label: "Plans & settings", icon: SlidersHorizontal },
  { href: "/admin/audit", label: "Audit log", icon: ClipboardList },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "platform_admin")) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground/70">
        Loading admin…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[244px] border-r border-foreground/10 bg-elevated shadow-xl transition md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none",
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex h-16 items-center border-b border-foreground/10 px-5"><BrandMark href="/admin" /></div>
          <p className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[.16em] text-foreground/45">Platform owner</p>
          <nav className="space-y-0.5 px-3" aria-label="Platform navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-8 items-center gap-2.5 rounded-lg px-3 text-xs font-medium transition",
                  pathname === item.href
                    ? "bg-[#ec2f91]/10 text-[#ec2f91]"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <item.icon size={16} strokeWidth={1.8} aria-hidden />{item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-foreground/10 bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
            <button className="rounded-lg border border-foreground/15 px-3 py-1.5 text-sm md:hidden" aria-label="Open admin menu" onClick={() => setOpen(true)}>
              Menu
            </button>
            <span className="hidden text-sm font-semibold text-foreground/60 sm:block">Platform operations</span>
            <div className="flex items-center gap-2"><ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
            >
              Log out
            </Button>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1560px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</main>
        </div>
      </div>
      {open && <button className="fixed inset-0 z-30 bg-black/60 md:hidden" aria-label="Close admin navigation" onClick={() => setOpen(false)} />}
    </div>
  );
}
