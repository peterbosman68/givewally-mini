import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDate } from "@/lib/money";
import FirstVisitBanner from "@/components/FirstVisitBanner";
import SubmissionForm from "@/components/SubmissionForm";
import Logo from "@/components/Logo";
import GiftPhoto from "@/components/GiftPhoto";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ secretSlug: string }>;
}): Promise<Metadata> {
  const { secretSlug } = await params;
  return {
    title: "Jouw cadeau — GiveWally",
    manifest: `/cadeau/${secretSlug}/manifest.webmanifest`,
  };
}

export default async function CadeauPage({
  params,
}: {
  params: Promise<{ secretSlug: string }>;
}) {
  const { secretSlug } = await params;

  const gift = await prisma.gift.findUnique({
    where: { secretSlug },
    include: { submissions: { orderBy: { submittedAt: "desc" } } },
  });
  if (!gift) notFound();

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-4 flex justify-center">
        <Logo width={90} />
      </div>

      <FirstVisitBanner slug={secretSlug} />

      <section className="overflow-hidden rounded-3xl border border-navy-900/10 bg-white shadow-sm">
        <GiftPhoto photoUrl={gift.photoUrl} greeting={gift.greeting} alt="Jouw cadeau" />
        <div className="p-5">
          <h1 className="text-2xl font-semibold text-navy-950">
            Voor {gift.recipientName} 🎁
          </h1>
          <p className="mt-3 whitespace-pre-wrap text-navy-900/80">{gift.message}</p>
          <p className="mt-3 text-sm text-navy-900/60">— {gift.giverName}</p>
        </div>
      </section>

      <section className="navy-gradient-bg mt-4 rounded-3xl p-6 text-center text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide gold-gradient-text">
          Nog te besteden
        </p>
        <p className="mt-1 text-4xl font-semibold gold-gradient-text">
          {formatCents(gift.remainingAmount)}
        </p>
        <p className="mt-1 text-xs text-white/50">
          van oorspronkelijk {formatCents(gift.originalAmount)}
        </p>
      </section>

      <section className="mt-6">
        <SubmissionForm slug={secretSlug} remainingAmount={gift.remainingAmount} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-900/50">
          Eerdere aankopen
        </h2>
        {gift.submissions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-navy-900/20 bg-white p-6 text-center text-sm text-navy-900/60">
            Nog geen aankopen ingediend.
          </p>
        )}
        <ul className="space-y-2">
          {gift.submissions.map((submission) => (
            <li
              key={submission.id}
              className="flex items-center justify-between rounded-2xl border border-navy-900/10 bg-white px-4 py-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-navy-950">{submission.description}</p>
                <p className="text-sm text-navy-900/50">{formatDate(submission.submittedAt)}</p>
              </div>
              <div className="ml-3 shrink-0 text-right">
                <p className="font-semibold text-navy-950">{formatCents(submission.amount)}</p>
                {submission.status === "reimbursed" ? (
                  <span className="text-xs font-semibold text-navy-900/60">Terugbetaald ✓</span>
                ) : (
                  <span className="text-xs font-semibold text-gold-600">In behandeling</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
