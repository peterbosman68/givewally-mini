import { formatCents } from "./money";

/**
 * Stuurt een e-mailnotificatie bij een nieuwe inzending naar het
 * e-mailadres van de gever. Cadeaus van vóór dit veld hebben geen
 * giverEmail — die vallen terug op NOTIFY_EMAIL (indien ingesteld).
 * Zonder RESEND_API_KEY of een bereikbaar "to"-adres wordt de melding
 * alleen gelogd, zodat de app ook zonder e-mailconfiguratie blijft werken.
 */
export async function notifyNewSubmission(params: {
  recipientName: string;
  description: string;
  amountCents: number;
  remainingCents: number;
  giftId: string;
  giverEmail: string | null;
}): Promise<void> {
  const to = params.giverEmail || process.env.NOTIFY_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  const subject = `Nieuwe inzending van ${params.recipientName}: ${formatCents(params.amountCents)}`;
  const text = [
    `${params.recipientName} heeft een nieuwe inzending gedaan.`,
    ``,
    `Omschrijving: ${params.description}`,
    `Bedrag: ${formatCents(params.amountCents)}`,
    `Resterend saldo: ${formatCents(params.remainingCents)}`,
    ``,
    `Bekijk en vergoed via je dashboard: /dashboard/${params.giftId}`,
  ].join("\n");

  if (!to || !apiKey) {
    console.log(`[GiveWally] E-mailnotificatie (niet verstuurd, geen RESEND_API_KEY/NOTIFY_EMAIL):\n${subject}\n${text}`);
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "GiveWally <onboarding@resend.dev>",
      to,
      subject,
      text,
    });
  } catch (error) {
    // Een mislukte notificatie mag een inzending nooit blokkeren.
    console.error("[GiveWally] E-mailnotificatie mislukt:", error);
  }
}
