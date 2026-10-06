"use client";

import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bell, Bot, ChartNoAxesCombined, ChevronsLeft, ChevronsRight, ClipboardCheck, CreditCard, FileText, LayoutDashboard, LogOut, Menu, MessageSquareText, Settings2, Users, X } from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Workspace");

  useEffect(() => { void api.getWorkspace().then((ws) => setWorkspaceName(ws.companyName)); }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user?.role === "platform_admin") router.replace("/admin");
    if (!loading && user && !user.onboardingCompleted && !pathname.startsWith("/app/onboarding")) router.replace("/app/onboarding");
  }, [loading, user, router, pathname]);

  if (loading || !user) return <div className="grid min-h-screen place-items-center bg-background text-foreground/70">Loading workspace…</div>;
  if (pathname.startsWith("/app/onboarding")) return <div className="workspace-shell min-h-screen bg-background text-foreground">{children}</div>;

  return (
    <div className="workspace-shell min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className={cn("workspace-sidebar fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r shadow-2xl transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none", collapsed && "lg:w-[76px]", open ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-foreground/10 px-5">
            <div className={cn("min-w-0", collapsed && "lg:hidden")}><BrandMark href="/app/dashboard" inverse /></div>
            <button type="button" className="hidden rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:block" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}</button>
            <button className="rounded-lg p-2 text-foreground/70 lg:hidden" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button>
          </div>
          <nav aria-label="Workspace navigation" className="sidebar-nav min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-5">
            {groups.map((group) => <div key={group.label}>
              <p className={cn("px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-foreground/40", collapsed && "lg:hidden")}>{group.label}</p>
              <div className="mt-2 space-y-1">{group.links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined} className={cn("flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-medium transition-colors", collapsed && "lg:justify-center lg:px-0", active ? "workspace-nav-active" : "text-foreground/65")}><Icon size={17} strokeWidth={1.8} aria-hidden /><span className={cn(collapsed && "lg:hidden")}>{label}</span></Link>;
              })}</div>
            </div>)}
          </nav>
          <div className="border-t border-foreground/10 p-3">
            <div className="flex items-center gap-1">
              <Link href="/app/profile" title={collapsed ? user.name : undefined} className={cn("flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-2 transition hover:bg-white/10", collapsed && "lg:justify-center")}>
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-semibold text-white">{user.name.slice(0, 1).toUpperCase()}</div>
                <div className={cn("min-w-0", collapsed && "lg:hidden")}><p className="truncate text-xs font-semibold text-white">{user.name}</p><p className="truncate text-[11px] text-white/55">{user.email}</p></div>
              </Link>
              <button type="button" title="Log out" aria-label="Log out" onClick={async () => { await logout(); router.push("/login"); }} className="workspace-logout grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white/75 transition"><LogOut size={17} /></button>
            </div>
          </div>
        </aside>
        {open && <button className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-sm lg:hidden" aria-label="Close navigation overlay" onClick={() => setOpen(false)} />}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-foreground/10 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button className="rounded-xl border border-foreground/10 p-2.5 lg:hidden" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={19} /></button>
              <p className="truncate text-xs font-medium text-foreground/55">{workspaceName}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link href="/app/notifications" className="relative grid h-10 w-10 place-items-center rounded-full border border-foreground/15 bg-foreground/[0.05] text-foreground/70 hover:text-foreground" aria-label="Notifications"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-fuchsia-400" /></Link>
            </div>
          </header>
          <main id="main-content" className="w-full flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</main>
          <footer className="border-t border-foreground/10 px-6 py-4 text-xs text-foreground/45">Receivly AI · Milestone 1 demo workspace</footer>
        </div>
      </div>
    </div>
  );
}
