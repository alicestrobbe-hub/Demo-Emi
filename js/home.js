(function home() {
  const reduced = window.EBM.reducedMotion;
  const isMobile = window.EBM.isMobile;

  /* ===== Hero bg parallax (solo desktop) =====
     Su mobile la disattivo: il velo (gradient di fusione foto→cream)
     è absolute dentro .hero__bg ma NON è coinvolto nella trasformazione
     GSAP applicata all'<img>. Lasciandola attiva, l'immagine slitta di
     yPercent al variare dello scroll mentre il velo resta fisso,
     creando un gap visibile crescente al bordo inferiore della foto. */
  if (!reduced && !isMobile) {
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

  /* ===== Hero text drift (solo mobile) =====
     Effetto scroll mantenuto senza muovere il pannello beige:
     animiamo solo testo e CTA, lasciando stabile il layout della hero. */
  if (!reduced && isMobile) {
    const hero = document.querySelector(".hero");
    const title = document.querySelector(".hero__title");
    const sub = document.querySelector(".hero__sub");
    const eyebrow = document.querySelector(".hero__eyebrow");
    const row = document.querySelector(".hero__row");

    if (hero && title) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom 38%",
          scrub: 0.9,
        },
      });

      tl.to(title, {
        y: -86,
        scale: 0.94,
        opacity: 0.22,
        ease: "none",
      }, 0);

      if (sub) {
        tl.to(sub, {
          y: -62,
          opacity: 0,
          ease: "none",
        }, 0.04);
      }

      if (eyebrow) {
        tl.to(eyebrow, {
          y: -42,
          opacity: 0,
          ease: "none",
        }, 0.08);
      }

      if (row) {
        tl.to(row, {
          y: -28,
          opacity: 0.18,
          ease: "none",
        }, 0.12);
      }
    }
  }

  /* ===== Homepage section motion ===== */
  if (!reduced) {
    const manifestoLead = document.querySelector(".manifesto .lead");
    const pillars = gsap.utils.toArray(".manifesto__pillars .pillar");
    if (manifestoLead) {
      gsap.from(manifestoLead, {
        opacity: 0,
        y: 34,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: {
          trigger: manifestoLead,
          start: "top 84%",
          once: true,
        },
      });
    }
    if (pillars.length) {
      gsap.set(pillars, { opacity: 0, y: 42 });
      ScrollTrigger.batch(pillars, {
        start: "top 86%",
        onEnter: (els) => gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.12,
        }),
        once: true,
      });
    }

    const bioCarousel = document.querySelector(".bio__carousel");
    const bioStinger = document.querySelector(".bio__stinger");
    const bioCopy = document.querySelector(".bio__copy");
    if (bioCarousel) {
      gsap.fromTo(bioCarousel,
        { clipPath: "inset(12% 0 12% 0)", y: 42, opacity: 0.72 },
        {
          clipPath: "inset(0% 0 0% 0)",
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: bioCarousel,
            start: "top 82%",
            once: true,
          },
        }
      );
    }
    if (bioStinger) {
      gsap.from(bioStinger, {
        opacity: 0,
        y: 54,
        scale: 0.96,
        duration: 1.0,
        ease: "expo.out",
        scrollTrigger: {
          trigger: bioStinger,
          start: "top 88%",
          once: true,
        },
      });
    }
    if (bioCopy) {
      gsap.from(bioCopy.querySelectorAll("p, .bio__exp li"), {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: bioCopy,
          start: "top 78%",
          once: true,
        },
      });
    }

    const finalCta = document.querySelector(".final-cta__inner");
    if (finalCta) {
      gsap.from(finalCta.querySelectorAll(".final-cta__num, .final-cta__sub, .final-cta__btns"), {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: finalCta,
          start: "top 78%",
          once: true,
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
