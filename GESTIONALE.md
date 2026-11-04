# Form contatti → gestionale di Emi

Il form di `contatti.html` manda le richieste nel **gestionale di Emi** (sezione Contatti) e a Emi arriva un avviso per email. Il collegamento l'ha fatto AuralpDigital (Alice) e funziona insieme al gestionale: se si rompe, Emi non riceve più le richieste e nessuno se ne accorge.

## Cosa si può cambiare liberamente

- Grafica, testi delle domande, ordine e numero dei passi, animazioni, layout, mobile: `contatti.html`, `css/contatti.css`, `js/contatti.js`.
- Si può anche rifare il form da zero, o spostarlo in un'altra pagina.

## Cosa NON si tocca (il "core")

1. **`js/gestionale-form.js`**: non modificarlo, non copiarne il contenuto altrove, non sostituirlo con Formspree, Netlify Forms, EmailJS o simili. Va caricato prima del JS del form.
2. Il form, comunque sia disegnato, deve raccogliere e passare a `window.EmiGestionale.sendLead(...)`:

   | Campo | Obbligatorio | Note |
   | --- | --- | --- |
   | `firstName`, `lastName` | sì | nome e cognome, max 80 caratteri |
   | `email` | sì | |
   | `contactPreference` | sì | esattamente `"whatsapp"`, `"telefono"` o `"email"` |
   | `phone` | sì se la preferenza non è email | |
   | `message` | no | testo libero |
   | `cerco`, `evento`, `percorso` | no | finiscono in testa al messaggio per Emi |
   | `honeypot` | — | valore del campo nascosto `website` (trappola per i bot): il campo deve esserci, nascosto alle persone ma **non** `type="hidden"` |

   Non aggiungere campi nuovi aspettandosi che arrivino a Emi: il gestionale non li salva (vanno nel messaggio, come `cerco`).
3. **Casella dell'informativa privacy** obbligatoria prima dell'invio, con link a `privacy.html`.
4. Il **grazie si mostra solo se `result.ok` è vero**. Altrimenti si mostra `result.error` (è già in italiano) e la persona può riprovare. Mai mostrare il grazie prima della risposta.
5. Se il sito cambia indirizzo (dominio nuovo, altro hosting, anteprime) il gestionale rifiuta le richieste (`Origine non ammessa`) finché Alice non aggiunge il nuovo indirizzo. **Dirlo ad Alice prima di andare online.**

Se un redesign richiede di cambiare una di queste cose: **fermarsi e chiedere ad Alice**, non trovare un'alternativa da soli.

## Come provare dopo un redesign

Dal sito pubblicato (non da `file://`): compilare il form con un'email vera e "Prova" nel messaggio → deve comparire il grazie → avvisare Alice, che controlla che la richiesta sia arrivata nei Contatti e la cancella.
