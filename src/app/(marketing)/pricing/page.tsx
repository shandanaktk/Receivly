import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/Button";
import { APP_NAME, PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple plans based on active invoice volume. Starter, Professional, and Business tiers.",
};

type ComparisonRow = {
  feature: string;
  starter: string | boolean;
  professional: string | boolean;
  business: string | boolean;
};

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Active invoices",
    starter: "50",
    professional: "250",
    business: "1,000",
  },
  {
    feature: "AI reminder drafting",
    starter: true,
    professional: true,
    business: true,
  },
  {
    feature: "Conversation inbox",
    starter: true,
    professional: true,
    business: true,
  },
  {
    feature: "CSV import & export",
    starter: true,
    professional: true,
    business: true,
  },
  {
    feature: "Approval queue & escalation",
    starter: false,
    professional: true,
    business: true,
  },
  {
    feature: "Team roles & invitations",
    starter: false,
    professional: true,
    business: true,
  },
  {
    feature: "Advanced reports",
    starter: false,
    professional: true,
    business: true,
  },
  {
    feature: "Firm-stage approvals",
    starter: false,
    professional: false,
    business: true,
  },
  {
    feature: "Multi-currency reporting",
    starter: false,
    professional: false,
    business: true,
  },
  {
    feature: "Audit-friendly history",
    starter: false,
    professional: true,
    business: true,
  },
  {
    feature: "Support",
    starter: "Email",
    professional: "Priority",
    business: "Dedicated onboarding",
  },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="text-emerald-400" aria-label="Included">
        ✓
      </span>
    ) : (
      <span className="text-white/25" aria-label="Not included">
        —
      </span>
    );
  }
  return <span className="text-white/80">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-white/10 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.18em] text-white/45">{APP_NAME}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Pricing that scales with your receivables
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              Pay for active invoice capacity — not seats. Upgrade when your volume grows.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.05}>
                <article
                  className={cn(
                    "flex h-full flex-col rounded-2xl border p-6 sm:p-8",
                    plan.highlighted
                      ? "border-[#902177]/50 bg-gradient-to-b from-[#902177]/10 to-transparent shadow-[0_0_40px_rgba(144,33,119,0.12)]"
                      : "border-white/10 bg-white/[0.03]",
                  )}
                >
                  {plan.highlighted ? (
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#d8b4fe]">
                      Most popular
                    </p>
                  ) : null}
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  <p className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold">${plan.priceMonthly}</span>
                    <span className="text-sm text-white/50">/ month</span>
                  </p>
                  <p className="mt-2 text-sm text-white/55">
                    Up to {plan.invoiceAllowance.toLocaleString()} active invoices
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm text-white/70">
                        <span className="text-emerald-400" aria-hidden>
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/signup?plan=${plan.id}`} className="mt-8 block">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "primary" : "secondary"}
                    >
                      Start with {plan.name}
                    </Button>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Compare plans
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Scroll horizontally on smaller screens to see all columns.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Feature comparison across Starter, Professional, and Business plans
                </caption>
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04]">
                    <th scope="col" className="px-4 py-4 font-medium text-white/70 sm:px-6">
                      Feature
                    </th>
                    <th scope="col" className="px-4 py-4 font-medium text-white sm:px-6">
                      Starter
                    </th>
                    <th scope="col" className="px-4 py-4 font-medium text-white sm:px-6">
                      Professional
                    </th>
                    <th scope="col" className="px-4 py-4 font-medium text-white sm:px-6">
                      Business
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-white/10 last:border-0">
                      <th scope="row" className="px-4 py-3.5 font-normal text-white/75 sm:px-6">
                        {row.feature}
                      </th>
                      <td className="px-4 py-3.5 text-center sm:px-6">
                        <CellValue value={row.starter} />
                      </td>
                      <td className="px-4 py-3.5 text-center sm:px-6">
                        <CellValue value={row.professional} />
                      </td>
                      <td className="px-4 py-3.5 text-center sm:px-6">
                        <CellValue value={row.business} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-2xl font-semibold sm:text-3xl">Questions about volume or enterprise?</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/60">
              Need more than 1,000 active invoices or custom compliance? Talk to us.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/contact">
                <Button variant="outline">Contact sales</Button>
              </Link>
              <Link href="/signup">
                <Button>Start free trial</Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
