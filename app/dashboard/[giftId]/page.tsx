import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDate } from "@/lib/money";
import { markReimbursedAction } from "@/app/dashboard/actions";
import { generateQrCodeDataUrl } from "@/lib/qrcode";
import { splitMessageForCard } from "@/lib/cardText";
import { isGiftLocked } from "@/lib/giftLock";
import { withCumulativeTotals } from "@/lib/submissionTotals";
import CopyButton from "@/components/CopyButton";
import GiftPhoto from "@/components/GiftPhoto";
import CardPanel from "@/components/CardPanel";
import WhatsappSendButton from "@/components/WhatsappSendButton";

export const dynamic = "force-dynamic";

export default async function GiftDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ giftId: string }>;
  searchParams: Promise<{ nieuw?: string }>;
}) {
  const { giftId } = await params;
  const { nieuw } = await searchParams;

  const gift = await prisma.gift.findUnique({
    where: { id: giftId },
    include: { submissions: { orderBy: { submittedAt: "desc" } } },
  });
  if (!gift) notFound();

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${proto}://${host}/cadeau/${gift.secretSlug}`;
  const qrDataUrl = await generateQrCodeDataUrl(shareUrl);
  const { front: messageFront, overflow: messageOverflow } = splitMessageForCard(gift.message);
  const locked = isGiftLocked(gift);

  const submissionsWithTotals = withCumulativeTotals(gift.submissions, gift.originalAmount);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/dashboard" className="text-sm text-white/60 hover:text-white">
          ← Terug naar overzicht
        </Link>

        {nieuw === "1" && (
          <div className="rounded-2xl border border-gold-500/40 bg-gold-300 p-4">
            <p className="font-semibold text-navy-950">Cadeau aangemaakt! 🎉</p>
            <p className="mt-1 text-sm text-navy-900/70">
              Deel de link hieronder met {gift.recipientName}.
            </p>
          </div>
        )}

        <section className="navy-gradient-bg rounded-3xl p-6 text-white shadow-lg">
          <h1 className="text-xl font-semibold">Cadeau voor {gift.recipientName}</h1>
          <p className="mt-2 text-3xl font-semibold gold-gradient-text">
            {formatCents(gift.remainingAmount)}
          </p>
          <p className="mt-1 text-sm text-white/60">
            resterend van {formatCents(gift.originalAmount)}
          </p>

          <div className="mt-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/50">
              Deelbare link
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="w-full truncate rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80"
              />
              <CopyButton text={shareUrl} />
            </div>
          </div>
        </section>
      </div>

      <section>
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
              De kaart (4 vlakken)
            </h2>
            {!locked ? (
              <Link
                href={`/dashboard/${gift.id}/bewerken`}
                className="text-sm font-semibold text-gold-400 underline hover:text-gold-300"
              >
                Bewerken
              </Link>
            ) : null}
          </div>

          {locked && (
            <p className="mb-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
              Deze kaart is al {gift.printedAt ? "geprint" : ""}
              {gift.printedAt && gift.whatsappSentAt ? " en " : ""}
              {gift.whatsappSentAt ? "via WhatsApp verzonden" : ""} en kan niet meer aangepast
              worden.
            </p>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory lg:justify-between lg:gap-6 lg:overflow-visible lg:snap-none lg:pb-0">
          <CardPanel label="Voorkant links">
            <GiftPhoto
              photoUrl={gift.photoUrl}
              greeting={gift.greeting}
              alt={`Cadeau voor ${gift.recipientName}`}
            />
          </CardPanel>

          <CardPanel label="Voorkant rechts">
            <div className="navy-gradient-bg flex h-full flex-col items-center justify-between gap-1.5 p-2.5 text-center text-white">
              <div>
                <p className="text-[8px] uppercase tracking-wide text-white/50">Voor</p>
                <p className="text-xs font-semibold leading-tight">{gift.recipientName}</p>
              </div>
              <p className="text-[7.5px] leading-snug text-white/70">
                Door deze QR-code of link te openen, opent u een webapp die u op uw telefoon of
                computer kunt installeren.
              </p>
              <div className="flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR-code naar het cadeau" className="h-14 w-14 rounded bg-white p-0.5" />
              </div>
              <p className="text-[8px] text-white/60">— {gift.giverName}</p>
            </div>
          </CardPanel>

          <CardPanel label="Achterkant links">
            <div className="h-full overflow-hidden bg-white p-3">
              <p className="whitespace-pre-wrap text-[10px] leading-snug text-navy-900/80">
                {messageFront}
              </p>
            </div>
          </CardPanel>

          <CardPanel label="Achterkant rechts">
            <div className="h-full overflow-hidden bg-white p-3">
              {messageOverflow ? (
                <p className="whitespace-pre-wrap text-[10px] leading-snug text-navy-900/80">
                  {messageOverflow}
                </p>
              ) : (
                <p className="text-[10px] text-navy-900/30">(blijft leeg)</p>
              )}
            </div>
          </CardPanel>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/${gift.id}/kaart`}
              className="inline-flex items-center justify-center rounded-xl gold-gradient-bg px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm shadow-gold-500/30 transition hover:brightness-105"
            >
              Afdrukken (A4) →
            </Link>
            <WhatsappSendButton
              giftId={gift.id}
              shareUrl={shareUrl}
              recipientName={gift.recipientName}
              photoUrl={gift.photoUrl}
              greeting={gift.greeting}
              giverName={gift.giverName}
              qrDataUrl={qrDataUrl}
              messageFront={messageFront}
              messageOverflow={messageOverflow}
            />
          </div>
          <p className="mt-2 text-xs text-white/40">
            Tip: gebruik bij voorkeur stevig papier van 300 gram — afhankelijk van je printer.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
            Inzendingen ({gift.submissions.length})
          </h2>

          {gift.submissions.length === 0 && (
            <p className="rounded-2xl border border-dashed border-navy-900/20 bg-white p-6 text-center text-navy-900/60">
              Nog geen inzendingen.
            </p>
          )}

          <ul className="space-y-3">
            {submissionsWithTotals.map(({ submission, betaald, over }) => (
              <li
                key={submission.id}
                className="rounded-2xl border border-navy-900/10 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex items-start justify-between gap-3 lg:w-64 lg:shrink-0">
                    <div className="min-w-0">
                      <p className="font-medium text-navy-950">{submission.description}</p>
                      <p className="text-sm text-navy-900/50">
                        {formatDate(submission.submittedAt)} · {formatCents(submission.amount)}
                      </p>
                    </div>
                    {submission.receiptPhotoUrl ? (
                      <a
                        href={submission.receiptPhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                        title="Bekijk bon"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={submission.receiptPhotoUrl}
                          alt="Bon"
                          className="h-16 w-16 rounded-xl border border-navy-900/10 object-cover"
                        />
                      </a>
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-navy-900/15 text-center text-xs text-navy-900/40">
                        Geen bon
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-navy-900/10 lg:w-48 lg:shrink-0 lg:border-l lg:pl-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-900/40">
                        Gift
                      </p>
                      <p className="text-sm font-medium text-navy-950">
                        {formatCents(gift.originalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-900/40">
                        Besteed
                      </p>
                      <p className="text-sm font-medium text-navy-950">{formatCents(betaald)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-900/40">
                        Resteert
                      </p>
                      <p className="text-sm font-medium text-navy-950">{formatCents(over)}</p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 border-navy-900/10 lg:border-l lg:pl-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-900/40">
                      Boodschap van {gift.recipientName}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-navy-900/70">
                      {submission.recipientMessage || (
                        <span className="text-navy-900/30">(geen boodschap)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {submission.status === "reimbursed" ? (
                    <span className="rounded-full bg-navy-900/5 px-3 py-1 text-sm font-medium text-navy-900/70">
                      Vergoed ✓
                    </span>
                  ) : (
                    <>
                      <span className="rounded-full gold-gradient-bg px-3 py-1 text-sm font-semibold text-navy-950">
                        Nog te vergoeden
                      </span>
                      <form action={markReimbursedAction}>
                        <input type="hidden" name="submissionId" value={submission.id} />
                        <button
                          type="submit"
                          className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800 active:bg-navy-950"
                        >
                          Markeer als vergoed
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
