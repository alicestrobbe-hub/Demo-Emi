(function reveal() {
  if (!window.gsap) return;
  const reduced = window.EBM.reducedMotion;
  const mobile = window.EBM.isMobile;

  function splitLines(el) {
    const text = el.textContent.trim();
    el.innerHTML = "";
    const words = text.split(/\s+/);
    const wrap = document.createElement("span");
    wrap.className = "line-wrap";
    const line = document.createElement("span");
    line.className = "line";
    line.textContent = text;
    wrap.appendChild(line);
    el.appendChild(wrap);
    return [line];
  }

  function splitLinesMulti(el) {
    const html = el.innerHTML;
    const segments = html.split(/<br\s*\/?>/i);
    el.innerHTML = "";
    const lines = [];
    segments.forEach((seg) => {
      const wrap = document.createElement("span");
      wrap.className = "line-wrap";
      const line = document.createElement("span");
      line.className = "line";
      line.innerHTML = seg.trim();
      wrap.appendChild(line);
      el.appendChild(wrap);
      lines.push(line);
    });
    return lines;
  }

  function splitWords(el) {
    const text = el.textContent.trim();
    el.innerHTML = "";
    const words = text.split(/\s+/);
    const nodes = [];
    words.forEach((w, i) => {
      const wrap = document.createElement("span");
      wrap.className = "word-wrap";
      wrap.style.display = "inline-block";
      wrap.style.overflow = "hidden";
      const word = document.createElement("span");
      word.className = "word";
      word.textContent = w;
      word.style.display = "inline-block";
      wrap.appendChild(word);
      el.appendChild(wrap);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      nodes.push(word);
    });
    return nodes;
  }

  function setupLinesReveal(el) {
    const lines = splitLinesMulti(el);
    if (reduced) {
      gsap.set(lines, { opacity: 1, yPercent: 0 });
      return;
    }
    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, {
      yPercent: 0,
      duration: 1.0,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });
  }

  function setupWordsReveal(el) {
    const words = splitWords(el);
    if (reduced) { gsap.set(words, { opacity: 1, y: 0 }); return; }
    gsap.set(words, { opacity: 0, y: 16 });
    gsap.to(words, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.02,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  }

  function setupFadeReveal(el) {
    if (reduced) { gsap.set(el, { opacity: 1, y: 0 }); return; }
    gsap.set(el, { opacity: 0, y: 24 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  }

  function setupClipReveal(el) {
    if (reduced) { gsap.set(el, { clipPath: "inset(0 0 0 0)" }); return; }
    gsap.fromTo(
      el,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0 0 0)",
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  }

  function setupParallax(el) {
    if (reduced || mobile) return;
    const speed = parseFloat(el.dataset.parallax) || 0.15;
    gsap.to(el, {
      yPercent: -speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
    });
  }

  function initAll(scope = document) {
    scope.querySelectorAll("[data-reveal='lines']").forEach(setupLinesReveal);
    scope.querySelectorAll("[data-reveal='words']").forEach(setupWordsReveal);
    scope.querySelectorAll("[data-reveal='fade']").forEach(setupFadeReveal);
    scope.querySelectorAll("[data-clip-reveal]").forEach(setupClipReveal);
    scope.querySelectorAll("[data-parallax]").forEach(setupParallax);
  }

  window.EBM.reveal = { initAll, setupLinesReveal, setupWordsReveal, setupFadeReveal, setupClipReveal, setupParallax };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initAll());
  } else {
    initAll();
  }
})();
