(function home() {
  const reduced = window.EBM.reducedMotion;
  const isMobile = window.EBM.isMobile;

  /* ===== Hero bg parallax ===== */
  if (!reduced) {
    const heroImg = document.querySelector(".hero__bg img");
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 18,
        scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.0,
        },
      });
    }
  }

  /* ===== Bio carousel auto ===== */
  const carEl = document.querySelector("[data-bio-carousel]");
  if (carEl) {
    const figs = Array.from(carEl.querySelectorAll(".bio__track figure"));
    const dots = Array.from(carEl.querySelectorAll(".bio__dot"));
    let idx = 0;
    let timer;

    if (!figs[0].classList.contains("is-active")) figs[0].classList.add("is-active");

    function go(i) {
      idx = (i + figs.length) % figs.length;
      figs.forEach((f, k) => f.classList.toggle("is-active", k === idx));
      dots.forEach((d, k) => d.classList.toggle("is-active", k === idx));
    }
    function start() {
      stop();
      if (reduced) return;
      timer = setInterval(() => go(idx + 1), 5400);
    }
    function stop() { if (timer) clearInterval(timer); }

    dots.forEach((d) => d.addEventListener("click", () => {
      go(parseInt(d.dataset.i, 10));
      start();
    }));
    carEl.addEventListener("mouseenter", stop);
    carEl.addEventListener("mouseleave", start);
    start();
  }

  /* ===== Final CTA bg subtle parallax ===== */
  if (!reduced && !isMobile) {
    const ctaImg = document.querySelector(".final-cta__bg img");
    if (ctaImg) {
      gsap.fromTo(ctaImg, { yPercent: -6 }, {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: ".final-cta",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4,
        },
      });
    }
  }

  /* ===== Pacchetti — entry stagger ===== */
  const pacs = document.querySelectorAll(".pacchetti__grid .pac");
  if (pacs.length && !reduced) {
    gsap.set(pacs, { opacity: 0, y: 48 });
    ScrollTrigger.batch(pacs, {
      start: "top 85%",
      onEnter: (els) => gsap.to(els, {
        opacity: 1, y: (i, el) => el.classList.contains("is-featured") ? -12 : 0,
        duration: 1.0,
        ease: "expo.out",
        stagger: 0.12,
      }),
      once: true,
    });
  }

  /* ===== Testimonials stagger ===== */
  const testCards = document.querySelectorAll(".testi__card");
  if (testCards.length && !reduced) {
    gsap.set(testCards, { opacity: 0, y: 36 });
    ScrollTrigger.batch(testCards, {
      start: "top 88%",
      onEnter: (els) => gsap.to(els, {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
      }),
      once: true,
    });
  }
})();
