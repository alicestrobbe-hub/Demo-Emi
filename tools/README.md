# Strumenti (non servono al sito pubblicato)

Il sito è HTML statico: si apre e si pubblica così com'è. Questi script aiutano solo a modificarlo.

```bash
cd tools && npm install        # una volta sola (installa sharp)
```

| Comando | Cosa fa |
| --- | --- |
| `node build.js` | Ricopia nav, footer e form (`tools/partials/`) in tutte le pagine, trasforma i segnaposto `{{img:nome\|alt\|sizes}}` in `<img>` completi e rigenera lo schema FAQ di `faq.html`. |
| `node export-images.js` | Esporta le foto scelte da `assets/img nuove/` (originali, fuori dal repo) in `assets/img/` come WebP 800/1600/2400 px. |

## Dove si cambia cosa

- **Colori, font, angoli**: `css/tokens.css` (palette e font sono provvisori).
- **Numero WhatsApp, link "Accedi"**: `js/config.js`.
- **Eventi in programma**: `js/eventi-data.js`.
- **Prezzi**: blocco `<!-- PREZZI -->` in `percorsi.html` + `tools/partials/schema-business.html`.
- **Banner promo in home**: classe `is-off` sull'elemento `.promo` in `index.html` per spegnerlo.
- **Dominio**: canonical, Open Graph, sitemap e schema usano `https://www.emibodymovement.it` come segnaposto: cercare e sostituire quando c'è il dominio vero.
- **Form contatti**: vedi `GESTIONALE.md`. `js/gestionale-form.js` non si tocca.
