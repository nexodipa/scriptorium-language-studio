const menuButton = document.querySelector("#menu-button");
const siteNav = document.querySelector("#site-nav");
const filterButtons = document.querySelectorAll(".filter-button");
const portfolioCards = document.querySelectorAll(".portfolio-card");
const quoteForm = document.querySelector("#quote-form");
const formNote = document.querySelector("#form-note");
const whatsappRequestLink = document.querySelector("#whatsapp-request-link");
const languageSelect = document.querySelector("#language-select");
const lensButtons = document.querySelectorAll(".lens-button");
const lensPanel = document.querySelector("#philology-panel");
const scriptButtons = document.querySelectorAll(".script-button");
const scriptPanel = document.querySelector("#script-panel");
const profileService = document.querySelector("#profile-service");
const profileWords = document.querySelector("#profile-words");
const profileUrgency = document.querySelector("#profile-urgency");
const profileOutput = document.querySelector("#profile-output");
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function translateText(value, lang) {
  if (lang === "en") {
    return value;
  }

  const translations = window.SCRIPTORIUM_TRANSLATIONS?.[lang] || {};
  return translations[normalizeText(value)] || value;
}

function translateAttribute(element, attr, lang) {
  if (!element.hasAttribute(attr)) {
    return;
  }

  if (!originalAttributes.has(element)) {
    originalAttributes.set(element, {});
  }

  const originals = originalAttributes.get(element);
  if (!originals[attr]) {
    originals[attr] = element.getAttribute(attr);
  }

  element.setAttribute(attr, translateText(originals[attr], lang));
}

function applyLanguage(lang) {
  const isRtl = window.SCRIPTORIUM_RTL?.includes(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl ? "rtl" : "ltr";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
        return 2;
      }

      return normalizeText(node.textContent) ? 1 : 2;
    }
  });

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    if (!originalText.has(node)) {
      originalText.set(node, node.textContent);
    }

    node.textContent = translateText(originalText.get(node), lang);
  });

  document.querySelectorAll("[placeholder], [aria-label], [title]").forEach((element) => {
    translateAttribute(element, "placeholder", lang);
    translateAttribute(element, "aria-label", lang);
    translateAttribute(element, "title", lang);
  });

  localStorage.setItem("scriptorium-language", lang);
}

menuButton.addEventListener("click", () => {
  siteNav.classList.toggle("open");
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => siteNav.classList.remove("open"));
});

if (languageSelect) {
  const savedLanguage = localStorage.getItem("scriptorium-language") || "es";
  languageSelect.value = savedLanguage;
  applyLanguage(savedLanguage);

  languageSelect.addEventListener("change", () => {
    applyLanguage(languageSelect.value);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    portfolioCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const philologyData = {
  text: {
    number: "01",
    title: "Texto",
    body: "Se revisa el archivo real: soporte, legibilidad, extensión, citas, tablas, imágenes y estado editable.",
    points: [
      "Evita cotizaciones a ciegas.",
      "Define si se necesita traducción, edición, glosario o reconstrucción.",
      "Protege documentos sensibles desde el primer contacto."
    ]
  },
  form: {
    number: "02",
    title: "Forma",
    body: "La forma del documento también comunica: estructura, notas, interfaz, maquetación, citas y jerarquía visual.",
    points: [
      "Ayuda a preservar tablas, marcas y referencias.",
      "Evita entregar texto correcto en un formato incómodo.",
      "Distingue traducción documental de publicación."
    ]
  },
  language: {
    number: "03",
    title: "Lengua",
    body: "Se observa gramática, registro, terminología, variación regional y nivel de intervención requerido.",
    points: [
      "El tono no es igual para tesis, app, marca o clase.",
      "La terminología se puede convertir en glosario.",
      "El idioma destino se adapta al lector real."
    ]
  },
  context: {
    number: "04",
    title: "Contexto",
    body: "El texto se lee por época, género, público, canal y objetivo. En lenguas antiguas, el contexto evita interpretaciones infladas.",
    points: [
      "Se separa traducción de explicación.",
      "Se aclaran límites educativos o profesionales.",
      "Se define si hace falta nota cultural."
    ]
  },
  delivery: {
    number: "05",
    title: "Entrega",
    body: "El resultado puede ser PDF, DOCX, glosario, guía, muestra anotada, publicación bilingüe o paquete de localización.",
    points: [
      "Cada entrega se define antes de iniciar.",
      "Las revisiones se atan al alcance acordado.",
      "Los archivos finales deben ser útiles, no solo bonitos."
    ]
  }
};

function renderPhilologyLens(key) {
  const item = philologyData[key] || philologyData.text;
  if (!lensPanel) {
    return;
  }

  lensPanel.innerHTML = `
    <span>${item.number}</span>
    <h3>${item.title}</h3>
    <p>${item.body}</p>
    <ul>${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
  `;
}

lensButtons.forEach((button) => {
  button.addEventListener("click", () => {
    lensButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderPhilologyLens(button.dataset.lens);
  });
});

const scriptData = {
  latin: {
    mark: "LAT",
    title: "Latín",
    body: "Útil para frases, inscripciones breves, citas académicas y notas de lectura con traducción educativa.",
    delivery: "Entrega sugerida: original, transliteración si aplica, traducción de muestra y nota de contexto."
  },
  greek: {
    mark: "GRC",
    title: "Griego antiguo",
    body: "Requiere separar alfabeto, transliteración, morfología básica y sentido contextual antes de explicar una cita.",
    delivery: "Entrega sugerida: lectura guiada, glosario mínimo y nota sobre variante o fuente."
  },
  hebrew: {
    mark: "HEB",
    title: "Hebreo bíblico",
    body: "Se trabaja con cuidado direccional, transliteración y límites de interpretación, especialmente en textos religiosos.",
    delivery: "Entrega sugerida: muestra breve, transliteración, traducción educativa y advertencia de alcance."
  },
  arabic: {
    mark: "AR",
    title: "Árabe clásico",
    body: "Conviene revisar escritura, vocalización, fuente y contexto antes de traducir fragmentos literarios o históricos.",
    delivery: "Entrega sugerida: lectura orientativa, nota gramatical y explicación cultural."
  },
  sanskrit: {
    mark: "SA",
    title: "Sánscrito",
    body: "Puede requerir transliteración normalizada, identificación de términos y explicación de función gramatical.",
    delivery: "Entrega sugerida: transliteración, glosario básico y nota de uso académico."
  },
  runic: {
    mark: "RUN",
    title: "Escrituras rúnicas",
    body: "Se tratan como muestras históricas: lectura prudente, identificación de signos y contexto material.",
    delivery: "Entrega sugerida: tabla de signos, transliteración tentativa y límites de lectura."
  }
};

function renderScript(key) {
  const item = scriptData[key] || scriptData.latin;
  if (!scriptPanel) {
    return;
  }

  scriptPanel.innerHTML = `
    <span class="script-mark">${item.mark}</span>
    <div>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
      <strong>${item.delivery}</strong>
    </div>
  `;
}

scriptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    scriptButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderScript(button.dataset.script);
  });
});

