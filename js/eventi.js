(function eventi() {
  const reduced = window.EBM.reducedMotion;
  const isMobile = window.matchMedia("(max-width: 880px)").matches;

  /* Hero bg parallax (alleggerito su mobile) */
  if (!reduced && !isMobile) {
    const heroImg = document.querySelector(".eventi-hero__bg img");
    if (heroImg && window.gsap) {
      gsap.to(heroImg, {
        yPercent: 16, scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".eventi-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.0,
        },
      });
    }
  }

  /* ============================
     Asymmetric vertical flow
     ============================ */
  const flow = document.querySelector("[data-eventi-flow]");
  if (!flow) return;

  const cards = Array.from(flow.querySelectorAll("[data-flow-card]"));
  const totEl = flow.querySelector(".eventi-flow__tot");
  const curEl = flow.querySelector(".eventi-flow__cur");
  const railFill = flow.querySelector(".eventi-flow__rail-fill");
  if (totEl) totEl.textContent = String(cards.length).padStart(2, "0");

  /* Reveal cards on scroll */
  if (!reduced && window.gsap && window.ScrollTrigger) {
    /* Hook CSS: solo ora che GSAP è attivo nascondo le card per animarle.
       Se questo branch non esegue, le card restano visibili di default. */
    document.documentElement.classList.add("js-reveal-ready");

    /* Forzo l'is-in sulle card già visibili al primo paint, così non restano nere */
    requestAnimationFrame(() => {
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9) card.classList.add("is-in");
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });

    cards.forEach((card) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top 85%",
        once: true,
        onEnter: () => card.classList.add("is-in"),
      });

      /* leggera parallax sull'immagine, solo desktop */
      if (!isMobile) {
        const img = card.querySelector(".eflow__media img");
        if (img) {
          gsap.fromTo(img,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            }
          );
        }
      }
    });

    /* Vertical rail fill che cresce mentre scorri tra le card */
    if (railFill && !isMobile) {
      gsap.to(railFill, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: flow,
          start: "top 50%",
          end: "bottom 70%",
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            const cur = Math.max(1, Math.min(cards.length, Math.ceil(p * cards.length)));
            if (curEl) curEl.textContent = String(cur).padStart(2, "0");
          },
        },
      });
    } else if (curEl && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = cards.indexOf(entry.target);
            if (idx >= 0) curEl.textContent = String(idx + 1).padStart(2, "0");
          }
        });
      }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
      cards.forEach((c) => io.observe(c));
    }

    /* Refresh dopo il load delle immagini per riallineare i trigger */
    window.addEventListener("load", () => {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }
  /* In tutti gli altri casi (reduced motion, GSAP assente) le card sono già visibili dal CSS */
})();
