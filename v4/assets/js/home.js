/* Homepage sections driven by v4 slots and theme options. */
(function (w, d) {
  'use strict';
  var KV = w.KV, D = w.KV_DATA, esc = KV.esc, $ = KV.$, $$ = KV.$$, timers = [];

  function imgSrc(src) { return src || ''; }
  function picture(b, cls, eager, dims) {
    dims = dims || [1320, 520, '1320 × 520 px'];
    var missing = !b || !b.img;
    if (missing) return '<span class="kv-banner-placeholder ' + (cls || '') + '" role="img" aria-label="Banner image unavailable">Banner image slot · ' + dims[2] + '</span>';
    var source = b.imgMobile ? '<source media="(max-width: 767px)" srcset="' + esc(imgSrc(b.imgMobile)) + '">' : '';
    return '<picture class="' + (cls || '') + '">' + source + '<img src="' + esc(imgSrc(b.img)) + '" width="' + dims[0] + '" height="' + dims[1] + '" alt="' + esc(b.alt || '') + '" loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async" ' + (eager ? 'fetchpriority="high"' : '') + '></picture>';
  }
  function bannerLink(b, cls, eager, dims) {
    if (!b) return '';
    return '<a class="kv-banner-link ' + (cls || '') + '" href="' + esc(b.link || '#') + '">' + picture(b, '', eager, dims) + '</a>';
  }
  function slide(b, i) { return '<div class="kv-slide">' + bannerLink(b, '', i === 0, [1320, 520, '1320 × 520 px']) + '</div>'; }

  function hero() {
    var o = d.body.getAttribute('data-hero') || '1', B = KV.banners(), slides = (B.heroSlides || []).filter(function (b) { return b && b.visible !== false; }), h;
    var slider = slides.length ? '<div class="kv-slider hero-slider"><div class="kv-slides">' + slides.map(slide).join('') + '</div></div>' : '';
    if (o === '2') h = '<div class="container hero-full-wrap">' + slider + '</div>';
    else if (o === '3') h = '<div class="container"><div class="hero3-grid"><nav class="hero-catlist" aria-label="Shop by category"><h2>Shop by category</h2><ul>' + D.categories.map(function (c) { return '<li><a href="shop.html?cat=' + c.id + '"><i class="' + c.icon + '" aria-hidden="true"></i><span>' + esc(c.name) + '</span><i class="fa-solid fa-chevron-right chev" aria-hidden="true"></i></a></li>'; }).join('') + '</ul></nav>' + slider + '</div></div>';
    else { var side = (B.heroSide || []).filter(function (b) { return b && b.visible !== false; }); h = '<div class="container"><div class="hero1-grid">' + slider + (side.length ? '<div class="hero-side">' + side.map(function (b) { return bannerLink(b, 'side-banner', false, [640, 252, '640 × 252 px']); }).join('') + '</div>' : '') + '</div></div>'; }
    var host = $('#home-hero'); host.className = 'hero hero-' + o; host.innerHTML = h;
    $$('.kv-slider', host).forEach(function (s) { KV.slider(s, { interval: 5000 }); });
  }

  function serviceStrip() {
    var host = $('#home-services'); if (!host) return;
    host.innerHTML = '<ul class="service-tiles"><li><i class="fa-solid fa-truck-fast" aria-hidden="true"></i><span><strong>Islandwide delivery</strong>Reliable delivery across Sri Lanka</span></li><li><i class="fa-solid fa-calendar-check" aria-hidden="true"></i><span><strong>Easy Payment</strong>Up to 36 monthly instalments</span></li><li><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><span><strong>Genuine warranty</strong>Manufacturer-backed cover</span></li><li><i class="fa-solid fa-store" aria-hidden="true"></i><span><strong>Showrooms</strong>Visit and test before you buy</span></li></ul>';
  }

  function cats() {
    var o = d.body.getAttribute('data-cats') || '1', C = D.categories, h;
    if (o === '2') h = '<div class="cat-tiles">' + C.map(function (c) { return '<a href="shop.html?cat=' + c.id + '" class="cat-tile"><span class="ph"><img src="' + esc(c.image) + '" alt="" loading="lazy" width="400" height="300"></span><span class="nm">' + esc(c.name) + '</span><span class="cn">' + c.count + ' products</span></a>'; }).join('') + '</div>';
    else if (o === '3') h = '<div class="cat-iconrow">' + C.map(function (c) { return '<a href="shop.html?cat=' + c.id + '" class="cat-icon"><span class="box"><i class="' + c.icon + '" aria-hidden="true"></i></span><span class="lbl">' + esc(c.name) + '</span></a>'; }).join('') + '</div>';
    else h = '<div class="cat-circles">' + C.map(function (c) { return '<a href="shop.html?cat=' + c.id + '" class="cat-circle"><img src="' + esc(c.image) + '" alt="" loading="lazy" width="128" height="128"><span class="lbl">' + esc(c.name) + '</span><small>' + c.count + ' products</small></a>'; }).join('') + '</div>';
    $('#home-cats').innerHTML = h;
  }

  function promoRow() {
    var host = $('#home-promos'), B = KV.banners(); if (!host) return;
    host.innerHTML = (B.promoRow || []).filter(function (b) { return b && b.visible !== false; }).map(function (b) { return bannerLink(b, 'promo-slot', false, [424, 220, '424 × 220 px']); }).join('');
  }
  function wideBanner() { var host = $('#home-wide-banner'), b = KV.banners().wideBanner; if (host) host.innerHTML = b && b.visible !== false ? bannerLink(b, 'wide-slot', false, [1320, 200, '1320 × 200 px']) : ''; }
  function furnitureBanner() { var host = $('#home-furniture-banner'), b = KV.banners().furniture; if (host) host.innerHTML = b && b.visible !== false ? bannerLink(b, 'furniture-slot', false, [640, 560, '640 × 560 px']) : ''; }

  var P = D.products;
  function cardImage(p) { var src = p.images[0]; return /images\.unsplash\.com/.test(src) ? src.replace(/([?&]w=)\d+/, '$1600') : src; }
  function bySaving(a, b) { return KV.saving(b).pct - KV.saving(a).pct; }
  var RAILS = [
    { id: 'rail-best', opt: 'rail1', eyebrow: 'Most loved', title: 'Best sellers', link: 'shop.html?sort=popularity', list: function () { return P.filter(function (p) { return p.bestseller; }).sort(function (a, b) { return b.reviews - a.reviews; }); }, tabs: [{ l: 'All', f: null }, { l: 'Appliances', f: function (p) { return /refrigerators|washing|air-cond|kitchen|small/.test(p.category); } }, { l: 'Furniture', f: function (p) { return p.category === 'furniture'; } }], deal: false },
    { id: 'rail-deals', opt: 'rail2', eyebrow: 'Limited time', title: 'Deals this week', link: 'shop.html?sort=deals', list: function () { return P.filter(function (p) { return p.rrp > p.price; }).sort(bySaving); }, tabs: [{ l: 'All deals', f: null }, { l: 'Under Rs 50,000', f: function (p) { return p.price < 50000; } }, { l: 'Over Rs 50,000', f: function (p) { return p.price >= 50000; } }], deal: true },
    { id: 'rail-new', opt: 'rail3', eyebrow: 'Just landed', title: 'New arrivals in furniture', link: 'shop.html?cat=furniture&sort=date', list: function () { return P.filter(function (p) { return p.category === 'furniture'; }).sort(function (a, b) { return (b.badges || []).indexOf('New') - (a.badges || []).indexOf('New'); }); }, tabs: [{ l: 'All', f: null }, { l: 'Sofas', f: function (p) { return /sofa/i.test(p.name); } }, { l: 'Bedroom', f: function (p) { return /bed|mattress|wardrobe/i.test(p.name); } }], deal: false }
  ];
  function head(r, extra) { return '<div class="kv-section-head"><span class="kv-eyebrow">' + r.eyebrow + '</span><h2>' + r.title + '</h2>' + (extra || '') + '<a class="kv-viewall" href="' + r.link + '">View all <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>'; }
  function railHtml(r, o) {
    var all = r.list();
    if (o === '2') return head(r, '<span class="rail-arrows"><button type="button" data-scroll="-1" aria-label="Scroll left">&lsaquo;</button><button type="button" data-scroll="1" aria-label="Scroll right">&rsaquo;</button></span>') + '<div class="rail-carousel"><div class="rail-track" tabindex="0" role="group" aria-label="' + esc(r.title) + '">' + KV.grid(all.slice(0, 10), { cls: 'rail-list' }) + '</div></div>';
    if (o === '3') { var f = all[0], rest = all.slice(1, 5); return head(r, r.deal ? '<span class="deal-timer-wrap">Ends in <span class="deal-timer" data-end></span></span>' : '') + (f ? '<div class="rail-deal"><article class="deal-feature"><a href="' + KV.url(f) + '" class="df-img"><img src="' + esc(cardImage(f)) + '" width="600" height="600" loading="lazy" decoding="async" alt="' + esc(f.name) + '"></a><div class="df-info"><span class="product-brand">' + esc(f.brand) + '</span><h3><a href="' + KV.url(f) + '">' + esc(f.name) + '</a></h3>' + KV.priceBlock(f) + '<a class="button alt add_to_cart_button" href="?add-to-cart=' + esc(f.id) + '" data-kv-add="' + esc(f.id) + '">Add to cart</a></div></article>' + KV.grid(rest, { cols: 2, cls: 'deal-grid' }) + '</div>' : ''); }
    return head(r) + '<div class="kv-tabs" role="tablist" aria-label="' + esc(r.title) + '">' + r.tabs.map(function (t, i) { return '<button type="button" role="tab" class="kv-tab" aria-selected="' + (i === 0) + '" data-tab="' + i + '">' + esc(t.l) + '</button>'; }).join('') + '</div><div class="rail-panel" role="tabpanel">' + KV.grid(all.slice(0, 8), { cols: 4 }) + '</div>';
  }
  function rails() {
    timers.forEach(clearInterval); timers = [];
    RAILS.forEach(function (r) { var host = $('#' + r.id); if (!host) return; var o = d.body.getAttribute('data-' + r.opt) || '1'; host.setAttribute('data-rail-variant', o); host.innerHTML = railHtml(r, o); host.__r = r; var t = $('.deal-timer', host); if (t) { var e = new Date(); e.setHours(23, 59, 59, 0); timers.push(KV.countdown(t, e.getTime())); } }); KV.sync();
  }
  d.addEventListener('click', function (e) { var tab = e.target.closest('.kv-tab'); if (tab && tab.closest('.rail')) { var host = tab.closest('.rail'), r = host.__r, i = +tab.getAttribute('data-tab'), f = r.tabs[i].f, list = r.list().filter(f || function () { return true; }).slice(0, 8); $$('.kv-tab', host).forEach(function (b) { b.setAttribute('aria-selected', b === tab); }); $('.rail-panel', host).innerHTML = KV.grid(list, { cols: 4 }); KV.sync(); return; } var sc = e.target.closest('[data-scroll]'); if (sc) { var tr = $('.rail-track', sc.closest('.rail')); if (tr) tr.scrollBy({ left: +sc.getAttribute('data-scroll') * Math.max(280, tr.clientWidth * .8), behavior: 'smooth' }); } });

  function calc() {
    var f = $('#home-calc'); if (!f) return; var price = $('#hc-price', f), down = $('#hc-down', f), out = $('#hc-out', f), months = KV.easy.defaultTenure;
    f.querySelector('.hc-tenures').innerHTML = KV.easy.tenures.map(function (t) { return '<button type="button" class="kv-chip" data-m="' + t.months + '" aria-pressed="' + (t.months === months) + '">' + t.months + ' mo</button>'; }).join('');
    function run() { var p = Math.max(KV.easy.minPrice, parseInt(String(price.value).replace(/\D/g, ''), 10) || 0), c = KV.calc(p, +down.value, months); out.innerHTML = '<span class="hc-monthly">' + KV.fmt(c.monthly) + '<small> / month x ' + months + '</small></span><span class="hc-line">Down payment ' + KV.fmt(c.down) + '</span><span class="hc-line">Total payable ' + KV.fmt(c.total) + '</span>'; }
    f.addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (!b) return; months = +b.getAttribute('data-m'); $$('[data-m]', f).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); run(); }); f.addEventListener('input', run); f.addEventListener('submit', function (e) { e.preventDefault(); }); run();
  }
  function all() { hero(); serviceStrip(); cats(); promoRow(); wideBanner(); furnitureBanner(); rails(); }
  KV.ready(function () { all(); calc(); });
  w.addEventListener('kv:options', function (e) { var k = e.detail.key; if (k === 'hero') hero(); else if (k === 'cats') cats(); else if (/^rail/.test(k) || k === 'card') rails(); else if (k === 'all') all(); });
})(window, document);
