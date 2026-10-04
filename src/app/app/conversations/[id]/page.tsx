"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatRelative, statusLabel } from "@/lib/format";
import type { Conversation } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const [pauseReason, setPauseReason] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const c = await api.getConversation(id);
    setConversation(c);
    setDraft(c.messages.find((m) => m.status === "draft")?.body || "");
    setPauseReason(c.pauseReason || "");
    setNextAction(c.nextAction || "");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const approveDraft = async () => {
    setSaving(true);
    await api.resolveApproval("demo", "approve");
    await api.updateConversation(id, { needsApproval: false, unread: false });
    await load();
    setSaving(false);
  };

  const saveEdits = async () => {
    setSaving(true);
    await api.updateConversation(id, { pauseReason, nextAction });
    await load();
    setSaving(false);
  };

  const addNote = async () => {
    if (!note.trim() || !conversation) return;
    setSaving(true);
    await api.updateConversation(id, {
      internalNotes: [
        ...conversation.internalNotes,
        {
          id: `note_${Date.now()}`,
          body: note,
          author: "You",
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setNote("");
    await load();
    setSaving(false);
  };

  if (loading || !conversation) return <PageLoader label="Loading conversation…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/app/conversations" className="text-sm text-white/50 hover:text-white">
            ← Conversations
          </Link>
          <h1 className="mt-2 text-xl font-semibold">{conversation.subject}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {conversation.needsApproval ? <Badge status="medium">Needs approval</Badge> : null}
            {conversation.aiCategory ? (
              <Badge status="disputed">{statusLabel(conversation.aiCategory)}</Badge>
            ) : null}
            {conversation.aiConfidence != null ? (
              <span className="text-xs text-white/45">
                AI confidence: {Math.round(conversation.aiConfidence * 100)}%
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/app/invoices/${conversation.invoiceId}`}>
            <Button variant="outline" size="sm">
              View invoice
            </Button>
          </Link>
          {conversation.needsApproval ? (
            <Button size="sm" onClick={() => void approveDraft()} disabled={saving}>
              Approve & send
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-medium">Thread</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {conversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl border p-4 text-sm ${
                    msg.direction === "inbound"
                      ? "border-white/10 bg-white/[0.03]"
                      : msg.direction === "internal"
                        ? "border-amber-500/20 bg-amber-500/5"
                        : "border-fuchsia-500/20 bg-fuchsia-500/5 ml-4 sm:ml-8"
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-white/45">
                    <span className="capitalize">{msg.direction}</span>
                    <span>·</span>
                    <span>{formatRelative(msg.createdAt)}</span>
                    {msg.aiGenerated ? <Badge status="low">AI draft</Badge> : null}
                    {msg.status === "draft" ? <Badge status="draft">Draft</Badge> : null}
                  </div>
                  {msg.subject ? <p className="mb-1 font-medium">{msg.subject}</p> : null}
                  <p className="whitespace-pre-wrap text-white/80">{msg.body}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          {conversation.needsApproval || draft ? (
            <Card>
              <CardHeader>
                <h2 className="font-medium">Edit draft</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void approveDraft()} disabled={saving}>
                    Approve & send
                  </Button>
                  <Button size="sm" variant="secondary" disabled={saving}>
                    Save draft
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-medium">Next action</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Textarea
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="What should happen next?"
                rows={3}
              />
              <Textarea
                label="Pause reason"
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Why collection is paused…"
                rows={3}
              />
              <Button size="sm" variant="secondary" onClick={() => void saveEdits()} disabled={saving}>
                Save
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-medium">Internal notes</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <ul className="space-y-2 text-sm">
                {conversation.internalNotes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-white/10 p-3">
                    <p className="text-white/80">{n.body}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {n.author} · {formatRelative(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add internal note…"
                rows={3}
              />
              <Button size="sm" variant="outline" onClick={() => void addNote()} disabled={saving || !note.trim()}>
                Add note
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
