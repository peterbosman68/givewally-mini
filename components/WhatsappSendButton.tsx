"use client";

import { useTransition } from "react";
import { markGiftWhatsappSentAction } from "@/app/dashboard/actions";

export default function WhatsappSendButton({
  giftId,
  shareUrl,
  recipientName,
}: {
  giftId: string;
  shareUrl: string;
  recipientName: string;
}) {
  const [pending, startTransition] = useTransition();

  function send() {
    const text = `Hoi ${recipientName}! Ik heb een cadeau voor je klaargezet via GiveWally 🎁\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    startTransition(() => {
      markGiftWhatsappSentAction(giftId);
    });
  }

  return (
    <button
      type="button"
      onClick={send}
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-50"
    >
      Verzenden via WhatsApp
    </button>
  );
}
