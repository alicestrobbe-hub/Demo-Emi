/*
 * Aiuto per l'HTML statico (il sito NON ha bisogno di build per funzionare).
 *
 *   cd tools && node build.js
 *
 * Fa tre cose su tutte le pagine .html:
 * 1. Pezzi comuni: tra <!-- @include nome --> e <!-- @end nome --> rimette il contenuto
 *    di tools/partials/nome.html (nav, footer, form…). Cambi il pezzo una volta, rilanci, fatto.
 *    Nei pezzi: {{root}} = "" oppure "../" per le pagine in sottocartella;
 *    il link con data-nav uguale a <body data-page="…"> prende aria-current="page".
 * 2. Foto: il segnaposto {{img:nome|alt|sizes|classe|eager}} diventa un <img> completo
 *    (srcset 800/1600/2400, width/height veri, lazy tranne "eager"). Dati in tools/images.json.
 * 3. FAQ: rigenera lo JSON-LD FAQPage (<script id="faq-schema">) dalle domande <details class="faq__item">.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PARTIALS = path.join(__dirname, "partials");
const images = JSON.parse(fs.readFileSync(path.join(__dirname, "images.json"), "utf8"));

const pages = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")),
  ...fs.readdirSync(path.join(ROOT, "eventi")).filter((f) => f.endsWith(".html") && !f.includes(" ")).map((f) => "eventi/" + f),
];

function imgTag(spec, root) {
  const [name, alt = "", sizes = "100vw", cls = "", mode = ""] = spec.split("|").map((s) => s.trim());
  const meta = images[name];
  if (!meta) throw new Error("Foto sconosciuta: " + name);
  const src = (w) => `${root}assets/img/${name}-${w}.webp`;
  const srcset = meta.widths.map((w) => `${src(w)} ${w}w`).join(", ");
  const mid = meta.widths.find((w) => w >= 1600) || meta.widths[meta.widths.length - 1];
  const eager = mode === "eager";
  return (
    `<img src="${src(mid)}" srcset="${srcset}" sizes="${sizes}" width="${meta.width}" height="${meta.height}" alt="${alt}"` +
    (cls ? ` class="${cls}"` : "") +
    (eager ? ` fetchpriority="high"` : ` loading="lazy"`) +
    ` decoding="async" />`
  );
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

for (const rel of pages) {
  const file = path.join(ROOT, rel);
  let html = fs.readFileSync(file, "utf8");
  const root = rel.includes("/") ? "../" : "";
  const page = (html.match(/<body[^>]*data-page="([^"]+)"/) || [])[1] || "";

  // 1. pezzi comuni (anche annidati: un pezzo può includerne un altro)
  const expand = (text) => text.replace(/<!-- @include ([\w-]+) -->[\s\S]*?<!-- @end \1 -->/g, (m, name) => {
    let part = expand(fs.readFileSync(path.join(PARTIALS, name + ".html"), "utf8").trim());
    part = part.replace(/\{\{root\}\}/g, root);
    if (page) {
      part = part.replace(new RegExp(`data-nav="${page}"(?! aria-current)`, "g"), `data-nav="${page}" aria-current="page"`);
    }
    return `<!-- @include ${name} -->\n${part}\n<!-- @end ${name} -->`;
  });
  html = expand(html);

  // 2. foto
  html = html.replace(/\{\{img:([^}]+)\}\}/g, (m, spec) => imgTag(spec, root));

  // 3. FAQ → JSON-LD
  if (html.includes('id="faq-schema"')) {
    const items = [];
    const re = /<details class="faq__item"[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<div class="faq__answer">([\s\S]*?)<\/div>\s*<\/details>/g;
    let m;
    while ((m = re.exec(html))) {
      items.push({
        "@type": "Question",
        name: stripTags(m[1]),
        acceptedAnswer: { "@type": "Answer", text: stripTags(m[2]) },
      });
    }
    const json = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items }, null, 2);
    html = html.replace(
      /<script type="application\/ld\+json" id="faq-schema">[\s\S]*?<\/script>/,
      `<script type="application/ld+json" id="faq-schema">\n${json}\n</script>`
    );
  }

  fs.writeFileSync(file, html);
  console.log("ok", rel);
}
