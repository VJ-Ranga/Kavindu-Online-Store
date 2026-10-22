/* INFO pages: stores finder, about brands, contact form, policy tabs. Needs KV_DATA + theme.js loaded first. */
(function (w, d) {
  'use strict';
  var D = w.KV_DATA || {}, BR = D.brand || {};
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- stores ---------- */
  var DISTRICT = { 'Avissawella': 'Colombo' };
  // TO CONFIRM per showroom: services offered (all assumed to have delivery, installation and an Easy Payment desk)
  var SERVICES = ['Islandwide delivery', 'Installation', 'Easy Payment desk'];
  function initStores() {
    var list = $('#store-list'); if (!list) return;
    var stores = (D.stores || []).map(function (s) { return Object.assign({ district: DISTRICT[s.name] || '' }, s); });
    var sel = $('#sf-district'), q = $('#sf-q'), count = $('#sf-count'), map = $('#store-map'), cap = $('#store-map-cap');
    var districts = stores.map(function (s) { return s.district; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).sort();
    districts.forEach(function (n) { var o = d.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); });
    var active = -1;
    function query(s) { return s.name.replace(/\s\d+$/, '') + ' ' + s.address + ', Sri Lanka'; }
    function show(i) {
      var s = stores[i]; if (!s) return; active = i;
      map.src = 'https://maps.google.com/maps?q=' + encodeURIComponent('Kavindu ' + query(s)) + '&output=embed';
      cap.textContent = 'Showing: Kavindu ' + s.name + ', ' + s.address;
      $$('.store-item', list).forEach(function (el) { el.classList.toggle('is-active', +el.getAttribute('data-i') === i); });
    }
    function render() {
      var term = q.value.trim().toLowerCase(), dist = sel.value, shown = 0, html = '';
      stores.forEach(function (s, i) {
        if (dist && s.district !== dist) return;
        if (term && (s.name + ' ' + s.address + ' ' + s.district).toLowerCase().indexOf(term) < 0) return;
        shown++;
        var tel = s.phone.replace(/\D/g, '').replace(/^0/, '+94');
        html += '<li class="store-item' + (i === active ? ' is-active' : '') + '" data-i="' + i + '">' +
          '<h3>Kavindu ' + esc(s.name) + '</h3><p class="district">' + esc(s.district) + ' district</p>' +
          '<address>' + esc(s.address) + '</address><p class="hours">Open ' + esc(s.hours) + '</p>' +
          '<ul class="store-svc">' + SERVICES.map(function (v) { return '<li>' + v + '</li>'; }).join('') + '</ul>' +
          '<div class="store-actions"><button type="button" class="btn-kv btn-kv-outline btn-kv-sm" data-show="' + i + '" aria-label="Show Kavindu ' + esc(s.name) + ' on map">View on map</button>' +
          '<a class="btn-kv btn-kv-primary btn-kv-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Kavindu ' + query(s)) + '">Get directions</a>' +
          '<a class="btn-kv btn-kv-outline btn-kv-sm" href="tel:' + tel + '"><i class="fa-solid fa-phone" aria-hidden="true"></i>&nbsp;Call ' + esc(s.phone) + '</a></div></li>';
      });
      list.innerHTML = html || '<li class="store-empty">No showroom matches your search. Try a different district or call 011 234 5678.</li>';
      count.textContent = shown + (shown === 1 ? ' showroom' : ' showrooms');
    }
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-show]'); if (b) show(+b.getAttribute('data-show'));
    });
    sel.addEventListener('change', render); q.addEventListener('input', render);
    render(); show(0);
  }

  /* ---------- about ---------- */
  function initAbout() {
    var ul = $('#about-brands'); if (!ul) return;
    ul.innerHTML = (D.brands || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
  }

  /* ---------- contact ---------- */
  function initContact() {
    var f = $('#contact-form'); if (!f) return;
    var map = { hotline: [BR.hotline, BR.hotlineTel && 'tel:' + BR.hotlineTel], wa: [BR.whatsappDisplay, BR.whatsapp && 'https://wa.me/' + BR.whatsapp], email: [BR.email, BR.email && 'mailto:' + BR.email], address: [BR.address] };
    $$('[data-bind]').forEach(function (el) { var m = map[el.getAttribute('data-bind')]; if (m && m[0]) { el.textContent = m[0]; if (m[1] && el.tagName === 'A') el.href = m[1]; } });
    function err(id, msg) {
      var input = $('#' + id), e = $('#' + id + '-e');
      if (msg) { e.textContent = msg; e.hidden = false; input.setAttribute('aria-invalid', 'true'); } else { e.hidden = true; input.removeAttribute('aria-invalid'); }
      return !msg;
    }
    function validate() {
      var ok = [];
      ok.push(err('cf-name', $('#cf-name').value.trim().length < 2 ? 'Please enter your name.' : ''));
      ok.push(err('cf-phone', /^(\+94|0)?\s?7\d[\s-]?\d{3}[\s-]?\d{4}$|^(\+94|0)\s?\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test($('#cf-phone').value.trim()) ? '' : 'Enter a valid Sri Lankan phone number, e.g. 077 123 4567.'));
      var em = $('#cf-email').value.trim();
      ok.push(err('cf-email', em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em) ? 'Enter a valid email address.' : ''));
      ok.push(err('cf-topic', $('#cf-topic').value ? '' : 'Please choose a topic.'));
      ok.push(err('cf-msg', $('#cf-msg').value.trim().length < 10 ? 'Please write a few words (at least 10 characters).' : ''));
      return ok.every(Boolean);
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) { var bad = $('[aria-invalid=true]', f); if (bad) bad.focus(); return; }
      var s = $('#cf-success'); f.reset(); s.hidden = false; s.focus();
    });
    $$('input,select,textarea', f).forEach(function (el) { el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) validate(); }); });
  }

  /* ---------- policies ---------- */
  function initPolicies() {
    var tabs = $$('.kv-tab[data-tab]'); if (!tabs.length) return;
    function select(id, push) {
      if (!$('#' + id + '.policy')) id = 'delivery';
      tabs.forEach(function (t) { var on = t.getAttribute('data-tab') === id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
      $$('.policy').forEach(function (p) { p.hidden = p.id !== id; });
      if (push) { try { history.replaceState(null, '', '#' + id); } catch (e) {} }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t.getAttribute('data-tab'), true); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (n == null) return; e.preventDefault(); n = (n + tabs.length) % tabs.length; tabs[n].focus(); select(tabs[n].getAttribute('data-tab'), true);
      });
    });
    // in-page links like href="#warranty" switch tab
    d.addEventListener('click', function (e) {
      var a = e.target.closest('.policy a[href^="#"]'); if (!a) return;
      e.preventDefault(); select(a.getAttribute('href').slice(1), true);
    });
    w.addEventListener('hashchange', function () { select(location.hash.slice(1)); });
    select(location.hash.slice(1) || 'delivery');
  }

  function init() { initStores(); initAbout(); initContact(); initPolicies(); }
  if (w.KV && w.KV.ready) w.KV.ready(init); else if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
