const menuButton = document.querySelector("#menu-button");
const siteNav = document.querySelector("#site-nav");
const lensButtons = document.querySelectorAll(".lens-button");
const lensPanel = document.querySelector("#philology-panel");
const quoteForm = document.querySelector("#quote-form");
const formNote = document.querySelector("#form-note");
const whatsappRequestLink = document.querySelector("#whatsapp-request-link");

if (menuButton && siteNav) {
  const closeMenu = () => {
    siteNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuButton.focus();
    }
  });
}

const philologyData = {
  text: {
    number: "01",
    title: "Texto",
    body: "Se revisan soporte, legibilidad, extensión, citas, tablas, imágenes y estado editable.",
    points: ["Evita cotizaciones a ciegas.", "Define el nivel real de intervención.", "Identifica riesgos antes de recibir archivos privados."]
  },
  form: {
    number: "02",
    title: "Forma",
    body: "La estructura también comunica: jerarquía, notas, interfaz, tablas, citas y maquetación.",
    points: ["Preserva referencias y elementos útiles.", "Distingue traducción de diseño editorial.", "Evita entregar texto correcto en un formato inútil."]
  },
  language: {
    number: "03",
    title: "Lengua",
    body: "Se evalúan gramática, registro, terminología, variante regional y necesidad de un segundo revisor.",
    points: ["El tono responde al lector real.", "Los términos repetidos forman un glosario.", "Los límites de competencia se confirman antes de aceptar."]
  },
  context: {
    number: "04",
    title: "Contexto",
    body: "Se consideran época, género, público, canal y objetivo. En textos históricos, la fuente condiciona la lectura.",
    points: ["Separa traducción de explicación.", "Hace visibles las decisiones interpretativas.", "Define cuándo se necesita revisión especializada."]
  },
  delivery: {
    number: "05",
    title: "Entrega",
    body: "El resultado puede incluir documento final, glosario, notas, guía de estilo o paquete de localización.",
    points: ["Cada archivo se acuerda por escrito.", "Las revisiones responden al alcance.", "La entrega debe ser utilizable y verificable."]
  }
};

function renderLens(key) {
  if (!lensPanel || !philologyData[key]) {
    return;
  }

  const item = philologyData[key];
  lensPanel.innerHTML = `
    <span>${item.number}</span>
    <h3>${item.title}</h3>
    <p>${item.body}</p>
    <ul>${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
  `;
}

lensButtons.forEach((button) => {
  button.addEventListener("click", () => {
    lensButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    renderLens(button.dataset.lens);
  });
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

function buildRequestMessage(form) {
  const data = new FormData(form);
  return [
    "Hola Scriptorium, deseo solicitar una evaluación de proyecto.",
    "",
    `Nombre: ${data.get("name") || "No indicado"}`,
    `Contacto: ${data.get("contact") || "No indicado"}`,
    `Servicio: ${data.get("service") || "No indicado"}`,
    `Idioma origen: ${data.get("source") || "No indicado"}`,
    `Idioma destino: ${data.get("target") || "No indicado"}`,
    `Extensión: ${data.get("words") || "No indicada"}`,
    `Fecha deseada: ${data.get("deadline") || "No indicada"}`,
    `Descripción: ${data.get("message") || "Sin descripción"}`,
    "",
    "No adjunto información sensible en este primer contacto."
  ].join("\n");
}

if (quoteForm) {
  const refreshWhatsApp = () => {
    if (whatsappRequestLink) {
      whatsappRequestLink.href = "https://wa.me/593987411592?text=" + encodeURIComponent(buildRequestMessage(quoteForm));
    }
  };

  quoteForm.addEventListener("input", refreshWhatsApp);
  quoteForm.addEventListener("change", refreshWhatsApp);
  refreshWhatsApp();

  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!quoteForm.reportValidity()) {
      return;
    }

    const message = buildRequestMessage(quoteForm);
    const mailto = "mailto:josuepug@gmail.com?subject=" +
      encodeURIComponent("Solicitud de evaluación - Scriptorium") +
      "&body=" + encodeURIComponent(message);

    if (formNote) {
      formNote.textContent = "Se abrirá tu aplicación de correo. El sitio no guarda esta información.";
    }
    window.location.href = mailto;
  });
}
