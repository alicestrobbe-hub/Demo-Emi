(function contatti() {
  const reduced = window.EBM.reducedMotion;

  const form = document.getElementById("contattiForm");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".contatti__step"));
  const stepCurrent = document.getElementById("stepCurrent");
  const nomeInput = document.getElementById("nomeInput");
  const cognomeInput = document.getElementById("cognomeInput");
  const telefonoInput = document.getElementById("telefonoInput");
  const emailInput = document.getElementById("emailInput");
  const privacyInput = document.getElementById("privacyInput");
  const submitBtn = form.querySelector('button[type="submit"]');
  const greetName = document.getElementById("greetName");
  const messaggioInput = document.getElementById("messaggioInput");
  const cercoField = document.getElementById("cercoField");
  const eventoField = document.getElementById("eventoField");
  const pkgField = document.getElementById("pkgField");
  const successPanel = document.getElementById("successPanel");
  const successName = document.getElementById("successName");
  const tiles = Array.from(form.querySelectorAll(".contatti__tile[data-tile]"));
  const prefTiles = Array.from(form.querySelectorAll(".contatti__tile[data-pref]"));
  let pref = "";

  /* Pre-fill from query string (?evento=catamarano | ?pkg=primo-passo) */
  const params = new URLSearchParams(location.search);
  const ev = params.get("evento");
  const pkg = params.get("pkg");
  if (ev) {
    eventoField.value = ev;
    messaggioInput.value = `Ciao Emi, mi interessa l'evento "${ev}". `;
  }
  if (pkg) {
    pkgField.value = pkg;
    messaggioInput.value = `Ciao Emi, vorrei sapere di più sul percorso "${pkg}". `;
  }

  let current = 0;

  function setError(step, text) {
    const el = form.querySelector(`[data-error="${step}"]`);
    if (el) el.textContent = text || "";
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function show(target, dir = 1) {
    const from = steps[current];
    const to = steps[target];
    if (!to) return;
    current = target;
    stepCurrent.textContent = pad(target + 1);

    if (reduced) {
      from.classList.remove("is-active");
      to.classList.add("is-active");
      const firstInput = to.querySelector("input, textarea, button.contatti__tile");
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
      return;
    }

    const tl = gsap.timeline({
      defaults: { duration: 0.45, ease: "power3.out" },
    });
    tl.to(from, { opacity: 0, x: dir * -30, filter: "blur(6px)", duration: 0.35 })
      .add(() => {
        from.classList.remove("is-active");
        to.classList.add("is-active");
        gsap.set(to, { opacity: 0, x: dir * 30, filter: "blur(6px)" });
      })
      .to(to, { opacity: 1, x: 0, filter: "blur(0px)" })
      .add(() => {
        const firstInput = to.querySelector("input, textarea, button.contatti__tile");
        if (firstInput) firstInput.focus({ preventScroll: true });
      });
  }

  function validateStep() {
    const step = steps[current];
    const stepNum = step.dataset.step;
    if (stepNum === "1") {
      const name = nomeInput.value.trim();
      if (!name) { nomeInput.focus(); return false; }
      if (!cognomeInput.value.trim()) { cognomeInput.focus(); return false; }
      greetName.textContent = `Ciao ${name},`;
      successName.textContent = `Grazie, ${name}.`;
      return true;
    }
    if (stepNum === "2") {
      if (!cercoField.value) {
        const first = tiles[0];
        if (first) first.focus();
        return false;
      }
      return true;
    }
    if (stepNum === "3") return true;
    if (stepNum === "4") {
      if (!pref) {
        setError(4, "Scegli come preferisci che ti ricontatti.");
        if (prefTiles[0]) prefTiles[0].focus();
        return false;
      }
      if (pref !== "email" && !/^[+0-9 ()./-]{6,40}$/.test(telefonoInput.value.trim())) {
        setError(4, "Scrivi un numero di telefono valido.");
        telefonoInput.focus();
        return false;
      }
      setError(4, "");
      return true;
    }
    if (stepNum === "5") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
      if (!ok) { emailInput.focus(); return false; }
      if (!privacyInput.checked) {
        setError(5, "Per mandare il messaggio serve la spunta sull'informativa privacy.");
        privacyInput.focus();
        return false;
      }
      setError(5, "");
      return true;
    }
    return true;
  }

  form.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!validateStep()) return;
      if (current < steps.length - 1) show(current + 1, 1);
    });
  });

  form.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (current > 0) show(current - 1, -1);
    });
  });

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      tiles.forEach((t) => t.classList.remove("is-selected"));
      tile.classList.add("is-selected");
      cercoField.value = tile.dataset.tile;
    });
  });

  prefTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      prefTiles.forEach((t) => {
        t.classList.remove("is-selected");
        t.setAttribute("aria-checked", "false");
      });
      tile.classList.add("is-selected");
      tile.setAttribute("aria-checked", "true");
      pref = tile.dataset.pref;
      telefonoInput.hidden = pref === "email";
      telefonoInput.required = pref !== "email";
      setError(4, "");
      if (!telefonoInput.hidden) telefonoInput.focus({ preventScroll: true });
    });
  });

  /* Enter to advance on text inputs */
  [nomeInput, cognomeInput, telefonoInput, emailInput].forEach((inp) => {
    if (!inp) return;
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const isLast = current === steps.length - 1;
        if (isLast) { form.requestSubmit(); return; }
        if (validateStep()) show(current + 1, 1);
      }
    });
  });

  function showSuccess() {
    if (reduced) {
      form.style.display = "none";
      successPanel.classList.add("is-active");
      return;
    }
    gsap.to(form, {
      opacity: 0,
      y: -16,
      filter: "blur(6px)",
      duration: 0.45,
      ease: "power3.out",
      onComplete: () => {
        form.style.display = "none";
        successPanel.classList.add("is-active");
        gsap.fromTo(successPanel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      },
    });
  }

  /* Submit: la richiesta va nel gestionale di Emi (Contatti), tramite js/gestionale-form.js */
  let sending = false;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending || !validateStep()) return;
    sending = true;
    submitBtn.setAttribute("aria-busy", "true");
    setError(5, "");

    // l'invio vero sta in js/gestionale-form.js: non riscriverlo qui
    const result = await window.EmiGestionale.sendLead({
      firstName: nomeInput.value.trim(),
      lastName: cognomeInput.value.trim(),
      email: emailInput.value.trim(),
      phone: telefonoInput.value.trim(),
      contactPreference: pref,
      cerco: cercoField.value,
      evento: eventoField.value,
      percorso: pkgField.value,
      message: messaggioInput.value,
      honeypot: form.elements.website.value,
    });
    sending = false;
    submitBtn.removeAttribute("aria-busy");
    if (result.ok) showSuccess();
    else setError(5, result.error);
  });

})();
