"use client";

import { DemoBanner } from "@/components/shared/DemoBanner";
import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bell, Bot, ChartNoAxesCombined, ChevronDown, ClipboardCheck, CreditCard, FileText, LayoutDashboard, LogOut, Menu, MessageSquareText, Settings2, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

const groups = [
  { label: "Workspace", links: [
    { href: "/app/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/app/customers", label: "Customers", icon: Users },
    { href: "/app/invoices", label: "Invoices", icon: FileText },
    { href: "/app/conversations", label: "Conversations", icon: MessageSquareText },
    { href: "/app/approvals", label: "Approval queue", icon: ClipboardCheck },
  ] },
  { label: "Intelligence", links: [
    { href: "/app/ai-collector", label: "AI Collector", icon: Bot },
    { href: "/app/reports", label: "Reports", icon: ChartNoAxesCombined },
  ] },
  { label: "Manage", links: [
    { href: "/app/billing", label: "Billing & plan", icon: CreditCard },
    { href: "/app/notifications", label: "Notifications", icon: Bell },
    { href: "/app/settings", label: "Settings", icon: Settings2 },
  ] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Workspace");

  useEffect(() => { void api.getWorkspace().then((ws) => setWorkspaceName(ws.companyName)); }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user?.role === "platform_admin") router.replace("/admin");
    if (!loading && user && !user.onboardingCompleted && !pathname.startsWith("/app/onboarding")) router.replace("/app/onboarding");
  }, [loading, user, router, pathname]);

  if (loading || !user) return <div className="grid min-h-screen place-items-center bg-background text-foreground/70">Loading workspace…</div>;

  const current = groups.flatMap((g) => g.links).find((link) => pathname.startsWith(link.href));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DemoBanner />
      <div className="flex min-h-screen">
        <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-foreground/10 bg-elevated shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none", open ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-foreground/10 px-5">
            <BrandMark href="/app/dashboard" />
            <button className="rounded-lg p-2 text-foreground/70 lg:hidden" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button>
          </div>
          <div className="mx-4 mt-5 rounded-2xl border border-foreground/10 bg-foreground/[0.035] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/20 text-sm font-bold text-violet-400">{workspaceName.slice(0, 2).toUpperCase()}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{workspaceName}</p><p className="text-xs text-foreground/50">Business workspace</p></div>
              <ChevronDown size={15} className="text-foreground/40" aria-hidden />
            </div>
          </div>
          <nav aria-label="Workspace navigation" className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-6">
            {groups.map((group) => <div key={group.label}>
              <p className="px-3 text-[.75rem] font-semibold uppercase tracking-[.16em] text-foreground/40">{group.label}</p>
              <div className="mt-2 space-y-1">{group.links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={cn("flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors", active ? "bg-violet-500/15 text-violet-300" : "text-foreground/65 hover:bg-foreground/[0.06] hover:text-foreground")}><Icon size={18} strokeWidth={1.8} aria-hidden />{label}</Link>;
              })}</div>
            </div>)}
          </nav>
          <div className="border-t border-foreground/10 p-4">
            <Link href="/app/profile" className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-foreground/[0.05]">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-blue-600 text-sm font-bold text-white">{user.name.slice(0, 1).toUpperCase()}</div>
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-foreground/50">{user.email}</p></div>
            </Link>
          </div>
        </aside>
        {open && <button className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-sm lg:hidden" aria-label="Close navigation overlay" onClick={() => setOpen(false)} />}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-3 border-b border-foreground/10 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button className="rounded-xl border border-foreground/10 p-2.5 lg:hidden" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={19} /></button>
              <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-[.16em] text-foreground/45">Workspace / {current?.label ?? "Onboarding"}</p><p className="truncate text-sm font-semibold sm:text-base">{current?.label ?? "Getting started"}</p></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link href="/app/notifications" className="relative grid h-10 w-10 place-items-center rounded-full border border-foreground/15 bg-foreground/[0.05] text-foreground/70 hover:text-foreground" aria-label="Notifications"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-fuchsia-400" /></Link>
              <button onClick={async () => { await logout(); router.push("/login"); }} className="hidden h-10 items-center gap-2 rounded-full border border-foreground/15 px-3 text-sm text-foreground/65 hover:text-foreground sm:inline-flex"><LogOut size={16} />Log out</button>
            </div>
          </header>
          <main id="main-content" className="mx-auto w-full max-w-[1560px] flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</main>
          <footer className="border-t border-foreground/10 px-6 py-4 text-xs text-foreground/45">Receivly AI · Milestone 1 demo workspace</footer>
        </div>
      </div>
    </div>
  );
}
