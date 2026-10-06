"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/contexts/AuthContext";
import type { NotificationPreferences } from "@/types";
import { useState } from "react";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern (US)" },
  { value: "America/Chicago", label: "Central (US)" },
  { value: "America/Los_Angeles", label: "Pacific (US)" },
  { value: "Europe/London", label: "London" },
  { value: "UTC", label: "UTC" },
];

const LOCALES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
];

const NOTIF_KEYS: { key: keyof NotificationPreferences; label: string }[] = [
  { key: "disputes", label: "Invoice disputes" },
  { key: "paymentClaims", label: "Payment claims" },
  { key: "extensionRequests", label: "Extension requests" },
  { key: "lowConfidence", label: "Low-confidence AI replies" },
  { key: "messageFailures", label: "Message delivery failures" },
  { key: "missedPromises", label: "Missed payment promises" },
  { key: "upcomingPromises", label: "Upcoming promise dates" },
  { key: "subscriptionIssues", label: "Subscription issues" },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordMsg, setPasswordMsg] = useState("");

  if (!user) return null;

  const saveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updatePassword = () => {
    if (passwords.next.length < 8) {
      setPasswordMsg("New password must be at least 8 characters.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg("Passwords do not match.");
      return;
    }
    setPasswordMsg("Demo: password updated successfully.");
    setPasswords({ current: "", next: "", confirm: "" });
  };

  const togglePref = (key: keyof NotificationPreferences) => {
    if (key === "digest") return;
    updateUser({
      notificationPreferences: {
        ...user.notificationPreferences,
        [key]: !user.notificationPreferences[key],
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-foreground/55">{user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Personal info</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Full name"
            value={user.name}
            onChange={(e) => updateUser({ name: e.target.value })}
          />
          <Input
            label="Job role"
            value={user.jobRole || ""}
            onChange={(e) => updateUser({ jobRole: e.target.value })}
          />
          <Input label="Avatar URL (optional)" type="url" value={user.avatarUrl || ""} onChange={(e) => updateUser({ avatarUrl: e.target.value })} hint="A profile photo appears beside your account when connected to storage." />
          <Select
            label="Timezone"
            value={user.timezone}
            onChange={(e) => updateUser({ timezone: e.target.value })}
            options={TIMEZONES}
          />
          <Select
            label="Locale"
            value={user.locale}
            onChange={(e) => updateUser({ locale: e.target.value })}
            options={LOCALES}
          />
          <Button onClick={saveProfile}>{saved ? "Saved!" : "Save profile"}</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Change password</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
          <Input
            label="New password"
            type="password"
            value={passwords.next}
            onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
          />
          <Input
            label="Confirm new password"
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
          {passwordMsg ? <p className="text-sm text-foreground/60">{passwordMsg}</p> : null}
          <Button variant="secondary" onClick={updatePassword}>
            Update password
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Notification preferences</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {NOTIF_KEYS.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-foreground/80">{label}</span>
              <input
                type="checkbox"
                checked={Boolean(user.notificationPreferences[key])}
                onChange={() => togglePref(key)}
                className="rounded border-foreground/20"
              />
            </label>
          ))}
          <Select
            label="Email digest"
            value={user.notificationPreferences.digest}
            onChange={(e) =>
              updateUser({
                notificationPreferences: {
                  ...user.notificationPreferences,
                  digest: e.target.value as NotificationPreferences["digest"],
                },
              })
            }
            options={[
              { value: "off", label: "Off" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
            ]}
          />
        </CardBody>
      </Card>
      <Card><CardHeader><h2 className="font-medium">Account deletion</h2></CardHeader><CardBody className="space-y-3 text-sm text-foreground/65"><p>Deletion requires identity verification and a retention review. Workspace owners must close or transfer their workspace first.</p><a href={`mailto:support@receivly.ai?subject=${encodeURIComponent("Account deletion request")}&body=${encodeURIComponent(`Account: ${user.email}`)}`} className="inline-block rounded-full border border-rose-500/30 px-4 py-2 font-medium text-rose-300 hover:bg-rose-500/10">Request account deletion</a><p className="text-xs text-foreground/45">The verified request workflow will be connected with the backend.</p></CardBody></Card>
    </div>
  );
}
