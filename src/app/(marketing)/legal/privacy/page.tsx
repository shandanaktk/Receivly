import { Reveal } from "@/components/marketing/Reveal";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

function PlaceholderNotice() {
  return (
    <div
      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90"
      role="note"
    >
      <strong>Owner-supplied placeholder.</strong> Replace this document with your final Privacy
      Policy before launch. Consult qualified counsel for GDPR, CCPA, and other compliance
      requirements.
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <article className="pt-28 pb-20 sm:pt-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.18em] text-white/45">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-white/45">Last updated: [DATE — owner to supply]</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 space-y-8">
            <PlaceholderNotice />

            <section className="space-y-4 text-sm leading-relaxed text-white/70">
              <h2 className="text-lg font-semibold text-white">Overview</h2>
              <p>
                {APP_NAME} (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy
                describes how we collect, use, and share information when you use our website and
                application.
              </p>

              <h2 className="text-lg font-semibold text-white">Information we collect</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-white/85">Account data:</strong> name, email, company,
                  role, and authentication credentials.
                </li>
                <li>
                  <strong className="text-white/85">Business data:</strong> customers, invoices,
                  payments, and collection conversations you upload or create.
                </li>
                <li>
                  <strong className="text-white/85">Usage data:</strong> logs, device information,
                  and analytics about how you interact with the Service.
                </li>
                <li>
                  <strong className="text-white/85">Communications:</strong> support requests and
                  contact form submissions.
                </li>
              </ul>

              <h2 className="text-lg font-semibold text-white">How we use information</h2>
              <p>
                We use data to provide and improve the Service, process subscriptions, send
                transactional messages, detect abuse, and comply with legal obligations. AI features
                process invoice and conversation content solely to deliver requested functionality
                within your workspace.
              </p>

              <h2 className="text-lg font-semibold text-white">Sharing</h2>
              <p>
                [OWNER: Describe subprocessors, hosting providers, payment processors, and lawful
                disclosure circumstances.]
              </p>

              <h2 className="text-lg font-semibold text-white">Retention</h2>
              <p>
                [OWNER: Define retention periods for account data, business records, and logs.]
              </p>

              <h2 className="text-lg font-semibold text-white">Your rights</h2>
              <p>
                Depending on your location, you may have rights to access, correct, delete, or
                export personal data. Contact us to exercise these rights.
              </p>

              <h2 className="text-lg font-semibold text-white">Cookies</h2>
              <p>
                We use cookies and similar technologies as described in our{" "}
                <Link href="/legal/cookies" className="text-[#c084fc] hover:underline">
                  Cookie Policy
                </Link>
                .
              </p>

              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p>
                We implement administrative, technical, and organizational measures designed to
                protect your data. No method of transmission over the Internet is fully secure.
              </p>

              <h2 className="text-lg font-semibold text-white">Contact</h2>
              <p>
                Privacy inquiries:{" "}
                <a href="mailto:privacy@receivly.ai" className="text-[#c084fc] hover:underline">
                  privacy@receivly.ai
                </a>
              </p>
            </section>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
