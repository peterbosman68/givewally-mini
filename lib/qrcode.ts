import QRCode from "qrcode";

/** Genereert een QR-code (als data-URL) die naar de meegegeven URL verwijst. */
export async function generateQrCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 320,
    color: { dark: "#0a1830", light: "#ffffff" },
  });
}
