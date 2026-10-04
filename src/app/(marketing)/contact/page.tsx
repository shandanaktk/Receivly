"use client";

import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { api } from "@/lib/api";
import { APP_NAME } from "@/lib/constants";
import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (honeypot.trim()) {
      setSuccess(true);
      return;
    }

    setLoading(true);
    try {
      await api.submitContact({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        message: message.trim(),
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="border-b border-white/10 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.18em] text-white/45">{APP_NAME}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Contact us</h1>
            <p className="mt-4 text-white/60">
              Questions about plans, onboarding, or enterprise requirements? Send a message and
              we&apos;ll get back to you.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Reveal>
            {success ? (
              <div
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center"
                role="status"
              >
                <h2 className="text-xl font-semibold text-emerald-200">Message sent</h2>
                <p className="mt-2 text-sm text-white/70">
                  Thanks for reaching out. We&apos;ll respond to your email as soon as possible.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-6"
                  onClick={() => setSuccess(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
                noValidate
              >
                <Input
                  label="Name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Company (optional)"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                <Textarea
                  label="Message"
                  name="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your receivables workflow or questions…"
                />

                {/* Honeypot — hidden from users, bots may fill it */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <p className="text-xs text-white/40">
                  This form includes abuse protection. Please do not submit automated or bulk
                  messages.
                </p>

                {error ? (
                  <p className="text-sm text-rose-300" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 rounded-2xl border border-white/10 p-6 text-sm text-white/55">
              <p className="font-medium text-white/80">Other ways to reach us</p>
              <p className="mt-2">
                Email{" "}
                <a href="mailto:hello@receivly.ai" className="text-[#c084fc] hover:underline">
                  hello@receivly.ai
                </a>{" "}
                for general inquiries or{" "}
                <a href="mailto:support@receivly.ai" className="text-[#c084fc] hover:underline">
                  support@receivly.ai
                </a>{" "}
                for existing customers.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
