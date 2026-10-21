/* Shop archive: filters, sorting, pagination, grid/list. Needs theme.js. */
(function (w, d) {
  'use strict';
  var KV = w.KV, D = w.KV_DATA, esc = KV.esc, $ = KV.$, $$ = KV.$$;
  var ALL = D.products, qs = new URLSearchParams(location.search);
  var S = {
    cat: qs.get('cat') || '', q: (qs.get('q') || '').trim(), sort: qs.get('sort') || 'menu_order',
    brands: qs.getAll('brand'), min: qs.get('min') || '', max: qs.get('max') || '', easy: qs.get('easy') || '',
    stock: qs.get('stock') === '1', rating: qs.get('rating') || '', page: Math.max(1, parseInt(qs.get('page'), 10) || 1),
    per: parseInt(qs.get('per'), 10) || 12, view: qs.get('view') === 'list' ? 'list' : 'grid'
  };
  if (['12', '24', '36'].indexOf(String(S.per)) < 0) S.per = 12;
  var idx = {}; ALL.forEach(function (p, i) { idx[p.id] = i; });

  function easyM(p) { return KV.easyMonthly(p) || 0; }
  function matches(p, skip) {
    if (skip !== 'cat' && S.cat && p.category !== S.cat) return false;
    if (S.q) { var hay = (p.name + ' ' + p.brand + ' ' + p.model + ' ' + p.category + ' ' + p.keySpec).toLowerCase(); if (S.q.toLowerCase().split(/\s+/).some(function (t) { return hay.indexOf(t) < 0; })) return false; }
    if (skip !== 'brand' && S.brands.length && S.brands.indexOf(p.brand) < 0) return false;
    if (S.min !== '' && p.price < +S.min) return false;
    if (S.max !== '' && p.price > +S.max) return false;
    if (S.easy && !(easyM(p) && easyM(p) <= +S.easy)) return false;
    if (S.stock && p.stock === 'Out of stock') return false;
    if (S.rating && p.rating < +S.rating) return false;
    return true;
  }
  function sorted(list) {
    var l = list.slice();
    var f = { popularity: function (a, b) { return b.reviews - a.reviews; }, rating: function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; },
      date: function (a, b) { return idx[b.id] - idx[a.id]; }, price: function (a, b) { return a.price - b.price; }, 'price-desc': function (a, b) { return b.price - a.price; } }[S.sort];
    return f ? l.sort(f) : l;
  }
  function url(over) {
    var s = Object.assign({}, S, over || {}), p = new URLSearchParams();
    if (s.cat) p.set('cat', s.cat); if (s.q) p.set('q', s.q); if (s.sort !== 'menu_order') p.set('sort', s.sort);
    s.brands.forEach(function (b) { p.append('brand', b); });
    ['min', 'max', 'easy', 'rating'].forEach(function (k) { if (s[k] !== '') p.set(k, s[k]); });
    if (s.stock) p.set('stock', '1'); if (s.page > 1) p.set('page', s.page); if (s.per !== 12) p.set('per', s.per); if (s.view === 'list') p.set('view', 'list');
    var t = p.toString(); return 'shop.html' + (t ? '?' + t : '');
  }
  function push() { try { history.replaceState(null, '', url()); } catch (e) {} }

  /* ---------- sidebar ---------- */
  function group(id, title, body, open) {
    return '<div class="f-group"><button type="button" class="f-head" data-bs-toggle="collapse" data-bs-target="#fg-' + id + '" aria-expanded="' + (open !== false) + '" aria-controls="fg-' + id + '">' + title + '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button><div class="collapse' + (open !== false ? ' show' : '') + '" id="fg-' + id + '"><div class="f-body">' + body + '</div></div></div>';
  }
  function buildFilters() {
    var base = ALL.filter(function (p) { return matches(p, 'cat'); });
    var cats = '<ul class="f-list"><li><a href="#" data-cat="" class="' + (!S.cat ? 'on' : '') + '">All products <span>' + base.length + '</span></a></li>' +
      D.categories.map(function (c) { var n = base.filter(function (p) { return p.category === c.id; }).length; return '<li><a href="#" data-cat="' + c.id + '" class="' + (S.cat === c.id ? 'on' : '') + '"' + (S.cat === c.id ? ' aria-current="true"' : '') + '>' + esc(c.name) + ' <span>' + n + '</span></a></li>'; }).join('') + '</ul>';
    var brands = {}; ALL.filter(function (p) { return matches(p, 'brand'); }).forEach(function (p) { brands[p.brand] = (brands[p.brand] || 0) + 1; });
    S.brands.forEach(function (b) { if (!brands[b]) brands[b] = 0; });
    var bh = '<ul class="f-list f-checks">' + Object.keys(brands).sort().map(function (b, i) { return '<li><label><input type="checkbox" name="brand" value="' + esc(b) + '"' + (S.brands.indexOf(b) > -1 ? ' checked' : '') + '> <span class="lb">' + esc(b) + '</span><span class="ct">' + brands[b] + '</span></label></li>'; }).join('') + '</ul>';
    var price = '<div class="f-price"><div><label for="f-min">Min (Rs)</label><input class="input-text" id="f-min" name="min" type="number" min="0" step="1000" inputmode="numeric" placeholder="0" value="' + esc(S.min) + '"></div><span aria-hidden="true">to</span><div><label for="f-max">Max (Rs)</label><input class="input-text" id="f-max" name="max" type="number" min="0" step="1000" inputmode="numeric" placeholder="Any" value="' + esc(S.max) + '"></div></div>' +
      '<div class="f-quick">' + [['Under 50,000', '', 50000], ['50,000 - 150,000', 50000, 150000], ['Over 150,000', 150000, '']].map(function (r) { return '<button type="button" class="kv-chip" data-min="' + r[1] + '" data-max="' + r[2] + '">' + r[0] + '</button>'; }).join('') + '</div>';
    var easy = '<label class="screen-reader-text" for="f-easy">Easy Payment maximum per month</label><select id="f-easy" name="easy"><option value="">Any monthly amount</option>' + [5000, 10000, 15000, 25000, 50000].map(function (v) { return '<option value="' + v + '"' + (+S.easy === v ? ' selected' : '') + '>Up to ' + KV.fmt(v) + ' / month</option>'; }).join('') + '</select><p class="f-note">Based on the minimum down payment and default plan.</p>';
    var avail = '<label class="f-check"><input type="checkbox" name="stock" value="1"' + (S.stock ? ' checked' : '') + '> In stock only</label>';
    var rate = '<ul class="f-list f-checks">' + [['', 'Any rating'], ['4', '4 stars and above'], ['3', '3 stars and above']].map(function (r) { return '<li><label><input type="radio" name="rating" value="' + r[0] + '"' + (String(S.rating) === r[0] ? ' checked' : '') + '> <span class="lb">' + r[1] + '</span></label></li>'; }).join('') + '</ul>';
    $('#filter-form').innerHTML = group('cat', 'Category', cats) + group('price', 'Price', price) + group('brand', 'Brand', bh) + group('easy', 'Easy Payment', easy) + group('stock', 'Availability', avail) + group('rating', 'Customer rating', rate, false);
  }

  /* ---------- results ---------- */
  function heading() {
    var c = S.cat && KV.category(S.cat), crumb = '<a href="index.html">Home</a>&nbsp;/&nbsp;' + (c || S.q ? '<a href="shop.html">Shop</a>&nbsp;/&nbsp;' : 'Shop') + (c ? esc(c.name) : S.q ? 'Search results' : '');
    $('#shop-crumb').innerHTML = crumb;
    var t = c ? c.name : S.q ? 'Search results for "' + S.q + '"' : 'All products';
    $('#shop-title').textContent = t; d.title = t + ' | Kavindu Online Store';
    $('#shop-desc').textContent = c ? (c.subs && c.subs.length ? 'Including ' + c.subs.join(', ').toLowerCase() + '. Delivery island-wide, Easy Payment available on orders over Rs 15,000.' : 'Delivery island-wide. Easy Payment available on orders over Rs 15,000.') : S.q ? '' : 'Furniture, home appliances, TVs, laptops and phones. Delivery island-wide, with Easy Payment monthly plans on orders over Rs 15,000.';
  }
  function chips(total) {
    var a = [];
    function chip(label, over) { a.push('<a class="kv-chip on" href="' + url(Object.assign({ page: 1 }, over)) + '" data-clear=\'' + JSON.stringify(over) + '\'>' + esc(label) + ' <i class="fa-solid fa-xmark" aria-hidden="true"></i><span class="screen-reader-text"> remove filter</span></a>'); }
    if (S.q) chip('Search: ' + S.q, { q: '' });
    S.brands.forEach(function (b) { chip(b, { brands: S.brands.filter(function (x) { return x !== b; }) }); });
    if (S.min !== '' || S.max !== '') chip('Rs ' + (S.min || 0) + ' - ' + (S.max || 'any'), { min: '', max: '' });
    if (S.easy) chip('Up to ' + KV.fmt(+S.easy) + '/month', { easy: '' });
    if (S.stock) chip('In stock', { stock: false });
    if (S.rating) chip(S.rating + ' stars +', { rating: '' });
    $('#active-filters').innerHTML = a.length ? a.join('') + '<a class="clear-all" href="' + url({ page: 1, q: S.q, brands: [], min: '', max: '', easy: '', stock: false, rating: '' }) + '" data-clear=\'{"brands":[],"min":"","max":"","easy":"","stock":false,"rating":""}\'>Clear all</a>' : '';
    var n = a.length; var b = $('#filter-n'); b.hidden = !n; b.textContent = n;
  }
  function render() {
    var list = sorted(ALL.filter(function (p) { return matches(p); })), total = list.length, pages = Math.max(1, Math.ceil(total / S.per));
    if (S.page > pages) S.page = pages;
    var from = (S.page - 1) * S.per, slice = list.slice(from, from + S.per);
    heading(); chips(total);
    $('#result-count').textContent = total ? (total <= S.per ? 'Showing all ' + total + ' result' + (total > 1 ? 's' : '') : 'Showing ' + (from + 1) + '–' + (from + slice.length) + ' of ' + total + ' results') : 'No products found';
    $('#filters-count').textContent = total;
    $('#orderby').value = S.sort; $('#perpage').value = S.per;
    $$('.view-toggle .kv-chip').forEach(function (b) { var on = b.dataset.view === S.view; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    var host = $('#shop-loop');
    host.className = S.view === 'list' ? 'view-list' : '';
    host.innerHTML = total ? KV.grid(slice, { cols: 3 }) : '<div class="shop-empty"><h2>No products match your filters</h2><p>Try removing a filter, or browse a category.</p><a class="button alt" href="shop.html">View all products</a></div>';
    var pg = '';
    if (pages > 1) {
      pg = '<ul class="page-numbers">';
      if (S.page > 1) pg += '<li><a class="prev page-numbers" href="' + url({ page: S.page - 1 }) + '" data-page="' + (S.page - 1) + '" aria-label="Previous page">&larr;</a></li>';
      for (var i = 1; i <= pages; i++) pg += '<li>' + (i === S.page ? '<span aria-current="page" class="page-numbers current">' + i + '</span>' : '<a class="page-numbers" href="' + url({ page: i }) + '" data-page="' + i + '">' + i + '</a>') + '</li>';
      if (S.page < pages) pg += '<li><a class="next page-numbers" href="' + url({ page: S.page + 1 }) + '" data-page="' + (S.page + 1) + '" aria-label="Next page">&rarr;</a></li>';
      pg += '</ul>';
    }
    $('#shop-pages').innerHTML = pg;
    KV.sync && KV.sync(); push();
  }
  function refresh(keepFilters) { if (!keepFilters) buildFilters(); render(); }

  /* ---------- events ---------- */
  var form = $('#filter-form');
  form.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cat]'); if (a) { e.preventDefault(); S.cat = a.dataset.cat; S.page = 1; refresh(); return; }
    var c = e.target.closest('.f-quick .kv-chip'); if (c) { S.min = c.dataset.min; S.max = c.dataset.max; S.page = 1; refresh(); }
  });
  form.addEventListener('change', function (e) {
    var t = e.target; S.page = 1;
    if (t.name === 'brand') S.brands = $$('input[name=brand]:checked', form).map(function (x) { return x.value; });
    else if (t.name === 'stock') S.stock = t.checked;
    else if (t.name === 'min' || t.name === 'max' || t.name === 'easy' || t.name === 'rating') S[t.name] = t.value;
    refresh();
    var el = t.id && d.getElementById(t.id); if (el) { try { el.focus({ preventScroll: true }); } catch (x) {} }
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  $('#orderby').addEventListener('change', function () { S.sort = this.value; S.page = 1; render(); });
  $('#perpage').addEventListener('change', function () { S.per = +this.value; S.page = 1; render(); });
  $('.view-toggle').addEventListener('click', function (e) { var b = e.target.closest('[data-view]'); if (b) { S.view = b.dataset.view; render(); } });
  $('#active-filters').addEventListener('click', function (e) {
    var a = e.target.closest('[data-clear]'); if (!a) return; e.preventDefault();
    var o = JSON.parse(a.dataset.clear); Object.keys(o).forEach(function (k) { S[k] = o[k]; }); S.page = 1; refresh();
  });
  $('#shop-pages').addEventListener('click', function (e) {
    var a = e.target.closest('[data-page]'); if (!a) return; e.preventDefault(); S.page = +a.dataset.page; render();
    var t = $('.shop-toolbar'); t && t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  w.addEventListener('kv:options', function (e) { if (e.detail && e.detail.key === 'card') render(); });
  KV.ready(function () { refresh(); });
})(window, document);
