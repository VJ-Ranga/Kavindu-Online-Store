/*!
 * Kavindu Online Store - shared theme runtime  (window.KV)
 * ======================================================================================
 * LOAD ORDER (every storefront page, bottom of <body>):
 *   bootstrap.bundle.min.js (5.3.3) -> assets/js/data.js -> assets/js/theme.js -> page JS
 * Page skeleton: <div id="site-header"></div> ...<main>... <div id="site-footer"></div>
 *   <body class="woocommerce ..."> ; theme.js sets data-header/-hero/-cats/-card/-rail/-footer on <body>.
 *
 * DATA (window.KV_DATA)
 *   brand{name,company,hotline,hotlineTel,whatsapp,whatsappDisplay,email,address,hours,logo,logoWhite}
 *   shipping{freeOver:50000, flat:1500}      categories[{id,name,icon,image,count,subs[]}]
 *   products[{id,name,brand,model,sku,category,price,rrp?,keySpec,specs{label:value},bullets[],images[],
 *             description,warranty,rating,reviews,stock('In stock'|'Only 3 left'|'Out of stock'),
 *             badges[],freeGift?,delivery?,bestseller?}]
 *   brands[], banners{slides,side,promos}, guides[], easyPayment{minDownPct,defaultDownPct,defaultTenure,
 *   minPrice,tenures[{months,markupPct}]}, bankInstalments[{months}], banks[], stores[], districts[25],
 *   img(unsplashId,width)
 *
 * API  (window.KV)
 *   Format   KV.fmt(n)->"Rs 131,900"   KV.price(n)->WooCommerce price-amount html   KV.esc(str)
 *            KV.priceBlock(p)->'<span class="price">' (del RRP + ins price)   KV.stars(rating,count?)
 *   Catalog  KV.products  KV.categories  KV.product(id)  KV.category(id)  KV.url(p)->"product.html?id=.."
 *            KV.saving(p)->{amount,pct}   KV.easyMonthly(p,months?)->monthly at min down payment
 *   Easy Pay KV.calc(price,downPct,months)->{down,financed,extra,total,monthly,months,markupPct}
 *            KV.easy -> KV_DATA.easyPayment
 *   Cart     KV.cart.items()->[{id,qty,product}]  .add(id,qty=1,{silent})  .remove(id)  .setQty(id,qty)
 *            .subtotal()  .count()  .clear()  .shippingFee()  KV.openCart()
 *   Wishlist KV.wishlist.items()/has(id)/toggle(id)     Compare KV.compare.items()/has/toggle/clear (max 3)
 *   Render   KV.card(p,{opt}) -> '<li class="product ...">' honouring body[data-card] (1 retail, 2 hover, 3 list)
 *            KV.grid(list,{cols:4}) -> '<ul class="products columns-4">..</ul>'    KV.sync() refresh heart/compare state
 *            KV.renderHeader() KV.renderFooter() KV.payments(dark?) -> payment logo strip html
 *            KV.notice(html,type='message'|'info'|'error') toast (.woocommerce-message, aria-live)
 *            KV.quickView(id)   KV.slider(rootEl,{interval})   KV.countdown(el,endTs)
 *   Options  KV.options.get() / .set(key,val) / .reset()   keys: skin(1-2) header hero cats card rail1 rail2 rail3 footer (values "1".."3"); "rail" = alias setting all three
 *            localStorage "kv-options". Body gets data-<key>. Setting an option re-renders header/footer itself and
 *            fires window event "kv:options" {detail:{key,value}} - page JS listens and re-renders its own
 *            sections (e.g. home.js hero/cats/rails, shop.js product grid on key "card").
 *   Events   window "kv:cart" "kv:wishlist" "kv:compare" "kv:options"       KV.ready(fn) runs after theme init.
 *   Storage  kv-cart [{id,qty}]  kv-wishlist [id]  kv-compare [id]  kv-options {..}  kv-orders [..]  (kv-announce-off)
 *   Delegated attributes (work on any element, any page, also in dynamically added markup):
 *            [data-kv-add="ID"] (+ data-qty or data-kv-qty-input="#selector") add to cart
 *            [data-kv-wish="ID"] [data-kv-compare="ID"] [data-kv-quick="ID"] [data-kv-open-cart]
 *            [data-kv-cart-count] / [data-kv-cart-total] / [data-kv-wish-count]  auto-updated text
 *
 * CSS COMPONENT CLASSES (theme.css)
 *   Layout   .container (1320) .kv-section .kv-section-head(h2 + a.kv-viewall) .kv-section-alt .breadcrumb-wrap
 *            .woocommerce-breadcrumb .page-title-bar
 *   Buttons  .button (WC base, primary blue) .button.alt (primary) .btn-kv .btn-kv-primary/-secondary/-outline/-easy/-ghost
 *            .btn-kv-sm .btn-kv-block
 *   Forms    .input-text, select, .form-row, .quantity(.qty), label; focus ring built-in
 *   Woo      .woocommerce-message/-info/-error, .star-rating, ul.products.columns-3/4/5, li.product, .onsale,
 *            .price(del/ins), .woocommerce-pagination, .woocommerce-result-count, .woocommerce-ordering,
 *            table.shop_table, .woocommerce-tabs, .widget_shopping_cart_content, .woocommerce-mini-cart, .wc-proceed-to-checkout
 *   Misc     .kv-badge(.kv-badge-sale/-new/-easy/-gift) .stock-line.in-stock/.low-stock/.out .easy-line .save-line
 *            .kv-card-box (generic bordered 8px box) .kv-table .kv-chip .kv-tabs(.kv-tab) .kv-steps .kv-breadcrumb
 *            .text-muted-kv .text-sale .text-easy  .visually-hidden / .screen-reader-text   .kv-skip
 *   Tokens   :root --color-primary, -primary-dark, -secondary, -easy, -easy-soft, -sale, -sale-soft, -star, -text,
 *            -text-muted, -border, -bg-alt, --font-body, --container, --radius-btn(6px) --radius-card(8px)
 */
