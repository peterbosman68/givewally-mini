export const GREETING_OPTIONS = [
  {
    key: "verjaardag",
    label: "Verjaardag / felicitatie / bruiloft",
    text: "Van harte gefeliciteerd!",
  },
  { key: "kraamcadeau", label: "Kraamcadeau", text: "Gefeliciteerd met de geboorte!" },
  { key: "bedankt", label: "Bedankt", text: "Bedankt!" },
  { key: "algemeen", label: "Algemeen", text: "Voor jou!" },
  { key: "anders", label: "Anders", text: null },
] as const;

export type GreetingKey = (typeof GREETING_OPTIONS)[number]["key"];

export const CUSTOM_GREETING_MAX = 20;

/** Zet een gekozen gebeurtenis (+ eventuele eigen tekst) om naar de definitieve boodschap-op-de-foto. */
export function resolveGreeting(key: string, customText: string): string | null {
  const option = GREETING_OPTIONS.find((o) => o.key === key);
  if (!option) return null;

  if (option.key === "anders") {
    const trimmed = customText.trim();
    if (!trimmed || trimmed.length > CUSTOM_GREETING_MAX) return null;
    return trimmed;
  }

  return option.text;
}

/** Leidt uit de opgeslagen groet-tekst af welke gelegenheid ooit gekozen is (voor weergave in de historie). */
export function occasionLabelFromGreeting(greeting: string): string {
  const match = GREETING_OPTIONS.find((o) => o.key !== "anders" && o.text === greeting);
  return match ? match.label : "Anders";
}
