import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isGiftLocked } from "@/lib/giftLock";
import EditGiftForm from "@/components/EditGiftForm";

export const dynamic = "force-dynamic";

export default async function BewerkCadeauPage({
  params,
}: {
  params: Promise<{ giftId: string }>;
}) {
  const { giftId } = await params;

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift) notFound();
  if (isGiftLocked(gift)) redirect(`/dashboard/${giftId}`);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-white">Cadeau bewerken</h1>
      <EditGiftForm gift={gift} />
    </div>
  );
}
