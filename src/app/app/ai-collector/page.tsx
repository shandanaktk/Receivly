"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { ReminderTone, Workspace } from "@/types";
import { useCallback, useEffect, useState } from "react";

const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "firm", label: "Firm" },
];

const APPROVAL_OPTIONS = [
  { value: "none", label: "No approval" },
  { value: "first", label: "First reminder only" },
  { value: "all", label: "All messages" },
  { value: "firm", label: "Firm stage only" },
];

export default function AiCollectorPage() {
  const [ws, setWs] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setWs(await api.getWorkspace());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = (p: Partial<Workspace>) => setWs((prev) => (prev ? { ...prev, ...p } : prev));

  const save = async () => {
    if (!ws) return;
    setSaving(true);
    const updated = await api.updateWorkspace(ws);
    setWs(updated);
    setSaving(false);
  };

  const toggleActive = async () => {
    if (!ws) return;
    setSaving(true);
    const updated = await api.updateWorkspace({ aiCollectorActive: !ws.aiCollectorActive });
    setWs(updated);
    setSaving(false);
  };

  const testSend = () => {
    if (!ws) return;
    setPreview(
      `Subject: Friendly reminder — Invoice due\n\nHi [Customer],\n\nThis is a ${ws.reminderTone} reminder that invoice [NUMBER] for [AMOUNT] was due on [DATE].\n\n${ws.signature}`,
    );
  };

  if (loading || !ws) return <PageLoader label="Loading AI Collector settings…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Collector</h1>
          <p className="text-sm text-white/55">Configure automated collection behavior</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={ws.aiCollectorActive ? "active" : "paused"}>
            {ws.aiCollectorActive ? "Active" : "Paused"}
          </Badge>
          <Button variant={ws.aiCollectorActive ? "outline" : "primary"} onClick={() => void toggleActive()} disabled={saving}>
            {ws.aiCollectorActive ? "Pause collector" : "Activate collector"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Tone & sending</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="Reminder tone"
            value={ws.reminderTone}
            onChange={(e) => patch({ reminderTone: e.target.value as ReminderTone })}
            options={TONE_OPTIONS}
          />
          <Select
            label="Approval mode"
            value={ws.approvalMode}
            onChange={(e) => patch({ approvalMode: e.target.value as Workspace["approvalMode"] })}
            options={APPROVAL_OPTIONS}
          />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={ws.autoSend}
              onChange={(e) => patch({ autoSend: e.target.checked })}
              className="rounded border-white/20"
            />
            <span className="text-white/80">Auto-send approved reminders</span>
          </label>
          <Input
            label="Max reminders per invoice"
            type="number"
            min={1}
            max={10}
            value={ws.maxReminders}
            onChange={(e) => patch({ maxReminders: Number(e.target.value) })}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Quiet hours</h2>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start"
            type="time"
            value={ws.quietHoursStart}
            onChange={(e) => patch({ quietHoursStart: e.target.value })}
          />
          <Input
            label="End"
            type="time"
            value={ws.quietHoursEnd}
            onChange={(e) => patch({ quietHoursEnd: e.target.value })}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Identity & escalation</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Sender name"
            value={ws.senderName}
            onChange={(e) => patch({ senderName: e.target.value })}
          />
          <Input
            label="Reply-to email"
            type="email"
            value={ws.replyTo}
            onChange={(e) => patch({ replyTo: e.target.value })}
          />
          <Input
            label="Escalation email"
            type="email"
            value={ws.escalationEmail}
            onChange={(e) => patch({ escalationEmail: e.target.value })}
          />
          <Textarea
            label="Email signature"
            value={ws.signature}
            onChange={(e) => patch({ signature: e.target.value })}
            rows={4}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-medium">Test send preview</h2>
          <Button size="sm" variant="secondary" onClick={testSend}>
            Generate preview
          </Button>
        </CardHeader>
        {preview ? (
          <CardBody>
            <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/75">
              {preview}
            </pre>
          </CardBody>
        ) : null}
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
