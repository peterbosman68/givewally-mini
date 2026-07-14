"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatCents, parseEuroToCents } from "@/lib/money";
import { savePhoto } from "@/lib/storage";
import { notifyNewSubmission } from "@/lib/email";

export type SubmissionFormState = { error?: string; success?: boolean } | null;

export async function createSubmissionAction(
  _prev: SubmissionFormState,
  formData: FormData
): Promise<SubmissionFormState> {
  const slug = String(formData.get("slug") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amountInput = String(formData.get("amount") ?? "");
  const receipt = formData.get("receipt");
  const recipientMessage = String(formData.get("recipientMessage") ?? "").trim().slice(0, 50) || null;

  const gift = await prisma.gift.findUnique({ where: { secretSlug: slug } });
  if (!gift) return { error: "Dit cadeau bestaat niet (meer)." };

  if (!description) return { error: "Vul in wat je hebt gekocht." };

  const amount = parseEuroToCents(amountInput);
  if (amount === null || amount <= 0) {
    return { error: "Vul een geldig bedrag in, bijvoorbeeld 12,50." };
  }
  if (amount > gift.remainingAmount) {
    return {
      error: `Het bedrag is hoger dan het resterende saldo (${formatCents(gift.remainingAmount)}).`,
    };
  }

  const receiptPhotoUrl =
    receipt instanceof File && receipt.size > 0 ? await savePhoto(receipt, "receipts") : null;

  // Transactie met voorwaardelijke decrement voorkomt dat gelijktijdige
  // inzendingen het saldo onder nul brengen.
  const submission = await prisma.$transaction(async (tx) => {
    const updated = await tx.gift.updateMany({
      where: { id: gift.id, remainingAmount: { gte: amount } },
      data: { remainingAmount: { decrement: amount } },
    });
    if (updated.count === 0) return null;
    return tx.submission.create({
      data: {
        giftId: gift.id,
        description,
        amount,
        receiptPhotoUrl,
        recipientMessage,
        status: "open",
      },
    });
  });

  if (!submission) {
    return { error: "Het saldo is inmiddels niet meer toereikend voor dit bedrag." };
  }

  await notifyNewSubmission({
    recipientName: gift.recipientName,
    description,
    amountCents: amount,
    remainingCents: gift.remainingAmount - amount,
    giftId: gift.id,
    giverEmail: gift.giverEmail,
  });

  revalidatePath(`/cadeau/${slug}`);
  revalidatePath(`/dashboard/${gift.id}`);
  revalidatePath("/dashboard");

  return { success: true };
}
