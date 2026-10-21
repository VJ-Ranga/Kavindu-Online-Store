/* Easy Payment page: calculator, multi-step application, FAQ. Depends on window.KV / KV_DATA. */
(function (w, d) {
  'use strict';
  KV.ready(function () {
    var E = KV.easy, $ = KV.$, esc = KV.esc, fmt = KV.fmt;
    var qs = new URLSearchParams(location.search);
    var S = { pid: '', price: 120000, down: E.defaultDownPct, months: E.defaultTenure };
    var elig = KV.products.filter(function (p) { return p.price >= E.minPrice; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    var q = qs.get('product') || qs.get('id');
    if (!q && Number.isFinite(+qs.get('price')) && +qs.get('price') >= E.minPrice) S.price = Math.round(+qs.get('price'));
    if (q && KV.product(q)) { S.pid = q; S.price = KV.product(q).price; }
    if (qs.get('months') && E.tenures.some(function (t) { return t.months === +qs.get('months'); })) S.months = +qs.get('months');
    if (qs.get('down') && +qs.get('down') >= E.minDownPct) S.down = Math.min(60, Math.round(+qs.get('down') / 5) * 5);

    function prodOptions(sel) {
      sel.innerHTML = '<option value="">Other / custom price</option>' + elig.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + ' (' + fmt(p.price) + ')</option>'; }).join('');
      sel.value = S.pid;
    }

    /* ---------- calculator ---------- */
    var cProd = $('#c-product'), cPrice = $('#c-price'), cDown = $('#c-down'), cTen = $('#c-tenures'), cErr = $('#c-err');
    prodOptions(cProd);
    cDown.min = E.minDownPct;
    cTen.innerHTML = E.tenures.map(function (t) { return '<button type="button" class="kv-chip" data-m="' + t.months + '" aria-pressed="false">' + t.months + '</button>'; }).join('');

    function paintCalc() {
      cPrice.value = S.price; cPrice.readOnly = !!S.pid; cDown.value = S.down; cProd.value = S.pid;
      $('#c-down-pct-out').textContent = S.down + '%';
      var ok = S.price >= E.minPrice;
      cErr.hidden = ok; if (!ok) cErr.textContent = 'Easy Payment is available for items priced ' + fmt(E.minPrice) + ' or more.';
      cPrice.classList.toggle('is-invalid', !ok);
      KV.$$('.kv-chip', cTen).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.m === S.months)); });
      var r = KV.calc(S.price, S.down, S.months);
      $('#c-down-amt').textContent = 'Pay ' + fmt(r.down) + ' today';
      $('#r-monthly').textContent = ok ? fmt(r.monthly) : '-';
      $('#r-months').textContent = ok ? 'for ' + S.months + ' months' : '';
      $('#r-cash').textContent = fmt(S.price); $('#r-down').textContent = fmt(r.down); $('#r-fin').textContent = fmt(r.financed);
      $('#r-extra').textContent = fmt(r.extra) + ' (' + r.markupPct + '%)'; $('#r-total').textContent = fmt(r.total);
      var note = d.getElementById('ep-rounding'); if (!note) { note = d.createElement('div'); note.id = 'ep-rounding'; $('#r-total').parentNode.parentNode.appendChild(note); } note.innerHTML = KV.planNote(r);
      $('#c-table tbody').innerHTML = E.tenures.map(function (t) {
        var x = KV.calc(S.price, S.down, t.months);
        return '<tr class="' + (t.months === S.months ? 'on' : '') + '"><th scope="row">' + t.months + ' months</th><td>' + fmt(x.monthly) + '</td><td>' + fmt(x.down) + '</td><td>' + fmt(x.extra) + '</td><td>' + fmt(x.total) + '</td><td><button type="button" class="kv-chip" data-pick="' + t.months + '" aria-label="Choose ' + t.months + ' month plan">Choose</button></td></tr>';
      }).join('');
      syncApp();
    }
    cProd.addEventListener('change', function () { S.pid = cProd.value; if (S.pid) S.price = KV.product(S.pid).price; paintCalc(); });
    cPrice.addEventListener('input', function () { S.price = Math.max(0, +cPrice.value || 0); paintCalc(); cPrice.focus(); });
    cDown.addEventListener('input', function () { S.down = +cDown.value; paintCalc(); });
    cTen.addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (b) { S.months = +b.dataset.m; paintCalc(); } });
    $('#c-table').addEventListener('click', function (e) { var b = e.target.closest('[data-pick]'); if (b) { S.months = +b.dataset.pick; paintCalc(); } });

    /* ---------- application ---------- */
    var form = $('#ep-form'), aProd = $('#a-product'), aPrice = $('#a-price'), aDown = $('#a-down'), aMonths = $('#a-months');
    prodOptions(aProd);
    var downs = []; for (var dp = E.minDownPct; dp <= 60; dp += 5) downs.push(dp);
    aDown.innerHTML = downs.map(function (v) { return '<option value="' + v + '">' + v + '%</option>'; }).join('');
    aMonths.innerHTML = E.tenures.map(function (t) { return '<option value="' + t.months + '">' + t.months + ' months</option>'; }).join('');
    $('#a-district').innerHTML = '<option value="">Select district</option>' + KV_DATA.districts.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');

    function syncApp() {
      aProd.value = S.pid; aPrice.value = S.price; aPrice.readOnly = !!S.pid; aDown.value = String(S.down); aMonths.value = String(S.months);
      var r = KV.calc(S.price, S.down, S.months);
      $('#a-plan-sum').innerHTML = S.price >= E.minPrice ? 'Down payment <strong>' + fmt(r.down) + '</strong>, then <strong>' + fmt(r.monthly) + '</strong> a month for ' + S.months + ' months. Total <strong>' + fmt(r.total) + '</strong>. <span class="text-muted-kv">Rates shown are indicative.</span>' : '';
      var inc = +$('#a-income').value;
      var box = $('#a-afford');
      if (inc > 0) { var ok = inc >= r.monthly * 3; box.classList.toggle('warn', !ok); box.innerHTML = ok ? 'Your income covers this plan: <strong>' + fmt(r.monthly) + '</strong> a month.' : 'Our guideline is income of at least 3 times the monthly amount (<strong>' + fmt(r.monthly * 3) + '</strong>). You can still apply, or add a guarantor.'; } else box.innerHTML = '';
    }
    aProd.addEventListener('change', function () { S.pid = aProd.value; if (S.pid) S.price = KV.product(S.pid).price; paintCalc(); });
    aPrice.addEventListener('input', function () { S.price = +aPrice.value || 0; paintCalc(); });
    aDown.addEventListener('change', function () { S.down = +aDown.value; paintCalc(); });
    aMonths.addEventListener('change', function () { S.months = +aMonths.value; paintCalc(); });
    $('#a-income').addEventListener('input', syncApp);
    $('#r-apply').addEventListener('click', function () { setTimeout(function () { var h = $('.ep-panel:not([hidden]) h3'); if (h) h.focus({ preventScroll: true }); }, 50); });

    var DOCS = [['nicf', 'NIC, front'], ['nicb', 'NIC, back'], ['util', 'Utility bill (last 3 months)'], ['sal', 'Salary slip or bank statements']];
    $('#a-files').innerHTML = DOCS.map(function (x) {
      return '<div class="ep-file" data-doc="' + x[0] + '"><div class="t"><strong>' + x[1] + ' <span class="required" style="display:inline">*</span></strong><span id="f-' + x[0] + '-n">No file selected</span><span class="field-err" id="f-' + x[0] + '-e" role="alert" hidden></span></div>' +
        '<input type="file" id="f-' + x[0] + '" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" aria-describedby="f-' + x[0] + '-n"><label for="f-' + x[0] + '" class="btn-kv btn-kv-outline btn-kv-sm" style="margin:0">Choose file</label></div>';
    }).join('');
    var files = {};
    $('#a-files').addEventListener('change', function (e) {
      var inp = e.target; if (inp.type !== 'file') return;
      var key = inp.id.slice(2), f = inp.files[0], box = inp.closest('.ep-file'), err = $('#f-' + key + '-e');
      err.hidden = true; delete files[key]; box.classList.remove('has');
      if (!f) { $('#f-' + key + '-n').textContent = 'No file selected'; return; }
      if (!/\.(jpe?g|png|pdf)$/i.test(f.name)) { err.textContent = 'Use a JPG, PNG or PDF file.'; err.hidden = false; inp.value = ''; $('#f-' + key + '-n').textContent = 'No file selected'; return; }
      if (f.size > 5 * 1024 * 1024) { err.textContent = 'File is larger than 5 MB.'; err.hidden = false; inp.value = ''; $('#f-' + key + '-n').textContent = 'No file selected'; return; }
      files[key] = f.name; box.classList.add('has'); $('#f-' + key + '-n').textContent = f.name + ' (' + Math.max(1, Math.round(f.size / 1024)) + ' KB)';
    });

    var step = 1, TOTAL = 6, err = $('#a-err');
    var NIC_OLD = /^\d{9}[VvXx]$/, NIC_NEW = /^(19[4-9]\d|200[0-8])\d{8}$/, MOB = /^07\d{8}$/;
    function validNic(v) { return NIC_OLD.test(v) || NIC_NEW.test(v); }
    function fieldErr(el, msg) {
      var id = el.id + '-e', old = d.getElementById(id); if (old) old.remove();
      el.classList.toggle('is-invalid', !!msg); el.removeAttribute('aria-invalid');
      if (msg) { var s = d.createElement('span'); s.className = 'field-err'; s.id = id; s.textContent = msg; el.parentNode.appendChild(s); el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', ((el.getAttribute('aria-describedby') || '').replace(id, '') + ' ' + id).trim()); }
      return !msg;
    }
    function req(el, msg) { return fieldErr(el, el.value.trim() ? '' : (msg || 'This field is required.')); }
    var checks = {
      1: function () {
        var ok = true;
        if (S.price < E.minPrice) { ok = fieldErr(aPrice, 'Price must be ' + fmt(E.minPrice) + ' or more.') && ok; } else fieldErr(aPrice, '');
        return ok;
      },
      2: function () {
        var ok = true, n = $('#a-nic'), m = $('#a-mobile');
        ok = req($('#a-name'), 'Enter your full name.') && ok;
        n.value = n.value.trim().toUpperCase();
        ok = fieldErr(n, !n.value ? 'Enter your NIC number.' : validNic(n.value) ? '' : 'Enter 9 digits + V or X, or a 12-digit NIC.') && ok;
        ok = fieldErr(m, !m.value ? 'Enter your mobile number.' : MOB.test(m.value.replace(/\s/g, '')) ? '' : 'Use 10 digits starting 07, for example 0771234567.') && ok;
        var em = $('#a-email'); ok = fieldErr(em, em.value && !em.checkValidity() ? 'Enter a valid email address.' : '') && ok;
        ok = req($('#a-address'), 'Enter your delivery address.') && ok;
        ok = req($('#a-district'), 'Select your district.') && ok;
        return ok;
      },
      3: function () {
        var ok = true;
        ok = req($('#a-emptype'), 'Select employment type.') && ok; ok = req($('#a-employer'), 'Enter employer or business name.') && ok;
        ok = req($('#a-years'), 'Enter years in current job.') && ok; ok = req($('#a-income'), 'Enter your monthly income.') && ok;
        return ok;
      },
      4: function () {
        var gn = $('#g-name'), gi = $('#g-nic'), gm = $('#g-mobile'), any = gn.value || gi.value || gm.value, ok = true;
        if (!any) { [gn, gi, gm].forEach(function (x) { fieldErr(x, ''); }); return true; }
        ok = req(gn, 'Enter the guarantor name.') && ok;
        ok = fieldErr(gi, validNic(gi.value.trim().toUpperCase()) ? '' : 'Enter a valid NIC.') && ok;
        ok = fieldErr(gm, MOB.test(gm.value) ? '' : 'Use 10 digits starting 07.') && ok;
        return ok;
      },
      5: function () {
        var miss = DOCS.filter(function (x) { return !files[x[0]]; });
        DOCS.forEach(function (x) { if (!files[x[0]] && $('#f-' + x[0] + '-e').hidden) { /* keep size errors */ } });
        if (miss.length) { err.textContent = 'Please upload: ' + miss.map(function (x) { return x[1]; }).join(', ') + '.'; err.hidden = false; return false; }
        return true;
      },
      6: function () {
        var a = $('#a-terms'), b = $('#a-data'), ok = true;
        [a, b].forEach(function (c) { var e = d.getElementById(c.id + '-e'); if (e) e.remove(); if (!c.checked) { ok = false; var s = d.createElement('span'); s.className = 'field-err'; s.id = c.id + '-e'; s.textContent = 'Please tick to continue.'; c.closest('.form-row').appendChild(s); c.setAttribute('aria-invalid', 'true'); } else c.removeAttribute('aria-invalid'); });
        return ok;
      }
    };
    function val(id) { return ($('#' + id).value || '').trim(); }
    function review() {
      var r = KV.calc(S.price, S.down, S.months), p = S.pid ? KV.product(S.pid) : null;
      function sec(t, rows) { return '<h4>' + t + '</h4><dl>' + rows.filter(function (x) { return x[1]; }).map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>'; }
      $('#a-review').innerHTML =
        sec('Plan', [['Product', p ? p.name : 'Custom price'], ['Cash price', fmt(S.price)], ['Down payment', fmt(r.down) + ' (' + S.down + '%)'], ['Monthly', fmt(r.monthly) + ' x ' + S.months], ['Final instalment', fmt(r.finalMonthly)], ['Total payable', fmt(r.total)]]) +
        sec('Personal', [['Name', val('a-name')], ['NIC', val('a-nic')], ['Mobile', val('a-mobile')], ['Email', val('a-email')], ['Address', val('a-address') + ', ' + val('a-district')]]) +
        sec('Employment', [['Type', val('a-emptype')], ['Employer', val('a-employer')], ['Years in job', val('a-years')], ['Monthly income', fmt(+val('a-income'))]]) +
        sec('Guarantor', [['Name', val('g-name') || 'None added'], ['NIC', val('g-nic')], ['Mobile', val('g-mobile')], ['Relationship', val('g-rel')]]) +
        sec('Documents', DOCS.map(function (x) { return [x[1], files[x[0]]]; }));
    }
    function show(n, focus) {
      step = n;
      KV.$$('.ep-panel').forEach(function (p) { p.hidden = +p.dataset.step !== n; });
      KV.$$('#a-progress li').forEach(function (li) { var s = +li.dataset.step; li.className = s < n ? 'done' : s === n ? 'cur' : ''; if (s === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
      $('#a-count').textContent = 'Step ' + n + ' of ' + TOTAL + (n === 4 ? ' (optional)' : '');
      $('#a-back').hidden = n === 1; $('#a-next').textContent = n === TOTAL ? 'Submit application' : n === 4 && !(val('g-name') || val('g-nic') || val('g-mobile')) ? 'Skip guarantor' : 'Continue';
      err.hidden = true;
      if (n === 6) review();
      if (focus) { var h = $('.ep-panel[data-step="' + n + '"] h3'); h.focus({ preventScroll: true }); h.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    }
    ['g-name', 'g-nic', 'g-mobile'].forEach(function (id) { $('#' + id).addEventListener('input', function () { if (step === 4) $('#a-next').textContent = (val('g-name') || val('g-nic') || val('g-mobile')) ? 'Continue' : 'Skip guarantor'; }); });
    ['a-nic', 'g-nic'].forEach(function (id) { $('#' + id).addEventListener('blur', function () { this.value = this.value.trim().toUpperCase(); }); });
    ['a-mobile', 'g-mobile'].forEach(function (id) { $('#' + id).addEventListener('input', function () { this.value = this.value.replace(/[^\d]/g, ''); }); });
    $('#a-back').addEventListener('click', function () { show(step - 1, true); });
    $('#a-next').addEventListener('click', function () {
      if (!checks[step]()) { var bad = $('.ep-panel[data-step="' + step + '"] [aria-invalid="true"]') || err; if (bad !== err) bad.focus(); return; }
      if (step < TOTAL) { show(step + 1, true); return; }
      var apps = KV.load('kv-applications', []), ref = 'EP-2026-' + String(Math.floor(1000 + Math.random() * 9000));
      var r = KV.calc(S.price, S.down, S.months), p = S.pid ? KV.product(S.pid) : null;
      apps.unshift({ ref: ref, date: new Date().toISOString(), status: 'Under review', productId: S.pid, product: p ? p.name : 'Custom purchase', image: p ? p.images[0] : '', price: S.price, downPct: S.down, down: r.down, months: S.months, monthly: r.monthly, finalMonthly: r.finalMonthly, total: r.total, name: val('a-name'), nic: val('a-nic'), mobile: val('a-mobile'), district: val('a-district'), documents: files });
      KV.save('kv-applications', apps);
      form.hidden = true; $('#a-progress').hidden = true; $('#a-count').hidden = true;
      $('#a-ref').textContent = ref; $('#a-done-mob').textContent = val('a-mobile'); var dn = $('#a-done'); dn.hidden = false; dn.focus(); dn.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); $('#a-next').click(); } });

    /* ---------- FAQ ---------- */
    var FAQ = [
      ['What happens if I pay late?', 'Instalments are due on the same date each month. If a payment is more than 7 days late a late fee applies (the current rate is shown in your agreement) and our team will call you. Repeated delays can affect approval for future Easy Payment purchases.'],
      ['Can I settle the plan early?', 'Yes. You can settle the outstanding balance at any time at a showroom or by bank transfer. Early settlement terms, including any reduction in the plan charge, are set out in your agreement.'],
      ['Who owns the product during the plan?', 'You take the product home on delivery and can use it straight away. Ownership stays with Kavindu Enterprises until the final instalment is paid, and the title then passes to you. Please do not sell or pledge the item before then.'],
      ['Do I need a guarantor?', 'No, a guarantor is optional. We may ask for one if your income is irregular or the plan is large relative to your income. A guarantor must be a Sri Lankan citizen with a NIC and a regular income.'],
      ['How do I pay each month?', 'By card through PayHere from your account page, by bank transfer to our account quoting your reference, or in cash at any showroom.'],
      ['Is the plan charge fixed?', 'The plan charge is fixed when your agreement is signed and does not change during the plan. All terms are subject to the final agreement and approval by Kavindu Enterprises.']
    ];
    $('#faq-acc').innerHTML = FAQ.map(function (f, i) {
      return '<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq' + i + '" aria-expanded="false" aria-controls="faq' + i + '">' + esc(f[0]) + '</button></h3><div id="faq' + i + '" class="accordion-collapse collapse" data-bs-parent="#faq-acc"><div class="accordion-body">' + esc(f[1]) + '</div></div></div>';
    }).join('');

    paintCalc(); show(1, false);
    if (location.hash === '#apply' && qs.get('product')) setTimeout(function () { var el = d.getElementById('apply'); if (el) el.scrollIntoView(); }, 300);
  });
})(window, document);
