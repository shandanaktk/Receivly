"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import type { Customer, Invoice } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, invs] = await Promise.all([
      api.getCustomer(id),
      api.getInvoices(),
    ]);
    setCustomer(c);
    setInvoices(invs.filter((i) => i.customerId === id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !customer) return <PageLoader label="Loading customer…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/app/customers" className="text-sm text-white/50 hover:text-white">
            ← Customers
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{customer.name}</h1>
          <p className="text-sm text-white/55">{customer.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge status={customer.status} />
            {customer.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Link href="/app/invoices/new">
          <Button size="sm">Create invoice</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-white/55">Outstanding</p>
            <p className="text-xl font-semibold">
              {formatMoney(customer.outstandingBalance, customer.currency)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-white/55">Overdue</p>
            <p className="text-xl font-semibold text-rose-300">
              {formatMoney(customer.overdueBalance, customer.currency)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-white/55">Last contact</p>
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
                  className="rounded-xl border border-white/10 px-3 py-2.5 text-sm"
                >
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-white/55">{contact.email}</p>
                  {contact.phone ? <p className="text-white/45">{contact.phone}</p> : null}
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
          <CardBody className="space-y-3 text-sm text-white/70">
            {customer.notes ? <p>{customer.notes}</p> : <p className="text-white/45">No notes yet.</p>}
            {customer.billingAddress ? (
              <p>
                <span className="text-white/45">Address: </span>
                {customer.billingAddress}
              </p>
            ) : null}
            {customer.taxReference ? (
              <p>
                <span className="text-white/45">Tax ref: </span>
                {customer.taxReference}
              </p>
            ) : null}
            <p>
              <span className="text-white/45">Country: </span>
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
            <p className="px-5 py-8 text-center text-sm text-white/50">No invoices for this customer.</p>
          ) : (
            <div className="-mx-4 overflow-x-auto md:mx-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="px-5 py-3 font-medium">Number</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Due</th>
                    <th className="px-5 py-3 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <Link href={`/app/invoices/${inv.id}`} className="font-medium hover:text-fuchsia-300">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-white/60">{formatDate(inv.dueDate)}</td>
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
    </div>
  );
}
