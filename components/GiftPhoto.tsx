/**
 * Vlak "Voorkant links": de cadeaufoto met de groet-band eronder.
 *
 * Alle maten zijn uitgedrukt in container query-eenheden (cqw), afgeleid van
 * de fysieke printmaat (148,5mm ≈ 561px referentiebreedte) — zo ziet dit vlak
 * er in elke context (klein voorbeeld in het formulier, groot op de
 * printpagina) proportioneel exact hetzelfde uit, zonder dat elke plek zijn
 * eigen vaste pixelwaarden nodig heeft. De `clamp()` bovengrens is de
 * print-waarde zelf, zodat het nooit groter wordt dan het "echte" origineel.
 */
export default function GiftPhoto({
  photoUrl,
  greeting,
  alt,
  className = "",
}: {
  photoUrl: string;
  greeting: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-navy-950 ${className}`}
      style={{ aspectRatio: "148 / 210", containerType: "inline-size" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrl} alt={alt} className="h-full w-full object-cover" />
      <div
        className="absolute inset-x-0 bottom-0 text-center backdrop-blur-sm"
        style={{
          backgroundColor: "rgba(5, 11, 23, 0.85)",
          paddingBlock: "clamp(6px, 2.85cqw, 16px)",
          paddingInline: "clamp(10px, 4.28cqw, 24px)",
        }}
      >
        <p
          className="gold-gradient-text font-bold tracking-wide"
          style={{ fontSize: "clamp(11px, 4.28cqw, 24px)" }}
        >
          {greeting}
        </p>
      </div>
    </div>
  );
}
