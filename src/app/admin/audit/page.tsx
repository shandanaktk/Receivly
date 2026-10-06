"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { AuditLogEntry } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Filters {
  workspace: string;
  user: string;
  action: string;
  entity: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_FILTERS: Filters = {
  workspace: "",
  user: "",
  action: "",
  entity: "",
  dateFrom: "",
  dateTo: "",
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.getAuditLogs();
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (filters.workspace && !(log.workspaceId || "").toLowerCase().includes(filters.workspace.toLowerCase())) {
        return false;
      }
      if (filters.user && !log.user.toLowerCase().includes(filters.user.toLowerCase())) {
        return false;
      }
      if (filters.action && !log.action.toLowerCase().includes(filters.action.toLowerCase())) {
        return false;
      }
      if (filters.entity && !log.entity.toLowerCase().includes(filters.entity.toLowerCase())) {
        return false;
      }
      if (filters.dateFrom && log.date.slice(0, 10) < filters.dateFrom) return false;
      if (filters.dateTo && log.date.slice(0, 10) > filters.dateTo) return false;
      return true;
    });
  }, [logs, filters]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <PageLoader label="Loading audit log…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Immutable activity trail across workspaces — filter by tenant, user, action, entity, or date range.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Filters</h2>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Workspace ID"
              placeholder="ws_demo"
              value={filters.workspace}
              onChange={(e) => updateFilter("workspace", e.target.value)}
            />
            <Input
              label="User"
              placeholder="Alex Morgan"
              value={filters.user}
              onChange={(e) => updateFilter("user", e.target.value)}
            />
            <Input
              label="Action"
              placeholder="invoice.sent"
              value={filters.action}
              onChange={(e) => updateFilter("action", e.target.value)}
            />
            <Input
              label="Entity"
              placeholder="NW-1045"
              value={filters.entity}
              onChange={(e) => updateFilter("entity", e.target.value)}
            />
            <Input
              label="Date from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
            />
            <Input
              label="Date to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear filters
            </Button>
            <span className="self-center text-sm text-foreground/45">
              {filtered.length} of {logs.length} entries
            </span>
          </div>
        </CardBody>
      </Card>

      <div className="hidden overflow-hidden rounded-2xl border border-foreground/10 md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-foreground/10 bg-foreground/[0.03] text-foreground/55">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Workspace</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
                <td className="whitespace-nowrap px-4 py-3 text-foreground/70">
                  {formatDate(log.date, "MMM d, yyyy h:mm a")}
                </td>
                <td className="px-4 py-3">{log.user}</td>
                <td className="px-4 py-3">
                  <Badge status="sent">{log.action}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{log.entity}</td>
                <td className="px-4 py-3 text-foreground/60">{log.workspaceId || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground/50">{log.ip || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-foreground/50">No audit entries match your filters.</p>
        ) : null}
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((log) => (
          <Card key={log.id}>
            <CardBody className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge status="sent">{log.action}</Badge>
                <span className="text-xs text-foreground/45">
                  {formatDate(log.date, "MMM d, h:mm a")}
                </span>
              </div>
              <p>
                <span className="text-foreground/55">Entity:</span> {log.entity}
              </p>
              <p>
                <span className="text-foreground/55">User:</span> {log.user}
              </p>
              <p>
                <span className="text-foreground/55">Workspace:</span> {log.workspaceId || "—"}
              </p>
              {log.ip ? (
                <p className="font-mono text-xs text-foreground/45">IP {log.ip}</p>
              ) : null}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
