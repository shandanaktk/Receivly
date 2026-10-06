"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { Customer, CustomerContact } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { void api.getCustomer(id).then(setCustomer).catch(() => setError("Customer not found.")); }, [id]);
  if (!customer) return error ? <p role="alert" className="text-rose-300">{error}</p> : <PageLoader label="Loading customer…" />;
  const patch = (values: Partial<Customer>) => setCustomer((current) => current ? { ...current, ...values } : current);
  const updateContact = (contactId: string, values: Partial<CustomerContact>) => patch({ contacts: customer.contacts.map((c) => c.id === contactId ? { ...c, ...values } : c) });

  const save = async () => {
    if (!customer.name.trim() || !/^\S+@\S+\.\S+$/.test(customer.email)) { setError("Enter a customer name and valid email."); return; }
    if (!customer.contacts.some((c) => c.isBillingContact)) { setError("Choose one billing contact."); return; }
    if (customer.contacts.some((c) => !c.name.trim() || !/^\S+@\S+\.\S+$/.test(c.email))) { setError("Each contact needs a name and valid email."); return; }
    setSaving(true); setError("");
    try { await api.saveCustomer(customer); router.push(`/app/customers/${id}`); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save customer."); }
    finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-3xl space-y-6"><div><button className="text-sm text-foreground/55 hover:text-foreground" onClick={() => router.back()}>← Back</button><h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit customer</h1><p className="mt-1 text-sm text-foreground/55">Keep billing details and contacts in one record.</p></div>{error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
    <Card><CardHeader><h2 className="font-semibold">Customer details</h2></CardHeader><CardBody className="grid gap-4 sm:grid-cols-2"><Input label="Customer name" value={customer.name} onChange={(e) => patch({ name: e.target.value })} /><Input label="Primary email" type="email" value={customer.email} onChange={(e) => patch({ email: e.target.value })} /><Input label="Primary contact" value={customer.primaryContact} onChange={(e) => patch({ primaryContact: e.target.value })} /><Input label="Phone" value={customer.phone || ""} onChange={(e) => patch({ phone: e.target.value })} /><Input label="Country" value={customer.country} onChange={(e) => patch({ country: e.target.value })} /><Select label="Currency" value={customer.currency} onChange={(e) => patch({ currency: e.target.value })} options={["USD", "CAD", "GBP", "EUR"].map((v) => ({ value: v, label: v }))} /><Input label="Tax / reference number" value={customer.taxReference || ""} onChange={(e) => patch({ taxReference: e.target.value })} /><Input label="Tags (comma separated)" value={customer.tags.join(", ")} onChange={(e) => patch({ tags: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })} /><Select label="Language preference" value={customer.language} onChange={(e) => patch({ language: e.target.value })} options={[{ value: "en", label: "English" }, { value: "fr", label: "French" }, { value: "de", label: "German" }]} /><div className="flex items-end"><label className="flex items-center gap-3 rounded-xl border border-foreground/10 p-3 text-sm"><input type="checkbox" checked={Boolean(customer.doNotContact)} onChange={(e) => patch({ doNotContact: e.target.checked, collectorPaused: e.target.checked || customer.collectorPaused })} /> Do not contact · suppress automation</label></div><div className="sm:col-span-2"><Textarea label="Billing address" value={customer.billingAddress || ""} onChange={(e) => patch({ billingAddress: e.target.value })} /></div><div className="sm:col-span-2"><Textarea label="Internal notes" value={customer.notes || ""} onChange={(e) => patch({ notes: e.target.value })} /></div></CardBody></Card>
    <Card><CardHeader className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Contacts</h2><p className="text-sm text-foreground/50">One contact receives billing email by default.</p></div><Button size="sm" variant="outline" onClick={() => patch({ contacts: [...customer.contacts, { id: `cc_${crypto.randomUUID()}`, name: "", email: "", isBillingContact: false }] })}><Plus size={15} /> Add</Button></CardHeader><CardBody className="space-y-4">{customer.contacts.map((contact) => <div key={contact.id} className="rounded-xl border border-foreground/10 p-4"><div className="grid gap-3 sm:grid-cols-2"><Input label="Name" value={contact.name} onChange={(e) => updateContact(contact.id, { name: e.target.value })} /><Input label="Email" type="email" value={contact.email} onChange={(e) => updateContact(contact.id, { email: e.target.value })} /><Input label="Phone" value={contact.phone || ""} onChange={(e) => updateContact(contact.id, { phone: e.target.value })} /><div className="flex items-end justify-between gap-2"><label className="flex items-center gap-2 text-sm"><input type="radio" name="billingContact" checked={contact.isBillingContact} onChange={() => patch({ contacts: customer.contacts.map((c) => ({ ...c, isBillingContact: c.id === contact.id })) })} /> Billing contact</label><Button size="sm" variant="ghost" disabled={customer.contacts.length === 1} aria-label={`Remove ${contact.name || "contact"}`} onClick={() => patch({ contacts: customer.contacts.filter((c) => c.id !== contact.id) })}><Trash2 size={15} /></Button></div></div></div>)}</CardBody></Card>
    <div className="flex flex-wrap gap-3"><Button disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save changes"}</Button><Button variant="ghost" onClick={() => router.back()}>Cancel</Button></div>
  </div>;
}
