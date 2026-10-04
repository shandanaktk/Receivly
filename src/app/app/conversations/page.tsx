"use client";

import { Suspense } from "react";
import { PageLoader } from "@/components/ui/Spinner";
import { ConversationsContent } from "./ConversationsContent";

export default function ConversationsPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading conversations…" />}>
      <ConversationsContent />
    </Suspense>
  );
}
