import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateQrCodeDataUrl } from "@/lib/qrcode";
import { splitMessageForCard } from "@/lib/cardText";
import PrintButton from "@/components/PrintButton";

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
          <div className="relative h-full w-full overflow-hidden bg-navy-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gift.photoUrl} alt="Voorkant" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-navy-950/85 px-6 py-4 text-center backdrop-blur-sm">
              <p className="gold-gradient-text text-2xl font-bold tracking-wide">
                {gift.greeting}
              </p>
            </div>
          </div>
        </PrintPanel>

        <PrintPanel>
          <div className="navy-gradient-bg flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-white">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-2xl bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="GiveWally" className="h-12 w-auto" />
              </div>
              <p className="text-xs italic text-white/60">
                Kaart, cadeaubon en herinnering in één
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">Voor</p>
              <p className="text-2xl font-semibold">{gift.recipientName}</p>
            </div>
            <p className="max-w-[85%] text-sm leading-relaxed text-white/80">
              Door deze QR-code of link te openen, opent u een webapp die u op uw telefoon of
              computer kunt installeren.
            </p>
            <div className="rounded-2xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR-code naar het cadeau" className="h-24 w-24" />
            </div>
            <p className="max-w-[85%] break-all text-xs text-white/70">{shareUrl}</p>
            <p className="mt-2 text-sm text-white/60">— {gift.giverName}</p>
          </div>
        </PrintPanel>
      </PrintPage>

      <PrintPage label="Pagina 2 — achterkant (dubbelzijdig, kant B)">
        <PrintPanel>
          <div className="flex h-full flex-col justify-center overflow-hidden bg-white p-8">
            <p className="whitespace-pre-wrap text-base leading-relaxed text-navy-900/85">
              {messageFront}
            </p>
          </div>
        </PrintPanel>

        <PrintPanel>
          <div className="flex h-full flex-col justify-center overflow-hidden bg-white p-8">
            {messageOverflow ? (
              <p className="whitespace-pre-wrap text-base leading-relaxed text-navy-900/85">
                {messageOverflow}
              </p>
            ) : null}
          </div>
        </PrintPanel>
      </PrintPage>

      <div className="flex justify-center print:hidden">
        <PrintButton giftId={gift.id} />
      </div>
    </div>
  );
}
