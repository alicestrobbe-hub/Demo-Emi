/*
 * Form "Parliamone!" (uguale su tutte le pagine).
 * La grafica e i testi si possono cambiare; l'invio vero sta in js/gestionale-form.js
 * e NON va riscritto qui. Regole: GESTIONALE.md.
 */
(function leadForms() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(location.search);

  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    const el = form.elements;
    const phoneField = form.querySelector("[data-phone-field]");
    const errorBox = form.querySelector("[data-form-error]");
    const submitBtn = form.querySelector('[type="submit"]');
    const success = form.parentElement.querySelector("[data-form-success]");
    const successTitle = success && success.querySelector("[data-success-title]");

    /* Precompilazione dai link: ?cerco=prova|percorso|evento|community|curiosa, ?percorso=FLOW, ?evento=Roller */
    const cerco = params.get("cerco");
    if (cerco) el.cerco.value = cerco === "prova" ? "Prenotare una prova" : cerco;
    if (params.get("percorso")) {
      el.percorso.value = params.get("percorso");
      if (!cerco) el.cerco.value = "percorso";
    }
    if (params.get("evento")) {
      el.evento.value = params.get("evento");
      if (!cerco) el.cerco.value = "evento";
    }

    function pref() {
      const c = form.querySelector('input[name="pref"]:checked');
      return c ? c.value : "";
    }
    function syncPhone() {
      const needsPhone = pref() && pref() !== "email";
      phoneField.hidden = !needsPhone;
      el.telefono.required = !!needsPhone;
    }
    form.querySelectorAll('input[name="pref"]').forEach((r) => r.addEventListener("change", () => {
      syncPhone();
      if (!phoneField.hidden) el.telefono.focus({ preventScroll: true });
    }));
    syncPhone();

    function fail(input, msg) {
      errorBox.textContent = msg;
      if (input) {
        input.setAttribute("aria-invalid", "true");
        input.focus();
      }
      return false;
    }
    form.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid")) e.target.removeAttribute("aria-invalid");
    });

    function validate() {
      errorBox.textContent = "";
      if (!el.nome.value.trim()) return fail(el.nome, "Scrivi il tuo nome.");
      if (!el.cognome.value.trim()) return fail(el.cognome, "Scrivi il tuo cognome.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.email.value.trim())) return fail(el.email, "Scrivi un indirizzo email valido.");
      if (!pref()) return fail(form.querySelector('input[name="pref"]'), "Scegli come preferisci che ti ricontatti.");
      if (pref() !== "email" && !/^[+0-9 ()./-]{6,40}$/.test(el.telefono.value.trim())) {
        return fail(el.telefono, "Scrivi un numero di telefono valido.");
      }
      if (!el.privacy.checked) return fail(el.privacy, "Per mandare il messaggio serve la spunta sull'informativa privacy.");
      return true;
    }

    let sending = false;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sending || !validate()) return;
      sending = true;
      submitBtn.setAttribute("aria-busy", "true");
      const label = submitBtn.textContent;
      submitBtn.textContent = "Invio in corso…";

      // l'invio vero sta in js/gestionale-form.js: non riscriverlo qui
      const result = await window.EmiGestionale.sendLead({
        firstName: el.nome.value.trim(),
        lastName: el.cognome.value.trim(),
        email: el.email.value.trim(),
        phone: el.telefono.value.trim(),
        contactPreference: pref(),
        cerco: el.cerco.value,
        evento: el.evento.value,
        percorso: el.percorso.value,
        message: el.messaggio.value,
        honeypot: el.website.value,
      });

      sending = false;
      submitBtn.removeAttribute("aria-busy");
      submitBtn.textContent = label;

      if (result.ok) {
        // il grazie compare SOLO se il gestionale ha risposto ok
        if (successTitle) successTitle.textContent = `Grazie, ${el.nome.value.trim()}!`;
        form.hidden = true;
        success.hidden = false;
        success.focus({ preventScroll: true });
        if (!reduced && window.gsap) gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 });
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      } else {
        fail(null, result.error);
      }
    });
  });
})();
