import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#05050f] text-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
