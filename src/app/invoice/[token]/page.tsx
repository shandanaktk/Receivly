"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { APP_NAME } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import type { Customer, Invoice, Workspace } from "@/types";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function PublicInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getPublicInvoice(token);
      setInvoice(data.invoice);
      setCustomer(data.customer);
      setWorkspace(data.workspace);
    } catch {
      setError("Invoice not found or link has expired.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050f] text-white">
        <PageLoader label="Loading invoice…" />
      </div>
    );
  }

  if (error || !invoice || !customer || !workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05050f] px-4 text-white">
        <Card className="max-w-md w-full">
          <CardBody className="text-center">
            <p className="text-lg font-medium">{error || "Invoice unavailable"}</p>
            <p className="mt-2 text-sm text-white/55">
              Contact {workspace?.supportEmail || "the sender"} if you believe this is an error.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050f] text-white">
      <header className="border-b border-white/10 bg-[#070712]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs text-white/45">Powered by {APP_NAME}</p>
            <p className="font-semibold">{workspace.companyName}</p>
          </div>
          <Badge status={invoice.status} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold sm:text-3xl">Invoice {invoice.number}</h1>
          <p className="mt-1 text-white/55">
            Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-white/45">Bill to</p>
              <p className="mt-2 font-medium">{customer.name}</p>
              <p className="text-sm text-white/60">{customer.email}</p>
              {customer.billingAddress ? (
                <p className="mt-2 text-sm text-white/50">{customer.billingAddress}</p>
              ) : null}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-white/45">From</p>
              <p className="mt-2 font-medium">{workspace.companyName}</p>
              {workspace.address ? (
                <p className="text-sm text-white/50">{workspace.address}</p>
              ) : null}
              <p className="mt-2 text-sm text-white/60">{workspace.supportEmail}</p>
            </CardBody>
          </Card>
        </div>

        <Card className="mb-6">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium text-right">Qty</th>
                    <th className="px-5 py-3 font-medium text-right">Rate</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((li) => {
                    const lineTotal =
                      li.quantity * li.rate * (1 + li.taxRate / 100) - li.discount;
                    return (
                      <tr key={li.id} className="border-b border-white/5">
                        <td className="px-5 py-3">{li.description}</td>
                        <td className="px-5 py-3 text-right">{li.quantity}</td>
                        <td className="px-5 py-3 text-right">
                          {formatMoney(li.rate, invoice.currency)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {formatMoney(lineTotal, invoice.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10">
                    <td colSpan={3} className="px-5 py-4 text-right font-medium">
                      Total due
                    </td>
                    <td className="px-5 py-4 text-right text-lg font-semibold">
                      {formatMoney(invoice.balance, invoice.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardBody>
        </Card>

        {(invoice.notes || invoice.terms) && (
          <Card className="mb-6">
            <CardBody className="space-y-2 text-sm text-white/70">
              {invoice.terms ? (
                <p>
                  <span className="text-white/45">Terms: </span>
                  {invoice.terms}
                </p>
              ) : null}
              {invoice.notes ? (
                <p>
                  <span className="text-white/45">Notes: </span>
                  {invoice.notes}
                </p>
              ) : null}
            </CardBody>
          </Card>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {invoice.paymentLink && invoice.balance > 0 ? (
            <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full sm:w-auto">
                Pay {formatMoney(invoice.balance, invoice.currency)}
              </Button>
            </a>
          ) : null}
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => alert("Demo: PDF download would start here.")}
          >
            Download PDF
          </Button>
        </div>

        <Card className="mt-8">
          <CardBody className="text-sm text-white/60">
            <p className="font-medium text-white/80">Questions about this invoice?</p>
            <p className="mt-2">
              Contact {workspace.companyName} at{" "}
              <a href={`mailto:${workspace.supportEmail}`} className="text-fuchsia-300 hover:underline">
                {workspace.supportEmail}
              </a>
              {workspace.replyTo !== workspace.supportEmail ? (
                <>
                  {" "}
                  or reply to{" "}
                  <a href={`mailto:${workspace.replyTo}`} className="text-fuchsia-300 hover:underline">
                    {workspace.replyTo}
                  </a>
                </>
              ) : null}
              .
            </p>
          </CardBody>
        </Card>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/35">
        {workspace.companyName} · Secure invoice view via {APP_NAME}
      </footer>
    </div>
  );
}
