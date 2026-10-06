"use client";

import { InvoiceEditor } from "@/components/app/InvoiceEditor";
import { useParams } from "next/navigation";

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  return <InvoiceEditor invoiceId={id} />;
}
