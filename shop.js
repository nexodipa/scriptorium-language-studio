(function () {
  'use strict';
  var I = window.SHOP_I18N || {};
  var CFG = window.SCRIPTORIUM_SHOP || {};
  var API = 'https://plrqjhizrhrytxihbogj.supabase.co/rest/v1/interes_tienda';
  var KEY = 'sb_publishable_kPwXb1rAU45B4FdefcXMww_txvKWlG0';
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  function send(email, producto, origen) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY, Prefer: 'return=minimal' },
      body: JSON.stringify({ email: email.trim(), producto: producto, idioma: I.lang || 'es', origen: origen })
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  var dlg = document.getElementById('notify');
  var current = null;

  document.querySelectorAll('.buy').forEach(function (b) {
    var code = b.getAttribute('data-product');
    var cfg = CFG[code];
    if (cfg && cfg.url) {
      b.setAttribute('href', cfg.url);
      b.setAttribute('rel', 'noopener');
      b.removeAttribute('role');
      return;
    }
    b.textContent = I.notify;
    b.addEventListener('click', function (e) {
      e.preventDefault();
      current = code;
      var m = document.getElementById('dlg-msg'); if (m) m.textContent = '';
      if (dlg && dlg.showModal) dlg.showModal(); else document.getElementById('next-email').focus();
    });
  });

  var dsend = document.getElementById('dlg-send');
  if (dsend && dlg) {
    dsend.addEventListener('click', function (e) {
      e.preventDefault();
      var inp = document.getElementById('dlg-email'), msg = document.getElementById('dlg-msg');
      if (!EMAIL.test(inp.value)) { msg.textContent = I.bad; inp.focus(); return; }
      msg.textContent = I.sending;
      send(inp.value, current || 'aviso-general', 'tienda-' + (current || 'general')).then(function (ok) {
        if (ok) { msg.textContent = I.ok; inp.value = ''; setTimeout(function () { dlg.close(); }, 1600); }
        else msg.textContent = I.fail;
      });
    });
  }

  function wire(formId, msgId, producto, origen, onOk) {
    var f = document.getElementById(formId), m = document.getElementById(msgId);
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = f.elements.email.value;
      if (!EMAIL.test(email)) { m.textContent = I.bad; return; }
      m.textContent = I.sending;
      send(email, producto, origen).then(function (ok) {
        if (ok) { f.reset(); m.textContent = ''; onOk(true); }
        else { m.textContent = I.fail; onOk(false); }
      });
    });
  }

  wire('free-form', 'free-msg', 'gratis-egipcio', 'hoja-gratis', function (ok) {
    /* El archivo es público; se muestra aunque el registro del correo falle. */
    var box = document.getElementById('free-ok');
    if (box) { box.hidden = false; var a = box.querySelector('a'); if (a) a.focus(); }
    var msg = document.getElementById('free-msg'); if (ok && msg) msg.textContent = '';
  });
  wire('next-form', 'next-msg', 'aviso-general', 'proximamente', function (ok) {
    var m = document.getElementById('next-msg'); if (ok) m.textContent = I.ok;
  });
})();
