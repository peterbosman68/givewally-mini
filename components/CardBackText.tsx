/**
 * Vlak "Achterkant links/rechts": de boodschap-tekst op wit, verticaal
 * gecentreerd — zelfde cqw-opzet als GiftPhoto/CardFrontRight, afgeleid van
 * de fysieke printmaat (148,5mm ≈ 561px referentiebreedte).
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
      className="flex h-full flex-col justify-center overflow-hidden bg-white"
      style={{ containerType: "inline-size", padding: "clamp(8px, 5.7cqw, 32px)" }}
    >
      {text ? (
        <p
          className="whitespace-pre-wrap leading-relaxed text-navy-900/85"
          style={{ fontSize: "clamp(8px, 2.85cqw, 16px)" }}
        >
          {text}
        </p>
      ) : emptyHint ? (
        <p
          className="text-navy-900/30"
          style={{ fontSize: "clamp(8px, 2.85cqw, 16px)" }}
        >
          {emptyHint}
        </p>
      ) : null}
    </div>
  );
}
