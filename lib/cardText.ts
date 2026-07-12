// Ruwe schatting van hoeveel tekst op één A5-kaartvlak past bij de gebruikte
// tekstgrootte. Er is geen browser/canvas beschikbaar om dit exact te meten,
// dus dit is een praktische grens die voor de meeste boodschappen goed werkt.
const FRONT_PANEL_MAX_CHARS = 600;

/** Splitst een boodschap over het "achterkant links"- en "achterkant rechts"-vlak van de kaart. */
export function splitMessageForCard(message: string): { front: string; overflow: string } {
  const trimmed = message.trim();
  if (trimmed.length <= FRONT_PANEL_MAX_CHARS) {
    return { front: trimmed, overflow: "" };
  }

  let cut = trimmed.lastIndexOf(" ", FRONT_PANEL_MAX_CHARS);
  if (cut <= 0) cut = FRONT_PANEL_MAX_CHARS;

  return {
    front: trimmed.slice(0, cut).trim(),
    overflow: trimmed.slice(cut).trim(),
  };
}
