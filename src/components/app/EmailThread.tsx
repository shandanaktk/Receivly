"use client";

import { GmailLogo } from "@/components/app/GmailLogo";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STAGE_LABEL = {
  invoice: "Invoice email",
  upcoming: "Reminder before due",
  due: "Due reminder",
  overdue: "Late reminder",
} as const;

function sentWithGmail(message: Message) {
  return message.direction === "outbound" && message.viaGmail && message.status !== "draft";
}

export function EmailThread({
  messages,
  invoiceNumber,
  senderName,
  fromEmail,
  toName,
  toEmail,
}: {
  messages: Message[];
  invoiceNumber: string;
  senderName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
}) {
  const ordered = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const orderedRef = useRef(ordered);
  orderedRef.current = ordered;

  useEffect(() => {
    if (!playing) return;
    setCursor(0);
    const timer = window.setInterval(() => {
      setCursor((current) => {
        const next = current + 1;
        if (next >= orderedRef.current.length) {
          setPlaying(false);
          return current;
        }
        return next;
      });
    }, 1700);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (cursor < 0) return;
    const id = orderedRef.current[cursor]?.id;
    if (!id) return;
    document.getElementById(`email-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [cursor]);

  const gmailSearch = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(invoiceNumber)}`;

  return (
    <div className="gmail-thread rounded-2xl p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <GmailLogo size={26} />
          <div>
            <p className="text-sm font-semibold">Gmail thread · {invoiceNumber}</p>
            <p className="gmail-muted text-xs">Every email on this invoice, including ones AI sent automatically.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPlaying((value) => !value)} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#dadce0] bg-white px-3 text-xs font-medium text-[#202124]">
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? "Pause" : "Play"}
          </button>
          <a href={gmailSearch} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center rounded-full border border-[#dadce0] bg-white px-3 text-xs font-medium text-[#1a73e8]">
            Look up in Gmail
          </a>
        </div>
      </div>
      <div className="space-y-2">
        {ordered.map((message, index) => {
          const outbound = message.direction === "outbound";
          const from = outbound ? senderName : toName;
          const address = outbound ? fromEmail : toEmail;
          const to = outbound ? `${toName} <${toEmail}>` : senderName;
          const automatic = Boolean(message.aiGenerated && sentWithGmail(message));
          return (
            <article
              id={`email-${message.id}`}
              key={message.id}
              className={cn("gmail-card rounded-xl border border-[#e8eaed] px-4 py-3 shadow-sm", cursor === index && "gmail-active")}
            >
              <div className="flex items-start gap-3">
                {sentWithGmail(message) ? <GmailLogo decorative size={28} className="mt-0.5 shrink-0" /> : <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f0fe] text-xs font-semibold text-[#1a73e8]">{from.slice(0, 1)}</span>}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {from} <span className="gmail-muted font-normal">&lt;{address}&gt;</span>
                    </p>
                    <time className="gmail-muted text-xs" dateTime={message.createdAt}>{formatDate(message.createdAt, "MMM d, yyyy · h:mm a")}</time>
                  </div>
                  <p className="gmail-muted text-xs">to {to}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sentWithGmail(message) ? <span className="rounded-full bg-[#e6f4ea] px-2 py-0.5 text-[11px] font-medium text-[#137333]">Sent with Gmail</span> : null}
                    {automatic ? <span className="rounded-full bg-[#e8f0fe] px-2 py-0.5 text-[11px] font-medium text-[#1967d2]">AI sent this automatically</span> : null}
                    {message.stage ? <span className="gmail-muted rounded-full bg-[#f1f3f4] px-2 py-0.5 text-[11px] font-medium">{STAGE_LABEL[message.stage]}</span> : null}
                    {message.status === "draft" ? <span className="rounded-full bg-[#fef7e0] px-2 py-0.5 text-[11px] font-medium text-[#b06000]">Not sent yet</span> : null}
                  </div>
                  {message.subject ? <p className="mt-2 text-sm font-semibold">{message.subject}</p> : null}
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
