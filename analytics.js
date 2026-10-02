/* Scriptorium — Analítica web (Google Analytics 4)
 * ───────────────────────────────────────────────
 * PASO ÚNICO: crea una propiedad gratuita en https://analytics.google.com,
 * copia tu "ID de medición" (tiene forma G-XXXXXXXXXX) y pégalo abajo.
 * Mientras diga G-XXXXXXXXXX, la analítica queda inactiva (no carga nada ni
 * genera cookies). En cuanto pongas tu ID real, empieza a medir en todas las
 * páginas automáticamente, porque todas cargan este mismo archivo.
 */
(function () {
  var GA_ID = "G-J1SB69MGCN"; // ID de medición de la propiedad "Scriptorium Language Studio"

  if (!GA_ID || GA_ID.indexOf("XXXX") !== -1) return; // sin ID real: no hace nada

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });
})();
