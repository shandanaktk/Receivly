"use client";

import { EmailThread } from "@/components/app/EmailThread";
import { GmailConnect } from "@/components/app/GmailConnect";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatRelative, statusLabel } from "@/lib/format";
import type { Conversation, Customer, Invoice, ReplyCategory, TeamMember, Workspace } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const [pauseReason, setPauseReason] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [classification, setClassification] = useState<ReplyCategory | "">("");
  const [promisedDate, setPromisedDate] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const c = await api.getConversation(id);
    const [members, person, bill, ws] = await Promise.all([api.getTeam(), api.getCustomer(c.customerId), api.getInvoice(c.invoiceId), api.getWorkspace()]);
    setCustomer(person);
    setInvoice(bill);
    setWorkspace(ws);
    setTeam(members.filter((m) => m.status === "active"));
    setConversation(c);
    setDraft(c.messages.find((m) => m.status === "draft")?.body || "");
    setPauseReason(c.pauseReason || "");
    setNextAction(c.nextAction || "");
    setAssignedTo(c.assignedTo || "");
    setClassification(c.classificationOverride || "");
    setPromisedDate(c.promisedDateOverride || "");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const approveDraft = async () => {
    if (!draft.trim()) { setMessage("Write a reply before sending."); return; }
    if (!window.confirm("Approve this draft? The demo will update its status, but no email will be delivered.")) return;
    setSaving(true);
    const item = (await api.getApprovals()).find((a) => a.conversationId === id);
    if (item) await api.resolveApproval(item.id, "edit", draft);
    else await api.sendConversationDraft(id, draft);
    await api.updateConversation(id, { unread: false });
    await load();
    setMessage("Reply marked sent in this demo. No email was delivered.");
    setSaving(false);
  };

  const saveDraft = async () => { setSaving(true); await api.saveConversationDraft(id, draft); await load(); setMessage("Draft saved."); setSaving(false); };
  const rejectDraft = async () => { const item = (await api.getApprovals()).find((a) => a.conversationId === id); if (!item || !window.confirm("Reject this draft and remove it from the approval queue?")) return; await api.resolveApproval(item.id, "reject"); await load(); setMessage("Draft rejected. You can still edit and send a manual reply."); };

  const saveEdits = async () => {
    setSaving(true);
    await api.updateConversation(id, { pauseReason, nextAction, assignedTo: assignedTo || undefined, classificationOverride: classification || undefined, promisedDateOverride: promisedDate || undefined });
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
      {message && <p role="status" className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-3 text-sm text-foreground/75">{message}</p>}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/app/conversations" className="text-sm text-foreground/50 hover:text-foreground">
            ← Conversations
          </Link>
          <h1 className="mt-2 text-xl font-semibold">{conversation.subject}</h1>
          <p className="mt-1 text-sm text-foreground/55">{customer?.name} · Invoice {invoice?.number} · every email on this invoice is below</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {conversation.needsApproval ? <Badge status="medium">Needs approval</Badge> : null}
            {conversation.aiCategory ? (
              <Badge status="disputed">{statusLabel(conversation.aiCategory)}</Badge>
            ) : null}
            {conversation.aiConfidence != null ? (
              <span className="text-xs text-foreground/45">
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
              Approve & send (demo)
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <GmailConnect compact email={workspace?.gmailEmail} onChange={(gmailEmail) => setWorkspace((current) => current ? { ...current, gmailEmail } : current)} />
          {customer && invoice && workspace ? (
            <EmailThread
              messages={conversation.messages}
              invoiceNumber={invoice.number}
              senderName={workspace.senderName}
              fromEmail={workspace.gmailEmail || workspace.replyTo}
              toName={customer.name}
              toEmail={customer.email}
            />
          ) : null}

          {(
            <Card>
              <CardHeader>
                <h2 className="font-medium">Draft or manual reply</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void approveDraft()} disabled={saving || !draft.trim()}>
                    {conversation.needsApproval ? "Approve & send" : "Manual send"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void saveDraft()} disabled={saving || !draft.trim()}>
                    Save draft
                  </Button>
                  {conversation.needsApproval && <Button size="sm" variant="danger" onClick={() => void rejectDraft()} disabled={saving}>Reject draft</Button>}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-medium">Review & next action</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Select label="Assigned team member" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} options={[{ value: "", label: "Unassigned" }, ...team.map((m) => ({ value: m.name, label: m.name }))]} />
              <Select label="Human classification override" value={classification} onChange={(e) => setClassification(e.target.value as ReplyCategory | "")} options={[{ value: "", label: `Keep AI result (${conversation.aiCategory ? statusLabel(conversation.aiCategory) : "none"})` }, ...["payment_promise", "claims_already_paid", "requests_extension", "invoice_dispute", "needs_invoice_copy", "wrong_contact", "out_of_office", "unsubscribe", "abusive_sensitive", "unclear"].map((value) => ({ value, label: statusLabel(value) }))]} />
              <Input label="Promised payment date override" type="date" value={promisedDate} onChange={(e) => setPromisedDate(e.target.value)} hint="The original AI interpretation stays in the audit history." />
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
                  <li key={n.id} className="rounded-lg border border-foreground/10 p-3">
                    <p className="text-foreground/80">{n.body}</p>
                    <p className="mt-1 text-xs text-foreground/40">
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
