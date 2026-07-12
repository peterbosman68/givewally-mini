/**
 * Eén vlak van de vouwkaart (A5-rechtstaand). Op mobiel liggen de 4 vlakken
 * in een horizontale swipe-rij (scroll-snap, geen extra JS nodig); vanaf
 * lg-breakpoint staan ze naast elkaar zonder te hoeven swipen.
 */
export default function CardPanel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-[78vw] max-w-[220px] shrink-0 snap-start lg:w-[clamp(140px,13vw,240px)] lg:max-w-none">
      <p className="mb-1 text-center text-[11px] font-medium uppercase tracking-wide text-white/40">
        {label}
      </p>
      <div
        className="overflow-hidden rounded-2xl shadow-lg"
        style={{ aspectRatio: "148 / 210" }}
      >
        {children}
      </div>
    </div>
  );
}
