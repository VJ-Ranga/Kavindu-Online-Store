/* Single product page. Needs theme.js. */
(function (w, d) {
  'use strict';
  var KV = w.KV, D = w.KV_DATA, esc = KV.esc, $ = KV.$, $$ = KV.$$;
  var id = new URLSearchParams(location.search).get('id');
  var p = KV.product(id) || D.products[0];
  var root = $('#pd-root'), E = D.easyPayment;
  var cat = KV.category(p.category), sv = KV.saving(p), out = p.stock === 'Out of stock';
  var m = /(\d+)\s+left/i.exec(p.stock || ''), max = out ? 0 : (m ? +m[1] : 10);
  var easyOk = p.price >= E.minPrice;
  var st = { months: E.defaultTenure, down: E.defaultDownPct, pay: easyOk ? 'easy' : 'full', img: 0 };

  d.title = p.name + ' | Kavindu Online Store';
  $('#pd-crumb').innerHTML = '<a href="index.html">Home</a>&nbsp;/&nbsp;<a href="shop.html">Shop</a>&nbsp;/&nbsp;' + (cat ? '<a href="shop.html?cat=' + cat.id + '">' + esc(cat.name) + '</a>&nbsp;/&nbsp;' : '') + esc(p.name);
  try { var md = d.querySelector('meta[name=description]'); md && md.setAttribute('content', p.description); } catch (e) {}

  /* recently viewed */
  var rv = KV.load('kv-recent', []).filter(function (x) { return x !== p.id; });
  var rvShow = rv.filter(function (x) { return KV.product(x); }).slice(0, 4).map(KV.product);
  rv.unshift(p.id); KV.save('kv-recent', rv.slice(0, 10));

  function stockHtml() {
    if (out) return '<p class="stock out-of-stock">Out of stock</p>';
    var low = /left/i.test(p.stock);
    return '<p class="stock ' + (low ? 'low-stock' : 'in-stock') + '"><i class="fa-solid ' + (low ? 'fa-circle-exclamation' : 'fa-circle-check') + '" aria-hidden="true"></i> ' + esc(low ? p.stock + ' - order soon' : 'In stock - ready for delivery') + '</p>';
  }
  function gallery() {
    var imgs = p.images, h = '<div class="woocommerce-product-gallery woocommerce-product-gallery--with-images woocommerce-product-gallery--columns-4 images"><div class="woocommerce-product-gallery__wrapper">' +
      '<div class="woocommerce-product-gallery__image main-img">' + (sv.pct ? '<span class="onsale">-' + sv.pct + '%</span>' : '') + '<a href="' + esc(imgs[0]) + '" id="pd-main-link" target="_blank" rel="noopener"><img id="pd-main" class="wp-post-image" src="' + esc(imgs[0]) + '" alt="' + esc(p.name) + '" width="640" height="640" fetchpriority="high"></a></div>';
    if (imgs.length > 1) h += '<ol class="flex-control-nav flex-control-thumbs">' + imgs.map(function (s, i) { return '<li><button type="button" data-i="' + i + '" class="' + (i ? '' : 'on') + '" aria-label="View image ' + (i + 1) + ' of ' + imgs.length + '"><img src="' + esc(s) + '" alt="" width="80" height="80"></button></li>'; }).join('') + '</ol>';
    return h + '</div></div>';
  }
  function payBox() {
    var P = p.price, bank = D.bankInstalments || [], t3 = Math.ceil(P / 3);
    function opt(key, logo, title, sub, body, disabled) {
      return '<div class="pay-opt' + (st.pay === key ? ' on' : '') + (disabled ? ' off' : '') + '" data-opt="' + key + '"><label class="pay-head"><input type="radio" name="pd_pay" value="' + key + '"' + (st.pay === key ? ' checked' : '') + (disabled ? ' disabled' : '') + '><span class="pay-t"><strong>' + title + '</strong><small>' + sub + '</small></span>' + logo + '</label><div class="pay-body"' + (st.pay === key ? '' : ' hidden') + '>' + body + '</div></div>';
    }
    var tenures = E.tenures.map(function (t) { return '<button type="button" class="kv-chip' + (t.months === st.months ? ' on' : '') + '" aria-pressed="' + (t.months === st.months) + '" data-m="' + t.months + '">' + t.months + ' months</button>'; }).join('');
    var downs = [20, 25, 30, 40, 50].filter(function (v) { return v >= E.minDownPct; }).map(function (v) { return '<option value="' + v + '"' + (v === st.down ? ' selected' : '') + '>' + v + '% (' + KV.fmt(P * v / 100) + ')</option>'; }).join('');
    var easy = easyOk ? '<div class="ep-controls"><div><label for="ep-down">Down payment</label><select id="ep-down">' + downs + '</select></div></div><span class="small fw-medium d-block" id="ep-lbl">Choose number of months</span><div class="ep-tenures" role="group" aria-labelledby="ep-lbl">' + tenures + '</div><div class="ep-out" id="ep-out" aria-live="polite"></div><div class="ep-actions"><a class="btn-kv btn-kv-easy" id="ep-apply" href="easy-payment.html">Apply for Easy Payment</a><a class="ep-link" href="easy-payment.html">How it works</a></div><p class="ep-note">Indicative figures. Subject to approval; final plan is confirmed by our team.</p>' : '<p class="ep-note">Easy Payment is available on items over ' + KV.fmt(E.minPrice) + '.</p>';
    var banks = '<ul class="bank-plans">' + [3, 6, 12].map(function (mo) { return '<li><strong>' + KV.fmt(Math.ceil(P / mo)) + '</strong> x ' + mo + ' months<span>0% interest</span></li>'; }).join('') + '</ul><p class="ep-note">Available on selected credit cards' + (D.banks && D.banks.length ? ' from ' + esc(D.banks.slice(0, 4).map(function (b) { return b.name; }).join(', ')) + ' and more' : '') + '. Select "Bank card instalments" at checkout. Powered by PayHere.</p>';
    var bnpl = '<p class="bnpl-line">Pay in 3 equal parts of <strong>' + KV.fmt(t3) + '</strong>. First payment today; later payment dates and eligibility are confirmed by the provider.</p><ul class="pay-logos"><li><img src="assets/img/payments/koko.png" alt="Koko" height="24"></li><li class="pay-dark"><img src="assets/img/payments/mintpay-small.png" alt="Mintpay" height="22"></li></ul><p class="ep-note">Choose Koko or Mintpay at checkout. Provider approval and purchase limits apply. The exact schedule is shown before you confirm.</p>';
    return '<section class="pay-options" aria-labelledby="po-h"><h2 id="po-h">Payment options</h2>' +
      opt('full', '<span class="pay-logo-txt">' + KV.fmt(P) + '</span>', 'Pay in full', 'Card, cash on delivery or bank transfer', '<p class="ep-note" style="margin:0">Pay ' + KV.fmt(P) + ' by card or wallet via PayHere, bank transfer, or cash when delivered.</p><ul class="pay-logos mt-2"><li><img src="assets/img/payments/payhere.png" alt="PayHere" height="24"></li><li><i class="fa-brands fa-cc-visa" aria-label="Visa"></i></li><li><i class="fa-brands fa-cc-mastercard" aria-label="Mastercard"></i></li><li><i class="fa-brands fa-cc-amex" aria-label="American Express"></i></li></ul>') +
      opt('easy', '<span class="pay-badge-easy">Easy Payment</span>', 'Monthly instalments' + (easyOk ? ' from <span id="ep-from"></span>' : ''), 'Our own plan, 6 to 36 months', easy, !easyOk) +
      opt('bank', '<img src="assets/img/payments/payhere.png" alt="PayHere" height="22">', 'Bank card instalments', '0% for 3, 6 or 12 months', banks) +
      opt('bnpl', '<span class="pay-logos-inline"><img src="assets/img/payments/koko.png" alt="Koko" height="20"><img class="dk" src="assets/img/payments/mintpay-small.png" alt="Mintpay" height="18"></span>', 'Pay in 3 with Koko or Mintpay', KV.fmt(t3) + ' x 3, interest free', bnpl) + '</section>';
  }
  function specTable() { var k = Object.keys(p.specs || {}); k.unshift('Model'); var s = Object.assign({ Model: p.model }, p.specs); if (p.warranty) { k.push('Warranty'); s.Warranty = p.warranty; } return '<table class="woocommerce-product-attributes shop_attributes">' + k.map(function (x) { return '<tr class="woocommerce-product-attributes-item"><th class="woocommerce-product-attributes-item__label">' + esc(x) + '</th><td class="woocommerce-product-attributes-item__value"><p>' + esc(s[x]) + '</p></td></tr>'; }).join('') + '</table>'; }
  function reviews() {
    var names = ['Nimal P.', 'Dilani F.', 'Ashan R.', 'Sanduni W.'], bodies = ['Delivered on time and the installation team was careful. Works exactly as described.', 'Good value compared with other shops. The showroom staff explained the Easy Payment plan clearly.', 'Build quality is good for the price. Packaging was solid, no damage on arrival.'];
    var n = Math.min(3, p.reviews || 0);
    var rows = ''; for (var i = 0; i < n; i++) rows += '<li class="review"><div class="comment_container"><div class="comment-text">' + KV.stars(Math.max(3, Math.min(5, Math.round(p.rating) - (i === 2 ? 1 : 0)))) + '<p class="meta"><strong class="woocommerce-review__author">' + names[i] + '</strong> <span class="woocommerce-review__verified">verified owner</span></p><div class="description"><p>' + bodies[i] + '</p></div></div></div></li>';
    return '<div id="reviews" class="woocommerce-Reviews"><h2 class="woocommerce-Reviews-title">' + (p.reviews || 0) + ' review' + (p.reviews === 1 ? '' : 's') + ' for ' + esc(p.name) + '</h2>' + (rows ? '<ol class="commentlist">' + rows + '</ol>' : '<p class="woocommerce-noreviews">There are no reviews yet.</p>') + '<p class="ep-note">Showing a sample of recent customer reviews.</p></div>';
  }
  function related() {
    var rel = D.products.filter(function (x) { return x.id !== p.id && x.category === p.category; });
    if (rel.length < 4) rel = rel.concat(D.products.filter(function (x) { return x.id !== p.id && x.category !== p.category && x.brand === p.brand; }));
    return rel.slice(0, 4);
  }

  var distOpts = '<option value="">Select district</option>' + D.districts.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
  var shipFree = p.price >= D.shipping.freeOver;
  root.innerHTML =
    '<div id="product-' + esc(p.id) + '" class="product type-product ' + (out ? 'outofstock' : 'instock') + ' has-post-thumbnail product-type-simple"><div class="pd-top">' +
    gallery() +
    '<div class="summary entry-summary">' +
      '<p class="pd-brand"><a href="shop.html?brand=' + encodeURIComponent(p.brand) + '">' + esc(p.brand) + '</a></p>' +
      '<h1 class="product_title entry-title">' + esc(p.name) + '</h1>' +
      '<div class="woocommerce-product-rating">' + KV.stars(p.rating) + '<a href="#reviews" class="woocommerce-review-link" id="rev-link">(<span class="count">' + p.reviews + '</span> customer reviews)</a><span class="pd-model">Model: ' + esc(p.model) + '</span></div>' +
      '<div class="pd-price">' + KV.priceBlock(p).replace('<span class="price">', '<p class="price">').replace(/<\/span>$/, '</p>') + (sv.amount ? '<span class="save-line pd-save">Save ' + KV.fmt(sv.amount) + ' (' + sv.pct + '% off RRP)</span>' : '') + '</div>' +
      (easyOk ? '<p class="easy-line pd-easyline"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> or <strong>' + KV.fmt(KV.easyMonthly(p, 36) || 0) + '</strong> per month over 36 months with Easy Payment</p>' : '') +
      '<div class="woocommerce-product-details__short-description"><ul class="pd-bullets">' + (p.bullets || []).slice(0, 5).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></div>' +
      (p.freeGift ? '<p class="pd-gift"><i class="fa-solid fa-gift" aria-hidden="true"></i> Free gift: ' + esc(p.freeGift) + '</p>' : '') +
      stockHtml() +
      '<form class="cart" method="post" enctype="multipart/form-data" id="pd-form"><div class="quantity"><label class="screen-reader-text" for="quantity_1">Quantity</label><button type="button" class="q-btn" data-q="-1" aria-label="Decrease quantity">&minus;</button><input type="number" id="quantity_1" class="input-text qty text" name="quantity" value="1" min="1" max="' + max + '" step="1" inputmode="numeric"' + (out ? ' disabled' : '') + '><button type="button" class="q-btn" data-q="1" aria-label="Increase quantity">+</button></div>' +
        '<button type="button" name="add-to-cart" value="' + esc(p.id) + '" class="single_add_to_cart_button button alt" data-kv-add="' + esc(p.id) + '" data-kv-qty-input="#quantity_1"' + (out ? ' disabled' : '') + '>Add to cart</button>' +
        '<button type="button" class="button buy-now" id="buy-now"' + (out ? ' disabled' : '') + '>Buy now</button>' +
        '<button type="button" class="pd-icon" data-kv-wish="' + esc(p.id) + '" aria-label="Add to wishlist"><i class="fa-regular fa-heart" aria-hidden="true"></i></button><button type="button" class="pd-icon" data-kv-compare="' + esc(p.id) + '" aria-label="Add to compare"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i></button></form>' + payBox() +
      '<div class="pd-service">' +
        '<div class="pd-svc"><i class="fa-solid fa-truck-fast" aria-hidden="true"></i><div><strong>Delivery and installation</strong><p>' + (shipFree ? 'Free delivery on this item.' : 'Free delivery in Colombo over ' + KV.fmt(D.shipping.freeOver) + '; otherwise ' + KV.fmt(D.shipping.flat) + '.') + ' ' + esc(p.delivery || 'Usually 2 to 4 working days.') + '</p><label class="screen-reader-text" for="pd-dist">District</label><select id="pd-dist">' + distOpts + '</select><p class="svc-res" id="svc-res" aria-live="polite">Select your district to see the delivery estimate.</p></div></div>' +
        '<div class="pd-svc"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><div><strong>Warranty</strong><p>' + esc(p.warranty || 'Manufacturer warranty') + '</p></div></div>' +
        '<div class="pd-svc"><i class="fa-solid fa-store" aria-hidden="true"></i><div><strong>Showroom availability</strong><ul class="pd-stores">' + D.stores.slice(0, 3).map(function (s, i) { return '<li><span>' + esc(s.name) + '</span><span class="' + (out ? 'text-sale' : i === 2 && /left/i.test(p.stock) ? 'low' : 'text-easy') + '">' + (out ? 'On request' : i === 2 && /left/i.test(p.stock) ? 'Limited stock' : 'In stock') + '</span></li>'; }).join('') + '</ul><a href="stores.html">Our showroom</a></div></div>' +
      '</div>' +
      '<div class="product_meta"><span class="sku_wrapper">SKU: <span class="sku">' + esc(p.sku) + '</span></span><span class="posted_in">Category: <a href="shop.html?cat=' + esc(p.category) + '" rel="tag">' + esc(cat ? cat.name : p.category) + '</a></span></div>' +
    '</div></div>' +
    '<div class="woocommerce-tabs wc-tabs-wrapper"><ul class="tabs wc-tabs" role="tablist">' +
      [['description', 'Description'], ['additional_information', 'Specifications'], ['warranty', 'Warranty'], ['delivery', 'Delivery and returns'], ['reviews', 'Reviews (' + p.reviews + ')']].map(function (t, i) { return '<li class="' + t[0] + '_tab' + (i ? '' : ' active') + '" role="presentation"><a href="#tab-' + t[0] + '" role="tab" id="tab-title-' + t[0] + '" aria-controls="tab-' + t[0] + '" aria-selected="' + !i + '"' + (i ? ' tabindex="-1"' : '') + '>' + t[1] + '</a></li>'; }).join('') + '</ul>' +
      '<div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--description panel entry-content wc-tab" id="tab-description" role="tabpanel" aria-labelledby="tab-title-description"><h2>Description</h2><p>' + esc(p.description) + '</p><ul>' + (p.bullets || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--additional_information panel entry-content wc-tab" id="tab-additional_information" role="tabpanel" aria-labelledby="tab-title-additional_information" hidden><h2>Specifications</h2>' + specTable() + '</div>' +
      '<div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--warranty panel entry-content wc-tab" id="tab-warranty" role="tabpanel" aria-labelledby="tab-title-warranty" hidden><h2>Warranty</h2><p>' + esc(p.warranty || 'Manufacturer warranty applies.') + '</p><p>Keep your invoice. Warranty claims are handled at any Kavindu showroom or through the brand service centre. Damage from misuse, power surges or unauthorised repair is not covered.</p></div>' +
      '<div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--delivery panel entry-content wc-tab" id="tab-delivery" role="tabpanel" aria-labelledby="tab-title-delivery" hidden><h2>Delivery and returns</h2><p>We deliver island-wide. Free delivery in Colombo on orders over ' + KV.fmt(D.shipping.freeOver) + '; other orders ' + KV.fmt(D.shipping.flat) + ' flat. Large items are delivered by our own team, with installation for air conditioners, washing machines and furniture assembly.</p><p>Inspect your item on delivery. If it arrives damaged or faulty, tell us within 7 days and we will replace or refund it. Items must be unused and in original packaging.</p></div>' +
      '<div class="woocommerce-Tabs-panel woocommerce-Tabs-panel--reviews panel entry-content wc-tab" id="tab-reviews" role="tabpanel" aria-labelledby="tab-title-reviews" hidden><h2>Reviews</h2>' + reviews() + '</div>' +
    '</div>' +
    '<section class="related products"><h2>Related products</h2>' + KV.grid(related(), { cols: 4 }) + '</section>' +
    (rvShow.length ? '<section class="related products recent"><h2>Recently viewed</h2>' + KV.grid(rvShow, { cols: 4 }) + '</section>' : '') +
    '</div>' +
    '<div class="pd-sticky" id="pd-sticky" aria-hidden="true"><div class="pd-sticky-in"><div class="ps-info"><strong>' + KV.fmt(p.price) + '</strong>' + (easyOk ? '<span>or ' + KV.fmt(KV.easyMonthly(p, 36) || 0) + '/month</span>' : '') + '</div><button type="button" class="button alt" data-kv-add="' + esc(p.id) + '" tabindex="-1"' + (out ? ' disabled' : '') + '>Add to cart</button></div></div>';

  /* gallery */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('.flex-control-thumbs button');
    if (t) { var s = p.images[+t.dataset.i]; $('#pd-main').src = s; $('#pd-main-link').href = s; $$('.flex-control-thumbs button').forEach(function (b) { b.classList.toggle('on', b === t); }); }
    var q = e.target.closest('.q-btn');
    if (q) { var i = $('#quantity_1'); i.value = Math.max(1, Math.min(max, (+i.value || 1) + +q.dataset.q)); }
    var tn = e.target.closest('.ep-tenures [data-m]'); if (tn) { st.months = +tn.dataset.m; easyCalc(); }
  });
  $('#quantity_1').addEventListener('change', function () { this.value = Math.max(1, Math.min(max || 1, parseInt(this.value, 10) || 1)); });
  $('#buy-now').addEventListener('click', function () { KV.cart.add(p.id, +$('#quantity_1').value || 1, { silent: true }); location.href = 'checkout.html'; });

  /* payment options */
  function setPay(k) {
    st.pay = k;
    $$('.pay-opt').forEach(function (o) { var on = o.dataset.opt === k; o.classList.toggle('on', on); $('.pay-body', o).hidden = !on; $('input', o).checked = on; });
  }
  $$('.pay-opt input').forEach(function (r) { r.addEventListener('change', function () { setPay(r.value); }); });
  function easyCalc() {
    if (!easyOk) return;
    var c = KV.calc(p.price, st.down, st.months);
    $$('.ep-tenures .kv-chip').forEach(function (b) { var on = +b.dataset.m === st.months; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $('#ep-out').innerHTML = '<div class="ep-big"><strong>' + KV.fmt(c.monthly) + '</strong> <span>x ' + c.months + ' months</span></div><dl><div><dt>Down payment today</dt><dd>' + KV.fmt(c.down) + '</dd></div><div><dt>Amount financed</dt><dd>' + KV.fmt(c.financed) + '</dd></div><div><dt>Plan cost (' + c.markupPct + '%)</dt><dd>' + KV.fmt(c.extra) + '</dd></div><div class="tot"><dt>Total payable</dt><dd>' + KV.fmt(c.total) + '</dd></div></dl>' + KV.planNote(c);
    $('#ep-apply').href = 'easy-payment.html?product=' + encodeURIComponent(p.id) + '&months=' + c.months + '&down=' + st.down;
  }
  if (easyOk) {
    $('#ep-down').addEventListener('change', function () { st.down = +this.value; easyCalc(); });
    var lo = KV.easyMonthly(p, 36); $('#ep-from') && ($('#ep-from').textContent = KV.fmt(lo || 0) + '/month');
    easyCalc();
  }

  /* delivery estimate */
  var near = ['Colombo', 'Gampaha', 'Kalutara'];
  $('#pd-dist').addEventListener('change', function () {
    var v = this.value, r = $('#svc-res'); if (!v) { r.textContent = 'Select your district to see the delivery estimate.'; return; }
    r.innerHTML = '<i class="fa-solid fa-check text-easy" aria-hidden="true"></i> ' + (near.indexOf(v) > -1 ? 'Delivery to ' + esc(v) + ' in 1 to 3 working days.' : 'Delivery to ' + esc(v) + ' in 3 to 6 working days.');
  });

  /* tabs */
  var tabs = $$('.wc-tabs a');
  function openTab(a, focus) {
    tabs.forEach(function (x) { var on = x === a; x.parentNode.classList.toggle('active', on); x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; var pn = d.getElementById(x.getAttribute('aria-controls')); pn.hidden = !on; });
    if (focus) a.focus();
  }
  tabs.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); openTab(a); });
    a.addEventListener('keydown', function (e) { var n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1; if (n >= 0) { e.preventDefault(); openTab(tabs[(n + tabs.length) % tabs.length], true); } });
  });
  $('#rev-link').addEventListener('click', function (e) { e.preventDefault(); openTab(d.getElementById('tab-title-reviews')); $('.woocommerce-tabs').scrollIntoView({ behavior: 'smooth' }); });

  /* sticky bar: show once the main add-to-cart has scrolled out of view */
  var bar = $('#pd-sticky');
  if ('IntersectionObserver' in w) {
    new IntersectionObserver(function (en) { var show = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; bar.classList.toggle('show', show); bar.setAttribute('aria-hidden', !show); $('button', bar).tabIndex = show ? 0 : -1; }).observe($('#pd-form'));
  }
  w.addEventListener('kv:options', function (e) { if (e.detail && (e.detail.key === 'card' || e.detail.key === 'all')) { $$('section.related').forEach(function (s, i) { var l = i ? rvShow : related(); $('ul.products', s).outerHTML = KV.grid(l, { cols: 4 }); }); KV.sync && KV.sync(); } });
  KV.ready(function () { KV.sync && KV.sync(); });
})(window, document);
