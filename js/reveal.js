/* Animazioni leggere di entrata. Con prefers-reduced-motion non parte nulla e tutto resta visibile. */
(function reveal() {
  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger || window.EBM.reducedMotion) {
    root.classList.remove("js-motion");
    return;
  }

  /* blocchi che salgono in dissolvenza */
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, overwrite: true }),
  });

  /* hero: leggero zoom-out della foto e testo che entra */
  const heroImg = document.querySelector(".hero__media img");
  if (heroImg) {
    gsap.fromTo(heroImg, { scale: 1.08 }, { scale: 1, duration: 2.2, ease: "power2.out" });
    gsap.to(heroImg, {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* foto con parallasse delicata */
  document.querySelectorAll("[data-parallax] img").forEach((img) => {
    gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, {
      yPercent: 6, scale: 1.12, ease: "none",
      scrollTrigger: { trigger: img.closest("[data-parallax]"), start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* nome gigante del footer */
  const giant = document.querySelector(".footer__giant");
  if (giant) {
    gsap.from(giant, {
      yPercent: 40, opacity: 0, duration: 1.4, ease: "power3.out",
      scrollTrigger: { trigger: giant, start: "top 98%", once: true },
    });
  }
})();
