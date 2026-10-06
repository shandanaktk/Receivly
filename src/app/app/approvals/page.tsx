"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import type { ApprovalItem } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await api.getApprovals());
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const resolve = async (id: string, action: "approve" | "reject" | "edit", body?: string) => {
    if (!window.confirm(`${action === "reject" ? "Reject" : "Approve"} this draft? The demo updates history but does not deliver an email.`)) return;
    setBusy(id);
    await api.resolveApproval(id, action, body);
    setEditingId(null);
    await load();
    setBusy(null);
  };

  if (loading) return <PageLoader label="Loading approval queue…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Approval queue</h1>
        <p className="text-sm text-foreground/55">
          Review AI-drafted reminders. Approval updates demo history; no email is sent.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Queue is empty"
          description="No messages waiting for approval."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{item.customerName}</p>
                  <p className="text-xs text-foreground/45">
                    {item.stage} · {formatRelative(item.createdAt)}
                  </p>
                </div>
                <Link href={`/app/invoices/${item.invoiceId}`}>
                  <Button variant="outline" size="sm">
                    View invoice
                  </Button>
                </Link>
              </CardHeader>
              <CardBody className="space-y-4">
                {editingId === item.id ? (
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={6}
                  />
                ) : (
                  <p className="whitespace-pre-wrap rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm text-foreground/80">
                    {item.draftBody}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {editingId === item.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => void resolve(item.id, "edit", editBody)}
                        disabled={busy === item.id}
                      >
                        Save & approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => void resolve(item.id, "approve")}
                        disabled={busy === item.id}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditBody(item.draftBody);
                        }}
                        disabled={busy === item.id}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void resolve(item.id, "reject")}
                        disabled={busy === item.id}
                      >
                        Reject
                      </Button>
                      <Link href={`/app/conversations/${item.conversationId}`}>
                        <Button size="sm" variant="outline">
                          Open thread
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
