import Image from "next/image";

// Bronbestand is 1536x1024 — hoogte wordt hieruit afgeleid zodat het logo
// nooit vervormt, ongeacht de gekozen breedte.
const LOGO_RATIO = 1024 / 1536;

export default function Logo({
  width = 120,
  className = "",
}: {
  width?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="GiveWally"
      width={width}
      height={Math.round(width * LOGO_RATIO)}
      priority
      className={`rounded-2xl ${className}`.trim()}
    />
  );
}
