// Bouwt client-side (canvas) deelbare PNG's van de 4 kaartvlakken, zodat die als
// bijlages meegestuurd kunnen worden via het native deelmenu (Web Share API) —
// WhatsApp ondersteunt geen bijlages via een kale wa.me-link.
const CANVAS_W = 740;
const CANVAS_H = 1050;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Afbeelding kon niet geladen worden"));
    img.src = src;
  });
}

function createCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas wordt niet ondersteund");
  return { canvas, ctx };
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Kon afbeelding niet genereren"));
    }, "image/png");
  });
}

/** Breekt één "woord" (bijv. een lange URL zonder spaties) op tekenniveau af tot het binnen maxWidth past. */
function breakLongWord(ctx: CanvasRenderingContext2D, word: string, maxWidth: number): string[] {
  const parts: string[] = [];
  let chunk = "";
  for (const char of word) {
    const testChunk = chunk + char;
    if (chunk && ctx.measureText(testChunk).width > maxWidth) {
      parts.push(chunk);
      chunk = char;
    } else {
      chunk = testChunk;
    }
  }
  if (chunk) parts.push(chunk);
  return parts;
}

/** Breekt tekst op in regels die binnen maxWidth passen, zonder te tekenen (voor gecentreerde tekst). */
function wrapTextToLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(testLine).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/**
 * Bepaalt op welke lettergrootte en in hoeveel regels tekst past: begint op
 * de gewenste lettergrootte en verkleint stapsgewijs totdat de tekst in
 * maxLines regels past — zo blijft een langere groet altijd leesbaar in
 * plaats van samengeperst op één regel.
 */
function fitCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  startFontPx: number,
  minFontPx: number,
  fontSpec: (px: number) => string
): { fontPx: number; lines: string[]; lineHeight: number } {
  let fontPx = startFontPx;
  let lines: string[] = [];

  while (fontPx >= minFontPx) {
    ctx.font = fontSpec(fontPx);
    lines = wrapTextToLines(ctx, text, maxWidth);
    if (lines.length <= maxLines) break;
    fontPx -= 2;
  }

  return { fontPx, lines, lineHeight: fontPx * 1.25 };
}

/** Tekent tekst die al met fitCenteredText is gemeten, gecentreerd rond centerY. */
function drawFittedLines(
  ctx: CanvasRenderingContext2D,
  fitted: { fontPx: number; lines: string[]; lineHeight: number },
  centerX: number,
  centerY: number,
  maxWidth: number,
  fontSpec: (px: number) => string
): void {
  ctx.font = fontSpec(fitted.fontPx);
  const totalHeight = fitted.lines.length * fitted.lineHeight;
  let cursorY = centerY - totalHeight / 2 + fitted.lineHeight / 2;
  for (const line of fitted.lines) {
    ctx.fillText(line, centerX, cursorY, maxWidth);
    cursorY += fitted.lineHeight;
  }
}

/** Verdeelt tekst over regels die binnen maxWidth passen en tekent ze, regel voor regel. */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  let cursorY = y;
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(testLine).width > maxWidth) {
        ctx.fillText(line, x, cursorY);
        line = "";
        cursorY += lineHeight;
      }
      if (ctx.measureText(word).width > maxWidth) {
        // Woord zelf past niet op één regel (bv. lange URL) — op tekenniveau afbreken.
        for (const chunk of breakLongWord(ctx, word, maxWidth)) {
          ctx.fillText(chunk, x, cursorY);
          cursorY += lineHeight;
        }
        line = "";
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    if (line) {
      ctx.fillText(line, x, cursorY);
      cursorY += lineHeight;
    }
  }
  return cursorY;
}

/** Vlak 1 — Voorkant links: de foto met de groet erover. */
export async function composeFrontLeftImage(photoUrl: string, greeting: string): Promise<Blob> {
  const img = await loadImage(photoUrl);
  const { canvas, ctx } = createCanvas();

  ctx.fillStyle = "#050b17";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);

  const fontSpec = (px: number) => `bold ${px}px system-ui, -apple-system, sans-serif`;
  const textMaxWidth = CANVAS_W - 60;
  const fitted = fitCenteredText(ctx, greeting, textMaxWidth, 2, 42, 26, fontSpec);

  // Band krimpt mee met het aantal regels (padding + regelhoogte), net als op
  // de print-/PDF-versie — een vast percentage liet bij een korte groet te
  // veel band over de foto liggen.
  const bandPaddingY = 28;
  const bandHeight = fitted.lines.length * fitted.lineHeight + bandPaddingY * 2;
  ctx.fillStyle = "rgba(5, 11, 23, 0.85)";
  ctx.fillRect(0, CANVAS_H - bandHeight, CANVAS_W, bandHeight);

  const gradient = ctx.createLinearGradient(0, 0, CANVAS_W, 0);
  gradient.addColorStop(0, "#b8862f");
  gradient.addColorStop(1, "#e6c465");
  ctx.fillStyle = gradient;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  drawFittedLines(ctx, fitted, CANVAS_W / 2, CANVAS_H - bandHeight / 2, textMaxWidth, fontSpec);

  return canvasToPngBlob(canvas);
}

