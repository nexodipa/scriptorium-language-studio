const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const pages = {...require('../locales/pages.json'), ...require('../locales/extended.json')};
const names = {es:'Español',en:'English',fr:'Français',it:'Italiano',de:'Deutsch',pt:'Português',ru:'Русский',cs:'Čeština',zh:'简体中文',ja:'日本語',he:'עברית',ar:'العربية'};
const base = 'https://nexodipa.github.io/scriptorium-language-studio/';
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const destination = code => code === 'es' ? 'index.html' : `${code}.html`;
const links = Object.entries(names).map(([code])=>`<link rel="alternate" hreflang="${code}" href="${base}${destination(code)}">`).join('\n');
function formField(label, name, attributes='') {
  return `<label>${esc(label)}<input name="${name}" ${attributes}></label>`;
}
for (const [code, p] of Object.entries(pages)) {
  for(const [key,length] of Object.entries({nav:5,hero:4,services:4,process:4,historical:2,about:2,faq:3,contact:4,form:13,messages:9,resources:4})) {
    if(!Array.isArray(p[key]) || p[key].length!==length) throw new Error(`${code}.${key}: invalid translation schema`);
  }
  const f = p.form;
  const menu = `<label class="language-picker"><span class="sr-only">${esc(p.nav[4])}</span><select id="site-language" aria-label="${esc(p.nav[4])}">${Object.entries(names).map(([lang,name])=>`<option value="${lang}" lang="${lang}"${lang===code?' selected':''}>${name}</option>`).join('')}</select></label>`;
  const html = `<!doctype html>
<html lang="${code}" dir="${p.dir}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Scriptorium | ${esc(p.hero[0])}</title><meta name="description" content="${esc(p.hero[1])}">
<link rel="canonical" href="${base}${code}.html">${links}<link rel="alternate" hreflang="x-default" href="${base}">
<meta property="og:type" content="website"><meta property="og:title" content="Scriptorium | ${esc(p.hero[0])}"><meta property="og:description" content="${esc(p.hero[1])}"><meta property="og:url" content="${base}${code}.html"><meta property="og:image" content="${base}assets/social-facebook-cover.png">
<link rel="icon" href="assets/favicon.ico"><link rel="stylesheet" href="styles.css?v=multilingual-20260925"></head>
<body class="localized-page">
<header class="site-header"><a class="brand" href="#home" aria-label="Scriptorium"><img class="brand-logo" src="assets/logo-icon.png" alt=""><span><strong dir="ltr">Scriptorium</strong><small>${esc(p.hero[0])}</small></span></a>
${menu}<button class="menu-button" id="menu-button" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="${esc(p.messages[7])}"><span></span><span></span><span></span></button>
<nav class="site-nav" id="site-nav" aria-label="${esc(p.nav[0])}"><a href="#services">${esc(p.nav[0])}</a><a href="#method">${esc(p.nav[1])}</a><a href="#about">${esc(p.nav[2])}</a><a class="nav-cta" href="#contact">${esc(p.nav[3])}</a></nav></header>
<main id="main-content">
<section class="hero" id="home"><div class="hero-media"><img src="assets/scriptorium-philology-hero-framed.png" alt="" fetchpriority="high"></div><div class="hero-content"><p class="eyebrow">${esc(p.hero[0])}</p><h1 dir="ltr">Scriptorium</h1><p class="hero-lead">${esc(p.hero[1])}</p><div class="hero-actions"><a class="primary-button" href="#contact">${esc(p.hero[2])}</a><a class="secondary-button" href="#method">${esc(p.hero[3])}</a></div><div class="hero-contact-strip"><a href="mailto:josuepug@gmail.com" dir="ltr">josuepug@gmail.com</a><a href="https://wa.me/593987411592" dir="ltr">WhatsApp</a><a href="https://www.fiverr.com/s/Zm7Bjza" dir="ltr">Fiverr</a></div></div></section>
<p class="locale-scope">${esc(p.scope)}</p>
<section class="section today-section" id="services"><div class="section-heading"><p class="eyebrow">${esc(p.nav[0])}</p><h2>${esc(p.serviceTitle)}</h2></div><div class="today-grid service-offer-grid">${p.services.map(([title,description],i)=>`<article><span>0${i+1}</span><h3>${esc(title)}</h3><p>${esc(description)}</p></article>`).join('')}</div></section>
<section class="section" id="method"><span id="project"></span><div class="section-heading"><p class="eyebrow">${esc(p.nav[1])}</p><h2>${esc(p.processTitle)}</h2></div><ol class="delivery-steps">${p.process.map(([title,description])=>`<li><h3>${esc(title)}</h3><p>${esc(description)}</p></li>`).join('')}</ol></section>
<section class="section historical-focus" id="historical"><div class="historical-copy"><h2>${esc(p.historical[0])}</h2><p>${esc(p.historical[1])}</p><a class="text-link" href="#contact">${esc(p.hero[2])}</a></div><figure class="historical-media"><img src="assets/ancient-language-classroom.png" alt="" loading="lazy"></figure></section>
<section class="section about-section" id="about"><div class="section-heading"><p class="eyebrow">${esc(p.nav[2])}</p><h2>${esc(p.about[0])}</h2><p>${esc(p.about[1])}</p></div></section>
<section class="section locale-resources" id="resources"><h2>${esc(p.resources[0])}</h2><nav aria-label="${esc(p.resources[0])}"><a href="herramientas.html" data-original-language="es">${esc(p.resources[1])} <span lang="es">(ES)</span></a><a href="cursos.html" data-original-language="es">${esc(p.resources[2])} <span lang="es">(ES)</span></a><a href="credenciales.html" data-original-language="es">${esc(p.resources[3])} <span lang="es">(ES)</span></a></nav></section>
<section class="section faq-section" id="faq"><div class="faq-grid">${p.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
<section class="contact-section" id="contact"><div class="contact-copy"><p class="eyebrow">${esc(p.nav[3])}</p><h2>${esc(p.contact[0])}</h2><p>${esc(p.contact[1])}</p><div class="direct-contact"><a href="mailto:josuepug@gmail.com" dir="ltr">josuepug@gmail.com</a><a href="https://wa.me/593987411592" dir="ltr">WhatsApp: +593 98 741 1592</a><a href="https://www.fiverr.com/s/Zm7Bjza" dir="ltr">Fiverr</a></div></div>
<form class="quote-form" id="quote-form">${formField(f[0],'name','autocomplete="name" required maxlength="120"')}${formField(f[1],'contact','required maxlength="200" dir="auto"')}
<label>${esc(f[2])}<select name="service" required><option value="">${esc(f[3])}</option>${p.services.map(([title])=>`<option>${esc(title)}</option>`).join('')}</select></label>
<div class="form-row">${formField(f[4],'source','maxlength="80" dir="auto"')}${formField(f[5],'target','maxlength="80" dir="auto"')}</div><div class="form-row">${formField(f[6],'words','maxlength="80"')}${formField(f[7],'deadline','type="date"')}</div>
<label>${esc(f[8])}<textarea name="message" rows="5" maxlength="3000" required dir="auto"></textarea></label><label class="checkbox-field"><input name="privacyRead" type="checkbox" required><span>${esc(f[9])} <a href="privacidad.html" target="_blank" rel="noopener">${esc(p.contact[2])}</a></span></label>
<button class="primary-button" type="submit">${esc(f[10])}</button><div class="form-actions-secondary"><a class="secondary-button" id="whatsapp-request-link" href="https://wa.me/593987411592" target="_blank" rel="noopener">${esc(f[11])}</a><button class="secondary-button" id="copy-request" type="button">${esc(f[12])}</button></div><p class="form-note" id="form-note" aria-live="polite">${esc(p.contact[1])}</p></form></section>
</main><footer class="site-footer"><div><strong dir="ltr">Scriptorium</strong><span>${esc(p.footer)}</span></div><nav><a href="privacidad.html">${esc(p.contact[2])}</a><a href="terminos.html">${esc(p.contact[3])}</a></nav><p class="locale-notice">${esc(p.notice)}</p></footer>
<noscript><nav class="locale-noscript">${Object.entries(names).map(([lang,name])=>`<a href="${destination(lang)}" lang="${lang}">${name}</a>`).join(' ')}</nav></noscript>
<script type="application/json" id="page-locale">${JSON.stringify({form:p.form,messages:p.messages}).replaceAll('<','\\u003c')}</script>
<script src="script.js?v=multilingual-20260925"></script><script src="language-menu.js?v=20260925"></script>
</body></html>`;
  fs.writeFileSync(path.join(root,`${code}.html`),html+'\n');
}
console.log(`Built ${Object.keys(pages).length} localized pages.`);
