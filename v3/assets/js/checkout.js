/* Checkout + Order received. #checkout-root (checkout.html) / #order-root (order-received.html). Uses window.KV.
   Orders: localStorage "kv-orders" [{number,key,date,status,items,subtotal,discount,shipping,shipLabel,total,method,methodTitle,billing,notes,plan?,inst?,pay?}] */
(function (w, d) {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var IMG = 'assets/img/payments/';
  var SHIP = [
    { id: 'standard', title: 'Standard delivery (islandwide)', note: '3-5 working days. Free over Rs 50,000.' },
    { id: 'express', title: 'Colombo express delivery', note: 'Next working day. Colombo district only.' },
    { id: 'pickup', title: 'Showroom pickup', note: 'Free. Ready in 2 working days.' }
  ];
  var COUPONS = { WELCOME5: 5, KAVINDU10: 10 };
  var BANK = { bank: 'Commercial Bank of Ceylon PLC', branch: 'Avissawella', name: 'Kavindu Enterprises (Pvt) Ltd', no: '1000 2345 6789', swift: 'CCEYLKLX' };
  var METHODS = [
    { id: 'payhere', title: 'Pay online with PayHere', gw: 'payhere' },
    { id: 'payhere_instalment', title: 'Bank card instalments', gw: 'payhere' },
    { id: 'koko', title: 'Koko: pay in 3', gw: 'koko' },
    { id: 'mintpay', title: 'Mintpay: pay in 3', gw: 'mintpay' },
    { id: 'easy_payment', title: 'Easy Payment (monthly instalments)' },
    { id: 'cod', title: 'Cash on delivery' },
    { id: 'bacs', title: 'Direct bank transfer' }
  ];
  function fmt(n) { return KV.fmt(n); }
  function esc(s) { return KV.esc(s); }
  function shipFee(id, district) { return id === 'express' ? 2500 : id === 'pickup' ? 0 : KV.cart.shippingFee(); }
  function getShip() { var s = KV.load('kv-ship', 'standard'); return SHIP.some(function (x) { return x.id === s; }) ? s : 'standard'; }
  function orders() { return KV.load('kv-orders', []); }
  function findOrder(n) { var o = orders(); for (var i = 0; i < o.length; i++) if (String(o[i].number) === String(n)) return o[i]; return null; }
  function nextNumber() { return orders().reduce(function (m, o) { return Math.max(m, o.number); }, 1000) + 1; }
  function methodOf(id) { return METHODS.filter(function (m) { return m.id === id; })[0]; }

  function ensureSample() {
    if (qs.get('sample') === '1' && !KV.cart.count()) {
      ['innovex-no-frost-inverter-fridge-250l', 'panasonic-25l-microwave', 'philips-blender-15l'].forEach(function (id, n) { KV.cart.add(id, n === 2 ? 2 : 1, { silent: true }); });
    }
  }
  function emptyState(host) {
    host.innerHTML = '<p class="cart-empty woocommerce-info">Your cart is currently empty.</p><p class="return-to-shop"><a class="button wc-backward" href="shop.html">Return to shop</a></p>' +
      '<p class="small text-muted-kv sample-link"><a href="checkout.html?sample=1">Add sample items</a> to preview this page.</p>';
  }

  /* ================= CHECKOUT ================= */
  function initCheckout(root) {
    ensureSample();
    var submitting = false;
    var st = { method: 'payhere', ship: getShip(), months: 12, instMonths: 6, bank: '' };
    if (!KV.cart.count()) { emptyState(root); return; }
    var D = KV_DATA, districts = D.districts;

    function field(id, label, o) {
      o = o || {};
      var req = o.req, cls = 'form-row ' + (o.cls || 'form-row-wide') + (req ? ' validate-required' : ''), h = '<p class="' + cls + '" id="' + id + '_field"><label for="' + id + '">' + label + (req ? '&nbsp;<abbr class="required" title="required">*</abbr>' : '&nbsp;<span class="optional">(optional)</span>') + '</label><span class="woocommerce-input-wrapper">';
      if (o.select) h += '<select name="' + id + '" id="' + id + '"' + (req ? ' required aria-required="true"' : '') + (o.auto ? ' autocomplete="' + o.auto + '"' : '') + '>' + o.select + '</select>';
      else if (o.area) h += '<textarea name="' + id + '" id="' + id + '" rows="3" placeholder="' + esc(o.ph || '') + '"></textarea>';
      else h += '<input type="' + (o.type || 'text') + '" class="input-text" name="' + id + '" id="' + id + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.auto ? ' autocomplete="' + o.auto + '"' : '') + (o.mode ? ' inputmode="' + o.mode + '"' : '') + (req ? ' required aria-required="true"' : '') + '>';
      return h + '<span class="kv-field-error" id="' + id + '_err" role="alert" hidden></span></span></p>';
    }
    var distOpts = '<option value="">Select a district&hellip;</option>' + districts.map(function (x) { return '<option>' + x + '</option>'; }).join('');
    var storeOpts = D.stores.map(function (s) { return '<option>' + esc(s.name) + ' - ' + esc(s.address) + '</option>'; }).join('');
    var bankOpts = '<option value="">Select your card issuing bank&hellip;</option>' + D.banks.map(function (b) { return '<option value="' + esc(b.name) + '">' + esc(b.name) + ' (' + esc(b.terms) + ')</option>'; }).join('');
    var tenOpts = D.easyPayment.tenures.map(function (t) { return '<option value="' + t.months + '"' + (t.months === 12 ? ' selected' : '') + '>' + t.months + ' months</option>'; }).join('');

    var payRows = [
      { id: 'payhere', logo: '<img src="' + IMG + 'payhere.png" alt="PayHere" height="26">', chips: '<i class="fa-brands fa-cc-visa" style="color:#1A1F71" aria-label="Visa" role="img"></i><i class="fa-brands fa-cc-mastercard" style="color:#EB001B" aria-label="Mastercard" role="img"></i><i class="fa-brands fa-cc-amex" style="color:#006FCF" aria-label="American Express" role="img"></i><span class="pm-chip">eZ Cash</span><span class="pm-chip">Genie</span>',
        box: '<p>Pay with your Visa, Mastercard or American Express card, or with eZ Cash or Genie. You will be redirected to PayHere to complete your payment securely, then brought back to the store.</p>' },
      { id: 'payhere_instalment', logo: '<img src="' + IMG + 'payhere.png" alt="PayHere" height="26">', chips: '<span class="pm-chip">0% bank instalments</span>',
        box: '<p>Split the payment over 3, 6 or 12 months on your credit card at 0% interest. Instalments are processed by PayHere and approved by your card issuer.</p>' +
          '<p class="form-row"><label for="inst_bank">Card issuing bank&nbsp;<abbr class="required" title="required">*</abbr></label><select id="inst_bank" name="inst_bank">' + bankOpts + '</select><span class="kv-field-error" id="inst_bank_err" role="alert" hidden></span></p>' +
          '<fieldset class="inst-months"><legend>Instalment period</legend><div id="inst-opts"></div></fieldset>' },
      { id: 'koko', logo: '<img src="' + IMG + 'koko.png" alt="Koko" height="26">', chips: '<span class="pm-chip">Pay in 3</span>', box: '<div id="pb-koko"></div>' },
      { id: 'mintpay', logo: '<span class="pm-dark"><img src="' + IMG + 'mintpay-small.png" alt="Mintpay" height="20"></span>', chips: '<span class="pm-chip">Pay in 3</span>', box: '<div id="pb-mintpay"></div>' },
      { id: 'easy_payment', logo: '<span class="pm-easy"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Easy Payment</span>', chips: '<span class="pm-chip pm-chip-easy">Kavindu monthly plan</span>',
        box: '<p>Our own monthly instalment plan. Choose a period and pay a down payment; the rest is split into equal monthly payments. <strong>Your application is reviewed first</strong>, and we only dispatch once it is approved.</p>' +
          '<p class="form-row"><label for="easy_months">Plan period</label><select id="easy_months" name="easy_months">' + tenOpts + '</select></p><div id="pb-easy" aria-live="polite"></div>' },
      { id: 'cod', logo: '<i class="fa-solid fa-money-bill-wave pm-ico" aria-hidden="true"></i>', chips: '', box: '<p>Pay with cash upon delivery. Please keep the exact amount ready for our delivery team.</p>' },
      { id: 'bacs', logo: '<i class="fa-solid fa-building-columns pm-ico" aria-hidden="true"></i>', chips: '', box: '<p>Make your payment directly into our bank account. Use your order number as the payment reference. Your order will not be dispatched until the funds have cleared in our account.</p>' }
    ];
    var payHtml = payRows.map(function (r) {
      var m = methodOf(r.id);
      return '<li class="wc_payment_method payment_method_' + r.id + '"><input id="payment_method_' + r.id + '" type="radio" class="input-radio" name="payment_method" value="' + r.id + '"' + (r.id === st.method ? ' checked' : '') + '>' +
        '<label for="payment_method_' + r.id + '"><span class="pm-title">' + m.title + '</span><span class="pm-logos">' + r.logo + r.chips + '</span></label>' +
        '<div class="payment_box payment_method_' + r.id + '"' + (r.id === st.method ? '' : ' hidden') + '>' + r.box + '</div></li>';
    }).join('');

    root.innerHTML =
      '<div class="woocommerce-form-coupon-toggle"><div class="woocommerce-info">Have a coupon? <button type="button" class="link-btn showcoupon" aria-expanded="false" aria-controls="co-coupon">Click here to enter your code</button></div></div>' +
      '<form class="checkout_coupon woocommerce-form-coupon" id="co-coupon" hidden><p>If you have a coupon code, please apply it below.</p><div class="coupon-row"><label class="screen-reader-text" for="co_coupon_code">Coupon code</label><input type="text" class="input-text" id="co_coupon_code" placeholder="Coupon code" autocomplete="off"><button type="submit" class="button btn-kv-outline">Apply coupon</button></div></form>' +
      '<form name="checkout" method="post" class="checkout woocommerce-checkout" id="co-form" novalidate>' +
      '<div class="co-grid"><div class="col2-set" id="customer_details"><div class="woocommerce-billing-fields"><h2>Billing details</h2><p class="small text-muted-kv">Fields marked <abbr class="required" title="required">*</abbr> are required.</p><div class="woocommerce-billing-fields__field-wrapper">' +
      field('billing_first_name', 'First name', { req: 1, cls: 'form-row-first', auto: 'given-name' }) + field('billing_last_name', 'Last name', { req: 1, cls: 'form-row-last', auto: 'family-name' }) +
      field('billing_company', 'Company name') +
      field('billing_nic', 'NIC number', { ph: '199012345678 or 901234567V', mode: 'text' }) +
      field('billing_phone', 'Mobile number', { req: 1, type: 'tel', ph: '07X XXX XXXX', auto: 'tel', mode: 'tel', cls: 'form-row-first' }) + field('billing_email', 'Email address', { req: 1, type: 'email', auto: 'email', cls: 'form-row-last' }) +
      field('billing_country', 'Country / Region', { select: '<option>Sri Lanka</option>', req: 1 }) +
      field('billing_address_1', 'Street address', { req: 1, ph: 'House number and street name', auto: 'address-line1' }) + field('billing_address_2', 'Apartment, suite, unit, etc.', { auto: 'address-line2' }) +
      field('billing_city', 'Town / City', { req: 1, auto: 'address-level2', cls: 'form-row-first' }) + field('billing_state', 'District', { req: 1, select: distOpts, auto: 'address-level1', cls: 'form-row-last' }) +
      field('billing_postcode', 'Postcode / ZIP', { mode: 'numeric', auto: 'postal-code' }) +
      '</div></div><div class="woocommerce-additional-fields"><h3>Additional information</h3>' + field('order_comments', 'Order notes', { area: 1, ph: 'Notes about your order, e.g. delivery instructions, floor or lift access.' }) + '</div></div>' +
      '<aside class="co-review" aria-labelledby="order_review_heading"><h2 id="order_review_heading">Your order</h2><div id="order_review" class="woocommerce-checkout-review-order"></div>' +
      '<div id="payment" class="woocommerce-checkout-payment"><h3 class="pay-h">Payment method</h3><ul class="wc_payment_methods payment_methods methods">' + payHtml + '</ul>' +
      '<div class="form-row place-order"><div class="woocommerce-terms-and-conditions-wrapper"><p class="form-row validate-required"><label class="woocommerce-form__label woocommerce-form__label-for-checkbox checkbox"><input type="checkbox" class="woocommerce-form__input input-checkbox" name="terms" id="terms"> <span>I have read and agree to the website <a href="policies.html#terms" target="_blank" rel="noopener">terms and conditions</a> and <a href="policies.html#returns" target="_blank" rel="noopener">returns policy</a></span>&nbsp;<abbr class="required" title="required">*</abbr></label><span class="kv-field-error" id="terms_err" role="alert" hidden></span></p></div>' +
      '<button type="submit" class="button alt" name="woocommerce_checkout_place_order" id="place_order" value="Place order">Place order</button>' +
      '<p class="small text-muted-kv co-secure"><i class="fa-solid fa-lock" aria-hidden="true"></i> Your personal data is used to process your order and as described in our <a href="policies.html#privacy">privacy policy</a>.</p></div></div></aside></div></form>';

    var form = d.getElementById('co-form');
    function $(s) { return form.querySelector(s); }
    function val(id) { var e = d.getElementById(id); return e ? e.value.trim() : ''; }

    function calc() {
      var items = KV.cart.items(), sub = KV.cart.subtotal(), c = KV.load('kv-coupon', ''), disc = COUPONS[c] ? Math.round(sub * COUPONS[c] / 100) : 0;
      var dist = val('billing_state');
      if (st.ship === 'express' && dist !== 'Colombo') st.ship = 'standard';
      var fee = shipFee(st.ship), total = sub - disc + fee;
      return { items: items, sub: sub, c: c, disc: disc, fee: fee, total: total, dist: dist };
    }
    function renderReview() {
      var pickup = d.getElementById('pickup_store'), selectedPickup = pickup && pickup.value;
      var t = calc();
      var rows = t.items.map(function (i) { return '<tr class="cart_item"><td class="product-name">' + esc(i.product.name) + ' <strong class="product-quantity">&times;&nbsp;' + i.qty + '</strong></td><td class="product-total">' + KV.price(i.product.price * i.qty) + '</td></tr>'; }).join('');
      var shipList = SHIP.map(function (s) {
        var dis = s.id === 'express' && t.dist !== 'Colombo', f = shipFee(s.id);
        return '<li><input type="radio" name="shipping_method" id="shipping_method_' + s.id + '" value="' + s.id + '" class="shipping_method"' + (s.id === st.ship ? ' checked' : '') + (dis ? ' disabled' : '') + '><label for="shipping_method_' + s.id + '"><span>' + s.title + '</span> <strong>' + (f ? KV.price(f) : 'Free') + '</strong><small>' + (dis ? 'Select Colombo as your district to use this option.' : s.note) + '</small></label></li>';
      }).join('');
      var pick = st.ship === 'pickup' ? '<li class="pickup-sel"><label for="pickup_store">Collection showroom</label><select id="pickup_store" name="pickup_store">' + storeOpts + '</select></li>' : '';
      d.getElementById('order_review').innerHTML = '<table class="shop_table woocommerce-checkout-review-order-table"><thead><tr><th class="product-name">Product</th><th class="product-total">Subtotal</th></tr></thead><tbody>' + rows + '</tbody><tfoot>' +
        '<tr class="cart-subtotal"><th>Subtotal</th><td>' + KV.price(t.sub) + '</td></tr>' + (t.disc ? '<tr class="cart-discount"><th>Coupon: ' + t.c.toLowerCase() + '</th><td>-' + KV.price(t.disc) + '</td></tr>' : '') +
        '<tr class="woocommerce-shipping-totals shipping"><th>Shipping</th><td><ul id="shipping_method" class="woocommerce-shipping-methods">' + shipList + pick + '</ul></td></tr>' +
        '<tr class="order-total"><th>Total</th><td><strong>' + KV.price(t.total) + '</strong></td></tr></tfoot></table>';
      if (selectedPickup && d.getElementById('pickup_store')) d.getElementById('pickup_store').value = selectedPickup;
      var third = Math.ceil(t.total / 3);
      d.getElementById('pb-koko').innerHTML = '<p>Split your purchase into <strong>3 interest-free payments</strong> of about <strong>' + fmt(third) + '</strong>. No fees if you pay on time. You will be redirected to Koko to sign in and confirm.</p>';
      d.getElementById('pb-mintpay').innerHTML = '<p>Pay later in <strong>3 interest-free instalments</strong> of about <strong>' + fmt(third) + '</strong>. You will be redirected to Mintpay to confirm your plan and pay the first instalment by card.</p>';
      var opts = D.bankInstalments.map(function (b) { var per = Math.ceil(t.total / b.months); return '<label class="inst-opt"><input type="radio" name="inst_months" value="' + b.months + '"' + (b.months === st.instMonths ? ' checked' : '') + '> <span><strong>' + b.months + ' months</strong><small>' + fmt(per) + ' / month</small></span></label>'; }).join('');
      d.getElementById('inst-opts').innerHTML = opts;
      var eMonths = parseInt(d.getElementById('easy_months').value, 10) || 12, ep = KV.calc(t.total, D.easyPayment.minDownPct, eMonths);
      d.getElementById('pb-easy').innerHTML = t.total < D.easyPayment.minPrice ? '<p class="text-sale small">Easy Payment is available for orders of ' + fmt(D.easyPayment.minPrice) + ' or more.</p>' :
        '<dl class="easy-sum"><div><dt>Down payment (' + D.easyPayment.minDownPct + '%)</dt><dd>' + fmt(ep.down) + '</dd></div><div><dt>Monthly payment</dt><dd><strong>' + fmt(ep.monthly) + ' x ' + eMonths + '</strong></dd></div><div><dt>Total payable</dt><dd>' + fmt(ep.total) + '</dd></div></dl>' + KV.planNote(ep) + '<p class="small text-muted-kv">Indicative figures. The final plan is confirmed when your application is approved.</p>';
      var btn = d.getElementById('place_order');
      btn.textContent = st.method === 'cod' || st.method === 'bacs' ? 'Place order' : st.method === 'easy_payment' ? 'Place order and apply' : 'Place order and pay';
    }
    renderReview();

    /* events */
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'payment_method') {
        st.method = t.value;
        KV.$$('.payment_box', form).forEach(function (b) { b.hidden = !b.classList.contains('payment_method_' + st.method); });
      } else if (t.name === 'shipping_method') { st.ship = t.value; KV.save('kv-ship', t.value); }
      else if (t.name === 'inst_months') st.instMonths = parseInt(t.value, 10);
      if (t.name === 'billing_state' || t.name === 'shipping_method' || t.id === 'easy_months' || t.name === 'payment_method') renderReview();
      if (t.name === 'shipping_method') { var r = d.getElementById('shipping_method_' + st.ship); if (r) r.focus(); }
    });
    form.addEventListener('input', function (e) { if (e.target.hasAttribute('aria-invalid')) validateOne(e.target); });
    root.querySelector('.showcoupon').addEventListener('click', function () { var f = d.getElementById('co-coupon'); f.hidden = !f.hidden; this.setAttribute('aria-expanded', String(!f.hidden)); if (!f.hidden) d.getElementById('co_coupon_code').focus(); });
    d.getElementById('co-coupon').addEventListener('submit', function (e) {
      e.preventDefault(); var code = val('co_coupon_code').toUpperCase(), n = d.getElementById('co-notices');
      if (COUPONS[code]) { KV.save('kv-coupon', code); renderReview(); n.innerHTML = '<div class="woocommerce-message" role="alert">Coupon code applied successfully.</div>'; }
      else n.innerHTML = '<ul class="woocommerce-error" role="alert"><li>' + (code ? 'Coupon &ldquo;' + esc(code.toLowerCase()) + '&rdquo; does not exist!' : 'Please enter a coupon code.') + '</li></ul>';
    });

    /* validation */
    var RULES = {
      billing_first_name: function (v) { return v ? '' : 'Please enter your first name.'; },
      billing_last_name: function (v) { return v ? '' : 'Please enter your last name.'; },
      billing_phone: function (v) { var s = v.replace(/[\s-]/g, ''); return !s ? 'Please enter your mobile number.' : /^(?:\+94|0)7\d{8}$/.test(s) ? '' : 'Enter a valid Sri Lankan mobile number, e.g. 077 123 4567.'; },
      billing_email: function (v) { return !v ? 'Please enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address, e.g. name@example.com.'; },
      billing_nic: function (v) { return !v || /^(\d{9}[vVxX]|\d{12})$/.test(v) ? '' : 'NIC must be 12 digits, or 9 digits followed by V or X.'; },
      billing_address_1: function (v) { return v ? '' : 'Please enter your street address.'; },
      billing_city: function (v) { return v ? '' : 'Please enter your town or city.'; },
      billing_state: function (v) { return v ? '' : 'Please select your district.'; },
      billing_postcode: function (v) { return !v || /^\d{5}$/.test(v) ? '' : 'Postcode must be 5 digits.'; },
      terms: function () { return d.getElementById('terms').checked ? '' : 'Please read and accept the terms and conditions to proceed.'; },
      inst_bank: function (v) { return st.method !== 'payhere_instalment' || v ? '' : 'Select your card issuing bank.'; }
    };
    function validateOne(el) {
      var r = RULES[el.id]; if (!r) return true;
      var msg = r(el.value.trim()), err = d.getElementById(el.id + '_err'); if (!err) return !msg;
      err.textContent = msg; err.hidden = !msg;
      if (msg) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', err.id); el.closest('.form-row').classList.add('woocommerce-invalid'); }
      else { el.setAttribute('aria-invalid', 'false'); el.removeAttribute('aria-describedby'); el.closest('.form-row').classList.remove('woocommerce-invalid'); }
      return !msg;
    }
    form.addEventListener('focusout', function (e) { if (e.target.id && RULES[e.target.id] && e.target.id !== 'terms') validateOne(e.target); });
    function validateAll() {
      var bad = [];
      Object.keys(RULES).forEach(function (id) { var el = d.getElementById(id); if (el && !validateOne(el)) bad.push(el); });
      if (st.ship === 'pickup' && !val('pickup_store')) bad.push(d.getElementById('pickup_store'));
      return bad;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting) return;
      if (!KV.cart.count()) { emptyState(root); return; }
      var bad = validateAll(), n = d.getElementById('co-notices');
      if (bad.length) {
        n.innerHTML = '<ul class="woocommerce-error" role="alert" tabindex="-1">' + bad.map(function (el) {
          var lab = el.id === 'terms' ? 'Terms and conditions' : el.id === 'inst_bank' ? 'Card issuing bank' : (el.closest('.form-row').querySelector('label') || {}).firstChild.textContent;
          return '<li><a href="#' + el.id + '" data-focus="' + el.id + '"><strong>' + esc(String(lab).trim()) + '</strong></a> ' + esc((d.getElementById(el.id + '_err') || {}).textContent || '') + '</li>'; }).join('') + '</ul>';
        n.scrollIntoView({ behavior: 'smooth', block: 'start' }); bad[0].focus(); return;
      }
      n.innerHTML = '';
      var t = calc(), m = methodOf(st.method), no = nextNumber();
      var o = {
        number: no, key: 'wc_order_' + Math.random().toString(36).slice(2, 12), date: new Date().toISOString(),
        status: st.method === 'cod' ? 'processing' : (st.method === 'bacs' || st.method === 'easy_payment') ? 'on-hold' : 'pending',
        items: t.items.map(function (i) { return { id: i.id, name: i.product.name, qty: i.qty, price: i.product.price }; }),
        subtotal: t.sub, discount: t.disc, coupon: t.c, shipping: t.fee, shipId: st.ship,
        shipLabel: SHIP.filter(function (s) { return s.id === st.ship; })[0].title + (st.ship === 'pickup' ? ' (' + val('pickup_store') + ')' : ''),
        total: t.total, method: st.method, methodTitle: m.title, gw: m.gw || '',
        billing: { first: val('billing_first_name'), last: val('billing_last_name'), company: val('billing_company'), nic: val('billing_nic'), phone: val('billing_phone'), email: val('billing_email'), address1: val('billing_address_1'), address2: val('billing_address_2'), city: val('billing_city'), district: val('billing_state'), postcode: val('billing_postcode'), country: 'Sri Lanka' },
        notes: val('order_comments')
      };
      if (st.method === 'payhere_instalment') o.inst = { bank: val('inst_bank'), months: st.instMonths };
      if (st.method === 'easy_payment') { var months = parseInt(val('easy_months'), 10) || 12; o.plan = KV.calc(t.total, D.easyPayment.minDownPct, months); o.plan.ref = 'EP-' + (100000 + no * 7 % 899999); }
      var all = orders(); all.push(o); KV.save('kv-orders', all);
      submitting = true; KV.cart.clear(); KV.save('kv-coupon', '');
      var btn = d.getElementById('place_order'); btn.disabled = true; btn.textContent = 'Processing…';
      location.href = m.gw ? 'pay.html?gw=' + m.gw + '&order=' + no : 'order-received.html?order=' + no + '&key=' + o.key;
    });
    root.addEventListener('click', function (e) { var a = e.target.closest('[data-focus]'); if (a) { e.preventDefault(); var el = d.getElementById(a.getAttribute('data-focus')); if (el) el.focus(); } });
    function cartChanged() { if (submitting) return; if (!KV.cart.count()) { w.removeEventListener('kv:cart', cartChanged); emptyState(root); return; } if (d.getElementById('order_review')) renderReview(); }
    w.addEventListener('kv:cart', cartChanged);
  }

  /* ================= ORDER RECEIVED ================= */
  function dateStr(iso) { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  function addr(b) { return esc(b.first + ' ' + b.last) + (b.company ? '<br>' + esc(b.company) : '') + '<br>' + esc(b.address1) + (b.address2 ? '<br>' + esc(b.address2) : '') + '<br>' + esc(b.city) + (b.postcode ? ' ' + esc(b.postcode) : '') + '<br>' + esc(b.district) + ', ' + esc(b.country); }
  function initOrder(root) {
    var o = findOrder(qs.get('order'));
    var smp = qs.get('sample');
    if (!o && smp && smp !== '1') {
      var sampleNo = /^(?:KV-\d{1,10}|EP-\d{4}-\d{1,10}|\d{1,10})$/.test(qs.get('number') || '') ? qs.get('number') : 1042;
      var meth = methodOf(smp) || methodOf('bacs'), sampleProduct = KV.product(qs.get('product')), items = sampleProduct ? [sampleProduct] : ['innovex-no-frost-inverter-fridge-250l', 'panasonic-25l-microwave'].map(function (id) { return KV.product(id); });
      var sub = items.reduce(function (s, p) { return s + p.price; }, 0);
      o = { number: sampleNo, key: 'wc_order_sample', date: new Date().toISOString(), status: meth.id === 'cod' ? 'processing' : (meth.gw ? 'processing' : 'on-hold'), items: items.map(function (p) { return { id: p.id, name: p.name, qty: 1, price: p.price }; }),
        subtotal: sub, discount: 0, shipping: 0, shipLabel: 'Standard delivery (islandwide)', total: sub, method: meth.id, methodTitle: meth.title, gw: meth.gw || '',
        billing: { first: 'Nimal', last: 'Perera', phone: '077 123 4567', email: 'nimal@example.com', address1: '14 Temple Road', city: 'Avissawella', district: 'Colombo', postcode: '10700', country: 'Sri Lanka' }, notes: '' };
      if (meth.gw) o.pay = { ref: 'PH' + 4821937, at: o.date, via: meth.gw };
      if (meth.id === 'easy_payment') { o.plan = Object.assign(KV.calc(sub, 25, 12), { ref: String(sampleNo) }); }
    }
    if (!o) { root.innerHTML = '<p class="woocommerce-notice woocommerce-notice--error woocommerce-error" role="alert">We could not find that order. It may have expired, or the link is incomplete.</p><p class="return-to-shop"><a class="button wc-backward" href="shop.html">Return to shop</a> <a class="button btn-kv-outline" href="order-received.html?sample=bacs">View a sample order</a></p>'; return; }
    d.title = 'Order received | Kavindu Online Store';
    var unpaid = o.gw && o.status === 'pending', b = o.billing;
    var head = unpaid ? '<p class="woocommerce-notice woocommerce-notice--error woocommerce-error" role="alert">Your payment was not completed, so this order is still unpaid. You can try again below.</p>' :
      '<p class="woocommerce-notice woocommerce-notice--success woocommerce-thankyou-order-received"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Thank you. Your order has been received.</p>';
    var rows = o.items.map(function (i) { return '<tr class="woocommerce-table__line-item order_item"><td class="woocommerce-table__product-name product-name">' + esc(i.name) + ' <strong class="product-quantity">&times;&nbsp;' + i.qty + '</strong></td><td class="woocommerce-table__product-total product-total">' + KV.price(i.price * i.qty) + '</td></tr>'; }).join('');
    var extra = '';
    if (unpaid) extra = '<div class="co-panel"><h2>Complete your payment</h2><p>Your order is reserved. Pay with ' + esc(o.methodTitle) + ' to confirm it.</p><a class="button alt" href="pay.html?gw=' + o.gw + '&order=' + encodeURIComponent(o.number) + '">Pay now</a></div>';
    else if (o.method === 'bacs') extra = '<section class="woocommerce-bacs-bank-details co-panel"><h2 class="wc-bacs-bank-details-heading">Our bank details</h2><p>Please transfer <strong>' + fmt(o.total) + '</strong> and use <strong>Order ' + o.number + '</strong> as the payment reference. Email the slip to <a href="mailto:' + esc(KV_DATA.brand.email) + '">' + esc(KV_DATA.brand.email) + '</a> or send it on WhatsApp. We dispatch once the funds clear.</p>' +
      '<h3 class="wc-bacs-bank-details-account-name">' + BANK.name + '</h3><ul class="wc-bacs-bank-details order_details bacs_details"><li class="bank_name">Bank: <strong>' + BANK.bank + '</strong></li><li class="branch">Branch: <strong>' + BANK.branch + '</strong></li><li class="account_number">Account number: <strong>' + BANK.no + '</strong></li><li class="sort_code">SWIFT / BIC: <strong>' + BANK.swift + '</strong></li></ul><p class="small text-muted-kv">Bank details shown are placeholders until confirmed by the client.</p></section>';
    else if (o.method === 'cod') extra = '<div class="co-panel"><h2>Cash on delivery</h2><p>Please keep <strong>' + fmt(o.total) + '</strong> ready when our team delivers your order. We will call you on <strong>' + esc(b.phone) + '</strong> to arrange a delivery time.</p></div>';
    else if (o.method === 'easy_payment' && o.plan) extra = '<div class="co-panel co-easy"><span class="status-pill pending">Pending approval</span><h2>Your Easy Payment application</h2><p>Reference <strong>' + esc(o.plan.ref) + '</strong>. Your order is on hold until our team reviews your application and confirms the plan below. Complete the application with your employment details and documents so we can approve it faster.</p>' +
      '<dl class="easy-sum"><div><dt>Down payment</dt><dd>' + fmt(o.plan.down) + '</dd></div><div><dt>Monthly payment</dt><dd><strong>' + fmt(o.plan.monthly) + ' x ' + o.plan.months + '</strong></dd></div><div><dt>Total payable</dt><dd>' + fmt(o.plan.total) + '</dd></div></dl>' + KV.planNote(o.plan) + '<a class="button btn-kv-easy" href="easy-payment.html?order=' + o.number + '&months=' + o.plan.months + '&down=' + Math.round(o.plan.down / (o.plan.total - o.plan.extra) * 100) + '&price=' + (o.plan.total - o.plan.extra) + '&ref=' + esc(o.plan.ref) + '">Continue your application</a></div>';
    else if (o.gw && o.pay) extra = '<div class="co-panel"><h2>Payment received</h2><p>Paid with ' + esc(o.methodTitle) + (o.inst ? ' (' + o.inst.months + ' months, ' + esc(o.inst.bank) + ')' : '') + '. Payment reference <strong>' + esc(o.pay.ref) + '</strong>. Preview confirmation for ' + esc(b.email) + '.</p></div>';
    root.innerHTML = head + '<ul class="woocommerce-order-overview woocommerce-thankyou-order-details order_details">' +
      '<li class="woocommerce-order-overview__order order">Order number: <strong>' + o.number + '</strong></li><li class="woocommerce-order-overview__date date">Date: <strong>' + dateStr(o.date) + '</strong></li>' +
      '<li class="woocommerce-order-overview__email email">Email: <strong>' + esc(b.email) + '</strong></li><li class="woocommerce-order-overview__total total">Total: <strong>' + KV.price(o.total) + '</strong></li>' +
      '<li class="woocommerce-order-overview__payment-method method">Payment method: <strong>' + esc(o.methodTitle) + '</strong></li></ul>' + extra +
      '<section class="woocommerce-order-details"><h2 class="woocommerce-order-details__title">Order details</h2><table class="woocommerce-table woocommerce-table--order-details shop_table order_details"><thead><tr><th class="woocommerce-table__product-name product-name">Product</th><th class="woocommerce-table__product-table product-total">Total</th></tr></thead><tbody>' + rows + '</tbody><tfoot>' +
      '<tr><th scope="row">Subtotal:</th><td>' + KV.price(o.subtotal) + '</td></tr>' + (o.discount ? '<tr><th scope="row">Discount:</th><td>-' + KV.price(o.discount) + '</td></tr>' : '') +
      '<tr><th scope="row">Shipping:</th><td>' + (o.shipping ? KV.price(o.shipping) : 'Free') + '&nbsp;<small>via ' + esc(o.shipLabel) + '</small></td></tr><tr><th scope="row">Payment method:</th><td>' + esc(o.methodTitle) + '</td></tr>' +
      '<tr><th scope="row">Total:</th><td><strong>' + KV.price(o.total) + '</strong></td></tr>' + (o.notes ? '<tr><th scope="row">Note:</th><td>' + esc(o.notes) + '</td></tr>' : '') + '</tfoot></table></section>' +
      '<section class="woocommerce-customer-details"><section class="woocommerce-columns woocommerce-columns--2 col2-set addresses"><div class="woocommerce-column col-1"><h2 class="woocommerce-column__title">Billing address</h2><address>' + addr(b) + '<p class="woocommerce-customer-details--phone">' + esc(b.phone) + '</p><p class="woocommerce-customer-details--email">' + esc(b.email) + '</p></address></div>' +
      '<div class="woocommerce-column col-2"><h2 class="woocommerce-column__title">Delivery</h2><address>' + (o.shipId === 'pickup' ? esc(o.shipLabel) : addr(b)) + '</address></div></section></section>' +
      '<p class="co-after"><a class="button btn-kv-outline" href="shop.html">Continue shopping</a> <a class="button btn-kv-outline" href="my-account.html">View my account</a></p>';
  }

  KV.ready(function () {
    var r;
    if ((r = d.getElementById('checkout-root'))) { var checkoutHost = r; initCheckout(checkoutHost); w.addEventListener('kv:cart', function () { if (KV.cart.count() && !checkoutHost.querySelector('#co-form')) initCheckout(checkoutHost); }); }
    else if ((r = d.getElementById('order-root'))) initOrder(r);
  });
})(window, document);
