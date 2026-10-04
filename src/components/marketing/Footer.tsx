import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#05050f]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="text-lg font-semibold text-white">{APP_NAME}</p>
          <p className="mt-3 text-sm text-white/50">
            AI-powered invoice management and payment collection for modern finance teams.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Product</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/55">
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/signup">Start free</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Company</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/55">
            <Link href="/contact">Contact</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Legal</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/55">
            <Link href="/legal/cookies">Cookie Policy</Link>
            <Link href="/legal/acceptable-use">Acceptable Use</Link>
            <Link href="/login">Log in</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
