"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.requestPasswordReset(email.trim());
      setMessage(result.message);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
      <p className="mt-2 text-sm text-white/55">
        Enter your email and we&apos;ll send a link to reset your password.
      </p>

      {success ? (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5" role="status">
          <p className="text-sm text-emerald-100">{message}</p>
          <p className="mt-3 text-xs text-white/50">
            Demo mode: use{" "}
            <Link href="/reset-password?token=demo" className="text-[#c084fc] hover:underline">
              reset password
            </Link>{" "}
            to continue.
          </p>
          <Link href="/login" className="mt-4 inline-block">
            <Button variant="secondary" size="sm">
              Back to log in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error ? (
            <p className="text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/50">
        Remember your password?{" "}
        <Link href="/login" className="text-[#c084fc] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
