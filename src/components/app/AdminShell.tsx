"use client";

import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Activity, Building2, ChevronsLeft, ChevronsRight, ClipboardList, LayoutDashboard, LogOut, SlidersHorizontal } from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(false);

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
    <div className="workspace-shell min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "workspace-sidebar fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r shadow-xl transition-all md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none",
            collapsed && "md:w-[76px]",
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-foreground/10 px-5"><div className={cn(collapsed && "md:hidden")}><BrandMark href="/admin" inverse /></div><button type="button" className="hidden rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white md:block" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}</button></div>
          <p className={cn("px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[.16em] text-foreground/45", collapsed && "md:hidden")}>Platform owner</p>
          <nav className="flex-1 space-y-0.5 px-3" aria-label="Platform navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-medium transition",
                  collapsed && "md:justify-center md:px-0",
                  pathname === item.href
                    ? "workspace-nav-active"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <item.icon size={17} strokeWidth={1.8} aria-hidden /><span className={cn(collapsed && "md:hidden")}>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-foreground/10 p-3"><button type="button" title="Log out" aria-label="Log out" onClick={async () => { await logout(); router.push("/login"); }} className="workspace-logout flex w-full items-center justify-center gap-2 rounded-lg p-2 text-sm text-white/75 transition md:justify-start"><LogOut size={17} /><span className={cn(collapsed && "md:hidden")}>Log out</span></button></div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-foreground/10 bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
            <button className="rounded-lg border border-foreground/15 px-3 py-1.5 text-sm md:hidden" aria-label="Open admin menu" onClick={() => setOpen(true)}>
              Menu
            </button>
            <span className="hidden text-sm font-semibold text-foreground/60 sm:block">Platform operations</span>
            <div className="flex items-center gap-2"><ThemeToggle /></div>
          </header>
          <main className="w-full px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</main>
        </div>
      </div>
      {open && <button className="fixed inset-0 z-30 bg-black/60 md:hidden" aria-label="Close admin navigation" onClick={() => setOpen(false)} />}
    </div>
  );
}
