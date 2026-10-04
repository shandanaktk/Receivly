import { Reveal } from "@/components/marketing/Reveal";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
};

function PlaceholderNotice() {
  return (
    <div
      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90"
      role="note"
    >
      <strong>Owner-supplied placeholder.</strong> Replace this document with your final Terms of
      Service before launch. This text is for layout and navigation only — not legal advice.
    </div>
  );
}

export default function TermsPage() {
  return (
    <article className="pt-28 pb-20 sm:pt-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.18em] text-white/45">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-sm text-white/45">Last updated: [DATE — owner to supply]</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 space-y-8">
            <PlaceholderNotice />

            <section className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed text-white/70">
              <h2 className="text-lg font-semibold text-white">1. Agreement</h2>
              <p>
                By accessing or using {APP_NAME} (&quot;Service&quot;), you agree to these Terms of
                Service (&quot;Terms&quot;). If you are using the Service on behalf of an
                organization, you represent that you have authority to bind that organization.
              </p>

              <h2 className="text-lg font-semibold text-white">2. The Service</h2>
              <p>
                {APP_NAME} provides invoice management and AI-assisted accounts-receivable
                communication tools. Features, limits, and availability may vary by subscription
                plan. We may update the Service from time to time.
              </p>

              <h2 className="text-lg font-semibold text-white">3. Accounts &amp; security</h2>
              <p>
                You are responsible for maintaining the confidentiality of your credentials and for
                all activity under your account. Notify us promptly of any unauthorized use.
              </p>

              <h2 className="text-lg font-semibold text-white">4. Acceptable use</h2>
              <p>
                You agree not to misuse the Service, including sending unlawful communications,
                harassing content, or attempting to bypass usage limits. See our{" "}
                <Link href="/legal/acceptable-use" className="text-[#c084fc] hover:underline">
                  Acceptable Use Policy
                </Link>{" "}
                for details.
              </p>

              <h2 className="text-lg font-semibold text-white">5. Fees &amp; billing</h2>
              <p>
                [OWNER: Insert billing terms — subscription fees, renewals, refunds, taxes, and
                plan changes.]
              </p>

              <h2 className="text-lg font-semibold text-white">6. Data &amp; privacy</h2>
              <p>
                Our handling of personal data is described in the{" "}
                <Link href="/legal/privacy" className="text-[#c084fc] hover:underline">
                  Privacy Policy
                </Link>
                . You retain ownership of your business data; we process it to provide the Service.
              </p>

              <h2 className="text-lg font-semibold text-white">7. Disclaimers &amp; limitation of liability</h2>
              <p>
                [OWNER: Insert warranty disclaimers, limitation of liability, and indemnification
                clauses appropriate to your jurisdiction.]
              </p>

              <h2 className="text-lg font-semibold text-white">8. Termination</h2>
              <p>
                Either party may terminate in accordance with your subscription agreement. Upon
                termination, access may be revoked subject to data export and retention policies.
              </p>

              <h2 className="text-lg font-semibold text-white">9. Governing law</h2>
              <p>[OWNER: Insert governing law and dispute resolution venue.]</p>

              <h2 className="text-lg font-semibold text-white">10. Contact</h2>
              <p>
                Questions about these Terms:{" "}
                <a href="mailto:legal@receivly.ai" className="text-[#c084fc] hover:underline">
                  legal@receivly.ai
                </a>
              </p>
            </section>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
