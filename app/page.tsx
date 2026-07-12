import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="navy-gradient-bg flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center text-white">
      <Logo width={280} className="shadow-lg" />

      <p className="max-w-sm text-balance text-white/80">Ben je gever of ontvanger?</p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl gold-gradient-bg px-5 py-3 text-sm font-semibold text-navy-950 shadow-sm shadow-gold-500/30 transition hover:brightness-105 active:brightness-95"
        >
          Ik ben een gever
        </Link>
        <Link
          href="/ontvanger"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-transparent px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Ik ben een ontvanger
        </Link>
      </div>
    </main>
  );
}
