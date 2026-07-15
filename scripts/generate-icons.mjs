import sharp from "sharp";
import { mkdirSync } from "fs";
import { dirname } from "path";

const OUT_DIR = new URL("../extension/icons/", import.meta.url).pathname;

const SIZES = [16, 32, 48, 128];

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#D31F3D"/>
      <stop offset="1" stop-color="#a01830"/>
    </linearGradient>
    <linearGradient id="extract" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f87171"/>
      <stop offset="1" stop-color="#ef4444"/>
    </linearGradient>
  </defs>

  <!-- Rounded background -->
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>

  <!-- Document -->
  <rect x="28" y="22" width="52" height="68" rx="6" fill="#fef2f2"/>
  <rect x="28" y="22" width="52" height="68" rx="6" fill="none" stroke="#fecaca" stroke-width="1.5"/>

  <!-- Text lines on document -->
  <rect x="36" y="34" width="36" height="4" rx="2" fill="#9ca3af"/>
  <rect x="36" y="44" width="28" height="4" rx="2" fill="#9ca3af"/>
  <rect x="36" y="54" width="32" height="4" rx="2" fill="#9ca3af"/>
  <rect x="36" y="64" width="24" height="4" rx="2" fill="#9ca3af"/>
  <rect x="36" y="74" width="30" height="4" rx="2" fill="#9ca3af"/>

  <!-- Extraction arrow / beam -->
  <path d="M82 48 L108 48 L108 42 L118 52 L108 62 L108 56 L82 56 Z"
        fill="url(#extract)"/>

  <!-- Extracted text (brighter, moving out) -->
  <rect x="86" y="68" width="24" height="4" rx="2" fill="#fca5a5" opacity="0.9"/>
  <rect x="86" y="78" width="18" height="4" rx="2" fill="#fca5a5" opacity="0.7"/>
  <rect x="86" y="88" width="22" height="4" rx="2" fill="#fca5a5" opacity="0.5"/>
</svg>`;

mkdirSync(OUT_DIR, { recursive: true });

for (const size of SIZES) {
  await sharp(Buffer.from(ICON_SVG))
    .resize(size, size)
    .png()
    .toFile(`${OUT_DIR}icon${size}.png`);
  console.log(`Generated icon${size}.png`);
}

console.log("Done.");
