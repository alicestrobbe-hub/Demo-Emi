(function chrome() {
  const reduced = window.EBM.reducedMotion;
  const isTouch = window.EBM.isTouch;

  /* ======================================
     SPLASH — "Emi Body Movement"
     Compare SOLO al primo accesso nella sessione o su refresh esplicito.
     Mai durante la navigazione interna fra pagine del sito.
     ====================================== */
  const splash = document.querySelector(".splash");
  let splashShown = false;

  /* Determina se mostrare la splash:
     - primo ingresso nella sessione (no flag in sessionStorage) → sì
     - reload della pagina (navigation type "reload") → sì
     - navigazione interna (link → link) → no */
  let shouldShowSplash = false;
  if (splash) {
    let navType = "navigate";
    try {
      const navEntry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      if (navEntry && navEntry.type) navType = navEntry.type;
      else if (performance.navigation) {
        navType = performance.navigation.type === 1 ? "reload" : "navigate";
      }
    } catch (_) {}
    const firstVisit = !sessionStorage.getItem("ebm_splashed");
    shouldShowSplash = firstVisit || navType === "reload";
    if (!shouldShowSplash) splash.remove();
    else sessionStorage.setItem("ebm_splashed", "1");
  }

  /* Preload di tutte le immagini (img tag + background-image) della pagina.
     Cap a 6s per evitare blocchi se una risorsa è lenta/irraggiungibile. */
  function preloadAllImages() {
    const urls = new Set();
    document.querySelectorAll("img").forEach((img) => {
      const src = img.currentSrc || img.getAttribute("src");
      if (src) urls.add(src);
      const ss = img.getAttribute("srcset");
      if (ss) ss.split(",").forEach((p) => {
        const u = p.trim().split(/\s+/)[0];
        if (u) urls.add(u);
      });
    });
    document.querySelectorAll("*").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (!bg || bg === "none") return;
      const matches = bg.match(/url\((['"]?)([^'")]+)\1\)/g);
      if (!matches) return;
      matches.forEach((m) => {
        const u = m.replace(/^url\((['"]?)/, "").replace(/(['"]?)\)$/, "");
        if (u && !u.startsWith("data:")) urls.add(u);
      });
    });
    const promises = Array.from(urls).map((u) => new Promise((res) => {
      const img = new Image();
      img.onload = img.onerror = () => res();
      img.src = u;
    }));
    return Promise.race([
      Promise.all(promises),
      new Promise((res) => setTimeout(res, 6000)),
    ]);
  }

  if (splash && shouldShowSplash) {
    if (reduced) {
      splash.remove();
    } else {
      splashShown = true;
      if (window.EBM.lenis) window.EBM.lenis.stop();
      document.body.style.overflow = "hidden";

      const preloadPromise = preloadAllImages();

      const eyebrow = splash.querySelector(".splash__eyebrow");
      const words = splash.querySelector(".splash__words");
      const rule = splash.querySelector(".splash__rule");
      const tag = splash.querySelector(".splash__tag");
      const veil = splash.querySelector(".splash__veil");

      function runExit() {
        if (!window.gsap) {
          splash.classList.add("is-hidden");
          splash.style.transform = "translateY(-100%)";
          document.body.style.overflow = "";
          if (window.EBM.lenis) window.EBM.lenis.start();
          setTimeout(() => splash.remove(), 600);
          return;
        }
        const exitTl = gsap.timeline({
          defaults: { ease: "power4.inOut" },
          onComplete: () => {
            splash.classList.add("is-hidden");
            document.body.style.overflow = "";
            if (window.EBM.lenis) window.EBM.lenis.start();
            setTimeout(() => splash.remove(), 60);
          },
        });
        exitTl.to(veil, { yPercent: -100, duration: 0.65 })
              .to(splash.querySelector(".splash__inner"), {
                yPercent: -30, opacity: 0, duration: 0.5, ease: "power3.in",
              }, "<")
              .to(splash, { yPercent: -100, duration: 0.55 }, "-=0.3");
      }

      if (window.gsap) {
        const introTl = gsap.timeline({ defaults: { ease: "power3.out" } });

        introTl.to(eyebrow, { opacity: 1, y: 0, duration: 0.45 })
          .add(() => { if (eyebrow) eyebrow.classList.add("is-in"); }, "<")
          .to(words, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, "-=0.25")
          .to(rule, { scaleX: 1, duration: 0.55, ease: "power3.inOut" }, "-=0.4")
          .to(tag, { opacity: 1, y: 0, duration: 0.4 }, "-=0.35")
          .to({}, { duration: 0.25 });

        introTl.eventCallback("onComplete", () => {
          preloadPromise.then(runExit);
        });
      } else {
        preloadPromise.then(() => setTimeout(runExit, 500));
      }
    }
  }

  /* ======================================
     Scroll progress
     ====================================== */
  const progress = document.querySelector(".scroll-progress__bar");
  if (progress) {
    function updateProgress() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      progress.style.transform = `scaleX(${p})`;
    }
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  /* ======================================
     Nav — sempre visibile, theme adattivo
     ====================================== */
  const nav = document.querySelector(".nav");
  if (nav) {
    function updateNav() {
      if (window.scrollY > 24) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    }
    window.addEventListener("scroll", updateNav, { passive: true });
    updateNav();

    /* Burger mobile */
    const burger = nav.querySelector(".nav__burger");
    if (burger) {
      burger.addEventListener("click", () => {
        nav.classList.toggle("is-open");
        const isOpen = nav.classList.contains("is-open");
        burger.setAttribute("aria-expanded", String(isOpen));
        if (window.EBM.lenis) {
          if (isOpen) window.EBM.lenis.stop();
          else window.EBM.lenis.start();
        }
      });
      nav.querySelectorAll(".nav__links a").forEach((a) =>
        a.addEventListener("click", () => {
          nav.classList.remove("is-open");
          if (window.EBM.lenis) window.EBM.lenis.start();
        })
      );
    }

    /* Auto theme dark/light — IntersectionObserver su [data-nav-theme] */
    const themedSections = document.querySelectorAll("[data-nav-theme]");
    if (themedSections.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
            const theme = entry.target.dataset.navTheme;
            nav.classList.toggle("is-dark-theme", theme === "dark");
          }
        });
      }, {
        rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72}px 0px -60% 0px`,
        threshold: [0, 0.15, 0.4, 0.7],
      });
      themedSections.forEach((s) => io.observe(s));
    }
  }

  /* ======================================
     Custom cursor — sempre puntino statico, non cambia su elementi cliccabili
     ====================================== */
  if (!isTouch && !reduced) {
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    document.body.appendChild(cursor);

    let tx = 0, ty = 0, cx = 0, cy = 0;
    document.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    /* Magnetic effect on [data-magnetic] elements */
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.35;
      let mx = 0, my = 0, x = 0, y = 0;
      let active = false, raf = null;
      function animate() {
        x += (mx - x) * 0.2;
        y += (my - y) * 0.2;
        el.style.transform = `translate(${x}px, ${y}px)`;
        if (Math.abs(mx - x) > 0.1 || Math.abs(my - y) > 0.1) raf = requestAnimationFrame(animate);
        else raf = null;
      }
      el.addEventListener("mouseenter", () => { active = true; });
      el.addEventListener("mousemove", (e) => {
        if (!active) return;
        const r = el.getBoundingClientRect();
        mx = (e.clientX - (r.left + r.width / 2)) * strength;
        my = (e.clientY - (r.top + r.height / 2)) * strength;
        if (!raf) raf = requestAnimationFrame(animate);
      });
      el.addEventListener("mouseleave", () => {
        active = false; mx = 0; my = 0;
        if (!raf) raf = requestAnimationFrame(animate);
      });
    });
  }

  /* Page transition overlay rimosso per richiesta */
  const _legacyOverlay = document.querySelector(".page-transition");
  if (_legacyOverlay && _legacyOverlay.parentNode) _legacyOverlay.parentNode.removeChild(_legacyOverlay);
})();
