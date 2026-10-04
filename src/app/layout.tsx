import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Receivly AI — AI-Powered Invoice Collection",
    template: "%s · Receivly AI",
  },
  description:
    "Receivly AI helps businesses manage invoices and automate accounts-receivable follow-up with an AI collection assistant — while keeping money, dates, and access under deterministic control.",
  metadataBase: new URL("https://receivly.ai"),
};

export const viewport: Viewport = {
  themeColor: "#05050f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
