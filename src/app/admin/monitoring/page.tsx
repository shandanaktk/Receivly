"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import { useMemo, useState } from "react";

type ExecutionStatus = "success" | "failed" | "running" | "retrying";

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

interface IntegrationHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  lastCheck: string;
}

const MOCK_EXECUTIONS: N8nExecution[] = [
  { id: "ex_901", workflow: "Reminder dispatch", status: "success", durationMs: 1240, startedAt: "2026-10-04T14:02:00.000Z" },
  { id: "ex_902", workflow: "Inbound reply classifier", status: "success", durationMs: 890, startedAt: "2026-10-04T14:01:30.000Z" },
  { id: "ex_903", workflow: "Stripe webhook sync", status: "failed", durationMs: 3200, startedAt: "2026-10-04T13:58:00.000Z" },
  { id: "ex_904", workflow: "Digest notifications", status: "running", durationMs: 0, startedAt: "2026-10-04T14:05:00.000Z" },
  { id: "ex_905", workflow: "Promise follow-up", status: "retrying", durationMs: 2100, startedAt: "2026-10-04T13:50:00.000Z" },
];

const MOCK_FAILED_JOBS: FailedJob[] = [
  { id: "job_1", queue: "email.outbound", error: "SMTP timeout after 30s", attempts: 3, lastAttempt: "2026-10-04T13:45:00.000Z" },
  { id: "job_2", queue: "ai.draft", error: "Rate limit exceeded (429)", attempts: 2, lastAttempt: "2026-10-04T13:40:00.000Z" },
  { id: "job_3", queue: "webhook.stripe", error: "Invalid signature", attempts: 1, lastAttempt: "2026-10-04T13:58:00.000Z" },
];

const MOCK_WEBHOOKS: WebhookFailure[] = [
  { id: "wh_1", source: "Stripe", endpoint: "/api/webhooks/stripe", statusCode: 500, at: "2026-10-04T13:58:00.000Z" },
  { id: "wh_2", source: "Resend", endpoint: "/api/webhooks/email", statusCode: 422, at: "2026-10-04T12:30:00.000Z" },
];

const MOCK_EMAIL_EVENTS: EmailEvent[] = [
  { id: "em_1", type: "delivered", recipient: "ap@vendor.demo", subject: "Reminder: NW-1042", at: "2026-10-04T14:00:00.000Z" },
  { id: "em_2", type: "bounced", recipient: "bad@invalid.demo", subject: "Reminder: NW-1038", at: "2026-10-04T13:55:00.000Z" },
  { id: "em_3", type: "deferred", recipient: "busy@corp.demo", subject: "Invoice NW-1045", at: "2026-10-04T13:50:00.000Z" },
  { id: "em_4", type: "complained", recipient: "spam@example.demo", subject: "Follow-up", at: "2026-10-04T11:00:00.000Z" },
];

const MOCK_RETRY_QUEUE: RetryItem[] = [
  { id: "rq_1", kind: "email.send", payload: "inv_NW1042 → ap@vendor.demo", nextRetry: "2026-10-04T14:10:00.000Z", attempts: 2 },
  { id: "rq_2", kind: "ai.classify", payload: "conv_8821 inbound reply", nextRetry: "2026-10-04T14:08:00.000Z", attempts: 1 },
  { id: "rq_3", kind: "webhook.forward", payload: "stripe.invoice.paid", nextRetry: "2026-10-04T14:12:00.000Z", attempts: 3 },
];

const MOCK_INTEGRATIONS: IntegrationHealth[] = [
  { name: "n8n orchestrator", status: "healthy", latencyMs: 45, lastCheck: "2026-10-04T14:05:00.000Z" },
  { name: "OpenAI API", status: "degraded", latencyMs: 820, lastCheck: "2026-10-04T14:05:00.000Z" },
  { name: "Resend email", status: "healthy", latencyMs: 120, lastCheck: "2026-10-04T14:05:00.000Z" },
  { name: "Stripe billing", status: "healthy", latencyMs: 95, lastCheck: "2026-10-04T14:05:00.000Z" },
  { name: "MongoDB Atlas", status: "healthy", latencyMs: 18, lastCheck: "2026-10-04T14:05:00.000Z" },
];

const AI_COSTS = {
  today: 42.18,
  month: 1284.55,
  tokensToday: 184200,
  tokensMonth: 2145000,
  topTenant: "Pulse Dental",
};