const profileCopy = {
  translation: {
    title: "Traducción documental",
    checklist: ["Idioma origen y destino", "Formato editable", "Uso final", "Glosario o referencias de estilo"]
  },
  localization: {
    title: "Localización web/app",
    checklist: ["URL o capturas", "Lista de pantallas o strings", "Público objetivo", "Tono de marca"]
  },
  academic: {
    title: "Académico o investigación",
    checklist: ["Disciplina", "Norma de citas", "Resumen del objetivo", "Nivel de revisión editorial"]
  },
  ancient: {
    title: "Lengua antigua o transliteración",
    checklist: ["Imagen o fuente del fragmento", "Extensión breve", "Uso educativo", "Tipo de nota requerida"]
  },
  social: {
    title: "Publicación o marca",
    checklist: ["Canal de publicación", "Audiencia", "Tono deseado", "Formato final"]
  }
};

function renderProfileOutput() {
  if (!profileOutput) {
    return;
  }

  const service = profileCopy[profileService?.value] || profileCopy.translation;
  const words = Number(profileWords?.value || 0);
  const urgency = profileUrgency?.value || "flexible";
  const volume = words > 5000 ? "alto" : words > 1800 ? "medio" : "breve";
  const urgencyLabel = {
    flexible: "La entrega flexible permite revisar mejor terminología, formato y notas.",
    normal: "La entrega normal debe confirmarse con archivo o fragmento antes de cotizar.",
    urgent: "La entrega urgente puede limitar revisiones o requerir alcance más pequeño."
  };

  profileOutput.innerHTML = `
    <h3>${service.title}</h3>
    <p><strong>Perfil estimado:</strong> proyecto ${volume}, ${words || "sin"} palabras aproximadas. ${urgencyLabel[urgency]}</p>
    <p>Para cotizar con precisión, prepara:</p>
    <ul>${service.checklist.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
}

[profileService, profileWords, profileUrgency].forEach((field) => {
  field?.addEventListener("input", renderProfileOutput);
  field?.addEventListener("change", renderProfileOutput);
});

renderProfileOutput();

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(quoteForm);
  const lang = languageSelect?.value || "en";
  const attachment = data.get("attachment");
  const attachmentName = attachment && attachment.name ? attachment.name : "Not attached in browser";
  const requestIntro = {
    en: "Hello Scriptorium, I would like to request a service proposal.",
    es: "Hola Scriptorium, me gustaría solicitar una propuesta de servicio.",
    de: "Hallo Scriptorium, ich möchte ein Serviceangebot anfragen.",
    fr: "Bonjour Scriptorium, je souhaite demander une proposition de service.",
    pt: "Olá Scriptorium, gostaria de solicitar uma proposta de serviço.",
    it: "Ciao Scriptorium, vorrei richiedere una proposta di servizio.",
    ru: "Здравствуйте, Scriptorium. Я хотел(а) бы запросить предложение по услуге.",
    cs: "Dobrý den, Scriptorium, rád(a) bych požádal(a) o návrh služby.",
    zh: "您好 Scriptorium，我想申请一份服务方案。",
    ja: "Scriptorium 様、サービス提案を依頼したいです。",
    he: "שלום Scriptorium, ברצוני לבקש הצעת שירות.",
    ar: "مرحباً Scriptorium، أود طلب عرض خدمة."
  };
  const noteLine = {
    en: "Note: I will not upload confidential, medical, academic or legally sensitive documents until an agreement is established.",
    es: "Nota: no subiré documentos confidenciales, médicos, académicos o legalmente sensibles hasta que exista un acuerdo.",
    de: "Hinweis: Ich werde keine vertraulichen, medizinischen, akademischen oder rechtlich sensiblen Dokumente hochladen, bevor eine Vereinbarung besteht.",
    fr: "Note : je ne téléverserai aucun document confidentiel, médical, académique ou juridiquement sensible avant accord.",
    pt: "Nota: não enviarei documentos confidenciais, médicos, acadêmicos ou legalmente sensíveis antes de um acordo.",
    it: "Nota: non caricherò documenti riservati, medici, accademici o legalmente sensibili prima di un accordo.",
    ru: "Примечание: я не буду загружать конфиденциальные, медицинские, академические или юридически чувствительные документы до заключения соглашения.",
    cs: "Poznámka: nebudu nahrávat důvěrné, lékařské, akademické ani právně citlivé dokumenty před uzavřením dohody.",
    zh: "备注：在达成协议之前，我不会上传机密、医学、学术或法律敏感文件。",
    ja: "注記：合意が成立するまで、機密・医療・学術・法的に重要な文書はアップロードしません。",
    he: "הערה: לא אעלה מסמכים חסויים, רפואיים, אקדמיים או משפטיים רגישים לפני קיום הסכם.",
    ar: "ملاحظة: لن أرفع وثائق سرية أو طبية أو أكاديمية أو قانونية حساسة قبل وجود اتفاق."
  };

  const message = [
    requestIntro[lang] || requestIntro.en,
    `${translateText("Name", lang)}: ${data.get("name") || "Not provided"}`,
    `${translateText("Contact", lang)}: ${data.get("email") || "Not provided"}`,
    `${translateText("Client type", lang)}: ${data.get("clientType") || "Not provided"}`,
    `${translateText("Urgency", lang)}: ${data.get("urgency") || "Not provided"}`,
    `${translateText("Service type", lang)}: ${data.get("service") || "Not provided"}`,
    `${translateText("Source language", lang)}: ${data.get("source") || "Not provided"}`,
    `${translateText("Target language", lang)}: ${data.get("target") || "Not provided"}`,
    `${translateText("Word count", lang)}: ${data.get("words") || "Not provided"}`,
    `${translateText("Deadline", lang)}: ${data.get("deadline") || "Not provided"}`,
    `${translateText("File format", lang)}: ${data.get("fileFormat") || "Not provided"}`,
    `${translateText("Review level", lang)}: ${data.get("reviewLevel") || "Not provided"}`,
    `${translateText("Confidentiality", lang)}: ${data.get("confidentiality") || "Not marked"}`,
    `${translateText("Reference file", lang)}: ${attachmentName}`,
    `${translateText("Project scope", lang)}: ${data.get("message") || "No additional notes"}`,
    "",
    noteLine[lang] || noteLine.en
  ].join("\n");

  // Open a prefilled email so the request can be sent in one click.
  const subjectByLang = {
    en: "Scriptorium service request",
    es: "Solicitud de servicio - Scriptorium",
    de: "Scriptorium Serviceanfrage",
    fr: "Demande de service Scriptorium",
    pt: "Solicitação de serviço - Scriptorium",
    it: "Richiesta di servizio Scriptorium",
    ru: "Запрос услуги Scriptorium",
    cs: "Žádost o službu Scriptorium",
    zh: "Scriptorium 服务申请",
    ja: "Scriptorium サービス依頼",
    he: "בקשת שירות - Scriptorium",
    ar: "طلب خدمة - Scriptorium"
  };
  const subject = subjectByLang[lang] || subjectByLang.en;
  if (whatsappRequestLink) {
    whatsappRequestLink.href = "https://wa.me/593987411592?text=" + encodeURIComponent(message);
  }

  const mailto = "mailto:josuepug@gmail.com?subject=" +
    encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
  window.location.href = mailto;

  if (!navigator.clipboard) {
    formNote.textContent = message;
    return;
  }

  navigator.clipboard.writeText(message).then(
    () => {
      formNote.textContent = translateText("Service request copied. You can paste it into email, WhatsApp or Fiverr chat.", lang);
    },
    () => {
      formNote.textContent = message;
    }
  );
});
