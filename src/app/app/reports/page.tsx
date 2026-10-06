"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { formatMoney } from "@/lib/format";
import type { ReportSummary } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function ReportsPage() {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState<string[]>(["USD"]);

  const load = useCallback(async () => {
    setLoading(true);
    const [data, invoices] = await Promise.all([api.getReports(currency), api.getInvoices()]);
    setReport(data);
    setCurrencies([...new Set(invoices.map((i) => i.currency))].sort());
    setLoading(false);
  }, [currency]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const exportReport = (type: "aging" | "activity") => {
    if (!report) return;
    if (type === "aging") downloadCsv(`receivly-aging-${currency}.csv`, ["age_band", "currency", "outstanding"], report.agingBands.map((b) => [b.label, currency, b.amount]));
    else downloadCsv("receivly-collection-activity.csv", ["metric", "count"], Object.entries(report.collectionActivity).map(([metric, count]) => [metric, count]));
  };

  if (loading || !report) return <PageLoader label="Loading reports…" />;

  const stats = report.collectionActivity;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-foreground/55">Collection performance and aging. Financial totals are separated by currency.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => exportReport("aging")}>
            Export aging
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportReport("activity")}>
            Export activity
          </Button>
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm font-medium">Show amounts in <select aria-label="Report currency" className="rounded-lg border border-foreground/15 bg-elevated px-3 py-2" value={currency} onChange={(e) => setCurrency(e.target.value)}>{currencies.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <p className="text-sm text-foreground/55">Collected (period)</p>
            <p className="text-2xl font-semibold">{formatMoney(report.collectedAmount, currency)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-foreground/55">Avg days to payment</p>
            <p className="text-2xl font-semibold">{report.avgDaysToPayment} days</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Outstanding by customer</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="-mx-4 overflow-x-auto md:mx-0">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-foreground/50">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium text-right">Outstanding</th>
                  <th className="px-5 py-3 font-medium text-right">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {report.outstandingByCustomer.map((row) => (
                  <tr key={row.name} className="border-b border-foreground/5">
                    <td className="px-5 py-3">{row.name}</td>
                    <td className="px-5 py-3 text-right">{formatMoney(row.amount, currency)}</td>
                    <td className="px-5 py-3 text-right text-rose-300">{formatMoney(row.overdue, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-medium">Aging bands</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {report.agingBands.map((band) => (
              <div key={band.label} className="flex justify-between text-sm">
                <span className="text-foreground/70">{band.label}</span>
                <span>{formatMoney(band.amount, currency)}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Collection activity <span className="text-sm font-normal text-foreground/45">· all currencies</span></h2>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Reminders sent", stats.remindersSent],
                ["Replies received", stats.repliesReceived],
                ["Promises captured", stats.promisesCaptured],
                ["Promises kept", stats.promisesKept],
                ["Promises missed", stats.promisesMissed],
                ["Disputes", stats.disputes],
                ["Failures", stats.failures],
                ["Payments recorded", stats.paymentsRecorded],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-xl border border-foreground/10 p-3">
                  <dt className="text-foreground/50">{label}</dt>
                  <dd className="text-lg font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
