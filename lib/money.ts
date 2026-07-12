export function formatCents(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/**
 * Zet een euro-invoer ("12,50", "12.50", "€ 12") om naar centen.
 * Geeft null terug bij ongeldige invoer.
 */
export function parseEuroToCents(input: string): number | null {
  const cleaned = input.trim().replace(/€/g, "").replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
