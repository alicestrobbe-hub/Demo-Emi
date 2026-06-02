window.EBM = window.EBM || {};
window.EBM.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
window.EBM.isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
window.EBM.isMobile = window.matchMedia("(max-width: 1023px)").matches;
