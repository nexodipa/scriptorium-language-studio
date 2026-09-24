const builder = document.querySelector("#project-builder");
const output = document.querySelector("#brief-output");
const status = document.querySelector("#brief-status");
const copy = document.querySelector("#brief-copy");
const download = document.querySelector("#brief-download");
const email = document.querySelector("#brief-email");
const now = new Date();
builder.elements.date.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
builder.addEventListener("input", () => {
  if (!output.value) return;
  output.value = "";
  copy.disabled = download.disabled = true;
  email.hidden = true;
  status.textContent = "Los datos cambiaron. Genera el resumen actualizado.";
});
builder.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!builder.reportValidity()) return;
  const data = new FormData(builder);
  const fields = [["service", "Servicio"], ["source", "Origen"], ["target", "Destino"], ["audience", "Público y uso"], ["volume", "Extensión"], ["format", "Formato"], ["date", "Fecha deseada"], ["notes", "Requisitos"]];
  output.value = "Solicitud de propuesta — Scriptorium\n\n" + fields.map(([key, label]) => `${label}: ${String(data.get(key) || "Por acordar").trim()}`).join("\n");
  copy.disabled = download.disabled = false;
  email.href = "mailto:josuepug@gmail.com?subject=" + encodeURIComponent("Propuesta de proyecto") + "&body=" + encodeURIComponent(output.value);
  email.hidden = false;
  status.textContent = "Resumen preparado. Todavía no se ha enviado.";
});
copy.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(output.value); status.textContent = "Resumen copiado."; }
  catch { output.focus(); output.select(); status.textContent = "Seleccionamos el resumen para que puedas copiarlo."; }
});
download.addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([output.value], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "solicitud-scriptorium.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = "Descarga preparada.";
});
const checks = [...document.querySelectorAll(".checklist-grid input")];
checks.forEach((check) => check.addEventListener("change", () => {
  const count = checks.filter((item) => item.checked).length;
  document.querySelector("#readiness-status").textContent = `${count} de ${checks.length} puntos preparados.`;
}));
