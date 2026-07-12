/** Toont de cadeaufoto (altijd A5-rechtstaand) met de boodschap zichtbaar over de foto heen. */
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
      style={{ aspectRatio: "148 / 210" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrl} alt={alt} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-navy-950/85 px-4 py-3 text-center backdrop-blur-sm">
        <p className="gold-gradient-text text-lg font-bold tracking-wide">{greeting}</p>
      </div>
    </div>
  );
}