(function (w, d) {
  'use strict';
  var D = w.KV_DATA || {}, KV = w.KV = {};
  var BR = D.brand || {};
  var CATS = D.categories || [], PRODS = D.products || [];
  KV.products = PRODS; KV.categories = CATS; KV.easy = D.easyPayment || {};

  /* ---------- storage ---------- */
  function load(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function emit(name, detail) { w.dispatchEvent(new CustomEvent('kv:' + name, { detail: detail })); }
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  KV.$ = $; KV.$$ = $$; KV.load = load; KV.save = save;

  /* ---------- format ---------- */
  KV.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var esc = KV.esc;
  KV.fmt = function (n) { return 'Rs ' + Math.round(n).toLocaleString('en-US'); };
  KV.price = function (n) { return '<span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">Rs</span>&nbsp;' + Math.round(n).toLocaleString('en-US') + '</bdi></span>'; };
  KV.product = function (id) { for (var i = 0; i < PRODS.length; i++) if (PRODS[i].id === id) return PRODS[i]; return null; };
  KV.category = function (id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return null; };
  KV.url = function (p) { return 'product.html?id=' + encodeURIComponent(p.id); };
  KV.saving = function (p) { if (!p.rrp || p.rrp <= p.price) return { amount: 0, pct: 0 }; return { amount: p.rrp - p.price, pct: Math.round((1 - p.price / p.rrp) * 100) }; };
  KV.priceBlock = function (p) {
    if (p.rrp && p.rrp > p.price) return '<span class="price"><del aria-hidden="true">' + KV.price(p.rrp) + '</del> <span class="screen-reader-text">Original price was: ' + KV.fmt(p.rrp) + '.</span><ins aria-hidden="true">' + KV.price(p.price) + '</ins><span class="screen-reader-text">Current price is: ' + KV.fmt(p.price) + '.</span></span>';
    return '<span class="price">' + KV.price(p.price) + '</span>';
  };
  KV.stars = function (r, count) {
    return '<div class="star-rating" role="img" aria-label="Rated ' + r.toFixed(2) + ' out of 5"><span style="width:' + (r / 5 * 100).toFixed(0) + '%">Rated <strong class="rating">' + r.toFixed(2) + '</strong> out of 5</span></div>' + (count != null ? '<span class="rating-count">(' + count + ')</span>' : '');
  };

  /* ---------- Easy Payment calc ---------- */
  KV.calc = function (price, downPct, months) {
    var e = KV.easy, t = null, i;
    for (i = 0; i < e.tenures.length; i++) if (e.tenures[i].months === months) t = e.tenures[i];
    if (!t) t = e.tenures[e.tenures.length - 1];
    var down = Math.round(price * downPct / 100), fin = price - down, extra = Math.round(fin * t.markupPct / 100);
    return { down: down, financed: fin, extra: extra, total: price + extra, monthly: Math.ceil((fin + extra) / months), months: months, markupPct: t.markupPct };
  };
  KV.easyMonthly = function (p, months) {
    if (p.price < KV.easy.minPrice) return 0;
    return KV.calc(p.price, KV.easy.minDownPct, months || KV.easy.defaultTenure).monthly;
  };

  /* ---------- cart / wishlist / compare ---------- */
  var cartData = load('kv-cart', []);
  KV.cart = {
    items: function () { return cartData.map(function (i) { return { id: i.id, qty: i.qty, product: KV.product(i.id) }; }).filter(function (i) { return i.product; }); },
    add: function (id, qty, o) {
      var p = KV.product(id); if (!p) return; qty = Math.max(1, parseInt(qty, 10) || 1);
      var it = cartData.filter(function (i) { return i.id === id; })[0];
      if (it) it.qty += qty; else cartData.push({ id: id, qty: qty });
      save('kv-cart', cartData); emit('cart', { id: id, action: 'add' });
      if (!(o && o.silent)) {
        KV.notice('<a href="cart.html" class="button wc-forward">View cart</a> &ldquo;' + esc(p.name) + '&rdquo; has been added to your cart.');
        KV.openCart();
      }
    },
    remove: function (id) { cartData = cartData.filter(function (i) { return i.id !== id; }); save('kv-cart', cartData); emit('cart', { id: id, action: 'remove' }); },
    setQty: function (id, q) { q = parseInt(q, 10) || 0; if (q < 1) return KV.cart.remove(id); cartData.forEach(function (i) { if (i.id === id) i.qty = Math.min(q, 99); }); save('kv-cart', cartData); emit('cart', { id: id, action: 'qty' }); },
    subtotal: function () { return KV.cart.items().reduce(function (s, i) { return s + i.product.price * i.qty; }, 0); },
    count: function () { return cartData.reduce(function (s, i) { return s + i.qty; }, 0); },
    clear: function () { cartData = []; save('kv-cart', cartData); emit('cart', { action: 'clear' }); },
    shippingFee: function () { var s = KV.cart.subtotal(); return s === 0 || s >= D.shipping.freeOver ? 0 : D.shipping.flat; }
  };
  function listStore(key, max) {
    var arr = load(key, []);
    return {
      items: function () { return arr.slice(); },
      has: function (id) { return arr.indexOf(id) > -1; },
      toggle: function (id) {
        var i = arr.indexOf(id);
        if (i > -1) arr.splice(i, 1);
        else { if (max && arr.length >= max) { KV.notice('You can compare up to ' + max + ' products. Remove one first.', 'info'); return false; } arr.push(id); }
        save(key, arr); emit(key === 'kv-wishlist' ? 'wishlist' : 'compare', { id: id }); return true;
      },
      clear: function () { arr = []; save(key, arr); emit(key === 'kv-wishlist' ? 'wishlist' : 'compare', {}); }
    };
  }
  KV.wishlist = listStore('kv-wishlist'); KV.compare = listStore('kv-compare', 3);

  /* ---------- options ---------- */
  var OPT_DEF = { skin: '1', header: '1', hero: '1', cats: '1', card: '1', rail1: '1', rail2: '3', rail3: '2', footer: '1' };
  var RAIL_KEYS = ['rail1', 'rail2', 'rail3'];
  function optOk(k, v) { return (k === 'skin' ? ['1', '2'] : ['1', '2', '3']).indexOf(String(v)) > -1; }
  var OPT_META = [
    { key: 'skin', title: 'Design style', home: false, items: ['Classic retail', 'Modern - bold, rounded, full-width bands'] },
    { key: 'header', title: 'Header', home: false, items: ['Retail classic - top bar, search, mega menu', 'Centered - boutique logo and mega panels', 'Compact sticky - one row with offer strip'] },
    { key: 'hero', title: 'Hero (home)', home: true, items: ['Slider + 2 banners', 'Full-width banner + service tiles', 'Category list + slider'] },
    { key: 'cats', title: 'Categories (home)', home: true, items: ['Image tiles', 'Icon row', 'Circle images'] },
    { key: 'card', title: 'Product card', home: false, items: ['Standard retail', 'Hover actions', 'Detailed list-style'] },
    { key: 'rail1', group: 'Homepage product sections', title: 'Best sellers', home: true, items: ['Tabs + grid', 'Carousel with arrows', 'Feature card + grid'] },
    { key: 'rail2', group: 'Homepage product sections', title: 'Deals this week', home: true, items: ['Tabs + grid', 'Carousel with arrows', 'Deal of the day + grid'] },
    { key: 'rail3', group: 'Homepage product sections', title: 'New arrivals - furniture', home: true, items: ['Tabs + grid', 'Carousel with arrows', 'Feature card + grid'] },
    { key: 'footer', title: 'Footer', home: false, items: ['Navy 4 columns', 'USP strip + light columns', 'Compact centred'] }
  ];
  var optState = (function () { var s = load('kv-options', {}), o = {};
    for (var k in OPT_DEF) o[k] = optOk(k, s[k]) ? String(s[k]) : OPT_DEF[k];
    if (optOk('rail', s.rail) && !RAIL_KEYS.some(function (r) { return optOk(r, s[r]); })) RAIL_KEYS.forEach(function (r) { o[r] = String(s.rail); }); /* legacy single "rail" key */
    /* Shareable preview links: ?opt=skin-2,header-2,rail1-3 ("rail-N" sets all three sections) */
    try { var q = new URLSearchParams(location.search).get('opt'); if (q) { q.split(',').forEach(function (pair) { var kv = pair.split('-'); if (kv[0] === 'rail' && optOk('rail1', kv[1])) RAIL_KEYS.forEach(function (r) { o[r] = kv[1]; }); else if (kv[0] in OPT_DEF && optOk(kv[0], kv[1])) o[kv[0]] = kv[1]; }); save('kv-options', o); } } catch (e) {}
    return o; })();
  function applyOpts() { for (var k in optState) d.body.setAttribute('data-' + k, optState[k]); }
  KV.options = {
    get: function () { return JSON.parse(JSON.stringify(optState)); },
    set: function (k, v) {
      v = String(v); if (k === 'rail' && optOk('rail1', v)) { RAIL_KEYS.forEach(function (r) { optState[r] = v; }); save('kv-options', optState); applyOpts(); emit('options', { key: 'rail', value: v }); KV.sync(); return; }
      if (!(k in OPT_DEF) || !optOk(k, v)) return;
      optState[k] = v; save('kv-options', optState); applyOpts();
      if (k === 'header') KV.renderHeader(); if (k === 'footer') KV.renderFooter();
      emit('options', { key: k, value: v }); KV.sync();
    },
    reset: function () { optState = JSON.parse(JSON.stringify(OPT_DEF)); save('kv-options', optState); applyOpts(); KV.renderHeader(); KV.renderFooter(); emit('options', { key: 'all', value: null }); KV.sync(); }
  };

  /* ---------- ready queue ---------- */
  var readyQ = [], inited = false;
  KV.ready = function (fn) { if (inited) fn(); else readyQ.push(fn); };

  /* ---------- product cards ---------- */
  function stockClass(s) { return /out/i.test(s) ? 'out' : /only|low/i.test(s) ? 'low-stock' : 'in-stock'; }
  function liClass(p, extra) {
    var sale = p.rrp && p.rrp > p.price;
    return 'product type-product post-' + esc(p.id) + ' status-publish ' + (/out/i.test(p.stock) ? 'outofstock' : 'instock') + ' product_cat-' + esc(p.category) + ' has-post-thumbnail' + (sale ? ' sale' : '') + ' shipping-taxable purchasable product-type-simple' + (extra ? ' ' + extra : '');
  }
  function badges(p) {
    var s = KV.saving(p), h = '';
    if (s.pct) h += '<span class="onsale">-' + s.pct + '%</span>';
    if (p.freeGift) h += '<span class="kv-badge kv-badge-gift">Free gift</span>';
    if (p.badges && p.badges.indexOf('New') > -1) h += '<span class="kv-badge kv-badge-new">New</span>';
    return h ? '<span class="product-badges">' + h + '</span>' : '';
  }
  function addBtn(p, cls) {
    var out = /out/i.test(p.stock);
    if (out) return '<a href="' + KV.url(p) + '" class="button product_type_simple ' + (cls || '') + '" rel="nofollow">Read more</a>';
    return '<a href="?add-to-cart=' + esc(p.id) + '" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart ' + (cls || '') + '" data-kv-add="' + esc(p.id) + '" data-product_id="' + esc(p.id) + '" data-product_sku="' + esc(p.sku) + '" aria-label="Add to cart: &ldquo;' + esc(p.name) + '&rdquo;" rel="nofollow">Add to cart</a>';
  }
  function img(p, w2) { return '<img width="300" height="300" loading="lazy" src="' + esc(p.images[0]) + '" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="' + esc(p.name) + '">'; }
  function easyLine(p) { var m = KV.easyMonthly(p); return m ? '<span class="easy-line"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Easy Payment: <strong>' + KV.fmt(m) + '</strong> x ' + KV.easy.defaultTenure + ' months</span>' : ''; }
  function saveLine(p) { var s = KV.saving(p); return s.amount ? '<span class="save-line">Save ' + KV.fmt(s.amount) + '</span>' : ''; }
  function stockLine(p) { return '<span class="stock-line ' + stockClass(p.stock) + '"><i class="fa-solid ' + (stockClass(p.stock) === 'out' ? 'fa-circle-xmark' : stockClass(p.stock) === 'low-stock' ? 'fa-circle-exclamation' : 'fa-circle-check') + '" aria-hidden="true"></i> ' + esc(p.stock) + '</span>'; }
  function actionBtns(p) {
    return '<button type="button" class="act-btn" data-kv-wish="' + esc(p.id) + '" aria-pressed="false" aria-label="Add ' + esc(p.name) + ' to wishlist"><i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
      '<button type="button" class="act-btn" data-kv-compare="' + esc(p.id) + '" aria-pressed="false" aria-label="Compare ' + esc(p.name) + '"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i></button>' +
      '<button type="button" class="act-btn" data-kv-quick="' + esc(p.id) + '" aria-label="Quick view ' + esc(p.name) + '"><i class="fa-regular fa-eye" aria-hidden="true"></i></button>';
  }
  /* Offer timeline: p.saleEnds (ISO date) or a demo end date 1–5 days ahead for sale items */
  KV.saleEnds = function (p) {
    if (!(p.rrp && p.rrp > p.price)) return 0;
    if (p.saleEnds) return new Date(p.saleEnds).getTime();
    var h = 0; for (var i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
    var t = new Date(); t.setHours(23, 59, 0, 0); return t.getTime() + (h % 5) * 86400000;
  };
  function endsText(ms) {
    var left = ms - Date.now(); if (left <= 0) return 'Offer ended';
    var dd = Math.floor(left / 86400000), hh = Math.floor(left % 86400000 / 3600000), mm = Math.floor(left % 3600000 / 60000);
    return 'Offer ends in ' + (dd ? dd + 'd ' : '') + hh + 'h ' + (mm < 10 ? '0' : '') + mm + 'm';
  }
  function offerLine(p) { var e = KV.saleEnds(p); return e ? '<span class="kv-offer" data-kv-ends="' + e + '"><i class="fa-regular fa-clock" aria-hidden="true"></i> <span>' + endsText(e) + '</span></span>' : ''; }
  setInterval(function () { $$('[data-kv-ends]').forEach(function (el) { var s = el.querySelector('span'); if (s) s.textContent = endsText(+el.getAttribute('data-kv-ends')); }); }, 30000);
  KV.card = function (p, o) {
    var opt = (o && o.opt) || d.body.getAttribute('data-card') || '1', url = KV.url(p);
    if (opt === '2') {
      return '<li class="' + liClass(p, 'card-2') + '" data-id="' + esc(p.id) + '"><div class="product-inner"><div class="product-media"><a href="' + url + '" class="woocommerce-LoopProduct-link woocommerce-loop-product__link" tabindex="-1" aria-hidden="true">' + img(p) + '</a>' + badges(p) +
        '<div class="product-actions">' + actionBtns(p) + '</div>' + addBtn(p, 'card-add-bar') + '</div><div class="product-info"><span class="product-brand">' + esc(p.brand) + '</span><h2 class="woocommerce-loop-product__title"><a href="' + url + '">' + esc(p.name) + '</a></h2>' +
        '<div class="rating-row">' + KV.stars(p.rating, p.reviews) + '</div>' + KV.priceBlock(p) + offerLine(p) + '</div></div></li>';
    }
    if (opt === '3') {
      var bl = (p.bullets || []).slice(0, 3).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
      return '<li class="' + liClass(p, 'card-3') + '" data-id="' + esc(p.id) + '"><div class="product-inner"><div class="product-media"><a href="' + url + '" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">' + img(p) + '</a>' + badges(p) + '</div>' +
        '<div class="product-main"><span class="product-brand">' + esc(p.brand) + ' &middot; ' + esc(p.model) + '</span><h2 class="woocommerce-loop-product__title"><a href="' + url + '">' + esc(p.name) + '</a></h2><ul class="product-bullets">' + bl + '</ul><div class="rating-row">' + KV.stars(p.rating, p.reviews) + '</div></div>' +
        '<div class="product-buy">' + KV.priceBlock(p) + offerLine(p) + '<span class="delivery-line"><i class="fa-solid fa-truck-fast" aria-hidden="true"></i> ' + esc(p.delivery || (p.price >= D.shipping.freeOver ? 'Free delivery' : 'Delivery ' + KV.fmt(D.shipping.flat))) + '</span>' + addBtn(p) +
        '<span class="buy-links"><button type="button" class="link-btn" data-kv-wish="' + esc(p.id) + '" aria-pressed="false"><i class="fa-regular fa-heart" aria-hidden="true"></i> Wishlist</button><button type="button" class="link-btn" data-kv-compare="' + esc(p.id) + '" aria-pressed="false"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> Compare</button></span></div></div></li>';
    }
    /* Card 1 — simple real-shop card: whole card clickable (stretched link), image, name, price, offer + timer, wishlist, add to cart */
    return '<li class="' + liClass(p, 'card-1') + '" data-id="' + esc(p.id) + '"><div class="product-inner kv-card">' +
      '<div class="product-media">' + img(p) + badges(p) + '<button type="button" class="kv-wish" data-kv-wish="' + esc(p.id) + '" aria-pressed="false" aria-label="Add ' + esc(p.name) + ' to favourites"><i class="fa-regular fa-heart" aria-hidden="true"></i></button></div>' +
      '<span class="product-brand">' + esc(p.brand) + '</span>' +
      '<h2 class="woocommerce-loop-product__title"><a href="' + url + '" class="woocommerce-LoopProduct-link woocommerce-loop-product__link kv-stretch">' + esc(p.name) + '</a></h2>' +
      KV.priceBlock(p) + offerLine(p) + addBtn(p) + '</div></li>';
  };
  KV.grid = function (list, o) { return '<ul class="products columns-' + ((o && o.cols) || 4) + (o && o.cls ? ' ' + o.cls : '') + '">' + list.map(function (p) { return KV.card(p, o); }).join('') + '</ul>'; };
  KV.sync = function () {
    $$('[data-kv-wish]').forEach(function (b) { var on = KV.wishlist.has(b.getAttribute('data-kv-wish')); b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); var i = $('i', b); if (i) i.className = on ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; });
    $$('[data-kv-compare]').forEach(function (b) { var on = KV.compare.has(b.getAttribute('data-kv-compare')); b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
    $$('[data-kv-cart-count]').forEach(function (e) { var c = KV.cart.count(); e.textContent = c; e.hidden = false; e.classList.toggle('is-zero', !c); });
    $$('[data-kv-cart-total]').forEach(function (e) { e.textContent = KV.fmt(KV.cart.subtotal()); });
    $$('[data-kv-wish-count]').forEach(function (e) { var c = KV.wishlist.items().length; e.textContent = c; e.classList.toggle('is-zero', !c); });
  };

  /* ---------- payments strip ---------- */
  KV.payments = function () {
    return '<ul class="pay-logos" aria-label="Accepted payment methods">' +
      '<li><img src="assets/img/payments/payhere.png" alt="PayHere" height="24"></li><li><img src="assets/img/payments/koko.png" alt="Koko" height="24"></li>' +
      '<li class="pay-dark"><img src="assets/img/payments/mintpay-small.png" alt="Mintpay" height="22"></li>' +
      '<li><i class="fa-brands fa-cc-visa" style="color:#1A1F71" aria-label="Visa" role="img"></i></li><li><i class="fa-brands fa-cc-mastercard" style="color:#EB001B" aria-label="Mastercard" role="img"></i></li><li><i class="fa-brands fa-cc-amex" style="color:#006FCF" aria-label="American Express" role="img"></i></li>' +
      '<li class="pay-text">COD</li><li class="pay-text pay-easy">Easy Payment</li></ul>';
  };

  /* ---------- header ---------- */
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  function logo(white, h) { return '<a class="site-logo" href="index.html" aria-label="' + esc(BR.name) + ' - home"><img src="' + (white ? BR.logoWhite : BR.logo) + '" alt="' + esc(BR.name) + '" width="' + (h * 3) + '" height="' + h + '"></a>'; }
  function searchForm(id, withCat) {
    var sel = withCat ? '<label class="visually-hidden" for="sc-' + id + '">Category</label><select id="sc-' + id + '" name="cat"><option value="">All categories</option>' + CATS.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>' : '';
    return '<form class="kv-search" role="search" action="shop.html" method="get" autocomplete="off">' + sel + '<label class="visually-hidden" for="sq-' + id + '">Search products</label><input id="sq-' + id + '" type="search" name="q" placeholder="Search fridges, sofas, TVs, model numbers" aria-autocomplete="list"><button type="submit" aria-label="Search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button><ul class="kv-suggest" hidden></ul></form>';
  }
  function icons(opt) {
    return '<div class="hdr-icons">' +
      (opt && opt.easy ? '<a class="hdr-easy" href="easy-payment.html"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i><span><small>Pay monthly</small>Easy Payment</span></a>' : '') +
      '<a class="hdr-ico" href="my-account.html"><i class="fa-regular fa-user" aria-hidden="true"></i><span class="hdr-ico-label">' + (opt && opt.labels ? 'Account' : '') + '<span class="visually-hidden">My account</span></span></a>' +
      '<a class="hdr-ico" href="my-account.html?tab=wishlist"><i class="fa-regular fa-heart" aria-hidden="true"></i><span class="hdr-count" data-kv-wish-count>0</span><span class="visually-hidden">Wishlist</span></a>' +
      '<a class="hdr-ico hdr-cart" href="cart.html" data-kv-open-cart><i class="fa-solid fa-bag-shopping" aria-hidden="true"></i><span class="hdr-count" data-kv-cart-count>0</span>' + (opt && opt.total ? '<span class="hdr-cart-total" data-kv-cart-total>Rs 0</span>' : '') + '<span class="visually-hidden">Cart</span></a></div>';
  }
  function mobileHead(id) {
    return '<div class="mhead d-lg-none"><div class="mhead-row"><button class="mh-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#kv-mobile-menu" aria-controls="kv-mobile-menu" aria-label="Open menu"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>' + logo(false, 32) +
      '<div class="mh-right"><button class="mh-btn" type="button" data-kv-focus-search aria-label="Search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button><a class="mh-btn hdr-cart" href="cart.html" data-kv-open-cart aria-label="Cart"><i class="fa-solid fa-bag-shopping" aria-hidden="true"></i><span class="hdr-count" data-kv-cart-count>0</span></a></div></div>' +
      '<div class="mhead-search">' + searchForm('m' + id, false) + '</div></div>';
  }
  var NAV1 = ['furniture', 'refrigerators', 'washing-machines', 'tv-audio', 'air-conditioners', 'kitchen-appliances', 'laptops-phones'];
  var NAV3 = ['furniture', 'refrigerators', 'tv-audio', 'air-conditioners', 'laptops-phones'];
  function navLinks(ids, cls) {
    return ids.map(function (id) { var c = KV.category(id); return '<li><a href="shop.html?cat=' + id + '"' + (location.search.indexOf('cat=' + id) > -1 ? ' aria-current="page"' : '') + '>' + esc(c.name) + '</a></li>'; }).join('') +
      '<li><a href="easy-payment.html"' + (page === 'easy-payment.html' ? ' aria-current="page"' : '') + '>Easy Payment</a></li><li><a class="nav-deals" href="shop.html?sort=deals">Deals</a></li>';
  }
  function catBrands(c) { var s = {}; PRODS.forEach(function (p) { if (p.category === c.id) s[p.brand] = 1; }); return Object.keys(s).slice(0, 5); }
  function header1() {
    var allc = CATS.map(function (c) {
      return '<li class="allc-item"><a href="shop.html?cat=' + c.id + '"><i class="' + c.icon + '" aria-hidden="true"></i><span>' + esc(c.name) + '</span><i class="fa-solid fa-chevron-right chev" aria-hidden="true"></i></a><div class="allc-fly"><strong>' + esc(c.name) + '</strong><ul>' + c.subs.map(function (s) { return '<li><a href="shop.html?cat=' + c.id + '">' + esc(s) + '</a></li>'; }).join('') + '</ul></div></li>';
    }).join('');
    return '<header class="kv-header hdr-1"><div class="hdr-top d-none d-lg-block"><div class="container hdr-top-row"><ul><li><a href="tel:' + BR.hotlineTel + '"><i class="fa-solid fa-phone" aria-hidden="true"></i> Hotline ' + esc(BR.hotline) + '</a></li><li>Free delivery in Colombo over Rs 50,000</li></ul><ul><li><a href="stores.html"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Store locator</a></li><li><a href="my-account.html?tab=orders">Track order</a></li><li><a href="contact.html">Help</a></li></ul></div></div>' +
      '<div class="hdr-main d-none d-lg-block"><div class="container hdr-main-row">' + logo(false, 48) + searchForm('d1', true) + icons({ easy: true, total: true }) + '</div></div>' +
      '<div class="hdr-nav d-none d-lg-block"><div class="container hdr-nav-row"><div class="allcats"><button type="button" class="allcats-btn" aria-haspopup="true"><i class="fa-solid fa-bars" aria-hidden="true"></i> All categories <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button><ul class="allcats-menu">' + allc + '</ul></div><nav aria-label="Main"><ul class="nav-list">' + navLinks(NAV1) + '</ul></nav></div></div>' + mobileHead(1) + '</header>';
  }
  function header2() {
    var nav = NAV1.concat([]).slice(0, 6).map(function (id) {
      var c = KV.category(id), br = catBrands(c);
      return '<li class="has-mega"><a href="shop.html?cat=' + id + '">' + esc(c.name) + ' <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></a><div class="mega"><div class="container mega-in"><div><h3>Shop by type</h3><ul>' + c.subs.map(function (s) { return '<li><a href="shop.html?cat=' + id + '">' + esc(s) + '</a></li>'; }).join('') + '</ul></div>' +
        '<div><h3>Popular brands</h3><ul>' + br.map(function (b) { return '<li><a href="shop.html?cat=' + id + '&amp;brand=' + encodeURIComponent(b) + '">' + esc(b) + '</a></li>'; }).join('') + '</ul></div><div><h3>Quick links</h3><ul><li><a href="shop.html?cat=' + id + '&amp;sort=deals">Deals</a></li><li><a href="shop.html?cat=' + id + '&amp;sort=date">New arrivals</a></li><li><a href="easy-payment.html">Pay with Easy Payment</a></li><li><a href="stores.html">See it in a showroom</a></li></ul></div>' +
        '<a class="mega-promo" href="shop.html?cat=' + id + '"><img src="' + esc(c.image) + '" alt="" loading="lazy"><span>Shop ' + esc(c.name) + '</span></a></div></div></li>';
    }).join('');
    return '<header class="kv-header hdr-2"><div class="hdr-util d-none d-lg-block"><div class="container hdr-util-row"><span>Showrooms in Colombo, Kandy, Galle and 3 more cities</span><ul><li><a href="tel:' + BR.hotlineTel + '">' + esc(BR.hotline) + '</a></li><li><a href="stores.html">Store locator</a></li><li><a href="my-account.html?tab=orders">Track order</a></li></ul></div></div>' +
      '<div class="hdr-center d-none d-lg-block"><div class="container hdr-center-row"><div class="hc-left"><button type="button" class="hc-search-btn" data-kv-toggle-search aria-expanded="false" aria-controls="hdr2-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Search</button></div>' + logo(false, 56) + '<div class="hc-right">' + icons({ labels: true }) + '</div></div><div class="hdr2-search" id="hdr2-search" hidden><div class="container">' + searchForm('d2', true) + '</div></div></div>' +
      '<nav class="hdr-nav2 d-none d-lg-block" aria-label="Main"><ul class="container">' + nav + '<li><a href="easy-payment.html">Easy Payment</a></li><li><a class="nav-deals" href="shop.html?sort=deals">Deals</a></li></ul></nav>' + mobileHead(2) + '</header>';
  }
  function header3() {
    var off = load('kv-announce-off', 0);
    return '<header class="kv-header hdr-3">' + (off ? '' : '<div class="hdr-announce"><div class="container hdr-announce-row"><p>Up to 15% off furniture this week. Free delivery in Colombo over Rs 50,000. <a href="shop.html?sort=deals">See deals</a></p><button type="button" data-kv-dismiss-announce aria-label="Dismiss announcement"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div></div>') +
      '<div class="hdr-row3 d-none d-lg-block"><div class="container hdr-row3-in">' + logo(false, 44) + '<nav aria-label="Main"><ul class="nav-list">' + navLinks(NAV3) + '</ul></nav><div class="hdr3-search">' + searchForm('d3', false) + '</div>' + icons({}) + '</div></div>' + mobileHead(3) + '</header>';
  }
  KV.renderHeader = function () {
    var host = $('#site-header'); if (!host) return;
    var o = optState.header; host.innerHTML = o === '2' ? header2() : o === '3' ? header3() : header1();
    host.setAttribute('data-variant', o); KV.sync();
  };

  /* ---------- footer ---------- */
  function footerCols() {
    return {
      shop: CATS.slice(0, 7).map(function (c) { return '<li><a href="shop.html?cat=' + c.id + '">' + esc(c.name) + '</a></li>'; }).join(''),
      help: '<li><a href="my-account.html?tab=orders">Track your order</a></li><li><a href="policies.html#delivery">Delivery &amp; installation</a></li><li><a href="policies.html#returns">Returns &amp; refunds</a></li><li><a href="policies.html#warranty">Warranty</a></li><li><a href="easy-payment.html">Easy Payment</a></li><li><a href="contact.html">Contact us</a></li>',
      company: '<li><a href="about.html">About us</a></li><li><a href="stores.html">Showrooms</a></li><li><a href="policies.html#privacy">Privacy policy</a></li><li><a href="policies.html#terms">Terms &amp; conditions</a></li><li><a href="policies.html#easy-payment">Easy Payment terms</a></li>'
    };
  }
  function news(id) { return '<form class="kv-news" data-kv-news><label for="nl-' + id + '">Email for offers and new arrivals</label><div><input id="nl-' + id + '" type="email" required placeholder="Your email address" autocomplete="email"><button type="submit" class="button">Subscribe</button></div><p class="news-msg" role="status" hidden>Thank you. You are subscribed.</p></form>'; }
  function social() { return '<ul class="social"><li><a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a></li><li><a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a></li><li><a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a></li><li><a href="https://wa.me/' + BR.whatsapp + '" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a></li></ul>'; }
  function footer1() {
    var c = footerCols();
    return '<footer class="kv-footer ft-1"><div class="container ft-grid"><div class="ft-about">' + logo(true, 44) + '<p>' + esc(BR.company) + '. Home and office furniture, appliances and electronics, with Easy Payment monthly instalments.</p><address><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' + esc(BR.address) + '<br><i class="fa-solid fa-phone" aria-hidden="true"></i> <a href="tel:' + BR.hotlineTel + '">' + esc(BR.hotline) + '</a><br><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp ' + esc(BR.whatsappDisplay) + '<br><i class="fa-regular fa-envelope" aria-hidden="true"></i> <a href="mailto:' + BR.email + '">' + esc(BR.email) + '</a><br><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + esc(BR.hours) + '</address></div>' +
      '<nav aria-label="Shop"><h2>Shop</h2><ul>' + c.shop + '</ul></nav><nav aria-label="Customer service"><h2>Customer service</h2><ul>' + c.help + '</ul></nav><div><h2>Stay in touch</h2>' + news('f1') + social() + '</div></div>' +
      '<div class="ft-bottom"><div class="container ft-bottom-row"><p>&copy; 2026 ' + esc(BR.company) + '. Prices include VAT where applicable. Online prices may differ in showrooms.</p>' + KV.payments() + '</div></div></footer>';
  }
  function footer2() {
    var c = footerCols();
    return '<footer class="kv-footer ft-2"><div class="ft-usp"><div class="container ft-usp-row"><div><i class="fa-solid fa-truck-fast" aria-hidden="true"></i><p><strong>Island-wide delivery</strong>Free in Colombo over Rs 50,000</p></div><div><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><p><strong>Manufacturer warranty</strong>Genuine local warranty</p></div><div><i class="fa-solid fa-calendar-check" aria-hidden="true"></i><p><strong>Easy Payment</strong>Monthly instalments up to 36 months</p></div><div><i class="fa-solid fa-store" aria-hidden="true"></i><p><strong>6 showrooms</strong>See and test before you buy</p></div></div></div>' +
      '<div class="container ft-grid5"><div class="ft-about">' + logo(false, 44) + '<p>' + esc(BR.address) + '<br>Hotline <a href="tel:' + BR.hotlineTel + '">' + esc(BR.hotline) + '</a><br><a href="mailto:' + BR.email + '">' + esc(BR.email) + '</a></p>' + social() + '</div>' +
      '<nav aria-label="Shop"><h2>Shop</h2><ul>' + c.shop + '</ul></nav><nav aria-label="Customer service"><h2>Customer service</h2><ul>' + c.help + '</ul></nav><nav aria-label="Company"><h2>Company</h2><ul>' + c.company + '</ul></nav><div><h2>Newsletter</h2>' + news('f2') + '</div></div>' +
      '<div class="ft-bottom"><div class="container ft-bottom-row"><p>&copy; 2026 ' + esc(BR.company) + '</p>' + KV.payments() + '</div></div></footer>';
  }
  function footer3() {
    return '<footer class="kv-footer ft-3"><div class="container">' + logo(false, 48) + '<ul class="ft3-links"><li><a href="shop.html">Shop</a></li><li><a href="easy-payment.html">Easy Payment</a></li><li><a href="stores.html">Showrooms</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li><li><a href="policies.html#delivery">Delivery</a></li><li><a href="policies.html#returns">Returns</a></li><li><a href="policies.html#privacy">Privacy</a></li><li><a href="policies.html#terms">Terms</a></li></ul>' + social() + KV.payments() + '<p class="ft3-copy">&copy; 2026 ' + esc(BR.company) + ' &middot; ' + esc(BR.address) + ' &middot; <a href="tel:' + BR.hotlineTel + '">' + esc(BR.hotline) + '</a></p></div></footer>';
  }
  KV.renderFooter = function () {
    var host = $('#site-footer'); if (!host) return;
    var o = optState.footer; host.innerHTML = o === '2' ? footer2() : o === '3' ? footer3() : footer1();
    host.setAttribute('data-variant', o);
  };

  /* ---------- notices ---------- */
  KV.notice = function (html, type) {
    var box = $('.kv-notices'); if (!box) return;
    var el = d.createElement('div'); el.className = type === 'error' ? 'woocommerce-error' : type === 'info' ? 'woocommerce-info' : 'woocommerce-message'; el.setAttribute('role', 'alert'); el.innerHTML = html;
    box.appendChild(el); while (box.children.length > 3) box.removeChild(box.firstChild);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 4500);
  };

  /* ---------- offcanvas helpers ---------- */
  function oc(id) { var el = $('#' + id); return el && w.bootstrap ? w.bootstrap.Offcanvas.getOrCreateInstance(el) : null; }
  KV.openCart = function () { renderCart(); var o = oc('kv-cart-drawer'); if (o) o.show(); };
  function renderCart() {
    var host = $('#kv-cart-body'); if (!host) return;
    var items = KV.cart.items(), sub = KV.cart.subtotal(), free = D.shipping.freeOver, left = Math.max(0, free - sub);
    var head = $('#kv-cart-count'); if (head) head.textContent = KV.cart.count() ? '(' + KV.cart.count() + ')' : '';
    var prog = sub ? '<div class="kv-freeship"><p>' + (left ? 'Add <strong>' + KV.fmt(left) + '</strong> more for free delivery in Colombo' : '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> You have free delivery in Colombo') + '</p><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.min(100, Math.round(sub / free * 100)) + '" aria-label="Progress to free delivery"><span style="width:' + Math.min(100, sub / free * 100) + '%"></span></div></div>' : '';
    if (!items.length) { host.innerHTML = '<div class="widget_shopping_cart_content"><p class="woocommerce-mini-cart__empty-message">No products in the cart.</p><p class="woocommerce-mini-cart__buttons buttons"><a href="shop.html" class="button wc-forward">Continue shopping</a></p></div>'; return; }
    host.innerHTML = prog + '<div class="widget_shopping_cart_content"><ul class="woocommerce-mini-cart cart_list product_list_widget">' + items.map(function (i) {
      var p = i.product;
      return '<li class="woocommerce-mini-cart-item mini_cart_item"><a href="#" class="remove remove_from_cart_button" data-kv-remove="' + esc(p.id) + '" aria-label="Remove ' + esc(p.name) + ' from cart">&times;</a><a href="' + KV.url(p) + '" class="mc-link"><img src="' + esc(p.images[0]) + '" alt="" width="64" height="64"><span>' + esc(p.name) + '</span></a>' +
        '<span class="quantity"><span class="mc-step"><button type="button" data-kv-step="' + esc(p.id) + '" data-d="-1" aria-label="Decrease quantity">&minus;</button><span aria-live="polite">' + i.qty + '</span><button type="button" data-kv-step="' + esc(p.id) + '" data-d="1" aria-label="Increase quantity">+</button></span> &times; ' + KV.price(p.price) + '</span></li>';
    }).join('') + '</ul><p class="woocommerce-mini-cart__total total"><strong>Subtotal:</strong> ' + KV.price(sub) + '</p><p class="woocommerce-mini-cart__buttons buttons"><a href="cart.html" class="button wc-forward btn-kv-outline">View cart</a><a href="checkout.html" class="button checkout wc-forward alt">Checkout</a></p></div>';
  }

  /* ---------- shared containers: drawer, mobile menu, options panel, bar, whatsapp ---------- */
  function buildShared() {
    var b = d.body, wrap = d.createElement('div'); wrap.className = 'kv-shared';
    var acc = CATS.map(function (c, i) {
      return '<div class="mm-item"><button class="mm-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#mm-' + i + '" aria-expanded="false" aria-controls="mm-' + i + '"><span><i class="' + c.icon + '" aria-hidden="true"></i> ' + esc(c.name) + '</span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button><div id="mm-' + i + '" class="collapse"><ul><li><a href="shop.html?cat=' + c.id + '">All ' + esc(c.name) + '</a></li>' + c.subs.map(function (s) { return '<li><a href="shop.html?cat=' + c.id + '">' + esc(s) + '</a></li>'; }).join('') + '</ul></div></div>';
    }).join('');
    var lastGrp = '';
    var opts = OPT_META.map(function (g) {
      var gh = g.group && g.group !== lastGrp ? '<h3 class="opt-gh" data-opt-home="' + g.home + '">' + g.group + '</h3>' : ''; lastGrp = g.group || '';
      return gh + '<fieldset class="opt-group" data-opt-home="' + g.home + '"><legend>' + g.title + '</legend>' + g.items.map(function (t, i) { return '<label class="opt-radio"><input type="radio" name="opt-' + g.key + '" value="' + (i + 1) + '" data-kv-opt="' + g.key + '"><span><strong>' + (i + 1) + '</strong> ' + t + '</span></label>'; }).join('') + '</fieldset>';
    }).join('');
    wrap.innerHTML = '<a class="kv-skip" href="#primary">Skip to content</a>' +
      '<div class="kv-notices" aria-live="polite"></div>' +
      '<div class="offcanvas offcanvas-end kv-drawer" id="kv-cart-drawer" tabindex="-1" aria-labelledby="kv-cart-title"><div class="offcanvas-header"><h2 class="offcanvas-title" id="kv-cart-title">Your cart <span id="kv-cart-count"></span></h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close cart"></button></div><div class="offcanvas-body" id="kv-cart-body"></div></div>' +
      '<div class="offcanvas offcanvas-start kv-drawer" id="kv-mobile-menu" tabindex="-1" aria-labelledby="kv-mm-title"><div class="offcanvas-header"><h2 class="offcanvas-title" id="kv-mm-title">Menu</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close menu"></button></div><div class="offcanvas-body p-0"><div class="mm-links"><a href="easy-payment.html"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Easy Payment</a><a class="nav-deals" href="shop.html?sort=deals"><i class="fa-solid fa-tags" aria-hidden="true"></i> Deals</a></div><h3 class="mm-title">Shop by category</h3>' + acc + '<div class="mm-links"><a href="stores.html">Store locator</a><a href="my-account.html?tab=orders">Track order</a><a href="my-account.html">My account</a><a href="contact.html">Contact us</a><a href="tel:' + BR.hotlineTel + '"><i class="fa-solid fa-phone" aria-hidden="true"></i> ' + esc(BR.hotline) + '</a></div></div></div>' +
      '<button type="button" class="kv-opt-fab" data-bs-toggle="offcanvas" data-bs-target="#kv-options" aria-controls="kv-options"><i class="fa-solid fa-gear" aria-hidden="true"></i><span>Theme options</span></button>' +
      '<div class="offcanvas offcanvas-start kv-drawer" id="kv-options" tabindex="-1" aria-labelledby="kv-opt-title" data-bs-scroll="true" data-bs-backdrop="false"><div class="offcanvas-header"><h2 class="offcanvas-title" id="kv-opt-title">Theme options</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close theme options"></button></div><div class="offcanvas-body"><p class="opt-note">Switch layouts live. Choices are saved in this browser.</p>' + opts + '<button type="button" class="button btn-kv-outline" data-kv-opt-reset>Reset to defaults</button></div></div>' +
      '<a class="kv-wa" href="https://wa.me/' + BR.whatsapp + '" aria-label="Chat on WhatsApp" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>' +
      '<div class="kv-compare-bar" hidden><div class="container cmp-row"><ul class="cmp-thumbs"></ul><div class="cmp-actions"><button type="button" class="button alt" data-kv-compare-open>Compare (<span class="cmp-n">0</span>)</button><button type="button" class="link-btn" data-kv-compare-clear>Clear</button></div></div></div>' +
      '<div class="offcanvas offcanvas-end kv-drawer kv-drawer-wide" id="kv-compare-drawer" tabindex="-1" aria-labelledby="kv-cmp-title"><div class="offcanvas-header"><h2 class="offcanvas-title" id="kv-cmp-title">Compare products</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body" id="kv-compare-body"></div></div>' +
      '<div class="modal fade" id="kv-quick" tabindex="-1" aria-labelledby="kv-quick-title" aria-hidden="true"><div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content"><div class="modal-header border-0"><h2 class="visually-hidden" id="kv-quick-title">Quick view</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close quick view"></button></div><div class="modal-body" id="kv-quick-body"></div></div></div></div>';
    b.appendChild(wrap);
    var cur = function (n) { return page === n ? ' aria-current="page" class="active"' : ''; };
    var bar = d.createElement('nav'); bar.className = 'kv-bottombar d-lg-none'; bar.setAttribute('aria-label', 'Quick navigation');
    bar.innerHTML = '<a href="index.html"' + cur('index.html') + '><i class="fa-solid fa-house" aria-hidden="true"></i><span>Home</span></a><button type="button" data-bs-toggle="offcanvas" data-bs-target="#kv-mobile-menu" aria-controls="kv-mobile-menu"><i class="fa-solid fa-table-cells-large" aria-hidden="true"></i><span>Categories</span></button><a href="easy-payment.html"' + cur('easy-payment.html') + '><i class="fa-solid fa-calendar-check" aria-hidden="true"></i><span>Easy Pay</span></a><a href="cart.html" data-kv-open-cart' + (page === 'cart.html' ? ' class="active"' : '') + '><i class="fa-solid fa-bag-shopping" aria-hidden="true"></i><span class="hdr-count" data-kv-cart-count>0</span><span>Cart</span></a><a href="my-account.html"' + cur('my-account.html') + '><i class="fa-regular fa-user" aria-hidden="true"></i><span>Account</span></a>';
    b.appendChild(bar);
    $('#kv-options').addEventListener('show.bs.offcanvas', syncOptUi);
  }
  function syncOptUi() {
    var home = d.body.classList.contains('home');
    $$('.opt-group, .opt-gh').forEach(function (g) { g.hidden = g.getAttribute('data-opt-home') === 'true' && !home; });
    $$('[data-kv-opt]').forEach(function (r) { r.checked = optState[r.getAttribute('data-kv-opt')] === r.value; });
  }

  /* ---------- quick view & compare UI ---------- */
  KV.quickView = function (id) {
    var p = KV.product(id), body = $('#kv-quick-body'); if (!p || !body || !w.bootstrap) return;
    body.innerHTML = '<div class="qv"><div class="qv-img"><img src="' + esc(p.images[0]) + '" alt="' + esc(p.name) + '"></div><div class="qv-info"><span class="product-brand">' + esc(p.brand) + '</span><h3>' + esc(p.name) + '</h3><div class="rating-row">' + KV.stars(p.rating, p.reviews) + '</div>' + KV.priceBlock(p) + saveLine(p) + '<ul class="product-bullets">' + (p.bullets || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' + easyLine(p) + stockLine(p) + '<div class="qv-buy"><div class="quantity"><label class="screen-reader-text" for="qv-qty">Quantity</label><input type="number" id="qv-qty" class="input-text qty text" value="1" min="1" max="20" inputmode="numeric"></div><button type="button" class="button alt" data-kv-add="' + esc(p.id) + '" data-kv-qty-input="#qv-qty" data-kv-dismiss-modal>Add to cart</button></div><a class="qv-more" href="' + KV.url(p) + '">View full details <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div></div>';
    w.bootstrap.Modal.getOrCreateInstance($('#kv-quick')).show();
  };
  function renderCompareBar() {
    var bar = $('.kv-compare-bar'); if (!bar) return; var ids = KV.compare.items();
    bar.hidden = !ids.length; d.body.classList.toggle('has-compare', !!ids.length);
    $('.cmp-thumbs', bar).innerHTML = ids.map(function (id) { var p = KV.product(id); return '<li><img src="' + esc(p.images[0]) + '" alt="' + esc(p.name) + '"><button type="button" data-kv-compare="' + esc(id) + '" aria-label="Remove ' + esc(p.name) + ' from compare">&times;</button></li>'; }).join('');
    $('.cmp-n', bar).textContent = ids.length;
  }
  function renderCompareDrawer() {
    var ps = KV.compare.items().map(KV.product).filter(Boolean), host = $('#kv-compare-body'); if (!host) return;
    if (!ps.length) { host.innerHTML = '<p>No products selected.</p>'; return; }
    var keys = {}; ps.forEach(function (p) { Object.keys(p.specs).forEach(function (k) { keys[k] = 1; }); });
    var row = function (l, f) { return '<tr><th scope="row">' + l + '</th>' + ps.map(function (p) { return '<td>' + f(p) + '</td>'; }).join('') + '</tr>'; };
    host.innerHTML = '<div class="table-responsive"><table class="kv-table cmp-table"><thead><tr><th><span class="visually-hidden">Feature</span></th>' + ps.map(function (p) { return '<th scope="col"><a href="' + KV.url(p) + '"><img src="' + esc(p.images[0]) + '" alt="" width="96" height="96"><span>' + esc(p.name) + '</span></a></th>'; }).join('') + '</tr></thead><tbody>' +
      row('Price', function (p) { return KV.priceBlock(p); }) + row('Rating', function (p) { return p.rating.toFixed(1) + ' (' + p.reviews + ')'; }) + row('Easy Payment', function (p) { var m = KV.easyMonthly(p); return m ? KV.fmt(m) + ' x ' + KV.easy.defaultTenure : '-'; }) +
      Object.keys(keys).map(function (k) { return row(esc(k), function (p) { return esc(p.specs[k] || '-'); }); }).join('') + row('', function (p) { return addBtn(p); }) + '</tbody></table></div>';
  }

  /* ---------- slider ---------- */
  KV.slider = function (root, o) {
    if (!root || root.__kv) return; root.__kv = 1;
    var track = $('.kv-slides', root), slides = $$('.kv-slide', root), n = slides.length, i = 0, timer = null, playing = true;
    var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches; if (reduce) playing = false;
    root.setAttribute('role', 'region'); root.setAttribute('aria-roledescription', 'carousel'); if (!root.getAttribute('aria-label')) root.setAttribute('aria-label', 'Featured offers');
    var ui = d.createElement('div'); ui.className = 'kv-slider-ui';
    ui.innerHTML = '<button type="button" class="s-prev" aria-label="Previous slide"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button><button type="button" class="s-next" aria-label="Next slide"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button><div class="s-dots">' + slides.map(function (_, k) { return '<button type="button" data-i="' + k + '" aria-label="Go to slide ' + (k + 1) + '"></button>'; }).join('') + '<button type="button" class="s-pause" aria-label="Pause slideshow"><i class="fa-solid fa-pause" aria-hidden="true"></i></button></div>';
    root.appendChild(ui);
    function go(k) { i = (k + n) % n; track.style.transform = 'translateX(-' + (i * 100) + '%)'; slides.forEach(function (s, j) { s.setAttribute('aria-hidden', j !== i); s.setAttribute('role', 'group'); s.setAttribute('aria-label', (j + 1) + ' of ' + n); $$('a,button', s).forEach(function (e) { e.tabIndex = j === i ? 0 : -1; }); }); $$('.s-dots [data-i]', ui).forEach(function (b, j) { b.classList.toggle('on', j === i); if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }); }
    function tick() { clearInterval(timer); if (playing && n > 1) timer = setInterval(function () { go(i + 1); }, (o && o.interval) || 6500); }
    ui.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('s-prev')) go(i - 1); else if (b.classList.contains('s-next')) go(i + 1);
      else if (b.classList.contains('s-pause')) { playing = !playing; b.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow'); $('i', b).className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'; }
      else if (b.hasAttribute('data-i')) go(+b.getAttribute('data-i'));
      tick();
    });
    root.addEventListener('mouseenter', function () { clearInterval(timer); }); root.addEventListener('mouseleave', tick); root.addEventListener('focusin', function () { clearInterval(timer); });
    var sx = null; root.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); tick(); } sx = null; });
    go(0); tick();
  };
  KV.countdown = function (el, end) {
    function t() { var s = Math.max(0, Math.floor((end - Date.now()) / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; el.innerHTML = '<span><b>' + String(h).padStart(2, '0') + '</b>hrs</span><span><b>' + String(m).padStart(2, '0') + '</b>min</span><span><b>' + String(x).padStart(2, '0') + '</b>sec</span>'; }
    t(); return setInterval(t, 1000);
  };

  /* ---------- delegated events ---------- */
  function bindEvents() {
    d.addEventListener('click', function (e) {
      var t = e.target, el;
      if ((el = t.closest('[data-kv-add]'))) {
        e.preventDefault();
        var qi = el.getAttribute('data-kv-qty-input'), q = el.getAttribute('data-qty') || (qi && $(qi) && $(qi).value) || 1;
        KV.cart.add(el.getAttribute('data-kv-add'), q);
        if (el.hasAttribute('data-kv-dismiss-modal') && w.bootstrap) { var m = w.bootstrap.Modal.getInstance($('#kv-quick')); if (m) m.hide(); }
        return;
      }
      if ((el = t.closest('[data-kv-wish]'))) { e.preventDefault(); var wid = el.getAttribute('data-kv-wish'); KV.wishlist.toggle(wid); KV.notice(KV.wishlist.has(wid) ? 'Added to your wishlist.' : 'Removed from your wishlist.', 'info'); return; }
      if ((el = t.closest('[data-kv-compare]'))) { e.preventDefault(); KV.compare.toggle(el.getAttribute('data-kv-compare')); return; }
      if ((el = t.closest('[data-kv-quick]'))) { e.preventDefault(); KV.quickView(el.getAttribute('data-kv-quick')); return; }
      if ((el = t.closest('[data-kv-open-cart]'))) { if (page === 'cart.html' || page === 'checkout.html') return; e.preventDefault(); KV.openCart(); return; }
      if ((el = t.closest('[data-kv-remove]'))) { e.preventDefault(); KV.cart.remove(el.getAttribute('data-kv-remove')); return; }
      if ((el = t.closest('[data-kv-step]'))) { var id = el.getAttribute('data-kv-step'), it = cartData.filter(function (x) { return x.id === id; })[0]; if (it) KV.cart.setQty(id, it.qty + (+el.getAttribute('data-d'))); return; }
      if ((el = t.closest('[data-kv-focus-search]'))) { var inp = $('.mhead-search input'); if (inp) inp.focus(); return; }
      if ((el = t.closest('[data-kv-toggle-search]'))) { var pn = $('#hdr2-search'), open = pn.hidden; pn.hidden = !open; el.setAttribute('aria-expanded', open); if (open) $('input', pn).focus(); return; }
      if ((el = t.closest('[data-kv-dismiss-announce]'))) { save('kv-announce-off', 1); var a = $('.hdr-announce'); if (a) a.remove(); return; }
      if (t.closest('[data-kv-opt-reset]')) { KV.options.reset(); syncOptUi(); return; }
      if (t.closest('[data-kv-compare-open]')) { renderCompareDrawer(); var o = oc('kv-compare-drawer'); if (o) o.show(); return; }
      if (t.closest('[data-kv-compare-clear]')) { KV.compare.clear(); return; }
      if (!t.closest('.kv-search')) $$('.kv-suggest').forEach(function (u) { u.hidden = true; });
    });
    d.addEventListener('change', function (e) { var r = e.target.closest && e.target.closest('[data-kv-opt]'); if (r) KV.options.set(r.getAttribute('data-kv-opt'), r.value); });
    d.addEventListener('submit', function (e) { var f = e.target.closest && e.target.closest('[data-kv-news]'); if (f) { e.preventDefault(); $('.news-msg', f).hidden = false; $('input', f).value = ''; } });
    d.addEventListener('input', function (e) {
      var inp = e.target; if (!inp.matches || !inp.matches('.kv-search input[type=search]')) return;
      var box = $('.kv-suggest', inp.parentNode), q = inp.value.trim().toLowerCase();
      if (q.length < 2) { box.hidden = true; return; }
      var m = PRODS.filter(function (p) { return (p.name + ' ' + p.model + ' ' + p.brand).toLowerCase().indexOf(q) > -1; }).slice(0, 5);
      box.innerHTML = m.length ? m.map(function (p) { return '<li><a href="' + KV.url(p) + '"><img src="' + esc(p.images[0]) + '" alt="" width="40" height="40"><span>' + esc(p.name) + '</span><b>' + KV.fmt(p.price) + '</b></a></li>'; }).join('') : '<li class="none">No products found</li>';
      box.hidden = false;
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') $$('.kv-suggest').forEach(function (u) { u.hidden = true; }); });
    w.addEventListener('kv:cart', function () { KV.sync(); renderCart(); });
    w.addEventListener('kv:wishlist', KV.sync);
    w.addEventListener('kv:compare', function () { KV.sync(); renderCompareBar(); if ($('#kv-compare-drawer.show')) renderCompareDrawer(); });
    w.addEventListener('storage', function (e) { if (e.key === 'kv-cart') { cartData = load('kv-cart', []); KV.sync(); renderCart(); } });
  }

  /* ---------- init ---------- */
  function init() {
    applyOpts(); buildShared(); bindEvents();
    KV.renderHeader(); KV.renderFooter(); renderCart(); renderCompareBar(); KV.sync();
    inited = true; readyQ.forEach(function (f) { f(); }); readyQ = [];
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
