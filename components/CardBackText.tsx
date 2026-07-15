/**
 * Vlak "Achterkant links/rechts": de boodschap-tekst op wit, bovenaan
 * uitgelijnd met een ruime bovenmarge — zelfde cqw-opzet als
 * GiftPhoto/CardFrontRight, hier afgeleid van de WhatsApp-PNG-versie
 * (composeMessageImage in lib/composeCardImage.ts, canvas 740×1050) die
 * hiervoor als referentie geldt: linksboven beginnend, niet gecentreerd.
 *
 * `emptyHint` is optioneel: de printpagina toont niets bij een leeg vlak,
 * de voorbeelden in het dashboard tonen wel een hint-tekst.
 */
export default function CardBackText({
  text,
  emptyHint,
}: {
  text: string;
  emptyHint?: string;
}) {
  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-white"
      style={{
        containerType: "inline-size",
        paddingInline: "clamp(6px, 9.46cqw, 70px)",
        paddingTop: "clamp(8px, 16.22cqw, 120px)",
      }}
    >
      {text ? (
        <p
          className="whitespace-pre-wrap text-navy-900/85"
          style={{ fontSize: "clamp(9px, 3.51cqw, 26px)", lineHeight: 1.46 }}
        >
          {text}
        </p>
      ) : emptyHint ? (
        <p
          className="text-navy-900/30"
          style={{ fontSize: "clamp(9px, 3.51cqw, 26px)", lineHeight: 1.46 }}
        >
          {emptyHint}
        </p>
      ) : null}
    </div>
  );
}
