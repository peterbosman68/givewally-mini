import Link from "next/link";
import Logo from "@/components/Logo";

export default function OntvangerPage() {
  return (
    <main className="navy-gradient-bg flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center text-white">
      <Logo width={280} className="shadow-lg" />

      <p className="max-w-sm text-balance text-white/80">
        Heb je een cadeau gekregen? Klik op de link die je hebt ontvangen via WhatsApp of scan
        met jouw camera de QR-code op de kaart.
      </p>
      <p className="max-w-sm text-balance text-sm text-white/60">
        Link kwijt? Vraag de gever om hem opnieuw te sturen.
      </p>

      <Link
        href="/"
        className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-white/25 bg-transparent px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
      >
        ← Terug
      </Link>
    </main>
  );
}
