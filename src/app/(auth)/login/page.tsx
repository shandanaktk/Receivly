"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role === "platform_admin") {
      router.replace("/admin");
    } else {
      router.replace("/app/dashboard");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const next = await login(email.trim(), password);
      if (next.role === "platform_admin") {
        router.push("/admin");
      } else {
        router.push("/app/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(type: "business" | "admin") {
    const creds = DEMO_CREDENTIALS[type];
    setEmail(creds.email);
    setPassword(creds.password);
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="auth-dark-white text-xs font-semibold uppercase tracking-[.18em] text-[#e53690]">Welcome back</p>
      <h1 className="mt-2 text-[2.75rem] leading-none sm:text-[3.3rem]">Sign in to Receivly</h1>
      <p className="mt-2 text-[13px] text-foreground/60">
        Your invoices, conversations, and next actions are ready.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
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
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-[#c084fc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc] rounded"
          >
            Forgot password?
          </Link>
        </div>

        {error ? (
          <p className="text-sm text-rose-300" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <aside
        className="mt-5 rounded-2xl border border-foreground/10 bg-foreground/[0.025] p-3.5"
        aria-label="Demo credentials"
      >
        <p className="text-xs font-semibold uppercase tracking-[.12em] text-foreground/70">Explore the demo</p>
        <p className="mt-1 text-xs text-foreground/50">Choose a demo role to fill the form.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => fillDemo("business")}
            className="w-full min-w-0 rounded-xl border border-foreground/10 bg-elevated px-3 py-2 text-left text-xs transition hover:border-[#ec2f91]/40 hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec2f91]"
          >
            <span className="font-medium text-foreground/85">{DEMO_CREDENTIALS.business.label}</span>
            <span className="mt-0.5 block break-all text-[11px] text-foreground/50">{DEMO_CREDENTIALS.business.email}</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo("admin")}
            className="w-full min-w-0 rounded-xl border border-foreground/10 bg-elevated px-3 py-2 text-left text-xs transition hover:border-[#ec2f91]/40 hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec2f91]"
          >
            <span className="font-medium text-foreground/85">{DEMO_CREDENTIALS.admin.label}</span>
            <span className="mt-0.5 block break-all text-[11px] text-foreground/50">{DEMO_CREDENTIALS.admin.email}</span>
          </button>
        </div>
      </aside>

      <p className="mt-4 text-center text-[13px] text-foreground/55">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="auth-dark-white text-[#c084fc] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
