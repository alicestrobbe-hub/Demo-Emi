(function eventoSub() {
  const reduced = window.EBM.reducedMotion;
  const isMobile = window.EBM.isMobile;

  /* Hero bg parallax */
  if (!reduced) {
    const heroImg = document.querySelector(".evento-hero__bg img");
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 18, scale: 1.14,
        ease: "none",
        scrollTrigger: {
          trigger: ".evento-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.0,
        },
      });
    }
  }

  /* Itinerary line-trace + step reveal */
  const itin = document.querySelector("[data-itinerary]");
  if (itin) {
    const lineFill = itin.querySelector(".itinerary__line-fill");
    const steps = itin.querySelectorAll(".itin-step");

    if (lineFill && !reduced) {
      gsap.to(lineFill, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: itin.querySelector(".itinerary__track"),
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.6,
        },
      });
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "-20% 0px -20% 0px" });
      steps.forEach((s) => io.observe(s));
    } else {
      steps.forEach((s) => s.classList.add("is-visible"));
    }

    if (!reduced && steps.length) {
      steps.forEach((step) => {
        gsap.from(step.querySelector(".itin-step__content"), {
          opacity: 0, y: 32,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: step, start: "top 78%" },
        });
        const v = step.querySelector(".itin-step__visual");
        if (v) {
          gsap.fromTo(v, { clipPath: "inset(0 0 100% 0)" }, {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: step, start: "top 80%" },
          });
        }
      });
    }
  }

  /* Gallery — drag-to-scroll */
  const gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    const track = gallery.querySelector(".evento-gallery__track");
    if (track) {
      let isDown = false, startX = 0, scrollL = 0;
      track.addEventListener("pointerdown", (e) => {
        isDown = true;
        track.classList.add("is-dragging");
        startX = e.clientX;
        scrollL = track.scrollLeft;
        track.setPointerCapture(e.pointerId);
      });
      track.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        track.scrollLeft = scrollL - (e.clientX - startX);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
        track.addEventListener(ev, () => {
          if (isDown) { isDown = false; track.classList.remove("is-dragging"); }
        })
      );

      /* Subtle horizontal parallax via scroll */
      if (!reduced && !isMobile) {
        const figs = track.querySelectorAll("figure img");
        figs.forEach((img, i) => {
          gsap.fromTo(img, { yPercent: -3 }, {
            yPercent: 3,
            ease: "none",
            scrollTrigger: {
              trigger: gallery,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.0,
            },
          });
        });
      }
    }
  }

  /* Stinger video reveal */
  const stingerMedia = document.querySelector(".stinger__media");
  if (stingerMedia && !reduced) {
    gsap.fromTo(stingerMedia, { clipPath: "inset(0 0 100% 0)" }, {
      clipPath: "inset(0 0 0% 0)",
      duration: 1.4,
      ease: "expo.out",
      scrollTrigger: { trigger: stingerMedia, start: "top 80%" },
    });
  }
})();
