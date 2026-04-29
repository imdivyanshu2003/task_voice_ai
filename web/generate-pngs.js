import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const svg192 = readFileSync("public/icon-192.svg");
const svg512 = readFileSync("public/icon-512.svg");

await sharp(svg192).resize(192, 192).png().toFile("public/icon-192.png");
console.log("✅ icon-192.png created");

await sharp(svg512).resize(512, 512).png().toFile("public/icon-512.png");
console.log("✅ icon-512.png created");

// Also create a maskable version with padding (safe zone is 80% center)
await sharp(svg512)
  .resize(410, 410)
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: { r: 14, g: 11, b: 26, alpha: 1 } })
  .png()
  .toFile("public/icon-512-maskable.png");
console.log("✅ icon-512-maskable.png created (maskable)");

// Create screenshot placeholders — wide and narrow
const screenshotWide = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
    <rect width="1280" height="720" rx="0" fill="#0E0B1A"/>
    <text x="640" y="300" text-anchor="middle" font-family="sans-serif" font-size="64" font-weight="bold" fill="#B39DFF">Saathi AI</text>
    <text x="640" y="380" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#9C95B8">Emotion + Action — your AI companion</text>
    <text x="640" y="440" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#FFB48A">Voice-first • Private • Smart Tasks • Reminders</text>
  </svg>`
);
await sharp(screenshotWide).resize(1280, 720).png().toFile("public/screenshot-wide.png");
console.log("✅ screenshot-wide.png created");

const screenshotNarrow = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844">
    <rect width="390" height="844" fill="#0E0B1A"/>
    <circle cx="195" cy="280" r="80" fill="url(#g)"/>
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#B39DFF"/><stop offset="100%" stop-color="#FFB48A"/></linearGradient></defs>
    <path d="M195 240 L205 270 L237 270 L211 288 L221 318 L195 300 L169 318 L179 288 L153 270 L185 270 Z" fill="white"/>
    <text x="195" y="420" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="white">Saathi AI</text>
    <text x="195" y="460" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#9C95B8">Emotion + Action</text>
    <text x="195" y="520" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#B39DFF">🎤 Voice Chat</text>
    <text x="195" y="550" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#7BD389">📋 Smart Tasks</text>
    <text x="195" y="580" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#FFB48A">🔒 Private by Design</text>
  </svg>`
);
await sharp(screenshotNarrow).resize(390, 844).png().toFile("public/screenshot-narrow.png");
console.log("✅ screenshot-narrow.png created");

console.log("\nAll icons and screenshots generated!");
