import { Reveal } from "@/components/marketing/Reveal";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

function PlaceholderNotice() {
  return (
    <div
      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90"
      role="note"
    >
      <strong>Owner-supplied placeholder.</strong> Replace this document with your final Cookie
      Policy and consent mechanism before launch.
    </div>
  );
}

export default function CookiesPage() {
  return (
    <article className="pt-28 pb-20 sm:pt-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.18em] text-foreground/45">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cookie Policy</h1>
          <p className="mt-2 text-sm text-foreground/45">Last updated: [DATE — owner to supply]</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 space-y-8">
            <PlaceholderNotice />

            <section className="space-y-4 text-sm leading-relaxed text-foreground/70">
              <h2 className="text-lg font-semibold text-foreground">What are cookies?</h2>
              <p>
                Cookies are small text files stored on your device when you visit {APP_NAME}. They
                help the site function, remember preferences, and understand usage patterns.
              </p>

              <h2 className="text-lg font-semibold text-foreground">How we use cookies</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-foreground/85">Strictly necessary:</strong> authentication,
                  session management, and security.
                </li>
                <li>
                  <strong className="text-foreground/85">Functional:</strong> remembering settings such
                  as timezone or UI preferences.
                </li>
                <li>
                  <strong className="text-foreground/85">Analytics:</strong> [OWNER: list analytics
                  providers and purposes, e.g. aggregated usage metrics.]
                </li>
                <li>
                  <strong className="text-foreground/85">Marketing:</strong> [OWNER: describe if any
                  marketing or retargeting cookies are used, or state none.]
                </li>
              </ul>

              <h2 className="text-lg font-semibold text-foreground">Local storage</h2>
              <p>
                In demo and early-access builds, session data may be stored in browser local storage
                (e.g. <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-xs">receivly_session</code>
                ). Production deployments may use httpOnly cookies instead.
              </p>

              <h2 className="text-lg font-semibold text-foreground">Managing cookies</h2>
              <p>
                You can control cookies through your browser settings. Blocking strictly necessary
                cookies may prevent you from signing in or using core features.
              </p>

              <h2 className="text-lg font-semibold text-foreground">Related policies</h2>
              <p>
                See our{" "}
                <Link href="/legal/privacy" className="text-[#c084fc] hover:underline">
                  Privacy Policy
                </Link>{" "}
                for how we handle personal data collected via cookies.
              </p>

              <h2 className="text-lg font-semibold text-foreground">Contact</h2>
              <p>
                Cookie questions:{" "}
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
