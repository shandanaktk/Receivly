"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { readLogoFile } from "@/lib/logo";
import { formatRelative } from "@/lib/format";
import type { TeamMember, UserRole, Workspace } from "@/types";
import { useCallback, useEffect, useState } from "react";

const TABS = ["workspace", "team", "roles", "data & closure"] as const;
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
  const [logoError, setLogoError] = useState("");
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
    void Promise.resolve().then(load);
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

  const changeRole = async (id: string, role: UserRole) => {
    await api.updateTeamMember(id, { role });
    setTeam(await api.getTeam());
  };

  const removeMember = async (member: TeamMember) => {
    if (!window.confirm(`Remove ${member.email} from this workspace? Their historical actions remain in the audit trail.`)) return;
    await api.updateTeamMember(member.id, { status: "removed" });
    setTeam(await api.getTeam());
  };

  if (loading || !workspace) return <PageLoader label="Loading settings…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-foreground/55">Workspace, team, and roles</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-foreground/10 pb-px">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-4 py-2 text-sm capitalize transition ${
              tab === t
                ? "border-fuchsia-500 text-foreground"
                : "border-transparent text-foreground/50 hover:text-foreground"
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
            <div className="grid gap-4 sm:grid-cols-2"><Input label="Country" value={workspace.country} onChange={(e) => setWorkspace({ ...workspace, country: e.target.value })} /><Select label="Default currency" value={workspace.currency} onChange={(e) => setWorkspace({ ...workspace, currency: e.target.value })} options={["USD", "CAD", "GBP", "EUR"].map((value) => ({ value, label: value }))} /><Input label="Tax ID" value={workspace.taxId || ""} onChange={(e) => setWorkspace({ ...workspace, taxId: e.target.value })} /><div className="space-y-2 text-xs"><span className="font-medium text-foreground/80">Logo</span><div className="flex items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-foreground/15 bg-foreground/[0.03]">{workspace.logoUrl ? <img src={workspace.logoUrl} alt={`${workspace.companyName} logo`} className="h-full w-full object-contain" /> : <span className="text-[10px] text-foreground/40">None</span>}</div><label className="cursor-pointer rounded-full border border-foreground/15 px-3 py-2 text-xs font-medium hover:bg-foreground/5">Upload<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; void readLogoFile(file).then((logoUrl) => { setLogoError(""); setWorkspace({ ...workspace, logoUrl }); }).catch((err) => setLogoError(err instanceof Error ? err.message : "Could not upload that logo.")); }} /></label>{workspace.logoUrl ? <button type="button" className="text-xs text-foreground/55 hover:text-foreground" onClick={() => setWorkspace({ ...workspace, logoUrl: "" })}>Remove</button> : null}</div>{logoError ? <p role="alert" className="text-rose-300">{logoError}</p> : <p className="text-foreground/45">Shown on invoices. Save the workspace to keep it.</p>}</div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Invoice prefix"
                value={workspace.invoicePrefix}
                onChange={(e) => setWorkspace({ ...workspace, invoicePrefix: e.target.value })}
              />
              <Input label="Next invoice number" type="number" min={1} value={workspace.nextInvoiceNumber} onChange={(e) => setWorkspace({ ...workspace, nextInvoiceNumber: Number(e.target.value) })} />
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
            <p className="text-sm text-foreground/50">Invoice numbering is unique within this workspace. Existing numbers remain unchanged.</p>
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
                    <tr className="border-b border-foreground/10 text-foreground/50">
                      <th className="px-5 py-3 font-medium">Member</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Invited</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.filter((m) => m.status !== "removed").map((m) => (
                      <tr key={m.id} className="border-b border-foreground/5">
                        <td className="px-5 py-3">
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-foreground/45">{m.email}</p>
                        </td>
                        <td className="px-5 py-3"><select aria-label={`Role for ${m.email}`} value={m.role} onChange={(e) => void changeRole(m.id, e.target.value as UserRole)} className="rounded-lg border border-foreground/15 bg-elevated px-2 py-1.5 text-sm">{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></td>
                        <td className="px-5 py-3">
                          <Badge status={m.status === "active" ? "active" : "draft"}>
                            {m.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-foreground/50">{formatRelative(m.invitedAt)} <button type="button" className="ml-2 text-rose-300 hover:underline" onClick={() => void removeMember(m)}>Remove</button></td>
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
              <div key={role.value} className="rounded-xl border border-foreground/10 p-4">
                <p className="font-medium">{role.label}</p>
                <p className="mt-1 text-sm text-foreground/55">
                  {ROLE_DESCRIPTIONS[role.value] || "Standard workspace permissions."}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {tab === "data & closure" && <Card><CardHeader><h2 className="font-medium">Data rights & workspace closure</h2></CardHeader><CardBody className="space-y-4 text-sm text-foreground/65"><p>Workspace exports include only records your team can access. Account deletion and workspace closure require identity checks and a retention review before data is removed.</p><div className="rounded-xl border border-foreground/10 bg-foreground/[0.025] p-4"><p className="font-semibold text-foreground">Before closing a workspace</p><ul className="mt-2 list-inside list-disc space-y-1"><li>Export customer and invoice records.</li><li>Review open invoices and pending collection actions.</li><li>Confirm the owner, retention window, and billing status.</li></ul></div><a href="mailto:support@receivly.ai?subject=Workspace%20closure%20request" className="inline-block rounded-full border border-foreground/20 px-4 py-2 font-medium text-foreground hover:bg-foreground/[0.05]">Request controlled closure</a><p className="text-xs text-foreground/45">The request flow will connect to backend verification in Milestone 2.</p></CardBody></Card>}
    </div>
  );
}
