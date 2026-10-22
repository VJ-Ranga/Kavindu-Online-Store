/* pay.html - mock hosted pages for PayHere, Koko and Mintpay (sandbox). Standalone: needs only KV_DATA.
   URL: pay.html?gw=payhere|koko|mintpay&order=1001   (optional: &amt=12450&ref=EP-1 for an instalment payment with no order) */
(function (w, d) {
  'use strict';
  var root = d.getElementById('pay-root'), qs = new URLSearchParams(location.search);
  var gw = ['payhere', 'koko', 'mintpay'].indexOf(qs.get('gw')) > -1 ? qs.get('gw') : 'payhere';
  var IMG = 'assets/img/payments/';
  function load(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(n) { return Math.round(n).toLocaleString('en-US'); }
  function money2(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  var orders = load('kv-orders', []), order = null;
  orders.forEach(function (o) { if (String(o.number) === qs.get('order')) order = o; });
  var amount = order ? order.total : (parseInt(qs.get('amt'), 10) || 405500);
  var label = order ? 'Order #' + order.number : (qs.get('ref') ? 'Ref ' + qs.get('ref') : 'Order #1042');
  var inst = order && order.inst ? order.inst : null;
  function rnd(n) { var s = ''; while (s.length < n) s += Math.floor(Math.random() * 10); return s; }

  function finish(ref) {
    if (!order && qs.get('ref') === 'EP-2026-0417' && +qs.get('instalment')) { try { localStorage.setItem('kv-plan-paid', String(Math.max(+load('kv-plan-paid', 3), +qs.get('instalment')))); } catch (e) {} }
    if (order) {
      var all = load('kv-orders', []);
      all.forEach(function (o) { if (o.number === order.number) { o.status = 'processing'; o.pay = { ref: ref, at: new Date().toISOString(), via: gw }; } });
      try { localStorage.setItem('kv-orders', JSON.stringify(all)); } catch (e) {}
    }
    return order ? 'order-received.html?order=' + order.number + '&key=' + order.key : 'my-account.html';
  }
  function cancelUrl() { return order ? 'order-received.html?order=' + order.number + '&key=' + order.key : 'checkout.html'; }
  function err(id, msg) { var e = d.getElementById(id + '_err'), i = d.getElementById(id); if (!e) return; e.textContent = msg; e.hidden = !msg; if (i) { i.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (msg) i.setAttribute('aria-describedby', id + '_err'); } }
  function f(id, label, o) {
    o = o || {};
    return '<div class="pg-f' + (o.cls ? ' ' + o.cls : '') + '"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + id + '" type="text" inputmode="' + (o.mode || 'numeric') + '" autocomplete="' + (o.auto || 'off') + '" placeholder="' + (o.ph || '') + '"' + (o.max ? ' maxlength="' + o.max + '"' : '') + '><span class="pg-err" id="' + id + '_err" role="alert" hidden></span></div>';
  }
  function focusH() { var h = root.querySelector('h1,h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } w.scrollTo(0, 0); }
  function brand(n) { n = n.replace(/\s/g, ''); return /^4/.test(n) ? 'visa' : /^(5[1-5]|2[2-7])/.test(n) ? 'mastercard' : /^3[47]/.test(n) ? 'amex' : ''; }
  function cardFields(prefix) {
    return f(prefix + 'num', 'Card number', { ph: '1234 5678 9012 3456', auto: 'cc-number', max: 23 }).replace('</div>', '<span class="pg-brand" id="' + prefix + 'brand" aria-hidden="true"></span></div>') +
      '<div class="pg-two">' + f(prefix + 'exp', 'Expiry (MM/YY)', { ph: 'MM/YY', auto: 'cc-exp', max: 5 }) + f(prefix + 'cvv', 'Security code (CVV)', { ph: '123', auto: 'cc-csc', max: 4 }) + '</div>' +
      f(prefix + 'name', 'Name on card', { mode: 'text', auto: 'cc-name', ph: 'As printed on the card' });
  }
  function bindCard(prefix) {
    var n = d.getElementById(prefix + 'num'), e = d.getElementById(prefix + 'exp');
    n.addEventListener('input', function () { var v = n.value.replace(/\D/g, '').slice(0, 19); n.value = v.replace(/(.{4})/g, '$1 ').trim(); var b = brand(v), el = d.getElementById(prefix + 'brand'); el.innerHTML = b ? '<i class="fa-brands fa-cc-' + b + '"></i>' : ''; });
    e.addEventListener('input', function () { var v = e.value.replace(/\D/g, '').slice(0, 4); e.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v; });
    d.getElementById(prefix + 'cvv').addEventListener('input', function (ev) { ev.target.value = ev.target.value.replace(/\D/g, ''); });
  }
  function checkCard(prefix) {
    var ok = true, v = function (i) { return d.getElementById(prefix + i).value.trim(); }, digits = v('num').replace(/\s/g, '');
    var m = /^(\d{2})\/(\d{2})$/.exec(v('exp'));
    err(prefix + 'num', digits.length < 13 || digits.length > 19 || !/^\d+$/.test(digits) ? 'Enter a valid card number.' : ''); if (digits.length < 13 || digits.length > 19 || !/^\d+$/.test(digits)) ok = false;
    var today = new Date(), expOk = m && +m[1] >= 1 && +m[1] <= 12 && (2000 + +m[2] > today.getFullYear() || (2000 + +m[2] === today.getFullYear() && +m[1] >= today.getMonth() + 1)); err(prefix + 'exp', expOk ? '' : 'Enter a current expiry date as MM/YY.'); if (!expOk) ok = false;
    var cvOk = /^\d{3,4}$/.test(v('cvv')); err(prefix + 'cvv', cvOk ? '' : 'Enter the 3 or 4 digit code.'); if (!cvOk) ok = false;
    var nmOk = v('name').length > 1; err(prefix + 'name', nmOk ? '' : 'Enter the name shown on the card.'); if (!nmOk) ok = false;
    if (!ok) { var bad = root.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); }
    return ok;
  }
  function otpStep(opts, next) {
    /* opts: {title, sub, btn, cls} */
    root.querySelector('.pg-body').innerHTML = '<h2 class="pg-h">' + opts.title + '</h2><p class="pg-sub">' + opts.sub + '</p><form id="otp-form" novalidate>' + f('otp', 'One-time password (6 digits)', { ph: '000000', auto: 'one-time-code', max: 6 }) +
      '<p class="pg-hint">Sandbox: enter any 6 digits. <button type="button" class="pg-link" id="otp-fill">Fill for me</button></p><button class="pg-btn" type="submit">' + opts.btn + '</button></form>';
    d.getElementById('otp').addEventListener('input', function (e) { e.target.value = e.target.value.replace(/\D/g, ''); });
    d.getElementById('otp-fill').onclick = function () { d.getElementById('otp').value = '482913'; d.getElementById('otp').focus(); };
    d.getElementById('otp-form').onsubmit = function (e) { e.preventDefault(); if (!/^\d{6}$/.test(d.getElementById('otp').value)) { err('otp', 'Enter the 6 digit code.'); d.getElementById('otp').focus(); return; } err('otp', ''); next(); };
    focusH();
  }
  function working(msg, ms, next) {
    root.querySelector('.pg-body').innerHTML = '<div class="pg-work" role="status"><span class="pg-spin" aria-hidden="true"></span><p>' + msg + '</p></div>';
    setTimeout(next, ms);
  }
  function redirectIn(url, s) {
    var el = d.getElementById('redir'); if (!el) return;
    var left = s; el.textContent = left; var t = setInterval(function () { left--; if (el) el.textContent = Math.max(left, 0); if (left <= 0) { clearInterval(t); location.href = url; } }, 1000);
  }

  /* =============== PAYHERE =============== */
  function payhere() {
    var tab = 'card', title = order ? 'Kavindu Online Store' : 'Kavindu Online Store';
    var tabs = inst ? [['card', 'Cards']] : [['card', 'Cards'], ['wallet', 'Mobile wallets'], ['bank', 'Internet banking']];
    root.innerHTML = '<div class="ph"><header class="ph-top"><div class="ph-wrap"><img src="' + IMG + 'payhere.png" alt="PayHere" height="34"><span class="ph-secure"><i class="fa-solid fa-lock" aria-hidden="true"></i> Secure checkout</span></div></header>' +
      '<div class="ph-wrap ph-main"><aside class="ph-sum" aria-label="Payment summary"><p class="ph-k">Paying to</p><h1 class="ph-merchant">' + title + '</h1><p class="ph-k">Reference</p><p class="ph-v">' + esc(label) + '</p>' +
      (inst ? '<p class="ph-k">Instalment plan</p><p class="ph-v">' + inst.months + ' months at 0%<br><span class="ph-sm">' + esc(inst.bank) + ' credit cards</span></p><p class="ph-k">Monthly payment</p><p class="ph-v">LKR ' + money2(Math.ceil(amount / inst.months)) + '</p>' : '') +
      '<div class="ph-amt"><span>Total amount</span><strong>LKR ' + money2(amount) + '</strong></div><a class="ph-cancel" href="' + cancelUrl() + '">Cancel and return to the store</a></aside>' +
      '<section class="ph-pay"><div class="pg-body"></div></section></div><footer class="ph-foot"><div class="ph-wrap"><span><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Payments are encrypted and processed by PayHere (Pvt) Ltd.</span><span class="ph-cards"><i class="fa-brands fa-cc-visa"></i><i class="fa-brands fa-cc-mastercard"></i><i class="fa-brands fa-cc-amex"></i></span></div></footer></div>';
    var body = root.querySelector('.pg-body');
    function show() {
      body.innerHTML = '<h2 class="pg-h">Select payment method</h2>' + (tabs.length > 1 ? '<div class="ph-tabs" role="tablist" aria-label="Payment methods">' + tabs.map(function (t) { return '<button type="button" role="tab" class="ph-tab" id="tab-' + t[0] + '" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' : '') + '<div class="ph-panel" role="tabpanel" aria-labelledby="tab-' + tab + '">' + panel() + '</div>';
      body.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.getAttribute('data-tab'); show(); d.getElementById('tab-' + tab).focus(); }; });
      bind();
    }
    function panel() {
      if (tab === 'card') return '<form id="card-form" novalidate><div class="ph-brands"><i class="fa-brands fa-cc-visa" style="color:#1A1F71"></i><i class="fa-brands fa-cc-mastercard" style="color:#EB001B"></i><i class="fa-brands fa-cc-amex" style="color:#006FCF"></i></div>' + cardFields('c') +
        '<p class="pg-hint"><button type="button" class="pg-link" id="test-card">Use sandbox test card</button></p><button class="pg-btn ph-btn" type="submit">Pay LKR ' + money2(amount) + '</button></form>';
      if (tab === 'wallet') return '<form id="wallet-form" novalidate><fieldset class="ph-tiles"><legend class="pg-sub">Choose your wallet</legend>' + ['eZ Cash', 'Genie', 'FriMi', 'mCash'].map(function (n, i) { return '<label class="ph-tile"><input type="radio" name="wallet" value="' + n + '"' + (i === 0 ? ' checked' : '') + '><span>' + n + '</span></label>'; }).join('') + '</fieldset>' +
        f('wmob', 'Registered mobile number', { ph: '07X XXX XXXX', auto: 'tel', mode: 'tel', max: 12 }) + '<button class="pg-btn ph-btn" type="submit">Continue</button></form>';
      return '<form id="bank-form" novalidate><fieldset class="ph-tiles"><legend class="pg-sub">Choose your bank</legend>' + ['Vishwa', 'HNB', 'Sampath Vishwa', 'Commercial Bank'].map(function (n, i) { return '<label class="ph-tile"><input type="radio" name="ibank" value="' + n + '"' + (i === 0 ? ' checked' : '') + '><span>' + n + '</span></label>'; }).join('') + '</fieldset><button class="pg-btn ph-btn" type="submit">Continue to bank</button></form>';
    }
    function success() {
      var ref = 'PH' + rnd(9), url = finish(ref);
      body.innerHTML = '<div class="pg-done"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><h2 class="pg-h">Payment successful</h2><p>LKR ' + money2(amount) + ' paid to Kavindu Online Store.</p><p class="pg-sub">Payment ID <strong>' + ref + '</strong></p><p class="pg-sub">Returning you to the store in <span id="redir">3</span> seconds&hellip;</p><a class="pg-btn ph-btn" href="' + url + '">Return to store now</a></div>';
      focusH(); redirectIn(url, 3);
    }
    function secure(how) {
      otpStep({ title: how === 'card' ? '3-D Secure verification' : 'Approve payment', sub: how === 'card' ? 'Your bank has sent a one-time password to your registered mobile number to confirm this purchase of LKR ' + money2(amount) + '.' : 'Enter the one-time password sent to your phone to approve the payment of LKR ' + money2(amount) + '.', btn: 'Confirm payment' },
        function () { working('Confirming your payment&hellip;', 1400, success); });
    }
    function bind() {
      var cf = d.getElementById('card-form');
      if (cf) { bindCard('c'); d.getElementById('test-card').onclick = function () { d.getElementById('cnum').value = '4916 2170 0000 0000'; d.getElementById('cexp').value = '12/29'; d.getElementById('ccvv').value = '123'; d.getElementById('cname').value = 'TEST CARDHOLDER'; d.getElementById('cbrand').innerHTML = '<i class="fa-brands fa-cc-visa"></i>'; }; cf.onsubmit = function (e) { e.preventDefault(); if (checkCard('c')) secure('card'); }; }
      var wf = d.getElementById('wallet-form');
      if (wf) wf.onsubmit = function (e) { e.preventDefault(); var v = d.getElementById('wmob').value.replace(/[\s-]/g, ''); if (!/^(?:\+94|0)7\d{8}$/.test(v)) { err('wmob', 'Enter a valid mobile number.'); d.getElementById('wmob').focus(); return; } secure('wallet'); };
      var bf = d.getElementById('bank-form');
      if (bf) bf.onsubmit = function (e) { e.preventDefault(); working('Redirecting to your bank&hellip;', 1000, function () { secure('wallet'); }); };
    }
    show(); document.title = 'PayHere | Secure payment';
  }

  /* =============== KOKO / MINTPAY =============== */
  function bnpl() {
    var K = gw === 'koko', T = K ? { name: 'Koko', cls: 'kk', logo: '<img src="' + IMG + 'koko.png" alt="Koko" height="30">' } : { name: 'Mintpay', cls: 'mp', logo: '<img src="' + IMG + 'mintpay-small.png" alt="Mintpay" height="26">' };
    var steps = ['Mobile', 'Verify', 'Plan', 'Pay'], step = 0, phone = '', mode = 'later';
    function plan() {
      var a = Math.floor(amount / 3), arr = [a, a, amount - 2 * a], out = [];
      for (var i = 0; i < 3; i++) { var dt = new Date(); dt.setDate(dt.getDate() + i * 30); out.push({ amt: arr[i], date: i === 0 ? 'Today' : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }); }
      return out;
    }
    root.innerHTML = '<div class="bn ' + T.cls + '"><header class="bn-top"><div class="bn-wrap">' + T.logo + '<span class="bn-secure"><i class="fa-solid fa-lock" aria-hidden="true"></i> Secure</span></div></header>' +
      '<main class="bn-wrap bn-main"><h1 class="bn-page-title">' + esc(T.name) + ' payment</h1><div class="bn-merchant"><div><span class="bn-k">Paying</span><strong>Kavindu Online Store</strong><span class="bn-k">' + esc(label) + '</span></div><div class="bn-total"><span class="bn-k">Order total</span><strong>Rs ' + num(amount) + '</strong></div></div>' +
      '<ol class="bn-steps" aria-label="Progress"></ol><div class="pg-body bn-card"></div><a class="bn-cancel" href="' + cancelUrl() + '">Cancel and return to Kavindu Online Store</a></main>' +
      '<footer class="bn-foot">' + T.name + ' is shown here as a sandbox preview of the hosted payment page.</footer></div>';
    var body = root.querySelector('.pg-body');
    function bar() { root.querySelector('.bn-steps').innerHTML = steps.map(function (s, i) { return '<li class="' + (i < step ? 'done' : i === step ? 'cur' : '') + '"' + (i === step ? ' aria-current="step"' : '') + '><span>' + (i < step ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : i + 1) + '</span>' + s + '</li>'; }).join(''); }
    function go(n) { step = n; bar(); [s0, s1, s2, s3][n](); }
    function s0() {
      body.innerHTML = '<h1 class="pg-h">' + (K ? 'Pay in 3 with Koko' : 'Mintpay checkout') + '</h1><p class="pg-sub">' + (K ? 'Enter your mobile number to sign in or create your Koko account.' : 'Enter your mobile number to sign in to Mintpay.') + '</p><form id="mob-form" novalidate><div class="pg-f"><label for="mob">Mobile number</label><div class="pg-phone"><span>+94</span><input id="mob" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="77 123 4567" maxlength="12"></div><span class="pg-err" id="mob_err" role="alert" hidden></span></div><button class="pg-btn" type="submit">Send OTP</button></form>';
      d.getElementById('mob').value = phone;
      d.getElementById('mob-form').onsubmit = function (e) { e.preventDefault(); var v = d.getElementById('mob').value.replace(/[\s-]/g, '').replace(/^0/, ''); if (!/^7\d{8}$/.test(v)) { err('mob', 'Enter a valid mobile number, e.g. 77 123 4567.'); d.getElementById('mob').focus(); return; } phone = v; go(1); };
      focusH();
    }
    function s1() { otpStep({ title: 'Verify your number', sub: 'We sent a 6 digit code to +94 ' + esc(phone) + '. <button type="button" class="pg-link" id="chg">Change number</button>', btn: 'Verify' }, function () { go(2); }); d.getElementById('chg').onclick = function () { go(0); }; }
    function s2() {
      var p = plan();
      body.innerHTML = '<h2 class="pg-h">' + (K ? 'Your Koko plan' : 'Choose how to pay') + '</h2>' +
        (K ? '' : '<div class="mp-modes" role="radiogroup" aria-label="Payment option"><label class="mp-mode"><input type="radio" name="mode" value="later" checked><span><strong>Pay Later in 3</strong><small>3 x Rs ' + num(p[0].amt) + ', 0% interest</small></span></label><label class="mp-mode"><input type="radio" name="mode" value="now"><span><strong>Pay Now</strong><small>Rs ' + num(amount) + ' today, earn Mint Coins</small></span></label></div>') +
        '<div id="plan-box"></div><button class="pg-btn" id="plan-ok" type="button">Continue to payment</button><p class="pg-hint">' + (K ? 'Missed instalments may attract a late fee. Read the Koko terms before you confirm.' : 'Instalments are charged automatically to your card on the due dates.') + '</p>';
      function box() {
        d.getElementById('plan-box').innerHTML = mode === 'now' ? '<div class="bn-plan"><div class="bn-plan-row cur"><span>Due today</span><strong>Rs ' + num(amount) + '</strong></div></div>' :
          '<div class="bn-plan"><p class="bn-plan-h">3 interest-free instalments</p>' + p.map(function (r, i) { return '<div class="bn-plan-row' + (i === 0 ? ' cur' : '') + '"><span><i class="fa-regular fa-circle' + (i === 0 ? '-dot' : '') + '" aria-hidden="true"></i> ' + (i === 0 ? 'Instalment 1 &middot; Today' : 'Instalment ' + (i + 1) + ' &middot; ' + r.date) + '</span><strong>Rs ' + num(r.amt) + '</strong></div>'; }).join('') + '<p class="bn-plan-n">Total Rs ' + num(amount) + ' &middot; Interest Rs 0 &middot; Fees Rs 0</p></div>';
      }
      box();
      body.querySelectorAll('[name=mode]').forEach(function (r) { r.onchange = function () { mode = r.value; box(); }; });
      d.getElementById('plan-ok').onclick = function () { go(3); };
      focusH();
    }
    function s3() {
      var due = mode === 'now' ? amount : plan()[0].amt;
      body.innerHTML = '<h2 class="pg-h">Pay ' + (mode === 'now' ? 'in full' : 'your first instalment') + '</h2><p class="pg-sub">Rs ' + num(due) + ' will be charged to your card' + (mode === 'now' ? '' : '; the remaining instalments are charged automatically') + '.</p><form id="pay-form" novalidate>' + cardFields('k') + '<p class="pg-hint"><button type="button" class="pg-link" id="test-card">Use sandbox test card</button></p><button class="pg-btn" type="submit">Pay Rs ' + num(due) + '</button></form>';
      bindCard('k'); d.getElementById('test-card').onclick = function () { d.getElementById('knum').value = '5204 7300 0000 2514'; d.getElementById('kexp').value = '11/29'; d.getElementById('kcvv').value = '123'; d.getElementById('kname').value = 'TEST CARDHOLDER'; d.getElementById('kbrand').innerHTML = '<i class="fa-brands fa-cc-mastercard"></i>'; };
      d.getElementById('pay-form').onsubmit = function (e) { e.preventDefault(); if (checkCard('k')) working('Processing your payment&hellip;', 1500, done); };
      focusH();
    }
    function done() {
      var ref = (K ? 'KK-' : 'MP-') + rnd(8), url = finish(ref);
      for (var i = 0; i < 4; i++) { var li = root.querySelectorAll('.bn-steps li')[i]; if (li) li.className = 'done'; }
      body.innerHTML = '<div class="pg-done"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><h2 class="pg-h">' + (mode === 'now' ? 'Payment successful' : 'Your plan is confirmed') + '</h2><p>' + (mode === 'now' ? 'Rs ' + num(amount) + ' paid.' : 'First instalment of Rs ' + num(plan()[0].amt) + ' paid. Two more of about Rs ' + num(plan()[1].amt) + ' follow every 30 days.') + '</p><p class="pg-sub">Reference <strong>' + ref + '</strong></p><p class="pg-sub">Taking you back to Kavindu Online Store in <span id="redir">3</span> seconds&hellip;</p><a class="pg-btn" href="' + url + '">Return to store now</a></div>';
      focusH(); redirectIn(url, 3);
    }
    document.title = T.name + ' | Secure payment';
    go(qs.get('step') ? Math.min(3, +qs.get('step')) : 0);
  }
  if (gw === 'payhere') payhere(); else bnpl();
})(window, document);
