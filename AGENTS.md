# Istruzioni per gli assistenti AI (Claude, Codex, …)

## ⚠️ STOP: form contatti collegato al gestionale di Emi

Il form contatti (`contatti.html`) manda le richieste al gestionale di Emi tramite **`js/gestionale-form.js`**. Prima di qualsiasi lavoro sul form leggere **`GESTIONALE.md`**.

Regole per l'assistente:

- **Non modificare, spostare, rinominare o eliminare `js/gestionale-form.js`.** Non riscriverne la logica in altri file e non sostituirla con altri servizi (Formspree, Netlify Forms, EmailJS, mailto…).
- Su grafica, testi, passi, animazioni e layout del form si può lavorare liberamente, ma il form finale deve continuare a chiamare `window.EmiGestionale.sendLead(...)` con i campi elencati in `GESTIONALE.md`, avere la casella privacy obbligatoria e il campo trappola `website`, e mostrare il grazie solo se `result.ok` è vero.
- **Se la richiesta dell'utente porterebbe a violare una di queste regole** (togliere un campo obbligatorio come cognome o preferenza di contatto, cambiare l'invio, cambiare l'indirizzo del sito o del gestionale, aggiungere campi che devono arrivare a Emi): **fermati prima di modificare i file**, spiega all'utente che quella parte è collegata al gestionale di Emi e che va concordata con Alice (AuralpDigital), e aspetta la sua conferma esplicita.
- Alla fine di un lavoro sul form, ricordare all'utente la prova descritta in `GESTIONALE.md` ("Come provare dopo un redesign").
