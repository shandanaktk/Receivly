// Demo platform operations snapshot. Replace through the API adapter when backend telemetry exists.
export type ExecutionStatus = "success" | "failed" | "running" | "retrying";

interface N8nExecution {
  id: string;
  workflow: string;
  status: ExecutionStatus;
  durationMs: number;
  startedAt: string;
}

interface FailedJob {
  id: string;
  queue: string;
  error: string;
  attempts: number;
  lastAttempt: string;
}

interface WebhookFailure {
  id: string;
  source: string;
  endpoint: string;
  statusCode: number;
  at: string;
}

interface EmailEvent {
  id: string;
  type: "delivered" | "bounced" | "complained" | "deferred";
  recipient: string;
  subject: string;
  at: string;
}

interface RetryItem {
  id: string;
  kind: string;
  payload: string;
  nextRetry: string;
  attempts: number;
}

export interface IntegrationHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  lastCheck: string;
}

export const MOCK_EXECUTIONS: N8nExecution[] = [
  { id: "ex_901", workflow: "Reminder dispatch", status: "success", durationMs: 1240, startedAt: "2026-10-04T14:02:00.000Z" },
  { id: "ex_902", workflow: "Inbound reply classifier", status: "success", durationMs: 890, startedAt: "2026-10-04T14:01:30.000Z" },
  { id: "ex_903", workflow: "Stripe webhook sync", status: "failed", durationMs: 3200, startedAt: "2026-10-04T13:58:00.000Z" },
  { id: "ex_904", workflow: "Digest notifications", status: "running", durationMs: 0, startedAt: "2026-10-04T14:05:00.000Z" },
  { id: "ex_905", workflow: "Promise follow-up", status: "retrying", durationMs: 2100, startedAt: "2026-10-04T13:50:00.000Z" },
];

export const MOCK_FAILED_JOBS: FailedJob[] = [
  { id: "job_1", queue: "email.outbound", error: "SMTP timeout after 30s", attempts: 3, lastAttempt: "2026-10-04T13:45:00.000Z" },
  { id: "job_2", queue: "ai.draft", error: "Rate limit exceeded (429)", attempts: 2, lastAttempt: "2026-10-04T13:40:00.000Z" },
  { id: "job_3", queue: "webhook.stripe", error: "Invalid signature", attempts: 1, lastAttempt: "2026-10-04T13:58:00.000Z" },
];

export const MOCK_WEBHOOKS: WebhookFailure[] = [
  { id: "wh_1", source: "Stripe", endpoint: "/api/webhooks/stripe", statusCode: 500, at: "2026-10-04T13:58:00.000Z" },
  { id: "wh_2", source: "Resend", endpoint: "/api/webhooks/email", statusCode: 422, at: "2026-10-04T12:30:00.000Z" },
];

export const MOCK_EMAIL_EVENTS: EmailEvent[] = [
  { id: "em_1", type: "delivered", recipient: "ap@vendor.demo", subject: "Reminder: NW-1042", at: "2026-10-04T14:00:00.000Z" },
  { id: "em_2", type: "bounced", recipient: "bad@invalid.demo", subject: "Reminder: NW-1038", at: "2026-10-04T13:55:00.000Z" },
  { id: "em_3", type: "deferred", recipient: "busy@corp.demo", subject: "Invoice NW-1045", at: "2026-10-04T13:50:00.000Z" },
  { id: "em_4", type: "complained", recipient: "spam@example.demo", subject: "Follow-up", at: "2026-10-04T11:00:00.000Z" },
];

export const MOCK_RETRY_QUEUE: RetryItem[] = [
  { id: "rq_1", kind: "email.send", payload: "inv_NW1042 â†’ ap@vendor.demo", nextRetry: "2026-10-04T14:10:00.000Z", attempts: 2 },
  { id: "rq_2", kind: "ai.classify", payload: "conv_8821 inbound reply", nextRetry: "2026-10-04T14:08:00.000Z", attempts: 1 },
  { id: "rq_3", kind: "webhook.forward", payload: "stripe.invoice.paid", nextRetry: "2026-10-04T14:12:00.000Z", attempts: 3 },
];

export const MOCK_INTEGRATIONS: IntegrationHealth[] = [
  { name: "n8n orchestrator", status: "healthy", latencyMs: 45, lastCheck: "2026-10-04T14:05:00.000Z" },
  { name: "OpenAI API", status: "degraded", latencyMs: 820, lastCheck: "2026-10-04T14:05:00.000Z" },
  { name: "Resend email", status: "healthy", latencyMs: 120, lastCheck: "2026-10-04T14:05:00.000Z" },
  { name: "Stripe billing", status: "healthy", latencyMs: 95, lastCheck: "2026-10-04T14:05:00.000Z" },
  { name: "Supabase PostgreSQL", status: "healthy", latencyMs: 18, lastCheck: "2026-10-04T14:05:00.000Z" },
];

export const AI_COSTS = {
  today: 42.18,
  month: 1284.55,
  tokensToday: 184200,
  tokensMonth: 2145000,
  topTenant: "Pulse Dental",
};


