/**
 * Vlak "Voorkant rechts": logo, ontvanger, uitleg, QR-code + link, gever.
 *
 * Net als GiftPhoto in cqw-eenheden opgebouwd, afgeleid van de fysieke
 * printmaat (148,5mm ≈ 561px referentiebreedte), zodat dit vlak er in het
 * formulier-voorbeeld, op de cadeau-detailpagina én op de printpagina
 * proportioneel identiek uitziet. Vóór het aanmaken van een cadeau bestaat er
 * nog geen QR/link — geef dan `qr={null}` mee voor een placeholder.
 */
export default function CardFrontRight({
  recipientName,
  giverName,
  qr,
  pendingHint = "verschijnt na aanmaken",
}: {
  recipientName: string;
  giverName: string;
  qr: { dataUrl: string; shareUrl: string } | null;
  pendingHint?: string;
}) {
  return (
    <div
      className="navy-gradient-bg flex h-full flex-col items-center justify-center text-center text-white"
      style={{
        containerType: "inline-size",
        gap: "clamp(4px, 2.85cqw, 16px)",
        padding: "clamp(8px, 5.7cqw, 32px)",
      }}
    >
      <div className="flex flex-col items-center" style={{ gap: "clamp(2px, 0.9cqw, 5px)" }}>
        <div
          className="rounded-2xl bg-white"
          style={{ padding: "clamp(3px, 1.42cqw, 8px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="GiveWally"
            className="w-auto"
            style={{ height: "clamp(16px, 8.55cqw, 48px)" }}
          />
        </div>
        <p className="italic text-white/60" style={{ fontSize: "clamp(6px, 2.14cqw, 12px)" }}>
          Kaart, cadeaubon en herinnering in één
        </p>
      </div>

      <div>
        <p
          className="uppercase tracking-wide text-white/50"
          style={{ fontSize: "clamp(6px, 2.14cqw, 12px)" }}
        >
          Voor
        </p>
        <p
          className="font-semibold leading-tight"
          style={{ fontSize: "clamp(11px, 4.28cqw, 24px)" }}
        >
          {recipientName}
        </p>
      </div>

      <p
        className="leading-snug text-white/75"
        style={{ fontSize: "clamp(7px, 2.5cqw, 14px)" }}
      >
        Door deze QR-code of link te openen, opent u een webapp die u op uw telefoon of computer
        kunt installeren.
      </p>

      {qr ? (
        <>
          <div
            className="rounded-2xl bg-white"
            style={{ padding: "clamp(5px, 2.14cqw, 12px)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr.dataUrl}
              alt="QR-code naar het cadeau"
              style={{ height: "clamp(30px, 17.1cqw, 96px)", width: "clamp(30px, 17.1cqw, 96px)" }}
            />
          </div>
          <p
            className="break-all text-white/70"
            style={{ fontSize: "clamp(6px, 2.14cqw, 12px)" }}
          >
            {qr.shareUrl}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center" style={{ gap: "clamp(2px, 0.9cqw, 5px)" }}>
          <div
            className="flex items-center justify-center rounded-lg bg-white/10 text-center text-white/40"
            style={{
              height: "clamp(30px, 17.1cqw, 96px)",
              width: "clamp(30px, 17.1cqw, 96px)",
              fontSize: "clamp(5px, 1.8cqw, 10px)",
            }}
          >
            QR + link
          </div>
          <p className="text-white/40" style={{ fontSize: "clamp(5px, 1.6cqw, 9px)" }}>
            {pendingHint}
          </p>
        </div>
      )}

      <p className="text-white/60" style={{ fontSize: "clamp(7px, 2.5cqw, 14px)" }}>
        — {giverName}
      </p>
    </div>
  );
}