/** Vlak 2 — Voorkant rechts: naam ontvanger, uitleg, QR-code, link, naam gever. */
export async function composeFrontRightImage(params: {
  recipientName: string;
  qrDataUrl: string;
  shareUrl: string;
  giverName: string;
}): Promise<Blob> {
  const { canvas, ctx } = createCanvas();

  const bg = ctx.createLinearGradient(0, 0, CANVAS_W * 0.6, CANVAS_H);
  bg.addColorStop(0, "#0a1830");
  bg.addColorStop(1, "#16305e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const logoImg = await loadImage("/logo.png");
  const logoH = 64;
  const logoW = (logoImg.width / logoImg.height) * logoH;
  const logoPad = 14;
  const logoBoxTop = 50;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    CANVAS_W / 2 - logoW / 2 - logoPad,
    logoBoxTop,
    logoW + logoPad * 2,
    logoH + logoPad * 2
  );
  ctx.drawImage(logoImg, CANVAS_W / 2 - logoW / 2, logoBoxTop + logoPad, logoW, logoH);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "italic 20px system-ui, -apple-system, sans-serif";
  ctx.fillText("Kaart, cadeaubon en herinnering in één", CANVAS_W / 2, logoBoxTop + logoH + logoPad * 2 + 34);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "22px system-ui, -apple-system, sans-serif";
  ctx.fillText("VOOR", CANVAS_W / 2, 230);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 50px system-ui, -apple-system, sans-serif";
  ctx.fillText(params.recipientName, CANVAS_W / 2, 295, CANVAS_W - 100);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "24px system-ui, -apple-system, sans-serif";
  drawWrappedText(
    ctx,
    "Door deze QR-code of link te openen, opent u een webapp die u op uw telefoon of computer kunt installeren.",
    CANVAS_W / 2,
    390,
    CANVAS_W - 180,
    34
  );

  const qrImg = await loadImage(params.qrDataUrl);
  const qrSize = 190;
  const qrPad = 20;
  const qrTop = 600;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(CANVAS_W / 2 - qrSize / 2 - qrPad, qrTop, qrSize + qrPad * 2, qrSize + qrPad * 2);
  ctx.drawImage(qrImg, CANVAS_W / 2 - qrSize / 2, qrTop + qrPad, qrSize, qrSize);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "20px system-ui, -apple-system, sans-serif";
  drawWrappedText(ctx, params.shareUrl, CANVAS_W / 2, qrTop + qrPad * 2 + qrSize + 40, CANVAS_W - 140, 26);

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "26px system-ui, -apple-system, sans-serif";
  ctx.fillText(`— ${params.giverName}`, CANVAS_W / 2, CANVAS_H - 60);

  return canvasToPngBlob(canvas);
}

/**
 * Voegt losse vlak-afbeeldingen samen tot één afbeelding: alle vlakken op
 * gelijke grootte, strikt onder elkaar, in de meegegeven volgorde. Omdat het
 * één bestand is, kan WhatsApp de volgorde niet meer omgooien (dat gebeurt
 * niet betrouwbaar bij los meegestuurde afbeeldingen).
 */
export async function composeCombinedCardImage(panels: Blob[]): Promise<Blob> {
  const objectUrls = panels.map((blob) => URL.createObjectURL(blob));
  try {
    const images = await Promise.all(objectUrls.map((url) => loadImage(url)));

    const gap = 12;
    const totalWidth = CANVAS_W;
    const totalHeight = images.length * CANVAS_H + (images.length - 1) * gap;

    const canvas = document.createElement("canvas");
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas wordt niet ondersteund");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    images.forEach((img, i) => {
      ctx.drawImage(img, 0, i * (CANVAS_H + gap), CANVAS_W, CANVAS_H);
    });

    return canvasToPngBlob(canvas);
  } finally {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }
}

/** Vlak 3 & 4 — Achterkant links/rechts: de boodschap-tekst op wit. */
export async function composeMessageImage(text: string): Promise<Blob> {
  const { canvas, ctx } = createCanvas();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = "rgba(10, 24, 48, 0.85)";
  ctx.font = "26px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  if (text) {
    drawWrappedText(ctx, text, 70, 120, CANVAS_W - 140, 38);
  } else {
    ctx.fillStyle = "rgba(10, 24, 48, 0.3)";
    ctx.font = "24px system-ui, -apple-system, sans-serif";
    ctx.fillText("(blijft leeg)", 70, 120);
  }

  return canvasToPngBlob(canvas);
}
