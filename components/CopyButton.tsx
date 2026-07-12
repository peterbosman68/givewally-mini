"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback voor oudere browsers / http-context
      window.prompt("Kopieer de link:", text);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-xl gold-gradient-bg px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm shadow-gold-500/30 transition hover:brightness-105"
    >
      {copied ? "Gekopieerd!" : "Kopieer"}
    </button>
  );
}
