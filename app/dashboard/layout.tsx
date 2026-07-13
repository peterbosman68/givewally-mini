import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAuth();

  return (
    <div className="app-shell navy-gradient-bg min-h-screen print:min-h-0">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/dashboard">
            <Logo width={110} />
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
            <Link
              href="/dashboard"
              className="rounded-xl gold-gradient-bg px-4 py-2 font-semibold text-navy-950 shadow-sm shadow-gold-500/30 transition hover:brightness-105"
            >
              Gemaakte cadeaus
            </Link>
            <Link
              href="/dashboard/historie"
              className="rounded-xl gold-gradient-bg px-4 py-2 font-semibold text-navy-950 shadow-sm shadow-gold-500/30 transition hover:brightness-105"
            >
              Historie
            </Link>
            <Link
              href="/dashboard/nieuw"
              className="rounded-xl gold-gradient-bg px-4 py-2 font-semibold text-navy-950 shadow-sm shadow-gold-500/30 transition hover:brightness-105"
            >
              + Nieuw cadeau
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="px-1 font-medium text-white/60 hover:text-white">
                Uitloggen
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="px-4 py-6 print:p-0">{children}</main>
    </div>
  );
}
