(function journal() {
  const reduced = window.EBM.reducedMotion;

  /* Hero bg parallax */
  if (!reduced) {
    const heroImg = document.querySelector(".journal-hero__bg img");
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 18, scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".journal-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.0,
        },
      });
    }
  }

  /* Scroll-spy sidebar */
  const sideLinks = document.querySelectorAll(".mag-side__list a[data-spy]");
  const articles = document.querySelectorAll(".mag-art");
  if (sideLinks.length && articles.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
          const id = entry.target.id;
          sideLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.spy === id));
        }
      });
    }, { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.15, 0.4] });
    articles.forEach((a) => io.observe(a));
  }

  /* Articoli — entry stagger */
  if (articles.length && !reduced) {
    gsap.set(articles, { opacity: 0, y: 56 });
    ScrollTrigger.batch(articles, {
      start: "top 90%",
      onEnter: (els) => gsap.to(els, {
        opacity: 1, y: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.1,
      }),
      once: true,
    });
  }
})();
