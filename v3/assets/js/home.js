/* Homepage sections driven by theme options: hero, categories, product rails; plus Easy Payment calculator. Needs theme.js. */
(function (w, d) {
  'use strict';
  var KV = w.KV, D = w.KV_DATA, esc = KV.esc, $ = KV.$, $$ = KV.$$;
  var timers = [];

  /* ---------- hero ---------- */
  function pic(b, eager) {
    return '<picture>' + (b.imgMobile ? '<source media="(max-width:767px)" srcset="' + esc(b.imgMobile) + '">' : '') + '<img src="' + esc(b.img) + '" alt="' + esc(b.alt || '') + '" ' + (eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"') + ' width="1320" height="520" decoding="async"></picture>';
  }
  function slide(s, i) { return '<div class="kv-slide kv-imgslide"><a href="' + esc(s.link) + '">' + pic(s, !i) + '</a></div>'; }
  function sideBanner(b) { return '<a class="side-banner kv-imgbanner" href="' + esc(b.link) + '">' + pic(b) + '</a>'; }
  function hero() {
    $$('.kv-slider', $('#home-hero')).forEach(function (slider) { if (slider.__dispose) slider.__dispose(); });
    var o = d.body.getAttribute('data-hero') || '1', B = D.banners, h;
    if (o === '2') {
      var s = B.slides[1];
      h = '<div class="hero-fullbleed"><div class="kv-slider hero-slider hero-slider-wide"><div class="kv-slides">' + B.slides.map(function (b, i) { return slide({ img: b.imgWide || b.img, imgMobile: b.imgMobile, link: b.link, alt: b.alt }, i); }).join('') + '</div></div></div>' +
        '<div class="container"><ul class="service-tiles"><li><i class="fa-solid fa-truck-fast" aria-hidden="true"></i><span><strong>Free delivery</strong>Colombo, orders over Rs 50,000</span></li><li><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><span><strong>Warranty</strong>Genuine manufacturer cover</span></li><li><i class="fa-solid fa-calendar-check" aria-hidden="true"></i><span><strong>Easy Payment</strong>6 to 36 monthly instalments</span></li><li><i class="fa-solid fa-store" aria-hidden="true"></i><span><strong>6 showrooms</strong>Visit and test in store</span></li></ul></div>';
    } else if (o === '3') {
      h = '<div class="container"><div class="hero3-grid"><nav class="hero-catlist" aria-label="Shop by category"><h2>Shop by category</h2><ul>' + D.categories.map(function (c) { return '<li><a href="shop.html?cat=' + c.id + '"><i class="' + c.icon + '" aria-hidden="true"></i><span>' + esc(c.name) + '</span><i class="fa-solid fa-chevron-right chev" aria-hidden="true"></i></a></li>'; }).join('') + '</ul></nav><div class="kv-slider hero-slider h480"><div class="kv-slides">' + B.slides.map(slide).join('') + '</div></div></div></div>';
    } else {
      h = '<div class="container"><div class="hero1-grid"><div class="kv-slider hero-slider h460"><div class="kv-slides">' + B.slides.map(slide).join('') + '</div></div><div class="hero-side">' + B.side.map(sideBanner).join('') + '</div></div></div>';
    }
    var host = $('#home-hero'); host.className = 'hero hero-' + o; host.innerHTML = h;
    $$('.kv-slider', host).forEach(function (s) { KV.slider(s); });
  }

  /* ---------- categories ---------- */
  function cats() {
    var o = d.body.getAttribute('data-cats') || '1', C = D.categories, h;
    if (o === '2') h = '<div class="cat-iconrow">' + C.map(function (c) { return '<a href="shop.html?cat=' + c.id + '" class="cat-icon"><span class="box"><i class="' + c.icon + '" aria-hidden="true"></i></span><span class="lbl">' + esc(c.name) + '</span></a>'; }).join('') + '</div>';
    else if (o === '3') h = '<div class="cat-circles">' + C.map(function (c) { return '<a href="shop.html?cat=' + c.id + '" class="cat-circle"><img src="' + esc(c.image) + '" alt="" loading="lazy" width="120" height="120"><span class="lbl">' + esc(c.name) + '</span></a>'; }).join('') + '</div>';
    else h = '<div class="cat-tiles">' + C.map(function (c) { return '<a href="shop.html?cat=' + c.id + '" class="cat-tile"><span class="ph"><img src="' + esc(c.image) + '" alt="" loading="lazy" width="400" height="300"></span><span class="nm">' + esc(c.name) + '</span><span class="cn">' + c.count + ' products</span></a>'; }).join('') + '</div>';
    $('#home-cats').innerHTML = h;
  }

  /* ---------- rails ---------- */
  var P = D.products;
  function bySaving(a, b) { return KV.saving(b).pct - KV.saving(a).pct; }
  var RAILS = [
    { id: 'rail-best', opt: 'rail1', eyebrow: 'Most loved', title: 'Best sellers', link: 'shop.html?sort=popularity', list: function () { return P.filter(function (p) { return p.bestseller; }).sort(function (a, b) { return b.reviews - a.reviews; }); },
      tabs: [{ l: 'All', f: null }, { l: 'Appliances', f: function (p) { return /refrigerators|washing|air-cond|kitchen|small/.test(p.category); } }, { l: 'Furniture', f: function (p) { return p.category === 'furniture'; } }, { l: 'TV, laptops & phones', f: function (p) { return /tv-audio|laptops/.test(p.category); } }], deal: false },
    { id: 'rail-deals', opt: 'rail2', eyebrow: 'Limited time', title: 'Deals this week', link: 'shop.html?sort=deals', list: function () { return P.filter(function (p) { return p.rrp > p.price; }).sort(bySaving); },
      tabs: [{ l: 'All deals', f: null }, { l: 'Under Rs 50,000', f: function (p) { return p.price < 50000; } }, { l: 'Rs 50,000 to 150,000', f: function (p) { return p.price >= 50000 && p.price <= 150000; } }, { l: 'Over Rs 150,000', f: function (p) { return p.price > 150000; } }], deal: true },
    { id: 'rail-new', opt: 'rail3', eyebrow: 'Just landed', title: 'New arrivals in furniture', link: 'shop.html?cat=furniture&sort=date', list: function () { return P.filter(function (p) { return p.category === 'furniture'; }).sort(function (a, b) { return (b.badges.indexOf('New') > -1) - (a.badges.indexOf('New') > -1); }); },
      tabs: [{ l: 'All', f: null }, { l: 'Sofas', f: function (p) { return /sofa/i.test(p.name); } }, { l: 'Bedroom', f: function (p) { return /bed|mattress|wardrobe/i.test(p.name); } }, { l: 'Dining & office', f: function (p) { return /dining|desk|chair/i.test(p.name); } }], deal: false }
  ];
  function head(r, extra) { return '<div class="kv-section-head"><span class="kv-eyebrow">' + r.eyebrow + '</span><h2>' + r.title + '</h2>' + (extra || '') + '<a class="kv-viewall" href="' + r.link + '">View all <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>'; }
  function railHtml(r, o) {
    var all = r.list(), h;
    if (!all.length) return head(r) + '<p class="woocommerce-info">No products in this group yet.</p>';
    if (o === '2') {
      h = head(r, '<span class="rail-arrows"><button type="button" data-scroll="-1" aria-label="Scroll left"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button><button type="button" data-scroll="1" aria-label="Scroll right"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></span>') +
        '<div class="rail-carousel"><div class="rail-track" tabindex="0" role="group" aria-label="' + esc(r.title) + '">' + KV.grid(all.slice(0, 10), { cls: 'rail-list' }) + '</div></div>';
    } else if (o === '3') {
      var f = all[0], rest = all.slice(1, 5);
      h = head(r, r.deal ? '<span class="deal-timer-wrap">Ends in <span class="deal-timer" data-end></span></span>' : '') +
        '<div class="rail-deal"><article class="deal-feature"><span class="deal-flag">' + (r.deal ? 'Deal of the day' : 'Top pick') + '</span><a href="' + KV.url(f) + '" class="df-img"><img src="' + esc(f.images[0]) + '" alt="' + esc(f.name) + '"></a><div class="df-info"><span class="product-brand">' + esc(f.brand) + '</span><h3><a href="' + KV.url(f) + '">' + esc(f.name) + '</a></h3><p class="product-keyspec">' + esc(f.keySpec) + '</p>' + KV.priceBlock(f) + (KV.saving(f).amount ? '<span class="save-line">Save ' + KV.fmt(KV.saving(f).amount) + '</span>' : '') + (KV.easyMonthly(f) ? '<span class="easy-line"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Easy Payment: <strong>' + KV.fmt(KV.easyMonthly(f)) + '</strong> x 12 months</span>' : '') + '<a class="button alt add_to_cart_button" href="?add-to-cart=' + esc(f.id) + '" data-kv-add="' + esc(f.id) + '">Add to cart</a></div></article>' + KV.grid(rest, { cols: 2, cls: 'deal-grid' }) + '</div>';
    } else {
      h = head(r) + '<div class="kv-tabs" role="tablist" aria-label="' + esc(r.title) + '">' + r.tabs.map(function (t, i) { return '<button type="button" role="tab" tabindex="' + (i ? '-1' : '0') + '" class="kv-tab" aria-selected="' + (i === 0) + '" data-tab="' + i + '">' + esc(t.l) + '</button>'; }).join('') + '</div><div class="rail-panel" role="tabpanel">' + KV.grid(all.slice(0, 8), { cols: 4 }) + '</div>';
    }
    return h;
  }
  function rails() {
    timers.forEach(clearInterval); timers = [];
    RAILS.forEach(function (r) {
      var o = d.body.getAttribute('data-' + r.opt) || '1';
      var host = $('#' + r.id); if (!host) return;
      host.setAttribute('data-rail-variant', o); host.innerHTML = railHtml(r, o);
      var t = $('.deal-timer', host); if (t) { var e = new Date(); e.setHours(23, 59, 59, 0); timers.push(KV.countdown(t, e.getTime())); }
      host.__r = r;
    });
    KV.sync();
  }
  d.addEventListener('click', function (e) {
    var tab = e.target.closest('.kv-tab');
    if (tab && tab.closest('.rail')) {
      var host = tab.closest('.rail'), r = host.__r, i = +tab.getAttribute('data-tab'), f = r.tabs[i].f, list = r.list().filter(f || function () { return true; }).slice(0, 8);
      $$('.kv-tab', host).forEach(function (b) { b.setAttribute('aria-selected', b === tab); b.tabIndex = b === tab ? 0 : -1; });
      $('.rail-panel', host).innerHTML = list.length ? KV.grid(list, { cols: 4 }) : '<p class="woocommerce-info">No products in this group yet.</p>'; KV.sync(); return;
    }
    var sc = e.target.closest('[data-scroll]');
    if (sc) { var tr = $('.rail-track', sc.closest('.rail')); tr.scrollBy({ left: +sc.getAttribute('data-scroll') * Math.max(280, tr.clientWidth * 0.8), behavior: 'smooth' }); }
  });

  d.addEventListener('keydown', function (e) {
    var tab = e.target.closest('.rail .kv-tab'); if (!tab) return;
    var tabs = $$('.kv-tab', tab.closest('.rail')), i = tabs.indexOf(tab), n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') n = 0; if (e.key === 'End') n = tabs.length - 1;
    if (n !== null) { e.preventDefault(); tabs[n].click(); tabs[n].focus(); }
  });

  /* Buying guides open complete, useful articles without leaving the store. */
  var GUIDES = [
    { title: 'How to choose an inverter fridge', cat: 'refrigerators', sections: [
      ['Measure the space first', 'Check the available width, height and depth, plus the doorway and route into your kitchen. Leave the ventilation clearance specified by the manufacturer and enough room for the doors to open.'],
      ['Choose capacity for your household', 'Compare usable capacity, freezer space and shelf layout with your shopping routine. Bring measurements of larger containers you use regularly.'],
      ['Compare the running cost and cover', 'Check the model’s energy label and annual electricity use. Ask what the compressor warranty covers separately from the full appliance warranty, and whether delivery and installation are included.'] ] },
    { title: 'Sofa fabric guide: what lasts in a Sri Lankan home', cat: 'furniture', sections: [
      ['Start with everyday use', 'For a busy family room, ask about abrasion resistance, removable covers and the recommended cleaning method. Examine the frame, cushion support and stitching in the showroom.'],
      ['Check fabric in real light', 'View a fabric sample in daylight and under your room lighting. Think about pets, young children, direct sunlight and how often you can maintain the upholstery.'],
      ['Measure the room and delivery route', 'Record the sofa dimensions, door widths, stair turns and lift opening. Leave comfortable walking space and confirm whether delivery includes assembly or carrying upstairs.'] ] },
    { title: 'AC size by room: what to check', cat: 'air-conditioners', sections: [
      ['Room size is the starting point', 'Measure room length, width and ceiling height. Cooling needs also depend on sun exposure, roof insulation, windows, occupancy and heat-producing equipment.'],
      ['Ask for a site assessment', 'Have a qualified installer confirm capacity and placement before buying. An oversized or undersized unit can affect comfort and efficiency; floor area alone is not enough.'],
      ['Compare the installed price', 'Ask whether the quote includes pipe length, brackets, electrical work, drainage and commissioning. Check the model’s efficiency label, warranty conditions and maintenance requirements.'] ] }
  ];
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-guide]'); if (!a || !w.bootstrap) return; e.preventDefault();
    var g = GUIDES[+a.dataset.guide], modal = $('#buying-guide-modal'); if (!g) return;
    if (!modal) { modal = d.createElement('div'); modal.id = 'buying-guide-modal'; modal.className = 'modal fade'; modal.tabIndex = -1; modal.setAttribute('aria-labelledby', 'buying-guide-title'); modal.innerHTML = '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"><article class="modal-content"><div class="modal-header"><h2 class="modal-title h4" id="buying-guide-title"></h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close buying guide"></button></div><div class="modal-body guide-copy"></div></article></div>'; d.body.appendChild(modal); }
    $('#buying-guide-title', modal).textContent = g.title;
    $('.modal-body', modal).innerHTML = '<p class="kv-eyebrow">Kavindu buying guide</p>' + g.sections.map(function (s) { return '<h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p>'; }).join('') + '<a class="button" href="shop.html?cat=' + g.cat + '">Browse ' + esc(KV.category(g.cat).name) + '</a>';
    var instance = w.bootstrap.Modal.getOrCreateInstance(modal); modal.addEventListener('hidden.bs.modal', function () { a.focus(); }, { once: true }); instance.show();
  });

  /* ---------- Easy Payment calculator (band) ---------- */
  function calc() {
    var f = $('#home-calc'); if (!f) return;
    var price = $('#hc-price', f), down = $('#hc-down', f), out = $('#hc-out', f), months = KV.easy.defaultTenure;
    f.querySelector('.hc-tenures').innerHTML = KV.easy.tenures.map(function (t) { return '<button type="button" class="kv-chip" data-m="' + t.months + '" aria-pressed="' + (t.months === months) + '">' + t.months + ' mo</button>'; }).join('');
    function run() {
      var p = Math.max(KV.easy.minPrice, parseInt(String(price.value).replace(/\D/g, ''), 10) || 0), c = KV.calc(p, +down.value, months);
      var apply = f.querySelector('a'); if (apply) apply.href = 'easy-payment.html?price=' + p + '&months=' + months + '&down=' + down.value;
      out.innerHTML = '<span class="hc-monthly">' + KV.fmt(c.monthly) + '<small> / month x ' + months + '</small></span><span class="hc-line">Down payment ' + KV.fmt(c.down) + '</span><span class="hc-line">Total payable ' + KV.fmt(c.total) + '</span>' + KV.planNote(c);
    }
    f.addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (!b) return; months = +b.getAttribute('data-m'); $$('[data-m]', f).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); run(); });
    f.addEventListener('input', run); f.addEventListener('submit', function (e) { e.preventDefault(); });
    run();
  }

  function showroom() {
    var sel = $('#sr-sel'), card = $('#sr-card'); if (!sel) return;
    sel.innerHTML = D.stores.map(function (s, i) { return '<option value="' + i + '">' + esc(s.name) + '</option>'; }).join('');
    function show() { var s = D.stores[+sel.value]; card.innerHTML = '<strong>' + esc(s.name) + '</strong><br>' + esc(s.address) + '<br>' + esc(s.hours) + '<br><a href="tel:' + s.phone.replace(/\s/g, '') + '">' + esc(s.phone) + '</a>'; }
    sel.addEventListener('change', show); show();
  }
  function all() { hero(); cats(); rails(); }
  KV.ready(function () { all(); calc(); showroom(); });
  w.addEventListener('kv:options', function (e) {
    var k = e.detail.key;
    if (k === 'hero') hero(); else if (k === 'cats') cats(); else if (/^rail/.test(k) || k === 'card') rails(); else if (k === 'all') all();
  });
})(window, document);
