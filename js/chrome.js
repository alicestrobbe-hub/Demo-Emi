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
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    const goingDown = y > lastY && y > 400;
    if (!document.documentElement.classList.contains("menu-open")) nav.classList.toggle("is-hidden", goingDown);
    lastY = y;
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  nav.addEventListener("focusin", () => nav.classList.remove("is-hidden"));

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
      nav.classList.remove("is-hidden");
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
