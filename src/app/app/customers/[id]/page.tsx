"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import type { Conversation, Customer, Invoice, TimelineEvent } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activity, setActivity] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, invs, threads] = await Promise.all([
      api.getCustomer(id),
      api.getInvoices(),
      api.getConversations(),
    ]);
    const customerInvoices = invs.filter((i) => i.customerId === id);
    setCustomer(c);
    setInvoices(customerInvoices);
    setConversations(threads.filter((thread) => thread.customerId === id));
    setActivity((await Promise.all(customerInvoices.map((invoice) => api.getTimeline(invoice.id)))).flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  if (loading || !customer) return <PageLoader label="Loading customer…" />;

  const toggleArchive = async () => {
    const archive = customer.status !== "archived";
    if (!window.confirm(`${archive ? "Archive" : "Restore"} ${customer.name}? ${archive ? "Its invoice history stays available." : "It will return to active lists."}`)) return;
    setCustomer(await api.saveCustomer({ ...customer, status: archive ? "archived" : "active" }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/app/customers" className="text-sm text-foreground/50 hover:text-foreground">
            ← Customers
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{customer.name}</h1>
          <p className="text-sm text-foreground/55">{customer.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge status={customer.status} />
            {customer.doNotContact && <Badge status="paused">Do not contact</Badge>}
            {customer.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs text-foreground/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2"><Link href={`/app/customers/${id}/edit`}><Button size="sm" variant="outline">Edit customer</Button></Link><Button size="sm" variant="secondary" onClick={() => void toggleArchive()}>{customer.status === "archived" ? "Restore" : "Archive"}</Button><Link href="/app/invoices/new"><Button size="sm">Create invoice</Button></Link></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-foreground/55">Outstanding</p>
            <p className="text-xl font-semibold">
              {formatMoney(customer.outstandingBalance, customer.currency)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-foreground/55">Overdue</p>
            <p className="text-xl font-semibold text-rose-300">
              {formatMoney(customer.overdueBalance, customer.currency)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-foreground/55">Last contact</p>
            <p className="text-xl font-semibold">{formatRelative(customer.lastContactDate)}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-medium">Contacts</h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-3">
              {customer.contacts.map((contact) => (
                <li
                  key={contact.id}
                  className="rounded-xl border border-foreground/10 px-3 py-2.5 text-sm"
                >
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-foreground/55">{contact.email}</p>
                  {contact.phone ? <p className="text-foreground/45">{contact.phone}</p> : null}
                  {contact.isBillingContact ? (
                    <Badge status="active" className="mt-2">
                      Billing contact
                    </Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Notes & details</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-foreground/70">
            {customer.notes ? <p>{customer.notes}</p> : <p className="text-foreground/45">No notes yet.</p>}
            {customer.billingAddress ? (
              <p>
                <span className="text-foreground/45">Address: </span>
                {customer.billingAddress}
              </p>
            ) : null}
            {customer.taxReference ? (
              <p>
                <span className="text-foreground/45">Tax ref: </span>
                {customer.taxReference}
              </p>
            ) : null}
            <p>
              <span className="text-foreground/45">Country: </span>
              {customer.country}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Invoices ({invoices.length})</h2>
        </CardHeader>
        <CardBody className="p-0">
          {invoices.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-foreground/50">No invoices for this customer.</p>
          ) : (
            <div className="-mx-4 overflow-x-auto md:mx-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-foreground/50">
                    <th className="px-5 py-3 font-medium">Number</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Due</th>
                    <th className="px-5 py-3 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
                      <td className="px-5 py-3">
                        <Link href={`/app/invoices/${inv.id}`} className="font-medium hover:text-fuchsia-300">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-foreground/60">{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-3 text-right">
                        {formatMoney(inv.balance, inv.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><h2 className="font-medium">Promises & disputes</h2></CardHeader><CardBody className="space-y-3">
          {conversations.filter((c) => c.disputed || c.paymentClaimed || c.aiCategory === "payment_promise").length ? conversations.filter((c) => c.disputed || c.paymentClaimed || c.aiCategory === "payment_promise").map((thread) => <Link key={thread.id} href={`/app/conversations/${thread.id}`} className="block rounded-xl border border-foreground/10 p-3 text-sm hover:bg-foreground/[0.04]"><p className="font-medium">{thread.subject}</p><p className="mt-1 text-foreground/55">{thread.pauseReason || thread.nextAction}</p></Link>) : <p className="text-sm text-foreground/50">No promises or disputes recorded.</p>}
        </CardBody></Card>
        <Card><CardHeader><h2 className="font-medium">Reminder & audit activity</h2></CardHeader><CardBody>
          {activity.length ? <ul className="space-y-3">{activity.slice(0, 8).map((event) => <li key={event.id} className="border-l border-violet-400/30 pl-3 text-sm"><p className="font-medium">{event.title}</p><p className="text-foreground/50">{formatDate(event.createdAt)} · {event.actor || "System"}</p></li>)}</ul> : <p className="text-sm text-foreground/50">No activity yet.</p>}
        </CardBody></Card>
      </div>
    </div>
  );
}
