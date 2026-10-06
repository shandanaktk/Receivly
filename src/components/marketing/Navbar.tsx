"use client";

import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = pathname === "/" && !scrolled && !open;
  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", overHero ? "hero-dark bg-transparent" : "border-b border-foreground/10 bg-background/90 shadow-[0_10px_30px_rgba(0,0,0,.04)] backdrop-blur-xl")}>
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
        <BrandMark inverse={overHero} />
        <nav aria-label="Primary navigation" className="hidden items-center gap-9 md:flex">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={cn("text-sm font-medium transition hover:text-foreground", pathname === link.href ? "text-foreground" : "text-foreground/65")}>{link.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium text-foreground/75 hover:text-foreground">Log in</Link>
          <Link href="/signup"><Button size="sm">Get started <ArrowUpRight size={15} /></Button></Link>
        </div>
        <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-foreground/20 text-foreground md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      {open && <nav id="mobile-nav" aria-label="Mobile navigation" className="border-t border-foreground/10 bg-background p-4 shadow-2xl md:hidden">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-1">
          {links.map((link) => <Link key={link.href} href={link.href} className="rounded-xl px-4 py-3 text-base font-medium text-foreground/85 hover:bg-foreground/[0.05]" onClick={() => setOpen(false)}>{link.label}</Link>)}
          <Link href="/login" className="rounded-xl px-4 py-3 text-base font-medium" onClick={() => setOpen(false)}>Log in</Link>
          <div className="mt-3 flex items-center gap-3"><ThemeToggle /><Link href="/signup" className="flex-1"><Button className="w-full">Get started <ArrowUpRight size={15} /></Button></Link></div>
        </div>
      </nav>}
    </header>
  );
}
