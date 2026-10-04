"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

const CUSTOMER_FIELDS = ["customer_name", "email", "phone", "country", "tags"];
const INVOICE_FIELDS = ["customer_name", "email", "invoice_number", "amount", "due_date", "currency", "po_reference"];

export default function ImportCsvPage() {
  const [type, setType] = useState<"customers" | "invoices">("invoices");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof api.importCsvPreview>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const fields = type === "customers" ? CUSTOMER_FIELDS : INVOICE_FIELDS;

  const runPreview = async () => {
    if (!file) return;
    setLoading(true);
    const text = await file.text();
    const rows = text.split("\n").filter(Boolean).length;
    const result = await api.importCsvPreview(type, rows);
    setPreview(result);
    setLoading(false);
  };

  const importDemo = () => {
    alert(`Demo: would import ${preview?.valid ?? 0} ${type} from CSV.`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/app/invoices" className="text-sm text-white/50 hover:text-white">
          ← Invoices
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Import CSV</h1>
        <p className="text-sm text-white/55">Bulk import customers or invoices</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Import type</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="What are you importing?"
            value={type}
            onChange={(e) => {
              setType(e.target.value as "customers" | "invoices");
              setPreview(null);
              setMapping({});
            }}
            options={[
              { value: "invoices", label: "Invoices (with customer info)" },
              { value: "customers", label: "Customers only" },
            ]}
          />

          <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-sm text-white/60">
            <p className="font-medium text-white/80">CSV template</p>
            <p className="mt-2">
              Required columns for {type}:{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">{fields.join(", ")}</code>
            </p>
            <p className="mt-2 text-xs">
              Download a sample template (demo): first row headers, one record per line. Dates use
              YYYY-MM-DD format.
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-white/80">Upload CSV file</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-2 block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setPreview(null);
              }}
            />
          </label>

          <Button onClick={() => void runPreview()} disabled={!file || loading}>
            {loading ? "Analyzing…" : "Preview import"}
          </Button>
        </CardBody>
      </Card>

      {loading ? <PageLoader label="Analyzing CSV…" /> : null}

      {preview ? (
        <Card>
          <CardHeader>
            <h2 className="font-medium">Preview results</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-semibold text-emerald-300">{preview.valid}</p>
                <p className="text-xs text-white/50">Valid rows</p>
              </div>
              <div className="rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-semibold text-rose-300">{preview.errors}</p>
                <p className="text-xs text-white/50">Errors</p>
              </div>
              <div className="rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-semibold text-amber-300">{preview.duplicates}</p>
                <p className="text-xs text-white/50">Duplicates</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Field mapping</p>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field} className="flex items-center gap-3 text-sm">
                    <span className="w-40 text-white/60">{field}</span>
                    <select
                      value={mapping[field] || field}
                      onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                      className="flex-1 rounded-lg border border-white/10 bg-[#0c0c18] px-3 py-2 text-white"
                    >
                      {fields.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <ul className="space-y-1 text-sm text-white/55">
              {preview.sample.map((line, i) => (
                <li key={i}>• {line}</li>
              ))}
            </ul>

            <Button onClick={importDemo} disabled={preview.valid === 0}>
              Import {preview.valid} rows (demo)
            </Button>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
