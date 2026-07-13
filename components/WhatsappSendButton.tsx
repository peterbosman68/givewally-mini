"use client";

import { useState, useTransition } from "react";
import { markGiftWhatsappSentAction } from "@/app/dashboard/actions";
import {
  composeFrontLeftImage,
  composeFrontRightImage,
  composeMessageImage,
  composeCombinedCardImage,
} from "@/lib/composeCardImage";

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

/** Bestanden delen via het native deelmenu is alleen betrouwbaar op mobiel —
 * op desktop (Windows/Mac) blijft de aanroep soms hangen zonder dat er ooit
 * iets op het scherm verschijnt, ook al claimt de browser het te ondersteunen. */
function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function WhatsappSendButton({
  giftId,
  shareUrl,
  recipientName,
  photoUrl,
  greeting,
  giverName,
  qrDataUrl,
  messageFront,
  messageOverflow,
}: {
  giftId: string;
  shareUrl: string;
  recipientName: string;
  photoUrl: string;
  greeting: string;
  giverName: string;
  qrDataUrl: string;
  messageFront: string;
  messageOverflow: string;
}) {
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const text = `Hoi ${recipientName}! Ik heb een cadeau voor je klaargezet via GiveWally 🎁\n\n${shareUrl}`;
  const fallbackUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  function markSent() {
    startTransition(() => {
      markGiftWhatsappSentAction(giftId);
    });
  }

  async function send() {
    // Achterkant rechts wordt alleen meegenomen als de boodschap daadwerkelijk
    // op dat vlak overloopt — anders is het gewoon een lege afbeelding. Alle
    // vlakken worden tot één afbeelding samengevoegd (verticaal, in deze
    // volgorde) — WhatsApp respecteert de volgorde van los meegestuurde
    // afbeeldingen niet betrouwbaar, dus dit is de enige manier om de
    // volgorde te garanderen.
    const panelComposers = [
      composeFrontLeftImage(photoUrl, greeting),
      composeMessageImage(messageFront),
      ...(messageOverflow ? [composeMessageImage(messageOverflow)] : []),
      composeFrontRightImage({ recipientName, qrDataUrl, shareUrl, giverName }),
    ];

    // Bestanden delen via het native deelmenu is hier onbetrouwbaar gebleken
    // op desktop (Windows/Mac) — de aanroep kan stil blijven hangen. Daar
    // openen we daarom meteen de tekstlink (nooit door een pop-upblokkering
    // tegen te houden, want synchroon in de klik) én downloaden we de
    // samengevoegde kaart-PNG, zodat je hem zelf in WhatsApp kunt bijvoegen.
    if (
      !isMobileDevice() ||
      typeof navigator.share !== "function" ||
      typeof navigator.canShare !== "function"
    ) {
      window.open(fallbackUrl, "_blank");
      markSent();
      setBusy(true);
      try {
        const panelBlobs = await Promise.all(panelComposers);
        const combinedBlob = await composeCombinedCardImage(panelBlobs);
        downloadBlob(combinedBlob, "cadeaukaart.png");
      } catch {
        // Downloaden mislukte — de tekstlink is dan in elk geval al verstuurd.
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      let file: File | null = null;
      try {
        const panelBlobs = await Promise.all(panelComposers);
        const combinedBlob = await composeCombinedCardImage(panelBlobs);
        file = new File([combinedBlob], "cadeaukaart.png", { type: "image/png" });
      } catch {
        file = null;
      }

      let canShareFile = false;
      try {
        canShareFile = !!file && !!navigator.canShare?.({ files: [file] });
      } catch {
        canShareFile = false;
      }

      if (canShareFile && file) {
        try {
          // Ruime tijdslimiet: navigator.share() blijft "hangen" zolang de
          // gebruiker in het deelvenster een contact aan het kiezen is, dus
          // een korte tijdslimiet zou een trage maar geldige keuze afbreken.
          await withTimeout(
            navigator.share({ files: [file], text }),
            45000,
            "Delen via WhatsApp duurde te lang"
          );
          markSent();
        } catch (err) {
          // Gebruiker annuleerde het deelvenster zelf — respecteer dat.
          if (!(err instanceof Error && err.name === "AbortError")) {
            window.open(fallbackUrl, "_blank");
            markSent();
          }
        }
        return;
      }

      window.open(fallbackUrl, "_blank");
      markSent();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={send}
      disabled={busy}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-50"
    >
      {busy ? "Bezig..." : "Verzenden via WhatsApp"}
    </button>
  );
}
