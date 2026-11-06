/*
 * Scrollbar personalizzata (solo mouse/trackpad: su touch resta quella del sistema).
 * La scrollbar standard viene nascosta solo se questo script parte, quindi senza JS il sito scorre normalmente.
 * Rotellina, tastiera e trackpad funzionano come sempre; la barra si può anche trascinare o cliccare.
 */
(function scrollbar() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const root = document.documentElement;
  const bar = document.createElement("div");
  bar.className = "scrollbar";
  bar.setAttribute("aria-hidden", "true");
  bar.innerHTML = '<div class="scrollbar__thumb"></div>';
  document.body.appendChild(bar);
  root.classList.add("has-custom-scrollbar");

  const thumb = bar.firstElementChild;
  let thumbH = 0, maxScroll = 0, track = 0, hideTimer = 0, dragging = false, dragStartY = 0, dragStartScroll = 0;

  function measure() {
    const vh = window.innerHeight;
    const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    maxScroll = Math.max(docH - vh, 0);
    track = vh - 16; // 8px di margine sopra e sotto
    thumbH = maxScroll ? Math.max(48, Math.round((vh / docH) * track)) : 0;
    thumb.style.height = thumbH + "px";
    bar.classList.toggle("is-disabled", !maxScroll);
    position();
  }
  function position() {
    const y = maxScroll ? (window.scrollY / maxScroll) * (track - thumbH) : 0;
    thumb.style.transform = `translateY(${y}px)`;
  }
  function wake() {
    bar.classList.add("is-active");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (!dragging && !bar.matches(":hover")) bar.classList.remove("is-active"); }, 1200);
  }
  function scrollToY(y, smooth) {
    y = Math.min(Math.max(y, 0), maxScroll);
    const lenis = window.EBM && window.EBM.lenis;
    if (lenis) lenis.scrollTo(y, { immediate: !smooth, duration: smooth ? 1 : 0 });
    else window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
  }

  window.addEventListener("scroll", () => { position(); wake(); }, { passive: true });
  window.addEventListener("resize", measure);
  new ResizeObserver(measure).observe(document.body);
  window.addEventListener("load", measure);

  /* trascinare il cursore */
  thumb.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    dragStartY = e.clientY;
    dragStartScroll = window.scrollY;
    thumb.setPointerCapture(e.pointerId);
    bar.classList.add("is-dragging", "is-active");
    root.classList.add("is-scrollbar-dragging");
  });
  thumb.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const ratio = maxScroll / Math.max(track - thumbH, 1);
    scrollToY(dragStartScroll + (e.clientY - dragStartY) * ratio, false);
  });
  const stop = () => {
    dragging = false;
    bar.classList.remove("is-dragging");
    root.classList.remove("is-scrollbar-dragging");
    wake();
  };
  thumb.addEventListener("pointerup", stop);
  thumb.addEventListener("pointercancel", stop);

  /* clic sulla traccia: salta lì */
  bar.addEventListener("pointerdown", (e) => {
    if (e.target === thumb) return;
    const rect = bar.getBoundingClientRect();
    const p = (e.clientY - rect.top - thumbH / 2) / Math.max(track - thumbH, 1);
    scrollToY(p * maxScroll, true);
  });
  bar.addEventListener("pointerenter", () => bar.classList.add("is-active"));
  bar.addEventListener("pointerleave", wake);

  measure();
})();
