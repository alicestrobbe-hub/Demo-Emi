/* Nav, menu mobile e link presi da js/config.js (WhatsApp, Accedi) */
(function chrome() {
  const cfg = window.EMI_CONFIG || {};

  /* WhatsApp e Accedi */
  const waUrl = `https://wa.me/${(cfg.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(cfg.whatsappMessaggio || "")}`;
  document.querySelectorAll("[data-wa]").forEach((a) => {
    const custom = a.getAttribute("data-wa");
    a.href = custom ? `https://wa.me/${(cfg.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(custom)}` : waUrl;
  });
  if (cfg.accediUrl) document.querySelectorAll("[data-accedi]").forEach((a) => (a.href = cfg.accediUrl));

  /* Nav: sfondo pieno dopo lo scroll, si nasconde scendendo e ricompare salendo */
  const nav = document.querySelector("[data-nav-root]");
  if (!nav) return;
  /* Un solo aggiornamento per fotogramma e una soglia di qualche pixel: così i piccoli
     cambi di direzione dello scroll morbido (Lenis, trackpad) non fanno sparire e
     ricomparire la barra di continuo. Le classi cambiano solo quando cambia lo stato. */
  const HIDE_AFTER = 14;   // px scesi di fila prima di nasconderla
  const SHOW_AFTER = 6;    // px saliti di fila prima di rimostrarla
  let lastY = window.scrollY, travel = 0, scrolled = null, hidden = false, ticking = false;
  function setHidden(v) {
    if (v === hidden) return;
    hidden = v;
    nav.classList.toggle("is-hidden", v);
  }
  function update() {
    ticking = false;
    const y = Math.max(window.scrollY, 0);
    const isScrolled = y > 24;
    if (isScrolled !== scrolled) { scrolled = isScrolled; nav.classList.toggle("is-scrolled", isScrolled); }

    const dy = y - lastY;
    lastY = y;
    if (document.documentElement.classList.contains("menu-open") || y < 400) { travel = 0; setHidden(false); return; }
    if (!dy) return;
    travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy; // si azzera quando cambia direzione
    if (travel > HIDE_AFTER) setHidden(true);
    else if (travel < -SHOW_AFTER) setHidden(false);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  nav.addEventListener("focusin", () => setHidden(false));

  /* Menu mobile a schermo intero */
  const burger = nav.querySelector(".nav__burger");
  const menu = document.getElementById("menu-mobile");
  const label = nav.querySelector("[data-burger-label]");
  if (!burger || !menu) return;
  const root = document.documentElement;

  function setOpen(open) {
    root.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Chiudi il menu" : "Apri il menu";
    document.body.style.overflow = open ? "hidden" : "";
    if (window.EBM && window.EBM.lenis) open ? window.EBM.lenis.stop() : window.EBM.lenis.start();
    if (open) {
      setHidden(false);
      const first = menu.querySelector("a");
      if (first) setTimeout(() => first.focus(), 80);
    }
  }
  burger.addEventListener("click", () => setOpen(!root.classList.contains("menu-open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("menu-open")) { setOpen(false); burger.focus(); }
  });
  window.matchMedia("(min-width: 1180px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
})();
