import type { Submission } from "@prisma/client";

export type SubmissionWithTotals = {
  submission: Submission;
  betaald: number;
  over: number;
};

/** Berekent per inzending het cumulatief betaalde bedrag en wat er daarna nog resteert van het cadeau. */
export function withCumulativeTotals(
  submissions: Submission[],
  originalAmount: number
): SubmissionWithTotals[] {
  const chronological = [...submissions].sort(
    (a, b) => a.submittedAt.getTime() - b.submittedAt.getTime()
  );

  let cumulativeBetaald = 0;
  const totalsById = new Map<string, { betaald: number; over: number }>();
  for (const submission of chronological) {
    cumulativeBetaald += submission.amount;
    totalsById.set(submission.id, {
      betaald: cumulativeBetaald,
      over: originalAmount - cumulativeBetaald,
    });
  }

  return submissions.map((submission) => ({
    submission,
    ...totalsById.get(submission.id)!,
  }));
}
