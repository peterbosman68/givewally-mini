import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/money";
import { occasionLabelFromGreeting } from "@/lib/greeting";
import HistorySortSelect from "@/components/HistorySortSelect";

export const dynamic = "force-dynamic";

type SortKey = "ontvanger" | "datum" | "gelegenheid";

function isSortKey(value: string | undefined): value is SortKey {
  return value === "ontvanger" || value === "datum" || value === "gelegenheid";
}

export default async function HistoriePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const sortKey: SortKey = isSortKey(sort) ? sort : "datum";

  const gifts = await prisma.gift.findMany({
    where: { OR: [{ printedAt: { not: null } }, { whatsappSentAt: { not: null } }] },
  });

  const withMeta = gifts.map((gift) => {
    const dates = [gift.printedAt, gift.whatsappSentAt].filter((d): d is Date => d !== null);
    const givenAt = new Date(Math.min(...dates.map((d) => d.getTime())));
    return { ...gift, givenAt, occasionLabel: occasionLabelFromGreeting(gift.greeting) };
  });

  const sorted = withMeta.sort((a, b) => {
    if (sortKey === "ontvanger") return a.recipientName.localeCompare(b.recipientName, "nl");
    if (sortKey === "gelegenheid") return a.occasionLabel.localeCompare(b.occasionLabel, "nl");
    return b.givenAt.getTime() - a.givenAt.getTime();
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">Historie</h1>
        <HistorySortSelect current={sortKey} />
      </div>

      {sorted.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/20 px-6 py-12 text-center text-white/60">
          Nog geen verzonden of geprinte cadeaus.
        </p>
      )}

      <ul className="space-y-3">
        {sorted.map((gift) => (
          <li key={gift.id}>
            <Link
              href={`/dashboard/${gift.id}`}
              className="block rounded-2xl border border-navy-900/10 bg-white p-4 shadow-sm hover:border-gold-500/40"
            >
              <p className="font-medium text-navy-950">{gift.recipientName}</p>
              <p className="text-sm text-navy-900/50">
                {formatDate(gift.givenAt)} · {gift.occasionLabel}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
