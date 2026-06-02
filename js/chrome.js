(function chrome() {
  const reduced = window.EBM.reducedMotion;
  const isTouch = window.EBM.isTouch;

  /* ======================================
     SPLASH — "Emi Body Movement"
     Solo al primissimo accesso (localStorage). Reduced-motion: skip.
     ====================================== */
  const splash = document.querySelector(".splash");
  let splashShown = false;
  if (splash) {
    if (reduced) {
      splash.remove();
    } else {
      splashShown = true;
      if (window.EBM.lenis) window.EBM.lenis.stop();
      document.body.style.overflow = "hidden";

      const eyebrow = splash.querySelector(".splash__eyebrow");
      const wordEmi = splash.querySelectorAll(".splash__word--emi .splash__char");
      const wordBody = splash.querySelectorAll(".splash__word--body .splash__char");
      const wordMov = splash.querySelectorAll(".splash__word--movement .splash__char");
      const rule = splash.querySelector(".splash__rule");
      const tag = splash.querySelector(".splash__tag");
      const veil = splash.querySelector(".splash__veil");

      if (window.gsap) {
        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          onComplete: () => {
            splash.classList.add("is-hidden");
            document.body.style.overflow = "";
            if (window.EBM.lenis) window.EBM.lenis.start();
            setTimeout(() => splash.remove(), 80);
          }
        });

        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 })
          .add(() => { if (eyebrow) eyebrow.classList.add("is-in"); }, "<")
          .to(wordEmi, { yPercent: 0, duration: 1.1, stagger: 0.045 }, "-=0.35")
          .to(wordBody, { yPercent: 0, duration: 1.1, stagger: 0.04 }, "-=0.85")
          .to(wordMov, { yPercent: 0, duration: 1.1, stagger: 0.035 }, "-=0.95")
          .to(rule, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, "-=0.55")
          .to(tag, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5")
          .to({}, { duration: 0.45 })
          /* veil sale dal basso */
          .to(veil, { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
          /* contenuto si solleva via in parallelo */
          .to(splash.querySelector(".splash__inner"), {
            yPercent: -40, opacity: 0, duration: 0.7, ease: "power3.in"
          }, "<")
          .to(splash, { yPercent: -100, duration: 0.7, ease: "power4.inOut" }, "-=0.35");
      } else {
        setTimeout(() => {
          splash.classList.add("is-hidden");
          splash.style.transform = "translateY(-100%)";
          document.body.style.overflow = "";
          setTimeout(() => splash.remove(), 800);
        }, 1500);
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
     Custom magnetic cursor
     ====================================== */
  if (!isTouch && !reduced) {
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    const label = document.createElement("span");
    label.className = "cursor__label";
    cursor.appendChild(label);
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

    document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
      const customLabel = el.dataset.cursor || "VIEW";
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hover");
        label.textContent = customLabel;
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover");
      });
    });

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
