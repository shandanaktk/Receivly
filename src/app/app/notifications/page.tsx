"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import type { NotificationItem } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setNotifications(await api.getNotifications());
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const markRead = async (id: string) => {
    await api.markNotificationRead(id);
    await load();
  };

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    await load();
  };

  const filtered = notifications.filter((n) => (filter === "unread" ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-foreground/55">
            {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button size="sm" variant="outline" onClick={() => void markAllRead()}>
            Mark all read
          </Button>
        ) : null}
      </div>

      <div className="flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`filter-pill rounded-full px-3 py-1.5 text-sm capitalize ${
              filter === f ? "bg-foreground/10 text-foreground" : "text-foreground/50 hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader label="Loading notifications…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={filter === "unread" ? "You're all caught up." : "Notifications will appear here."}
        />
      ) : (
        <Card>
          <CardBody className="divide-y divide-foreground/10 p-0">
            {filtered.map((n) => (
              <div
                key={n.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.read ? <Badge status="medium">New</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-foreground/60">{n.body}</p>
                  <p className="mt-1 text-xs text-foreground/40">{formatRelative(n.createdAt)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {n.href ? (
                    <Link href={n.href}>
                      <Button size="sm" variant="secondary">
                        View
                      </Button>
                    </Link>
                  ) : null}
                  {!n.read ? (
                    <Button size="sm" variant="ghost" onClick={() => void markRead(n.id)}>
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
