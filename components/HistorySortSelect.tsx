"use client";

import { useRouter } from "next/navigation";

export default function HistorySortSelect({ current }: { current: string }) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => router.push(`/dashboard/historie?sort=${e.target.value}`)}
      className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
    >
      <option value="datum" className="text-navy-950">
        Sorteer op datum
      </option>
      <option value="ontvanger" className="text-navy-950">
        Sorteer op ontvanger
      </option>
      <option value="gelegenheid" className="text-navy-950">
        Sorteer op gelegenheid
      </option>
    </select>
  );
}