function execBadge(status: ExecutionStatus) {
  const map: Record<ExecutionStatus, string> = {
    success: "active",
    failed: "past_due",
    running: "trialing",
    retrying: "due",
  };
  return map[status];
}

function integrationBadge(status: IntegrationHealth["status"]) {
  if (status === "healthy") return "active";
  if (status === "degraded") return "due";
  return "past_due";
}

export default function AdminMonitoringPage() {
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const failedCount = useMemo(
    () => MOCK_EXECUTIONS.filter((e) => e.status === "failed").length + MOCK_FAILED_JOBS.length,
    [refreshKey],
  );

  const handleRetry = (id: string) => {
    setRetried((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monitoring</h1>
          <p className="mt-1 text-sm text-white/55">
            n8n executions, job queues, webhooks, email events, and integration health (demo data).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          Refresh snapshot
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-sm text-white/55">Failed jobs (24h)</p>
            <p className="mt-1 text-2xl font-semibold text-rose-300">{failedCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-white/55">AI cost today</p>
            <p className="mt-1 text-2xl font-semibold">{formatMoney(AI_COSTS.today)}</p>
            <p className="text-xs text-white/40">{AI_COSTS.tokensToday.toLocaleString()} tokens</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-white/55">AI cost (MTD)</p>
            <p className="mt-1 text-2xl font-semibold">{formatMoney(AI_COSTS.month)}</p>
            <p className="text-xs text-white/40">Top tenant: {AI_COSTS.topTenant}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-white/55">Retry queue depth</p>
            <p className="mt-1 text-2xl font-semibold">{MOCK_RETRY_QUEUE.length}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-medium">n8n executions</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {MOCK_EXECUTIONS.map((ex) => (
              <div
                key={ex.id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{ex.workflow}</p>
                  <p className="text-xs text-white/45">
                    {ex.id} · {formatRelative(ex.startedAt)}
                    {ex.durationMs > 0 ? ` · ${ex.durationMs}ms` : ""}
                  </p>
                </div>
                <Badge status={execBadge(ex.status)}>{ex.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Failed jobs</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {MOCK_FAILED_JOBS.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{job.queue}</p>
                    <p className="mt-1 text-xs text-rose-300/90">{job.error}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {job.attempts} attempts · {formatRelative(job.lastAttempt)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={retried.has(job.id)}
                    onClick={() => handleRetry(job.id)}
                  >
                    {retried.has(job.id) ? "Queued" : "Retry"}
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-medium">Webhook failures</h2>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-white/55">
                <tr>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Endpoint</th>
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_WEBHOOKS.map((w) => (
                  <tr key={w.id} className="border-t border-white/5">
                    <td className="py-2">{w.source}</td>
                    <td className="py-2 font-mono text-xs text-white/60">{w.endpoint}</td>
                    <td className="py-2">
                      <Badge status="past_due">{w.statusCode}</Badge>
                    </td>
                    <td className="py-2 text-white/60">{formatRelative(w.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Email events</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {MOCK_EMAIL_EVENTS.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col gap-1 rounded-lg border border-white/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm">{ev.subject}</p>
                  <p className="text-xs text-white/45">{ev.recipient}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    status={
                      ev.type === "delivered"
                        ? "active"
                        : ev.type === "bounced"
                          ? "past_due"
                          : ev.type === "complained"
                            ? "disputed"
                            : "due"
                    }
                  >
                    {ev.type}
                  </Badge>
                  <span className="text-xs text-white/40">{formatRelative(ev.at)}</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-medium">Retry queue</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {MOCK_RETRY_QUEUE.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{item.kind}</p>
                  <p className="text-xs text-white/50">{item.payload}</p>
                  <p className="text-xs text-white/40">
                    Next retry {formatDate(item.nextRetry, "h:mm a")} · attempt {item.attempts}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={retried.has(item.id)}
                  onClick={() => handleRetry(item.id)}
                >
                  {retried.has(item.id) ? "Processing" : "Retry now"}
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Integration health</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {MOCK_INTEGRATIONS.map((int) => (
              <div key={int.name} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{int.name}</p>
                  <p className="text-xs text-white/40">{int.latencyMs}ms · {formatRelative(int.lastCheck)}</p>
                </div>
                <Badge status={integrationBadge(int.status)}>{int.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
