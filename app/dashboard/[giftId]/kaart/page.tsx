import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateQrCodeDataUrl } from "@/lib/qrcode";
import { splitMessageForCard } from "@/lib/cardText";
import PrintButton from "@/components/PrintButton";
import GiftPhoto from "@/components/GiftPhoto";
import CardFrontRight from "@/components/CardFrontRight";
import CardBackText from "@/components/CardBackText";

export const dynamic = "force-dynamic";

function PrintPage({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 print:mb-0">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50 print:hidden">
        {label}
      </p>
      <div className="print-page relative mx-auto flex w-full max-w-3xl overflow-hidden rounded-xl border border-navy-900/10 bg-white shadow-lg">
        {children}
        {/* Vouwlijn in het midden */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-0 border-l border-dashed border-navy-900/25 print:border-navy-900/40" />
      </div>
    </section>
  );
}

function PrintPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="print-panel relative flex-1" style={{ aspectRatio: "148 / 210" }}>
      {children}
    </div>
  );
}

export default async function GiftSharecardPage({
  params,
}: {
  params: Promise<{ giftId: string }>;
}) {
  const { giftId } = await params;

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift) notFound();

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${proto}://${host}/cadeau/${gift.secretSlug}`;
  const qrDataUrl = await generateQrCodeDataUrl(shareUrl);
  const { front: messageFront, overflow: messageOverflow } = splitMessageForCard(gift.message);

  return (
    <div className="mx-auto max-w-3xl space-y-4 print:max-w-none print:space-y-0">
      <div className="space-y-3 print:hidden">
        <Link href={`/dashboard/${gift.id}`} className="text-sm text-white/60 hover:text-white">
          ← Terug naar cadeau
        </Link>

        <div className="rounded-2xl border border-gold-500/30 bg-gold-300/10 p-4 text-sm text-white/80">
          <p className="font-semibold text-white">Afdrukinstructies</p>
          <p className="mt-1">
            Druk beide pagina&apos;s hieronder <strong className="text-white">dubbelzijdig</strong>{" "}
            af op A4, <strong className="text-white">liggend</strong> (landscape), met de optie{" "}
            <strong className="text-white">&quot;omslaan langs de lange zijde&quot;</strong>{" "}
            (duplex long-edge). Vouw de kaart daarna doormidden langs de gestippelde lijn.
          </p>
          <p className="mt-2 text-white/60">
            Tip: gebruik bij voorkeur stevig papier van <strong className="text-white">300 gram</strong>{" "}
            — dit is afhankelijk van wat jouw printer aankan.
          </p>
        </div>
      </div>

      <PrintPage label="Pagina 1 — voorkant (dubbelzijdig, kant A)">
        <PrintPanel>
          <CardFrontRight
            recipientName={gift.recipientName}
            giverName={gift.giverName}
            qr={{ dataUrl: qrDataUrl, shareUrl }}
          />
        </PrintPanel>

        <PrintPanel>
          <GiftPhoto photoUrl={gift.photoUrl} greeting={gift.greeting} alt="Voorkant" />
        </PrintPanel>
      </PrintPage>

      <PrintPage label="Pagina 2 — achterkant (dubbelzijdig, kant B)">
        <PrintPanel>
          <CardBackText text={messageFront} />
        </PrintPanel>

        <PrintPanel>
          <CardBackText text={messageOverflow} />
        </PrintPanel>
      </PrintPage>

      <div className="flex justify-center print:hidden">
        <PrintButton giftId={gift.id} />
      </div>
    </div>
  );
}
