// Eenmalig hulpscript: kopieert het GiveWally-logo uit de grote app.
import { copyFileSync } from "node:fs";
import path from "node:path";

const source = path.join(
  "C:",
  "Users",
  "peter",
  "OneDrive",
  "5. NieuweBedrijven",
  "WebsitesBouwen",
  "GiveWallyClaude",
  "public",
  "logo.png"
);
const target = path.join(process.cwd(), "public", "logo.png");

copyFileSync(source, target);
console.log("logo.png gekopieerd naar public/");
