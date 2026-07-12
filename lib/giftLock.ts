/** Zodra een kaart geprint of via WhatsApp verzonden is, mag de inhoud niet meer wijzigen. */
export function isGiftLocked(gift: { printedAt: Date | null; whatsappSentAt: Date | null }): boolean {
  return gift.printedAt !== null || gift.whatsappSentAt !== null;
}
