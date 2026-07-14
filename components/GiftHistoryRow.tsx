"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCents, formatDate } from "@/lib/money";
import type { SubmissionWithTotals } from "@/lib/submissionTotals";

const columnHeaderClass =
  "text-[10px] font-semibold uppercase tracking-wide text-navy-900/40";

export default function GiftHistoryRow({
  giftId,
  recipientName,
  givenAt,
  occasionLabel,
  originalAmount,
  submissionsWithTotals,
}: {
  giftId: string;
  recipientName: string;
  givenAt: Date;
  occasionLabel: string;
  originalAmount: number;
  submissionsWithTotals: SubmissionWithTotals[];
}) {
  const [expanded, setExpanded] = useState(false);

  const rows =
    submissionsWithTotals.length > 0
      ? submissionsWithTotals
      : [
          {
            submission: null,
            betaald: 0,
            over: originalAmount,
          },
        ];

  const latest = rows[rows.length - 1];
  const hasMultiple = submissionsWithTotals.length > 1;
  const visibleRows = hasMultiple && !expanded ? [latest] : rows;

  return (
    <li className="rounded-2xl border border-navy-900/10 bg-white p-4 shadow-sm hover:border-gold-500/40">
      <Link href={`/dashboard/${giftId}`} className="block">
        <p className="font-medium text-navy-950">{recipientName}</p>
        <p className="text-sm text-navy-900/50">
          {formatDate(givenAt)} · {occasionLabel}
        </p>
      </Link>

      <div className="mt-3 border-t border-navy-900/10 pt-3">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-3 sm:grid">
          <p className={columnHeaderClass}>Historie</p>
          <p className={columnHeaderClass}>Gift</p>
          <p className={columnHeaderClass}>Besteed</p>
          <p className={columnHeaderClass}>Resteert</p>
          <p className={columnHeaderClass}>Boodschap</p>
        </div>

        <div className="space-y-2 sm:space-y-1">
          {visibleRows.map(({ submission, betaald, over }, i) => (
            <div
              key={submission?.id ?? `empty-${i}`}
              className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-[2fr_1fr_1fr_1fr_2fr] sm:items-baseline"
            >
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-900/40 sm:hidden">
                  Historie
                </p>
                <p className="text-sm text-navy-950">
                  {submission ? (
                    <>
                      {submission.description}
                      <span className="text-navy-900/50"> · {formatDate(submission.submittedAt)}</span>
                    </>
                  ) : (
                    <span className="text-navy-900/30">—</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-900/40 sm:hidden">
                  Gift
                </p>
                <p className="text-sm text-navy-950">{formatCents(originalAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-900/40 sm:hidden">
                  Besteed
                </p>
                <p className="text-sm text-navy-950">{formatCents(betaald)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-900/40 sm:hidden">
                  Resteert
                </p>
                <p className="text-sm text-navy-950">{formatCents(over)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-900/40 sm:hidden">
                  Boodschap
                </p>
                <p className="text-sm text-navy-900/70">
                  {submission?.recipientMessage || <span className="text-navy-900/30">—</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasMultiple && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs font-semibold text-gold-600 underline hover:text-gold-700"
          >
            {expanded
              ? "Verberg bestedingen"
              : `Toon alle bestedingen (${submissionsWithTotals.length})`}
          </button>
        )}
      </div>
    </li>
  );
}
