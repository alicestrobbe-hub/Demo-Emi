(function setupGSAP() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });

  if (window.EBM.reducedMotion) {
    ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" });
  }

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
})();
