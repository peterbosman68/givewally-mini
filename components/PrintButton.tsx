"use client";

import { useTransition } from "react";
import { markGiftPrintedAction } from "@/app/dashboard/actions";

export default function PrintButton({ giftId }: { giftId: string }) {
  const [, startTransition] = useTransition();

  function handlePrint() {
    startTransition(() => {
      markGiftPrintedAction(giftId);
    });
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
    >
      Kaart printen
    </button>
  );
}
