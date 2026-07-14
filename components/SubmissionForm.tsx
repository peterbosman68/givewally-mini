"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createSubmissionAction, type SubmissionFormState } from "@/app/cadeau/actions";
import { formatCents } from "@/lib/money";

const inputClass =
  "w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-sm focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

export default function SubmissionForm({
  slug,
  remainingAmount,
}: {
  slug: string;
  remainingAmount: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<SubmissionFormState, FormData>(
    createSubmissionAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  if (remainingAmount <= 0) {
    return (
      <div className="rounded-2xl border border-navy-900/10 bg-white p-6 text-center text-navy-900/70 shadow-sm">
        Het volledige bedrag is besteed. Bedankt en veel plezier met je aankopen! 🎉
      </div>
    );
  }

  if (!open) {
    return (
      <div>
        {state?.success && (
          <p className="mb-3 rounded-2xl border border-gold-500/40 bg-gold-300/20 px-4 py-3 text-center font-semibold text-navy-950">
            Gelukt! Je inzending is verstuurd en het saldo is bijgewerkt.
          </p>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-2xl gold-gradient-bg px-5 py-4 text-lg font-bold text-navy-950 shadow-md shadow-gold-500/30 transition hover:brightness-105 active:brightness-95"
        >
          Ik heb iets gekocht
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-navy-950">Wat heb je gekocht?</h2>
      <input type="hidden" name="slug" value={slug} />

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-navy-900">
          Omschrijving
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          placeholder="Bijv. boek, plant, etentje"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium text-navy-900">
          Bedrag (€) — maximaal {formatCents(remainingAmount)}
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          placeholder="12,50"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="receipt" className="mb-1 block text-sm font-medium text-navy-900">
          Foto van de bon
        </label>
        <input
          id="receipt"
          name="receipt"
          type="file"
          accept="image/*"
          capture="environment"
          className="w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-sm text-navy-900/70 file:mr-3 file:rounded-lg file:border-0 file:gold-gradient-bg file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy-950"
        />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-1/3 rounded-xl border border-navy-900/15 px-4 py-3 text-sm font-medium text-navy-900 transition hover:bg-navy-900/5"
        >
          Annuleer
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-2/3 items-center justify-center rounded-xl gold-gradient-bg px-5 py-3 text-sm font-semibold text-navy-950 shadow-sm shadow-gold-500/30 transition hover:brightness-105 active:brightness-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? "Versturen..." : "Verstuur"}
        </button>
      </div>
    </form>
  );
}
