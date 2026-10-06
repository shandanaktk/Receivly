"use client";

import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { APP_NAME } from "@/lib/constants";
import { DEFAULT_INVOICE_ACCENT } from "@/lib/invoiceMath";
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
  const [paymentNoticeOpen, setPaymentNoticeOpen] = useState(false);

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
    void Promise.resolve().then(load);
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PageLoader label="Loading invoice…" />
      </div>
    );
  }

  if (error || !invoice || !customer || !workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <Card className="max-w-md w-full">
          <CardBody className="text-center">
            <p className="text-lg font-medium">{error || "Invoice unavailable"}</p>
            <p className="mt-2 text-sm text-foreground/55">
              Contact {workspace?.supportEmail || "the sender"} if you believe this is an error.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="public-invoice min-h-screen bg-background text-foreground">
      <header className="border-b border-foreground/10 bg-background/90 backdrop-blur" style={{ borderTop: `4px solid ${workspace.brandColor || DEFAULT_INVOICE_ACCENT}` }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {workspace.logoUrl ? <img src={workspace.logoUrl} alt={`${workspace.companyName} logo`} className="h-10 w-10 rounded-lg object-contain" /> : null}
            <div>
            <p className="text-xs text-foreground/45">Powered by {APP_NAME}</p>
            <p className="font-semibold">{workspace.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2"><ThemeToggle /><Badge status={invoice.status} /></div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold sm:text-3xl">Invoice {invoice.number}</h1>
          <p className="mt-1 text-foreground/55">
            Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-foreground/45">Bill to</p>
              <p className="mt-2 font-medium">{customer.name}</p>
              <p className="text-sm text-foreground/60">{customer.email}</p>
              {customer.billingAddress ? (
                <p className="mt-2 text-sm text-foreground/50">{customer.billingAddress}</p>
              ) : null}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-foreground/45">From</p>
              {workspace.logoUrl ? <img src={workspace.logoUrl} alt="" className="mt-3 h-13 w-13 rounded-xl object-contain" /> : null}
              <p className="mt-2 font-medium">{workspace.companyName}</p>
              {workspace.address ? (
                <p className="text-sm text-foreground/50">{workspace.address}</p>
              ) : null}
              <p className="mt-2 text-sm text-foreground/60">{workspace.supportEmail}</p>
            </CardBody>
          </Card>
        </div>

        <Card className="mb-6">
          <CardBody className="p-0">
            <div className="divide-y divide-foreground/10 sm:hidden">
              {invoice.lineItems.length === 0 ? <div className="flex justify-between gap-3 p-5 text-sm"><span>Invoice balance</span><strong>{formatMoney(invoice.amount, invoice.currency)}</strong></div> : invoice.lineItems.map((li) => (
                <div key={li.id} className="flex justify-between gap-4 p-5 text-sm">
                  <div className="min-w-0"><p className="font-medium">{li.description}</p><p className="mt-1 text-foreground/50">{li.quantity} × {formatMoney(li.rate, invoice.currency)}{li.taxRate ? ` · ${li.taxRate}% tax` : ""}{li.discount ? ` · ${formatMoney(li.discount, invoice.currency)} discount` : ""}</p></div>
                  <strong className="shrink-0">{formatMoney(li.quantity * li.rate * (1 + li.taxRate / 100) - li.discount, invoice.currency)}</strong>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 p-5"><span className="font-medium">Total due</span><strong className="text-lg">{formatMoney(invoice.balance, invoice.currency)}</strong></div>
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-foreground/50">
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium text-right">Qty</th>
                    <th className="px-5 py-3 font-medium text-right">Rate</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.length === 0 && <tr><td className="px-5 py-3">Invoice balance</td><td className="px-5 py-3 text-right">1</td><td className="px-5 py-3 text-right">{formatMoney(invoice.amount, invoice.currency)}</td><td className="px-5 py-3 text-right">{formatMoney(invoice.amount, invoice.currency)}</td></tr>}
                  {invoice.lineItems.map((li) => {
                    const lineTotal =
                      li.quantity * li.rate * (1 + li.taxRate / 100) - li.discount;
                    return (
                      <tr key={li.id} className="border-b border-foreground/5">
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
                  <tr className="border-t border-foreground/10">
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
            <CardBody className="space-y-2 text-sm text-foreground/70">
              {invoice.terms ? (
                <p>
                  <span className="text-foreground/45">Terms: </span>
                  {invoice.terms}
                </p>
              ) : null}
              {invoice.notes ? (
                <p>
                  <span className="text-foreground/45">Notes: </span>
                  {invoice.notes}
                </p>
              ) : null}
            </CardBody>
          </Card>
        )}

        <div className="invoice-actions flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {invoice.paymentLink?.startsWith("https://pay.demo/") && invoice.balance > 0 ? (
            <Button className="w-full sm:w-auto" onClick={() => setPaymentNoticeOpen(true)}>
              Pay {formatMoney(invoice.balance, invoice.currency)}
            </Button>
          ) : invoice.paymentLink && invoice.balance > 0 ? (
            <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full sm:w-auto">
                Pay {formatMoney(invoice.balance, invoice.currency)}
              </Button>
            </a>
          ) : null}
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.print()}
          >
            Print / save as PDF
          </Button>
        </div>

        <Card className="mt-8">
          <CardBody className="text-sm text-foreground/60">
            <p className="font-medium text-foreground/80">Questions about this invoice?</p>
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

      <footer className="border-t border-foreground/10 py-6 text-center text-xs text-foreground/35">
        {workspace.companyName} · Demo invoice view via {APP_NAME}
      </footer>
      <Modal open={paymentNoticeOpen} title="Payment preview" onClose={() => setPaymentNoticeOpen(false)} footer={<Button onClick={() => setPaymentNoticeOpen(false)}>Close</Button>}>
        <p className="text-sm text-foreground/70">This sample invoice has no connected payment provider. No payment will be taken in the demo.</p>
      </Modal>
    </div>
  );
}
