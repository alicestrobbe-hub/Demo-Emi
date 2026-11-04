/*
 * ⚠️  COLLEGAMENTO AL GESTIONALE DI EMI — NON MODIFICARE
 *
 * Questo file manda le richieste del form contatti al gestionale di Emi (sezione Contatti,
 * con avviso email a Emi). È la parte "core": nome dei campi, indirizzo, anti-spam e
 * messaggi d'errore devono restare così, altrimenti le richieste non arrivano più.
 *
 * Il form (grafica, testi, passi, animazioni) si può rifare come si vuole in contatti.html,
 * css/contatti.css e js/contatti.js, basta che alla fine chiami:
 *
 *   const result = await window.EmiGestionale.sendLead({ firstName, lastName, email, phone,
 *     contactPreference, cerco, evento, percorso, message, honeypot });
 *   if (result.ok) → mostra il grazie   else → mostra result.error (già in italiano)
 *
 * Regole complete: GESTIONALE.md. Per cambiare questo file chiedere prima ad Alice
 * (AuralpDigital): va cambiato insieme al gestionale.
 */
(function () {
  // l'indirizzo cambia quando c'è il dominio (https://app.<dominio>/api/leads): lo dice Alice
  var ENDPOINT = "https://emi-gestionale.vercel.app/api/leads";

  // il gestionale scarta come bot un invio entro 3 secondi dall'apertura della pagina
  var startedAt = Date.now();

  var CERCO = {
    percorso: "Un percorso personale",
    evento: "Info su un evento",
    community: "Far parte della community",
    curiosa: "Sono curiosa",
  };

  // il gestionale salva solo il messaggio: cosa cerca, evento e percorso vanno in testa al testo
  function buildMessage(d) {
    var lines = [];
    if (d.cerco) lines.push("Cerco: " + (CERCO[d.cerco] || d.cerco));
    if (d.evento) lines.push("Evento: " + d.evento);
    if (d.percorso) lines.push("Percorso: " + d.percorso);
    var text = (d.message || "").trim();
    if (text) lines.push("", text);
    return lines.join("\n").trim().slice(0, 2000);
  }

  async function sendLead(d) {
    var pref = d.contactPreference; // "whatsapp" | "telefono" | "email"
    var payload = {
      first_name: (d.firstName || "").trim(),
      last_name: (d.lastName || "").trim(),
      email: (d.email || "").trim(),
      phone: pref === "email" ? "" : (d.phone || "").trim(),
      contact_preference: pref,
      message: buildMessage(d),
      website: d.honeypot || "", // trappola per i bot: deve arrivare vuota
      started_at: startedAt,
    };
    try {
      var res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return { ok: true };
      var data = await res.json().catch(function () { return {}; });
      return { ok: false, error: data.error || "Non riesco a mandare il messaggio. Riprova tra poco." };
    } catch (err) {
      return { ok: false, error: "Non riesco a mandare il messaggio. Controlla la connessione e riprova." };
    }
  }

  window.EmiGestionale = { sendLead: sendLead };
})();
