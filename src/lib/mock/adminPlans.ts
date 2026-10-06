import { PLANS } from "@/lib/constants";
import type { PlanId } from "@/types";

// Demo owner configuration. Live values will come from the API adapter.
export interface PlanLimits {
  planId: PlanId;
  invoiceAllowance: number;
  teamSeats: number;
  aiTokensMonthly: number;
  visible: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface PromptVersion {
  id: string;
  name: string;
  version: string;
  active: boolean;
  preview: string;
}

export interface Announcement {
  id: string;
  message: string;
  enabled: boolean;
  link?: string;
}

export interface SupportContact {
  label: string;
  email: string;
  hours: string;
}

export const INITIAL_LIMITS: PlanLimits[] = PLANS.map((p) => ({
  planId: p.id,
  invoiceAllowance: p.invoiceAllowance,
  teamSeats: p.id === "starter" ? 2 : p.id === "professional" ? 10 : 50,
  aiTokensMonthly: p.id === "starter" ? 50000 : p.id === "professional" ? 250000 : 1000000,
  visible: true,
}));

export const INITIAL_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl_reminder",
    name: "Friendly reminder",
    subject: "Reminder: Invoice {{invoice_number}} from {{company}}",
    body: "Hi {{contact_name}},\n\nThis is a friendly reminder that invoice {{invoice_number}} for {{amount}} was due on {{due_date}}.\n\n{{payment_link}}\n\nThank you,\n{{sender_name}}",
  },
  {
    id: "tpl_overdue",
    name: "Overdue notice",
    subject: "Overdue: {{invoice_number}} â€” action requested",
    body: "Hi {{contact_name}},\n\nOur records show invoice {{invoice_number}} remains outstanding. Please advise on payment timing or reply if there is a dispute.\n\n{{sender_name}}",
  },
];

export const INITIAL_PROMPTS: PromptVersion[] = [
  {
    id: "prompt_collector_v3",
    name: "Collector reply drafter",
    version: "3.2.1",
    active: true,
    preview: "You are Receivly's AR assistant. Draft professional reminders without inventing amounts or datesâ€¦",
  },
  {
    id: "prompt_classifier_v2",
    name: "Inbound classifier",
    version: "2.0.4",
    active: true,
    preview: "Classify the customer reply into one of: payment_promise, claims_already_paid, invoice_disputeâ€¦",
  },
  {
    id: "prompt_collector_v2",
    name: "Collector reply drafter",
    version: "2.8.0",
    active: false,
    preview: "Legacy prompt â€” retained for rollback.",
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann_1",
    message: "Scheduled maintenance Oct 12, 02:00â€“04:00 UTC â€” email delivery may be delayed.",
    enabled: true,
    link: "https://status.receivly.ai",
  },
];

export const INITIAL_SUPPORT: SupportContact = {
  label: "Platform support",
  email: "support@receivly.ai",
  hours: "Monâ€“Fri, 9amâ€“6pm ET",
};


