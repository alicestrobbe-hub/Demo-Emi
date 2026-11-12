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

    /* barra di avanzamento: clic per saltare, trascina per andare avanti e indietro, frecce da tastiera */
    const seek = wrap.querySelector("[data-video-seek]");
    if (seek) {
      const fill = seek.querySelector(".vid__seek-fill");
      const knob = seek.querySelector(".vid__seek-knob");
      let seeking = false, wasPlaying = false, raf = 0;
      const dur = () => (isFinite(video.duration) && video.duration) || 31;

      function paint(t) {
        const p = Math.min(Math.max(t / dur(), 0), 1);
        fill.style.transform = `scaleX(${p})`;
        knob.style.left = `${p * 100}%`;
        seek.setAttribute("aria-valuenow", String(Math.round(t)));
        seek.setAttribute("aria-valuemax", String(Math.round(dur())));
        seek.setAttribute("aria-valuetext", `${Math.round(t)} secondi su ${Math.round(dur())}`);
      }
      function loop() {
        if (!seeking) paint(video.currentTime);
        raf = requestAnimationFrame(loop);
      }
      video.addEventListener("play", () => { cancelAnimationFrame(raf); loop(); });
      video.addEventListener("pause", () => { cancelAnimationFrame(raf); if (!seeking) paint(video.currentTime); });
      video.addEventListener("loadedmetadata", () => paint(video.currentTime));

      function setTime(t) {
        load();
        t = Math.min(Math.max(t, 0), dur());
        if (video.readyState >= 1) video.currentTime = t;
        else video.addEventListener("loadedmetadata", () => { video.currentTime = t; }, { once: true });
        paint(t);
      }
      function timeAt(e) {
        const r = seek.getBoundingClientRect();
        return ((e.clientX - r.left) / r.width) * dur();
      }
      seek.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        seeking = true;
        seek.setPointerCapture(e.pointerId);
        seek.classList.add("is-dragging");
        wasPlaying = !video.paused;
        if (wasPlaying) video.pause();
        setTime(timeAt(e));
      });
      seek.addEventListener("pointermove", (e) => { if (seeking) setTime(timeAt(e)); });
      const end = () => {
        if (!seeking) return;
        seeking = false;
        seek.classList.remove("is-dragging");
        if (wasPlaying) video.play().catch(() => {});
      };
      seek.addEventListener("pointerup", end);
      seek.addEventListener("pointercancel", end);
      seek.addEventListener("keydown", (e) => {
        const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
        if (step) { e.preventDefault(); setTime(video.currentTime + step); }
        if (e.key === "Home") { e.preventDefault(); setTime(0); }
        if (e.key === "End") { e.preventDefault(); setTime(dur() - 0.5); }
      });
      paint(0);
    }
  });

  /* ---------- Metodo: montaggio delle discipline di Emi nel telefono (muto, in loop, barre stile storie) ---------- */
  document.querySelectorAll("[data-montage]").forEach((wrap) => {
    const video = wrap.querySelector("video");
    const tag = wrap.querySelector("[data-montage-tag]");
    const playBtn = wrap.querySelector("[data-montage-play]");
    const barsBox = wrap.querySelector("[data-montage-bars]");
    // secondo in cui inizia ogni spezzone di assets/video/emi-sport.mp4 (se si rimonta il video, aggiornare qui)
    const cuts = [
      [0, "Backflip"], [1.27, "Sci"], [3.27, "Skate"], [5.67, "Ping pong"], [7.47, "Apnea"],
      [10.27, "Balance board"], [12.23, "Corsa"], [13.23, "Tuffi"], [14.63, "Moto d'acqua"], [15.93, "Sub"],
    ];
    const fills = cuts.map(() => {
      const bar = document.createElement("span");
      bar.className = "phone__bar";
      const fill = document.createElement("span");
      bar.appendChild(fill);
      if (barsBox) barsBox.appendChild(bar);
      return fill;
    });
    let userPaused = reduced, current = -1, raf = 0;

    function paint(t) {
      const end = (isFinite(video.duration) && video.duration) || 18.63;
      let idx = 0;
      cuts.forEach(([start], i) => { if (t >= start - 0.02) idx = i; });
      fills.forEach((f, i) => {
        const a = cuts[i][0], b = i + 1 < cuts.length ? cuts[i + 1][0] : end;
        const p = i < idx ? 1 : i > idx ? 0 : Math.min(Math.max((t - a) / (b - a), 0), 1);
        f.style.transform = `scaleX(${p})`;
      });
      if (idx !== current && tag) { current = idx; tag.textContent = cuts[idx][1]; }
    }
    function loop() { paint(video.currentTime); raf = requestAnimationFrame(loop); }
    function syncPlay() {
      const playing = !video.paused;
      playBtn.setAttribute("aria-pressed", String(!playing));
      playBtn.setAttribute("aria-label", playing ? "Metti in pausa il video" : "Riproduci il video");
      cancelAnimationFrame(raf);
      if (playing) loop(); else paint(video.currentTime);
    }
    function load() {
      if (video.dataset.src) { video.src = video.dataset.src; delete video.dataset.src; }
    }
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { load(); if (!userPaused) video.play().catch(() => {}); }
        else if (!video.paused) video.pause();
      });
    }, { threshold: 0.35 }).observe(video);

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
