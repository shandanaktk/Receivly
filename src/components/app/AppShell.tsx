"use client";

import { DemoBanner } from "@/components/shared/DemoBanner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const nav = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/customers", label: "Customers" },
  { href: "/app/invoices", label: "Invoices" },
  { href: "/app/conversations", label: "Conversations" },
  { href: "/app/approvals", label: "Approvals" },
  { href: "/app/ai-collector", label: "AI Collector" },
  { href: "/app/reports", label: "Reports" },
  { href: "/app/billing", label: "Billing" },
  { href: "/app/notifications", label: "Notifications" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user?.role === "platform_admin") router.replace("/admin");
    if (!loading && user && !user.onboardingCompleted && !pathname.startsWith("/app/onboarding")) {
      router.replace("/app/onboarding");
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070712] text-white/70">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070712] text-white">
      <DemoBanner />
      <div className="flex min-h-[calc(100vh-36px)]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#0a0a16] pt-[36px] transition md:static md:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex h-14 items-center justify-between px-5">
            <Link href="/app/dashboard" className="font-semibold">
              {APP_NAME}
            </Link>
            <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>
          <nav className="space-y-1 px-3 pb-8" aria-label="App">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-[#070712]/90 px-4 backdrop-blur md:px-6">
            <button
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm md:hidden"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
            <p className="hidden text-sm text-white/60 md:block">
              Signed in as <span className="text-white">{user.name}</span>
            </p>
            <div className="flex items-center gap-2">
              <Link href="/app/profile">
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
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
          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
      {open ? (
        <button
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
