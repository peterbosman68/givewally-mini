"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export default function FirstVisitBanner({ slug }: { slug: string }) {
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  const storageKey = `gw-gezien-${slug}`;

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) setVisible(true);
    } catch {
      // localStorage niet beschikbaar (bijv. private mode): banner tonen kan geen kwaad
      setVisible(true);
    }
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [storageKey]);

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // negeren
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-4 rounded-2xl border border-gold-500/40 bg-gold-300/20 p-4">
      <p className="font-medium text-navy-950">
        GiveWally kan straks automatisch betalen. Voor deze testfase: betaal zelf, upload
        foto van de bon en ik betaal meteen terug.
      </p>

      <div className="mt-3 text-sm text-navy-900/80">
        <p className="font-semibold">Zet deze pagina op je beginscherm:</p>
        {isIos ? (
          <p className="mt-1">Tik op het deel-icoon → Zet op beginscherm</p>
        ) : installEvent ? (
          <button
            type="button"
            onClick={() => installEvent.prompt()}
            className="mt-2 rounded-xl bg-navy-900 px-4 py-2 font-semibold text-white transition hover:bg-navy-800"
          >
            Zet op beginscherm
          </button>
        ) : (
          <p className="mt-1">Open het browsermenu en kies “Toevoegen aan startscherm”.</p>
        )}
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="mt-3 text-sm font-semibold text-navy-900/70 underline hover:text-navy-950"
      >
        Begrepen, niet meer tonen
      </button>
    </div>
  );
}
