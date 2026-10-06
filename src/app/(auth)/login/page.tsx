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
    <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-sm text-foreground/55">
        Access your workspace or platform admin console.
      </p>

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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <aside
        className="mt-6 rounded-xl border border-[#902177]/30 bg-[#902177]/10 p-4"
        aria-label="Demo credentials"
      >
        <p className="text-sm font-medium text-foreground/90">Demo credentials</p>
        <p className="mt-1 text-xs text-foreground/50">
          Milestone 1 uses frontend-only auth. Click to fill the form.
        </p>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() => fillDemo("business")}
            className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.04] px-3 py-2.5 text-left text-sm transition hover:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc]"
          >
            <span className="font-medium text-foreground/85">{DEMO_CREDENTIALS.business.label}</span>
            <span className="mt-0.5 block font-mono text-xs text-foreground/50">
              {DEMO_CREDENTIALS.business.email} / {DEMO_CREDENTIALS.business.password}
            </span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo("admin")}
            className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.04] px-3 py-2.5 text-left text-sm transition hover:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc]"
          >
            <span className="font-medium text-foreground/85">{DEMO_CREDENTIALS.admin.label}</span>
            <span className="mt-0.5 block font-mono text-xs text-foreground/50">
              {DEMO_CREDENTIALS.admin.email} / {DEMO_CREDENTIALS.admin.password}
            </span>
          </button>
        </div>
      </aside>

      <p className="mt-6 text-center text-sm text-foreground/50">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#c084fc] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
