"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { downloadCsv, parseCsv } from "@/lib/csv";
import { ArrowLeft, CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const FIELDS = {
  customers: ["customer_name", "email", "phone", "country", "tags"],
  invoices: ["customer_name", "email", "invoice_number", "amount", "due_date", "currency", "po_reference"],
} as const;
type ImportType = keyof typeof FIELDS;
type Preview = Awaited<ReturnType<typeof api.importCsvPreview>>;

export default function ImportCsvPage() {
  const [type, setType] = useState<ImportType>("invoices");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fields = [...FIELDS[type]];

  const chooseFile = async (file?: File) => {
    setPreview(null); setError(""); setSuccess("");
    if (!file) return;
    if (file.size > 2_000_000) { setError("Please choose a CSV smaller than 2 MB."); return; }
    try {
      const parsed = parseCsv(await file.text());
      if (parsed.length < 2) throw new Error("Add a header row and at least one data row.");
      if (parsed.length > 501) throw new Error("Import up to 500 rows at a time.");
      const names = parsed[0].map((h) => h.trim());
      if (new Set(names).size !== names.length) throw new Error("CSV column names must be unique.");
      setHeaders(names); setRawRows(parsed.slice(1)); setFileName(file.name);
      setMapping(Object.fromEntries(fields.map((field) => [field, names.find((h) => h.toLowerCase() === field) || ""])));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not read this CSV."); }
  };

  const mappedRows = () => rawRows.map((row) => Object.fromEntries(fields.map((field) => [field, row[headers.indexOf(mapping[field])] || ""])));

  const runPreview = async () => {
    setBusy(true); setError("");
    try { setPreview(await api.importCsvPreview(type, mappedRows())); }
    catch (err) { setError(err instanceof Error ? err.message : "Preview failed."); }
    finally { setBusy(false); }
  };

  const importValid = async () => {
    if (!preview) return;
    setBusy(true); setError("");
    try {
      const result = await api.importCsv(type, preview.details.filter((d) => !d.issues.length && !d.duplicate).map((d) => d.values));
      setSuccess(`${result.imported} ${type} imported into this demo workspace.`);
      setPreview(null); setRawRows([]); setFileName("");
    } catch (err) { setError(err instanceof Error ? err.message : "Import failed."); }
    finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-4xl space-y-6">
    <div><Link href="/app/invoices" className="inline-flex items-center gap-2 text-sm text-foreground/55 hover:text-foreground"><ArrowLeft size={15} /> Back to invoices</Link><h1 className="mt-3 text-3xl font-semibold tracking-tight">Import records</h1><p className="mt-1 text-sm text-foreground/55">Map your columns, review every row, and import valid records.</p></div>
    {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}
    {success && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"><CheckCircle2 size={18} />{success}</div>}
    <Card><CardHeader><h2 className="font-semibold">1. Choose your data</h2></CardHeader><CardBody className="space-y-5">
      <Select label="Import type" value={type} onChange={(e) => { setType(e.target.value as ImportType); setRawRows([]); setHeaders([]); setPreview(null); setFileName(""); }} options={[{ value: "invoices", label: "Invoices" }, { value: "customers", label: "Customers" }]} />
      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-violet-500/35 bg-violet-500/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><FileSpreadsheet className="mt-1 shrink-0 text-violet-400" size={24} /><div><p className="font-semibold">Start from a template</p><p className="mt-1 text-sm text-foreground/55">Required columns are checked in the preview. Use YYYY-MM-DD for dates.</p></div></div><Button variant="outline" size="sm" onClick={() => downloadCsv(`${type}-template.csv`, fields, [type === "customers" ? ["Acme Co", "billing@acme.example", "+1 555 0100", "United States", "priority"] : ["Acme Co", "billing@acme.example", "INV-1001", 1250, "2026-11-01", "USD", "PO-123"]])}><Download size={15} /> Download template</Button></div>
      <label className="block text-sm font-medium"><span className="mb-2 block">CSV file</span><span className="flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-xl border border-foreground/15 bg-foreground/[0.025] px-4 text-foreground/70 hover:border-violet-400"><Upload size={18} />{fileName || "Choose a CSV file (up to 2 MB, 500 rows)"}</span><input className="sr-only" type="file" accept=".csv,text/csv" onChange={(e) => void chooseFile(e.target.files?.[0])} /></label>
    </CardBody></Card>
    {rawRows.length > 0 && <Card><CardHeader><h2 className="font-semibold">2. Map CSV columns</h2><p className="text-sm text-foreground/50">{rawRows.length} data rows · {headers.length} source columns</p></CardHeader><CardBody className="space-y-3"><div className="grid gap-3 sm:grid-cols-2">{fields.map((field) => <Select key={field} label={field.replaceAll("_", " ")} value={mapping[field] || ""} onChange={(e) => { setMapping((m) => ({ ...m, [field]: e.target.value })); setPreview(null); }} options={[{ value: "", label: "Do not map" }, ...headers.map((h) => ({ value: h, label: h }))]} />)}</div><Button disabled={busy} onClick={() => void runPreview()}>{busy ? "Checking rows…" : "Validate & preview"}</Button></CardBody></Card>}
    {preview && <Card><CardHeader><h2 className="font-semibold">3. Review before import</h2><p className="text-sm text-foreground/50">Duplicate customers are skipped; no data changes until you confirm.</p></CardHeader><CardBody className="space-y-5"><div className="grid gap-3 sm:grid-cols-3">{[["Ready", preview.valid, "text-emerald-300"], ["Errors", preview.errors, "text-rose-300"], ["Duplicates", preview.duplicates, "text-amber-300"]].map(([label, count, color]) => <div key={label} className="rounded-xl border border-foreground/10 p-4"><p className="text-sm text-foreground/55">{label}</p><p className={`mt-1 text-2xl font-semibold ${color}`}>{count}</p></div>)}</div><div className="max-h-72 overflow-auto rounded-xl border border-foreground/10"><table className="w-full min-w-[520px] text-left text-sm"><thead className="sticky top-0 bg-elevated"><tr><th className="px-4 py-3">Row</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Result</th></tr></thead><tbody>{preview.details.map((d) => <tr key={d.row} className="border-t border-foreground/10"><td className="px-4 py-3">{d.row}</td><td className="px-4 py-3">{d.values.customer_name || "—"}</td><td className="px-4 py-3 text-foreground/65">{d.issues.length ? d.issues.join("; ") : d.duplicate ? "Duplicate email — skipped" : "Ready"}</td></tr>)}</tbody></table></div><div className="flex flex-wrap gap-3"><Button disabled={busy || preview.valid === 0} onClick={() => void importValid()}>{busy ? "Importing…" : `Import ${preview.valid} valid rows`}</Button><Button variant="outline" onClick={() => downloadCsv("import-error-report.csv", ["row", "customer_name", "issues"], preview.details.filter((d) => d.issues.length || d.duplicate).map((d) => [d.row, d.values.customer_name, d.issues.join("; ") || "Duplicate email"]))}><Download size={15} /> Error report</Button></div></CardBody></Card>}
  </div>;
}
