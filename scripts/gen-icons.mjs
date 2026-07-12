// Genereert eenvoudige PWA-iconen (groen vlak met wit lint, als cadeautje)
// zonder externe dependencies: handmatige PNG-encoding + zlib deflate.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

const NAVY = [10, 24, 48]; // huisstijl navy-900 (#0a1830)
const GOLD = [212, 165, 55]; // huisstijl gold-500 (#d4a537)

function pixelAt(x, y, size) {
  const band = size * 0.12;
  const cx = size / 2;
  // verticaal + horizontaal gouden lint over het midden
  if (Math.abs(x - cx) < band / 2 || Math.abs(y - cx) < band / 2) return GOLD;
  return NAVY;
}

function makePng(size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 3);
    raw[row] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelAt(x, y, size);
      const o = row + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(process.cwd(), "public");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "icon-192.png"), makePng(192));
writeFileSync(path.join(outDir, "icon-512.png"), makePng(512));
writeFileSync(path.join(outDir, "apple-touch-icon.png"), makePng(180));
console.log("Iconen gegenereerd: icon-192.png, icon-512.png, apple-touch-icon.png");
