/* Mostra gli eventi di js/eventi-data.js nei blocchi [data-eventi] */
(function eventi() {
  const lists = document.querySelectorAll("[data-eventi]");
  if (!lists.length) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const prossimi = (window.EMI_EVENTI || [])
    .filter((e) => new Date(e.data + "T00:00:00") >= today)
    .sort((a, b) => a.data.localeCompare(b.data));

  const fmtDay = new Intl.DateTimeFormat("it-IT", { day: "numeric" });
  const fmtMonth = new Intl.DateTimeFormat("it-IT", { month: "short", year: "numeric" });
  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  lists.forEach((list) => {
    const root = list.getAttribute("data-root") || "";
    if (!prossimi.length) {
      list.innerHTML =
        '<div class="events__empty"><p>Non ci sono eventi in programma al momento.</p>' +
        '<p>Stiamo preparando le prossime esperienze: scrivimi e ti avviso appena c\'è una data.</p></div>';
      return;
    }
    list.innerHTML = prossimi.map((e) => {
      const d = new Date(e.data + "T00:00:00");
      const cta = e.link
        ? `<a class="btn btn--primary btn--sm" href="${root}${esc(e.link)}">Scopri di più</a>`
        : `<a class="btn btn--primary btn--sm" href="${root}contatti.html?cerco=evento&amp;evento=${encodeURIComponent(e.titolo)}#parliamone">Chiedi info</a>`;
      return `<article class="event">
        <p class="event__date">${fmtDay.format(d)}<small>${fmtMonth.format(d)}</small></p>
        <div><h3>${esc(e.titolo)}</h3><p>${esc([e.luogo, e.orario].filter(Boolean).join(" · "))}</p>${e.descrizione ? `<p>${esc(e.descrizione)}</p>` : ""}</div>
        ${cta}
      </article>`;
    }).join("");
  });
})();
