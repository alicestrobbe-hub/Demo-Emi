/*
 * Esporta SOLO le foto scelte da "assets/img nuove/" (originali, non nel repo)
 * in assets/img/ come WebP a 800 / 1600 / 2400 px, qualità 75, senza metadati.
 *
 * Uso:  cd tools && npm install && npm run export-images
 * Per aggiungere una foto: aggiungi una riga a FOTO e rilancia.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "assets", "img nuove");
const OUT = path.join(ROOT, "assets", "img");
const WIDTHS = [800, 1600, 2400];
const QUALITY = 75;
const MAX_KB = 500;

// numero originale ("Emi body movement-N.jpg") → nome parlante
const FOTO = {
  // hero
  82: "hero-gruppo",
  // ritratti di Emi
  108: "emi-sorriso",
  134: "emi-ritratto-risata",
  138: "emi-respiro",
  117: "emi-affondo",
  29: "emi-accoglienza",
  // gruppo e allenamento
  31: "gruppo-correzione-risata",
  36: "allenamento-postura",
  142: "gruppo-spiegazione",
  14: "sala-luce",
  119: "gruppo-affondi",
  68: "community-batti-cinque",
  27: "community-pausa",
  85: "gruppo-rilassamento",
  17: "gruppo-mobilita",
  // dettagli
  116: "dettaglio-tecnica-1",
  105: "dettaglio-tecnica-2",
  127: "dettaglio-tecnica-3",
  94: "dettaglio-tecnica-4",
  114: "dettaglio-tecnica-5",
  92: "dettaglio-tecnica-6",
  33: "dettaglio-tecnica-7",
  // galleria
  9: "galleria-01", 11: "galleria-02", 18: "galleria-03", 26: "galleria-04",
  42: "galleria-05", 46: "galleria-06", 65: "galleria-07", 73: "galleria-08",
  97: "galleria-09", 122: "galleria-10", 125: "galleria-11", 137: "galleria-12",
  141: "galleria-13",
};

// vecchie foto già nel repo, riusate per le esperienze passate
const VECCHIE = {
  "copertinaroller.jpg": "evento-roller",
  "copertinacatamarano.jpg": "evento-catamarano",
  "roller1.jpg": "evento-roller-1",
  "roller2.jpg": "evento-roller-2",
  "roller3.jpg": "evento-roller-3",
};

async function exportOne(file, name, manifest) {
  const img = sharp(file).rotate(); // applica l'orientamento EXIF, poi i metadati vengono scartati
  const meta = await img.metadata();
  const portrait = (meta.orientation || 1) >= 5;
  const w0 = portrait ? meta.height : meta.width;
  const h0 = portrait ? meta.width : meta.height;
  const sizes = [];
  // niente ingrandimenti: se l'originale è più piccolo, l'ultima misura è la sua larghezza vera
  const widths = WIDTHS.filter((w) => w < w0);
  if (widths.length < WIDTHS.length) widths.push(w0);
  for (const w of widths) {
    const width = w;
    let q = QUALITY;
    const out = path.join(OUT, `${name}-${w}.webp`);
    for (;;) {
      await sharp(file).rotate().resize({ width }).webp({ quality: q, effort: 5 }).toFile(out);
      const kb = fs.statSync(out).size / 1024;
      if (kb <= MAX_KB || q <= 50) break;
      q -= 5; // abbassa la qualità finché non sta sotto i 500 KB
    }
    sizes.push(`${w}:${Math.round(fs.statSync(out).size / 1024)}KB`);
  }
  manifest[name] = { width: w0, height: h0, widths };
  console.log(name.padEnd(28), `${w0}x${h0}`, sizes.join("  "));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = {};
  for (const [n, name] of Object.entries(FOTO)) {
    await exportOne(path.join(SRC, `Emi body movement-${n}.jpg`), name, manifest);
  }
  for (const [f, name] of Object.entries(VECCHIE)) {
    await exportOne(path.join(ROOT, "assets", f), name, manifest);
  }
  // poster del video (primo fotogramma utile) — generato a parte con ffmpeg se serve
  fs.writeFileSync(path.join(__dirname, "images.json"), JSON.stringify(manifest, null, 2));
})();
