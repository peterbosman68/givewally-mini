import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const gifts = await prisma.gift.findMany({
    include: { submissions: { orderBy: { submittedAt: "desc" } } },
  });

  const sorted = gifts
    .map((gift) => ({
      ...gift,
      openCount: gift.submissions.filter((s) => s.status === "open").length,
      lastActivity: gift.submissions[0]?.submittedAt ?? gift.createdAt,
    }))
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-white">Cadeaus</h1>

      {sorted.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/20 px-6 py-12 text-center">
          <p className="text-white/60">Nog geen cadeaus.</p>
          <Link href="/dashboard/nieuw" className="font-semibold text-white underline">
            Maak je eerste cadeau aan
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {sorted.map((gift) => (
          <li key={gift.id}>
            <Link
              href={`/dashboard/${gift.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-navy-900/10 bg-white p-4 shadow-sm hover:border-gold-500/40"
            >
              <div>
                <p className="font-medium text-navy-950">{gift.recipientName}</p>
                <p className="text-sm text-navy-900/50">
                  {formatCents(gift.remainingAmount)} resterend van{" "}
                  {formatCents(gift.originalAmount)}
                </p>
              </div>
              {gift.openCount > 0 ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full gold-gradient-bg px-2 text-xs font-semibold text-navy-950">
                  {gift.openCount} open
                </span>
              ) : (
                <span className="text-sm text-navy-900/40">Geen open inzendingen</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
