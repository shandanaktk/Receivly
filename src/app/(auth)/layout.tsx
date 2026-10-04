import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#05050f] text-white">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="mb-8 text-sm text-white/50 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050f] rounded-lg px-1"
        >
          ← Back to {APP_NAME}
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
