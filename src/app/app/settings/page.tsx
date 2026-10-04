"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatRelative, statusLabel } from "@/lib/format";
import type { TeamMember, UserRole, Workspace } from "@/types";
import { useCallback, useEffect, useState } from "react";

const TABS = ["workspace", "team", "roles"] as const;
type Tab = (typeof TABS)[number];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "finance_manager", label: "Finance manager" },
  { value: "viewer", label: "Viewer" },
  { value: "member", label: "Member" },
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Full workspace access, billing, and team management.",
  finance_manager: "Manage invoices, customers, and collection settings.",
  viewer: "Read-only access to reports and invoices.",
  member: "Basic access to assigned items.",
};

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("workspace");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("finance_manager");

  const load = useCallback(async () => {
    setLoading(true);
    const [ws, tm] = await Promise.all([api.getWorkspace(), api.getTeam()]);
    setWorkspace(ws);
    setTeam(tm);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveWorkspace = async () => {
    if (!workspace) return;
    setSaving(true);
    setWorkspace(await api.updateWorkspace(workspace));
    setSaving(false);
  };

  const invite = async () => {
    if (!inviteEmail) return;
    setSaving(true);
    await api.inviteTeamMember(inviteEmail, inviteRole);
    setInviteEmail("");
    await load();
    setSaving(false);
  };

  if (loading || !workspace) return <PageLoader label="Loading settings…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-white/55">Workspace, team, and roles</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-px">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-4 py-2 text-sm capitalize transition ${
              tab === t
                ? "border-fuchsia-500 text-white"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "workspace" && (
        <Card>
          <CardHeader>
            <h2 className="font-medium">Workspace profile</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Company name"
              value={workspace.companyName}
              onChange={(e) => setWorkspace({ ...workspace, companyName: e.target.value })}
            />
            <Input
              label="Legal name"
              value={workspace.legalName || ""}
              onChange={(e) => setWorkspace({ ...workspace, legalName: e.target.value })}
            />
            <Input
              label="Support email"
              type="email"
              value={workspace.supportEmail}
              onChange={(e) => setWorkspace({ ...workspace, supportEmail: e.target.value })}
            />
            <Input
              label="Address"
              value={workspace.address || ""}
              onChange={(e) => setWorkspace({ ...workspace, address: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Invoice prefix"
                value={workspace.invoicePrefix}
                onChange={(e) => setWorkspace({ ...workspace, invoicePrefix: e.target.value })}
              />
              <Select
                label="Timezone"
                value={workspace.timezone}
                onChange={(e) => setWorkspace({ ...workspace, timezone: e.target.value })}
                options={[
                  { value: "America/New_York", label: "Eastern (US)" },
                  { value: "America/Chicago", label: "Central (US)" },
                  { value: "America/Los_Angeles", label: "Pacific (US)" },
                  { value: "Europe/London", label: "London" },
                  { value: "UTC", label: "UTC" },
                ]}
              />
            </div>
            <Button onClick={() => void saveWorkspace()} disabled={saving}>
              {saving ? "Saving…" : "Save workspace"}
            </Button>
          </CardBody>
        </Card>
      )}

      {tab === "team" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-medium">Invite team member</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                label="Email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Select
                label="Role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                options={ROLE_OPTIONS}
              />
              <Button onClick={() => void invite()} disabled={saving || !inviteEmail}>
                Send invite
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-medium">Team members</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="px-5 py-3 font-medium">Member</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Invited</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((m) => (
                      <tr key={m.id} className="border-b border-white/5">
                        <td className="px-5 py-3">
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-white/45">{m.email}</p>
                        </td>
                        <td className="px-5 py-3">{statusLabel(m.role)}</td>
                        <td className="px-5 py-3">
                          <Badge status={m.status === "active" ? "active" : "draft"}>
                            {m.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-white/50">{formatRelative(m.invitedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === "roles" && (
        <Card>
          <CardHeader>
            <h2 className="font-medium">Role permissions</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {ROLE_OPTIONS.map((role) => (
              <div key={role.value} className="rounded-xl border border-white/10 p-4">
                <p className="font-medium">{role.label}</p>
                <p className="mt-1 text-sm text-white/55">
                  {ROLE_DESCRIPTIONS[role.value] || "Standard workspace permissions."}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
