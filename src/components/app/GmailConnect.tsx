"use client";

import { GmailLogo } from "@/components/app/GmailLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { useState } from "react";

export function GmailConnect({
  email,
  onChange,
  compact = false,
}: {
  email?: string;
  onChange: (email?: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(email || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const connect = async () => {
    setError("");
    setSaving(true);
    try {
      const workspace = await api.connectGmail(value);
      onChange(workspace.gmailEmail);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect Gmail.");
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    setSaving(true);
    const workspace = await api.disconnectGmail();
    onChange(workspace.gmailEmail);
    setValue("");
    setSaving(false);
  };

  return (
    <>
      <div className={compact ? "flex flex-wrap items-center gap-3" : "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3"}>
        <div className="flex min-w-0 items-center gap-3">
          <GmailLogo />
          <div className="min-w-0">
            <p className="text-sm font-medium">{email ? "Gmail connected" : "Connect Gmail"}</p>
            <p className="truncate text-xs text-foreground/55">
              {email ? `Reminders send from ${email}` : "Unpaid and late invoice emails send from your Google account."}
            </p>
          </div>
        </div>
        {email ? (
          <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => void disconnect()}>Disconnect</Button>
        ) : (
          <Button type="button" size="sm" onClick={() => { setValue(email || ""); setError(""); setOpen(true); }}>Connect Gmail</Button>
        )}
      </div>
      <Modal
        open={open}
        title="Connect Gmail"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" disabled={saving} onClick={() => void connect()}>{saving ? "Connecting…" : "Connect"}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-foreground/70">Use the Gmail address Receivly should send invoice reminders from. This demo saves the account in your workspace. It does not ask for your Google password, and no email leaves the browser.</p>
          <Input label="Gmail address" type="email" value={value} autoComplete="email" placeholder="you@gmail.com" onChange={(event) => setValue(event.target.value)} />
          {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
        </div>
      </Modal>
    </>
  );
}
