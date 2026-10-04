"use client";

import { DemoBanner } from "@/components/shared/DemoBanner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/monitoring", label: "Monitoring" },
  { href: "/admin/plans", label: "Plans & settings" },
  { href: "/admin/audit", label: "Audit log" },
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
      <div className="flex min-h-screen items-center justify-center bg-[#070712] text-white/70">
        Loading admin…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070712] text-white">
      <DemoBanner />
      <div className="flex min-h-[calc(100vh-36px)]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#0a0a16] pt-[36px] transition md:static md:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex h-14 items-center px-5 font-semibold">Platform Admin</div>
          <nav className="space-y-1 px-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-[#070712]/90 px-4 backdrop-blur">
            <button className="md:hidden" onClick={() => setOpen(true)}>
              Menu
            </button>
            <span className="text-sm text-white/60">{user.email}</span>
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
          </header>
          <main className="px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
