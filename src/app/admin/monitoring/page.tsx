"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import { useState } from "react";
import { AI_COSTS, MOCK_EMAIL_EVENTS, MOCK_EXECUTIONS, MOCK_FAILED_JOBS, MOCK_INTEGRATIONS, MOCK_RETRY_QUEUE, MOCK_WEBHOOKS, type ExecutionStatus, type IntegrationHealth } from "@/lib/mock/adminMonitoring";

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
  const [refreshed, setRefreshed] = useState(false);
  const failedCount = MOCK_EXECUTIONS.filter((e) => e.status === "failed").length + MOCK_FAILED_JOBS.length;

  const handleRetry = (id: string) => {
    setRetried((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monitoring</h1>
          <p className="mt-1 text-sm text-foreground/55">
            n8n executions, job queues, webhooks, email events, and integration health (demo data).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefreshed(true)}>
          {refreshed ? "Demo snapshot current" : "Refresh snapshot"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-sm text-foreground/55">Failed jobs (24h)</p>
            <p className="mt-1 text-2xl font-semibold text-rose-300">{failedCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-foreground/55">AI cost today</p>
            <p className="mt-1 text-2xl font-semibold">{formatMoney(AI_COSTS.today)}</p>
            <p className="text-xs text-foreground/40">{AI_COSTS.tokensToday.toLocaleString()} tokens</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-foreground/55">AI cost (MTD)</p>
            <p className="mt-1 text-2xl font-semibold">{formatMoney(AI_COSTS.month)}</p>
            <p className="text-xs text-foreground/40">Top tenant: {AI_COSTS.topTenant}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-foreground/55">Retry queue depth</p>
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
                className="flex flex-col gap-2 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{ex.workflow}</p>
                  <p className="text-xs text-foreground/45">
                    {ex.id} Â· {formatRelative(ex.startedAt)}
                    {ex.durationMs > 0 ? ` Â· ${ex.durationMs}ms` : ""}
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
                className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{job.queue}</p>
                    <p className="mt-1 text-xs text-rose-300/90">{job.error}</p>
                    <p className="mt-1 text-xs text-foreground/40">
                      {job.attempts} attempts Â· {formatRelative(job.lastAttempt)}
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
              <thead className="text-foreground/55">
                <tr>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Endpoint</th>
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_WEBHOOKS.map((w) => (
                  <tr key={w.id} className="border-t border-foreground/5">
                    <td className="py-2">{w.source}</td>
                    <td className="py-2 font-mono text-xs text-foreground/60">{w.endpoint}</td>
                    <td className="py-2">
                      <Badge status="past_due">{w.statusCode}</Badge>
                    </td>
                    <td className="py-2 text-foreground/60">{formatRelative(w.at)}</td>
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
                className="flex flex-col gap-1 rounded-lg border border-foreground/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm">{ev.subject}</p>
                  <p className="text-xs text-foreground/45">{ev.recipient}</p>
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
                  <span className="text-xs text-foreground/40">{formatRelative(ev.at)}</span>
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
                className="flex flex-col gap-2 rounded-xl border border-foreground/10 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{item.kind}</p>
                  <p className="text-xs text-foreground/50">{item.payload}</p>
                  <p className="text-xs text-foreground/40">
                    Next retry {formatDate(item.nextRetry, "h:mm a")} Â· attempt {item.attempts}
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
                  <p className="text-xs text-foreground/40">{int.latencyMs}ms Â· {formatRelative(int.lastCheck)}</p>
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

