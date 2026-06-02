(function contatti() {
  const reduced = window.EBM.reducedMotion;

  const form = document.getElementById("contattiForm");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".contatti__step"));
  const stepCurrent = document.getElementById("stepCurrent");
  const nomeInput = document.getElementById("nomeInput");
  const greetName = document.getElementById("greetName");
  const messaggioInput = document.getElementById("messaggioInput");
  const cercoField = document.getElementById("cercoField");
  const eventoField = document.getElementById("eventoField");
  const pkgField = document.getElementById("pkgField");
  const successPanel = document.getElementById("successPanel");
  const successName = document.getElementById("successName");
  const tiles = Array.from(form.querySelectorAll(".contatti__tile"));

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
      const email = document.getElementById("emailInput").value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok) { document.getElementById("emailInput").focus(); return false; }
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

  /* Enter to advance on text inputs */
  [nomeInput, document.getElementById("emailInput")].forEach((inp) => {
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

  /* Submit */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    /* Hide form, show success */
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

    /* Real submit (fire-and-forget if Formspree endpoint configured) */
    const action = form.getAttribute("action");
    if (action && !action.includes("placeholder")) {
      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      }).catch(() => {});
    }
  });

})();
