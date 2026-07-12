"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { parseEuroToCents } from "@/lib/money";
import { savePhoto } from "@/lib/storage";
import { resolveGreeting } from "@/lib/greeting";
import { isGiftLocked } from "@/lib/giftLock";

export type GiftFormState = { error: string } | null;

export async function createGiftAction(
  _prev: GiftFormState,
  formData: FormData
): Promise<GiftFormState> {
  await requireAuth();

  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const amountInput = String(formData.get("amount") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const giverName = String(formData.get("giverName") ?? "").trim();
  const occasion = String(formData.get("occasion") ?? "");
  const customGreeting = String(formData.get("customGreeting") ?? "");
  const photo = formData.get("photo");

  if (!recipientName) return { error: "Vul de naam van de ontvanger in." };

  const amount = parseEuroToCents(amountInput);
  if (amount === null || amount <= 0) {
    return { error: "Vul een geldig bedrag in, bijvoorbeeld 25 of 25,50." };
  }

  const greeting = resolveGreeting(occasion, customGreeting);
  if (!greeting) {
    return {
      error: "Kies een boodschap voor op de foto, of vul bij 'Anders' een tekst van max 10 tekens in.",
    };
  }

  if (!message) return { error: "Schrijf een boodschap voor de ontvanger." };
  if (message.length > 1500) {
    return { error: "De boodschap mag maximaal 1.500 tekens zijn." };
  }

  if (!giverName) return { error: "Vul je eigen naam in (naam gever)." };

  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "Upload een foto voor het cadeau." };
  }

  const photoUrl = await savePhoto(photo, "gifts");
  const secretSlug = randomBytes(24).toString("base64url");

  const gift = await prisma.gift.create({
    data: {
      secretSlug,
      recipientName,
      originalAmount: amount,
      remainingAmount: amount,
      photoUrl,
      greeting,
      message,
      giverName,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/${gift.id}?nieuw=1`);
}

export async function updateGiftAction(
  _prev: GiftFormState,
  formData: FormData
): Promise<GiftFormState> {
  await requireAuth();

  const giftId = String(formData.get("giftId") ?? "");
  const existing = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!existing) return { error: "Cadeau niet gevonden." };
  if (isGiftLocked(existing)) {
    return { error: "Deze kaart is al geprint of verzonden en kan niet meer aangepast worden." };
  }

  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const amountInput = String(formData.get("amount") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const giverName = String(formData.get("giverName") ?? "").trim();
  const occasion = String(formData.get("occasion") ?? "");
  const customGreeting = String(formData.get("customGreeting") ?? "");
  const photo = formData.get("photo");

  if (!recipientName) return { error: "Vul de naam van de ontvanger in." };

  const amount = parseEuroToCents(amountInput);
  if (amount === null || amount <= 0) {
    return { error: "Vul een geldig bedrag in, bijvoorbeeld 25 of 25,50." };
  }

  const greeting = resolveGreeting(occasion, customGreeting);
  if (!greeting) {
    return {
      error: "Kies een boodschap voor op de foto, of vul bij 'Anders' een tekst van max 10 tekens in.",
    };
  }

  if (!message) return { error: "Schrijf een boodschap voor de ontvanger." };
  if (message.length > 1500) {
    return { error: "De boodschap mag maximaal 1.500 tekens zijn." };
  }

  if (!giverName) return { error: "Vul je eigen naam in (naam gever)." };

  const photoUrl =
    photo instanceof File && photo.size > 0 ? await savePhoto(photo, "gifts") : existing.photoUrl;

  const alreadySpent = existing.originalAmount - existing.remainingAmount;

  await prisma.gift.update({
    where: { id: giftId },
    data: {
      recipientName,
      originalAmount: amount,
      remainingAmount: Math.max(0, amount - alreadySpent),
      photoUrl,
      greeting,
      message,
      giverName,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${giftId}`);
  revalidatePath(`/dashboard/${giftId}/kaart`);
  redirect(`/dashboard/${giftId}`);
}

export async function markGiftPrintedAction(giftId: string): Promise<void> {
  await requireAuth();
  await prisma.gift.updateMany({
    where: { id: giftId, printedAt: null },
    data: { printedAt: new Date() },
  });
  revalidatePath(`/dashboard/${giftId}`);
}

export async function markGiftWhatsappSentAction(giftId: string): Promise<void> {
  await requireAuth();
  await prisma.gift.updateMany({
    where: { id: giftId, whatsappSentAt: null },
    data: { whatsappSentAt: new Date() },
  });
  revalidatePath(`/dashboard/${giftId}`);
}

export async function markReimbursedAction(formData: FormData): Promise<void> {
  await requireAuth();

  const submissionId = String(formData.get("submissionId") ?? "");
  if (!submissionId) return;

  const submission = await prisma.submission.update({
    where: { id: submissionId, status: "open" },
    data: { status: "reimbursed" },
    include: { gift: true },
  });

  revalidatePath(`/dashboard/${submission.giftId}`);
  revalidatePath(`/cadeau/${submission.gift.secretSlug}`);
  revalidatePath("/dashboard");
}
