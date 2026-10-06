import { Reveal } from "@/components/marketing/Reveal";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
};

function PlaceholderNotice() {
  return (
    <div
      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90"
      role="note"
    >
      <strong>Owner-supplied placeholder.</strong> Replace this document with your final Acceptable
      Use Policy before launch. Tailor prohibited activities to your product and jurisdiction.
    </div>
  );
}

export default function AcceptableUsePage() {
  return (
    <article className="pt-28 pb-20 sm:pt-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.18em] text-foreground/45">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Acceptable Use Policy</h1>
          <p className="mt-2 text-sm text-foreground/45">Last updated: [DATE — owner to supply]</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 space-y-8">
            <PlaceholderNotice />

            <section className="space-y-4 text-sm leading-relaxed text-foreground/70">
              <h2 className="text-lg font-semibold text-foreground">Purpose</h2>
              <p>
                This Acceptable Use Policy (&quot;AUP&quot;) governs use of {APP_NAME}. It supplements
                our{" "}
                <Link href="/legal/terms" className="text-[#c084fc] hover:underline">
                  Terms of Service
                </Link>
                .
              </p>

              <h2 className="text-lg font-semibold text-foreground">Permitted use</h2>
              <p>
                You may use {APP_NAME} to manage legitimate business receivables, communicate with
                customers about outstanding invoices, and automate follow-up in compliance with
                applicable laws and your own policies.
              </p>

              <h2 className="text-lg font-semibold text-foreground">Prohibited conduct</h2>
              <p>You must not use the Service to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Send harassing, threatening, deceptive, or unlawful collection messages</li>
                <li>Impersonate another person or entity without authorization</li>
                <li>Transmit malware, spam, or bulk unsolicited communications</li>
                <li>Collect debts you are not authorized to pursue</li>
                <li>Violate CAN-SPAM, TCPA, GDPR, or other applicable regulations</li>
                <li>Attempt to probe, scan, or test vulnerabilities without permission</li>
                <li>Circumvent plan limits, rate limits, or workspace isolation</li>
                <li>Upload content that infringes intellectual property or privacy rights</li>
              </ul>

              <h2 className="text-lg font-semibold text-foreground">AI-generated content</h2>
              <p>
                AI-drafted reminders must be reviewed when your workspace requires approval. You
                remain responsible for outbound communications sent from your account.
              </p>

              <h2 className="text-lg font-semibold text-foreground">Enforcement</h2>
              <p>
                We may investigate suspected violations, suspend or terminate accounts, and
                cooperate with law enforcement where required. [OWNER: add appeal or notice
                procedures.]
              </p>

              <h2 className="text-lg font-semibold text-foreground">Reporting abuse</h2>
              <p>
                Report misuse to{" "}
                <a href="mailto:abuse@receivly.ai" className="text-[#c084fc] hover:underline">
                  abuse@receivly.ai
                </a>
                .
              </p>
            </section>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
