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
     Parallax tied-to-scroll: tutto il blocco testo sale insieme
     mentre la hero esce. Niente stagger — gli elementi si muovono
     uniformemente per mantenere intatte le spaziature e non far
     sovrapporre la eyebrow con il bottone.

     In parallelo, la .hero stessa riduce il proprio spazio nel
     flusso (marginBottom negativo): la sezione successiva
     (.manifesto) viene tirata su della stessa quantità del drift,
     così sotto il testo che sale non resta un'ampia fascia cream
     vuota — è il contenuto del manifesto a colmare visivamente
     lo spazio in tempo reale, sincronizzato allo scroll. */
  if (!reduced && isMobile) {
    const heroInner = document.querySelector(".hero__inner");
    const heroSection = document.querySelector(".hero");
    if (heroInner && heroSection) {
      const drift = 160;
      const trigger = {
        trigger: ".hero",
        start: "top top",
        end: "40% top",
        scrub: 1.0,
      };
      gsap.to(heroInner, {
        y: -drift,
        /* Niente opacity: con un fade attivo, il bg cream del
           blocco testo diventava semi-trasparente durante lo scroll
           e lasciava intravedere la foto sottostante, creando
           proprio quel "taglio orizzontale" sulla foto. */
        ease: "none",
        scrollTrigger: trigger,
      });
      gsap.to(heroSection, {
        marginBottom: -drift,
        ease: "none",
        scrollTrigger: trigger,
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
