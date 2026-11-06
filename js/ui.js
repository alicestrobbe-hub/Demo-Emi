/* Componenti: slider, video di Emi, interruttore percorsi, filtri journal, mappa con consenso */
(function ui() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Slider orizzontale (frecce, barra di avanzamento, contatore "1 di 5") ---------- */
  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const track = slider.querySelector("[data-slider-track]");
    const items = Array.from(track.children);
    const prev = slider.querySelector("[data-slider-prev]");
    const next = slider.querySelector("[data-slider-next]");
    const bar = slider.querySelector("[data-slider-bar]");
    const count = slider.querySelector("[data-slider-count]");

    function current() {
      const left = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).scrollPaddingLeft || 0);
      let best = 0, dist = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs(it.getBoundingClientRect().left - left);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    }
    function update() {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 1;
      if (bar) bar.style.width = `${Math.max(p, items.length ? 1 / items.length : 0) * 100}%`;
      const idx = current();
      if (count) count.textContent = `${idx + 1} di ${items.length}`;
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
      items.forEach((it, i) => it.setAttribute("aria-hidden", count && i !== idx ? "true" : "false"));
    }
    function go(dir) {
      const idx = Math.min(Math.max(current() + dir, 0), items.length - 1);
      const target = items[idx];
      const left = target.offsetLeft - items[0].offsetLeft;
      track.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
    }
    prev && prev.addEventListener("click", () => go(-1));
    next && next.addEventListener("click", () => go(1));
    track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------- Video di Emi: loop muto, parte quando è visibile, audio attivabile ---------- */
  document.querySelectorAll("[data-video]").forEach((wrap) => {
    const video = wrap.querySelector("video");
    const soundBtn = wrap.querySelector("[data-video-sound]");
    const playBtn = wrap.querySelector("[data-video-play]");
    let userPaused = reduced; // con reduced motion il video non parte da solo

    function syncPlay() {
      const playing = !video.paused;
      playBtn.setAttribute("aria-pressed", String(!playing));
      playBtn.setAttribute("aria-label", playing ? "Metti in pausa il video" : "Riproduci il video");
    }
    function load() {
      if (video.dataset.src) {
        video.src = video.dataset.src;
        delete video.dataset.src;
      }
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          load();
          if (!userPaused) video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { threshold: 0.35 });
    io.observe(video);

    soundBtn.addEventListener("click", () => {
      load();
      video.muted = !video.muted;
      soundBtn.setAttribute("aria-pressed", String(!video.muted));
      soundBtn.setAttribute("aria-label", video.muted ? "Attiva l'audio" : "Disattiva l'audio");
      if (!video.muted && video.paused) { userPaused = false; video.play().catch(() => {}); }
    });
    playBtn.addEventListener("click", () => {
      load();
      if (video.paused) { userPaused = false; video.play().catch(() => {}); }
      else { userPaused = true; video.pause(); }
    });
    video.addEventListener("play", syncPlay);
    video.addEventListener("pause", syncPlay);
    syncPlay();
  });

  /* ---------- Percorsi: interruttore Trimestrale / Semestrale ---------- */
  document.querySelectorAll("[data-periodo-switch]").forEach((sw) => {
    const scope = document.querySelector(sw.getAttribute("data-periodo-switch"));
    const buttons = Array.from(sw.querySelectorAll("[data-periodo]"));
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        scope.setAttribute("data-show", btn.dataset.periodo);
      });
    });
  });

  /* ---------- Journal: filtri per categoria ---------- */
  document.querySelectorAll("[data-filters]").forEach((bar) => {
    const list = document.querySelector(bar.getAttribute("data-filters"));
    const buttons = Array.from(bar.querySelectorAll("[data-filter]"));
    const status = document.querySelector("[data-filter-status]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const f = btn.dataset.filter;
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        let shown = 0;
        list.querySelectorAll("[data-cat]").forEach((item) => {
          const ok = f === "tutti" || item.dataset.cat === f;
          item.hidden = !ok;
          if (ok) shown++;
        });
        if (status) status.textContent = `${shown} ${shown === 1 ? "articolo" : "articoli"}`;
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      });
    });
  });

  /* ---------- Mappa Google: si carica solo dopo il consenso ---------- */
  const KEY = "emi-consenso-mappe";
  function loadMap(box) {
    const iframe = document.createElement("iframe");
    iframe.src = box.dataset.mapSrc;
    iframe.title = box.dataset.mapTitle || "Mappa";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.allowFullscreen = true;
    box.innerHTML = "";
    box.appendChild(iframe);
  }
  document.querySelectorAll("[data-map-src]").forEach((box) => {
    let ok = false;
    try { ok = localStorage.getItem(KEY) === "si"; } catch (e) {}
    if (ok) { loadMap(box); return; }
    const btn = box.querySelector("[data-map-consent]");
    if (btn) btn.addEventListener("click", () => {
      try { localStorage.setItem(KEY, "si"); } catch (e) {}
      loadMap(box);
    });
  });
})();
