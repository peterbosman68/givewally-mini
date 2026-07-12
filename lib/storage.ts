import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

/**
 * Slaat een foto op met een random, niet-raadbare bestandsnaam.
 * - Met BLOB_READ_WRITE_TOKEN: Vercel Blob (publiek bereikbaar maar niet oplijstbaar).
 * - Zonder token: lokaal in public/uploads — alleen bedoeld voor development.
 */
export async function savePhoto(file: File, folder: "gifts" | "receipts"): Promise<string> {
  const ext =
    EXTENSIONS[file.type] ?? (path.extname(file.name || "") || ".jpg").toLowerCase();
  const name = `${folder}/${randomBytes(16).toString("hex")}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", addRandomSuffix: false });
    return blob.url;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const target = path.join(process.cwd(), "public", "uploads", ...name.split("/"));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  return `/uploads/${name}`;
}
