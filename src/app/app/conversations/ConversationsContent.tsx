"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatRelative, statusLabel } from "@/lib/format";
import type { Conversation, ConversationFilter } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const FILTERS: { value: ConversationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "needs_approval", label: "Needs approval" },
  { value: "disputed", label: "Disputed" },
  { value: "payment_claimed", label: "Payment claimed" },
  { value: "failed", label: "Failed" },
  { value: "promise_missed", label: "Promise missed" },
  { value: "low_confidence", label: "Low confidence" },
];

export function ConversationsContent() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get("filter") as ConversationFilter) || "all";
  const [filter, setFilter] = useState<ConversationFilter>(initialFilter);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await api.getConversations(filter);
    setConversations(list);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <p className="text-sm text-foreground/55">Unified inbox for collection threads</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`filter-pill shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
              filter === f.value
                ? "bg-gradient-to-r from-fuchsia-500/30 to-blue-600/30 text-foreground"
                : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader label="Loading conversations…" />
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No conversations"
          description={`No threads match the "${statusLabel(filter)}" filter.`}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="-mx-4 overflow-x-auto md:mx-0">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-foreground/50">
                    <th className="px-5 py-3 font-medium">Subject</th>
                    <th className="px-5 py-3 font-medium">Flags</th>
                    <th className="px-5 py-3 font-medium">AI category</th>
                    <th className="px-5 py-3 font-medium">Last message</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((c) => (
                    <tr key={c.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
                      <td className="px-5 py-3">
                        <Link
                          href={`/app/conversations/${c.id}`}
                          className={`font-medium hover:text-fuchsia-300 ${c.unread ? "text-foreground" : "text-foreground/70"}`}
                        >
                          {c.subject}
                          {c.unread ? (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-fuchsia-400" />
                          ) : null}
                        </Link>
                        {c.nextAction ? (
                          <p className="text-xs text-foreground/45">{c.nextAction}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.needsApproval ? <Badge status="medium">Approval</Badge> : null}
                          {c.disputed ? <Badge status="disputed">Disputed</Badge> : null}
                          {c.paymentClaimed ? <Badge status="payment_claimed">Paid claim</Badge> : null}
                          {c.failed ? <Badge status="overdue">Failed</Badge> : null}
                          {c.promiseMissed ? <Badge status="overdue">Missed</Badge> : null}
                          {c.lowConfidence ? <Badge status="low">Low conf.</Badge> : null}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-foreground/60">
                        {c.aiCategory ? statusLabel(c.aiCategory) : "—"}
                        {c.aiConfidence != null ? (
                          <span className="ml-1 text-xs text-foreground/40">
                            ({Math.round(c.aiConfidence * 100)}%)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-foreground/50">{formatRelative(c.lastMessageAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
