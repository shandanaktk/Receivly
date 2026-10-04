"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    primaryContact: "",
    email: "",
    phone: "",
    billingAddress: "",
    country: "United States",
    currency: "USD",
    taxReference: "",
    notes: "",
    tags: "",
    language: "en",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const customer = await api.saveCustomer({
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      router.push(`/app/customers/${customer.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save customer");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add customer</h1>
        <p className="text-sm text-white/55">Create a new customer record</p>
      </div>

      <form onSubmit={(e) => void submit(e)}>
        <Card>
          <CardHeader>
            <h2 className="font-medium">Customer details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <Input
              label="Company / customer name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Primary contact"
              value={form.primaryContact}
              onChange={(e) => setForm({ ...form, primaryContact: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Textarea
              label="Billing address"
              value={form.billingAddress}
              onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
              <Select
                label="Currency"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                options={[
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                  { value: "GBP", label: "GBP" },
                  { value: "CAD", label: "CAD" },
                ]}
              />
            </div>
            <Input
              label="Tax reference"
              value={form.taxReference}
              onChange={(e) => setForm({ ...form, taxReference: e.target.value })}
            />
            <Input
              label="Tags (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="retainer, priority"
            />
            <Textarea
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create customer"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
