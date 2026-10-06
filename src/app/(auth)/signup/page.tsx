"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS } from "@/lib/constants";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const selectedPlan = PLANS.find((p) => p.id === planParam);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!cleanFirstName || !cleanLastName) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid work email.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords you entered do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(`${cleanFirstName} ${cleanLastName}`, email.trim(), password);
      if (selectedPlan) window.sessionStorage.setItem("receivly_pending_plan", selectedPlan.id);
      const verifyUrl = planParam ? `/verify-email?plan=${planParam}` : "/verify-email";
      router.push(verifyUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <p className="auth-dark-white text-xs font-semibold uppercase tracking-[.18em] text-[#e53690]">Start with clarity</p>
      <h1 className="mt-2 text-[2.75rem] leading-none sm:text-[3.3rem]">Create your account</h1>
      <p className="mt-2 text-[13px] text-foreground/60">
        Bring your invoices together and set a better follow-up rhythm.
      </p>

      {selectedPlan ? (
        <p className="mt-4 rounded-xl border border-[#172B76]/40 bg-[#172B76]/15 px-4 py-3 text-sm text-foreground/75">
          Selected plan: <strong className="text-foreground">{selectedPlan.name}</strong> — $
          {selectedPlan.priceMonthly}/mo, up to {selectedPlan.invoiceAllowance} invoices
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="First name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setError(null);
            }}
          />
          <Input
            label="Last name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setError(null);
            }}
          />
        </div>
        <Input
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
        />
        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError(null);
          }}
        />

        {error ? (
          <p className="text-sm text-rose-300" role="alert">
            {error}
          </p>
        ) : null}

        <p className="text-xs text-foreground/40">
          By signing up you agree to our{" "}
          <Link href="/legal/terms" className="text-[#c084fc] hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-[#c084fc] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-[13px] text-foreground/55">
        Already have an account?{" "}
        <Link href="/login" className="auth-dark-white text-[#c084fc] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
