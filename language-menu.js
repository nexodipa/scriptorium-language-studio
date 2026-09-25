(() => {
  const languages = {es:'Español',en:'English',fr:'Français',it:'Italiano',de:'Deutsch',pt:'Português',ru:'Русский',cs:'Čeština',zh:'简体中文',ja:'日本語',he:'עברית',ar:'العربية'};
  const current = document.documentElement.lang;
  const header = document.querySelector('.site-header');
  if (!header) return;
  let select = document.querySelector('#site-language');
  if (!select) {
    const label = document.createElement('label');
    label.className = 'language-picker';
    select = document.createElement('select');
    select.id = 'site-language';
    select.setAttribute('aria-label',current === 'en' ? 'Website language' : 'Idioma del sitio');
    for (const [code,name] of Object.entries(languages)) {
      const option = new Option(name,code,code===current,code===current);
      option.lang = code;
      select.add(option);
    }
    label.append(select);
    const existing = header.querySelector('.language-switch');
    if (existing) existing.replaceWith(label);
    else header.insertBefore(label, header.querySelector('.menu-button, .site-nav'));
  }
  select.addEventListener('change', () => {
    if (!Object.hasOwn(languages,select.value)) return;
    const file = select.value === 'es' ? 'index.html' : `${select.value}.html`;
    const target = new URL(file, location.href);
    const shared = ['#home','#services','#method','#project','#historical','#about','#faq','#contact'];
    if(shared.includes(location.hash)) target.hash = location.hash;
    location.assign(target.href);
  });
})();
