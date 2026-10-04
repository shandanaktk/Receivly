import type { Plan } from "@/types";

/** Demo credentials for Milestone 1 (frontend-only auth). Remove when backend auth is wired. */
export const DEMO_CREDENTIALS = {
  business: {
    email: "demo@receivly.ai",
    password: "Demo1234!",
    label: "Business workspace",
  },
  admin: {
    email: "admin@receivly.ai",
    password: "Admin1234!",
    label: "Platform owner",
  },
} as const;

export const APP_NAME = "Receivly AI";

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 19,
    invoiceAllowance: 50,
    features: [
      "Up to 50 active invoices",
      "AI reminder drafting",
      "Conversation inbox",
      "Email support",
      "CSV import & export",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    priceMonthly: 49,
    invoiceAllowance: 250,
    highlighted: true,
    features: [
      "Up to 250 active invoices",
      "Approval queue & escalation",
      "Team roles & invitations",
      "Advanced reports",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 99,
    invoiceAllowance: 1000,
    features: [
      "Up to 1,000 active invoices",
      "Firm-stage approvals",
      "Multi-currency reporting",
      "Audit-friendly history",
      "Dedicated onboarding",
    ],
  },
];

export const INVOICE_STATUSES = [
  "draft",
  "scheduled",
  "sent",
  "viewed",
  "due",
  "overdue",
  "payment_promised",
  "payment_claimed",
  "disputed",
  "partially_paid",
  "paid",
  "paused",
  "void",
  "written_off",
] as const;

export const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK !== "false";
