"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  async function handleVerify() {
    setError(null);
    setLoading(true);
    try {
      await api.verifyEmail("demo");
      setVerified(true);
      router.push("/app/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 sm:p-8 text-center">
        <h1 className="text-2xl font-semibold">Verify your email</h1>
        <p className="mt-2 text-sm text-foreground/55">
          Sign up or log in first to verify your email address.
        </p>
        <Link href="/signup" className="mt-6 inline-block">
          <Button>Go to sign up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 sm:p-8 text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.05] text-2xl"
        aria-hidden
      >
        ✉
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Verify your email</h1>
      <p className="mt-2 text-sm text-foreground/55">
        We sent a verification link to{" "}
        <strong className="text-foreground/80">{user.email}</strong>. In production, click the link in
        your inbox. For this demo, use the button below.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}

      {verified ? (
        <p className="mt-4 text-sm text-emerald-300" role="status">
          Verified! Redirecting to onboarding…
        </p>
      ) : (
        <Button type="button" className="mt-6 w-full" onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying…" : "Verify email (demo)"}
        </Button>
      )}

      <p className="mt-6 text-xs text-foreground/40">
        Didn&apos;t receive an email? Check spam or{" "}
        <button
          type="button"
          className="text-[#c084fc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc] rounded"
          onClick={() => setError(null)}
        >
          resend
        </button>{" "}
        (demo — no email sent).
      </p>
    </div>
  );
}
