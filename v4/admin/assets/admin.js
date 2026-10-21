/* Kavindu Online Store - wp-admin demo (WooCommerce look). Defensive: works without KV_DATA. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rs = n => 'Rs. ' + Math.round(n).toLocaleString('en-US');
  const NOW = Date.now(), H = 3600e3, D = 24 * H;
  const page = document.body.dataset.page;
  const qs = new URLSearchParams(location.search);

  /* ---------- persisted demo state ---------- */
  let S = {};
  try { S = JSON.parse(localStorage.getItem('kv_admin_v3') || '{}'); } catch (e) { S = {}; }
  S.orderStatus = S.orderStatus || {}; S.appStatus = S.appStatus || {}; S.paid = S.paid || {};
  S.pay = S.pay || {}; S.notes = S.notes || {}; S.trashed = S.trashed || []; S.featured = S.featured || {};
  const save = () => { try { localStorage.setItem('kv_admin_v3', JSON.stringify(S)); } catch (e) {} };

  /* ---------- data ---------- */
  const KV = window.KV_DATA || window.CM || {};
  const FALLBACK = [
    ['Innovex No Frost Refrigerator (Inverter) 250L', 'Innovex', 'INR240I', 131900, 149900, 'refrigerators'],
    ['Innovex Front Load Washing Machine 8kg', 'Innovex', 'IWF80', 112500, 124900, 'washing-machines'],
    ['Innovex 43" Smart LED TV', 'Innovex', 'ILT43S', 84900, 94900, 'tv-audio'],
    ['Innovex Inverter Air Conditioner 12000 BTU', 'Innovex', 'IAC12I', 149900, 169900, 'air-conditioners'],
    ['Innovex Microwave Oven 25L', 'Innovex', 'IMW25', 31900, 0, 'kitchen-appliances'],
    ['Three Seater Fabric Sofa - Grey', 'Kavindu Home', 'KH-SOF3', 119000, 139000, 'furniture'],
    ['Queen Size Bed with Storage', 'Kavindu Home', 'KH-BED-Q', 98500, 0, 'furniture'],
    ['Ergonomic Office Chair - Mesh', 'Kavindu Home', 'KH-OC12', 27500, 32500, 'furniture'],
    ['Six Seater Dining Set', 'Kavindu Home', 'KH-DIN6', 134900, 154900, 'furniture'],
    ['15.6" Laptop Core i5 / 16GB / 512GB', 'Zenbook', 'ZB15-i5', 219900, 239900, 'laptops-phones'],
    ['Smartphone 8GB / 256GB', 'Nova', 'NV-X8', 89900, 0, 'laptops-phones'],
    ['Blender 1.5L 600W', 'Innovex', 'IBL15', 9900, 12900, 'small-appliances']
  ].map((r, i) => ({ id: 'p' + i, name: r[0], brand: r[1], sku: r[2], price: r[3], was: r[4], category: r[5], image: 'https://images.unsplash.com/' + ['photo-1622372738946-62e02505feb3', 'photo-1626806787461-102c1bfaaea1', 'photo-1593359677879-a4bb92f829d1', 'photo-1665826254141-bfa10685e002', 'photo-1585659722983-3a675dabf23d', 'photo-1555041469-a586c61ea9bc', 'photo-1631049307264-da0ec9d70304', 'photo-1586023492125-27b2c045efd7', 'photo-1615066390971-03e4e1c36ddf', 'photo-1496181133206-80ce9b88a853', 'photo-1511707171634-5f897ff02aa9', 'photo-1570222094114-d054a817e56b'][i] + '?auto=format&fit=crop&w=120&q=70' }));
  const catNames = {};
  (KV.categories || []).forEach(c => { catNames[c.id] = c.name; });
  Object.assign(catNames, { 'refrigerators': 'Refrigerators', 'washing-machines': 'Washing Machines', 'tv-audio': 'TV & Audio', 'air-conditioners': 'Air Conditioners', 'kitchen-appliances': 'Kitchen Appliances', 'furniture': 'Furniture', 'laptops-phones': 'Laptops & Phones', 'small-appliances': 'Small Appliances' }, (KV.categories || []).reduce((a, c) => (a[c.id] = c.name, a), {}));
  const rawProducts = (Array.isArray(KV.products) && KV.products.length) ? KV.products : FALLBACK;
  const hash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const PRODUCTS = rawProducts.map((p, i) => {
    const img = (p.images && p.images[0]) || p.image || p.img || '';
    let stock = String(p.stock || ''), qty = 0, st = 'in';
    if (/out/i.test(stock)) st = 'out'; else { const m = stock.match(/(\d+)/); qty = m ? +m[1] : 4 + hash(p.id || p.name) % 38; if (m) st = 'low'; }
    return {
      id: p.id || 'p' + i, name: p.name, brand: p.brand || '', sku: p.sku || p.model || ('KV-' + (1000 + i)),
      price: +p.price || 0, rrp: +(p.rrp || p.was) > +p.price ? +(p.rrp || p.was) : 0, category: p.category || '',
      img, stockState: st, qty, featured: i % 5 === 0, daysAgo: 3 + (hash(p.id || p.name) % 140)
    };
  });
  const catLabel = c => catNames[c] || (c ? c.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase()) : 'Uncategorized');
  const EP_CFG = Object.assign({ minDownPct: 20, defaultDownPct: 25, tenures: [{ months: 6, markupPct: 8 }, { months: 12, markupPct: 16 }, { months: 18, markupPct: 24 }, { months: 24, markupPct: 32 }, { months: 36, markupPct: 45 }] }, KV.easyPayment || {});
  S.ep = S.ep || { tenures: EP_CFG.tenures.map(t => ({ months: t.months, markupPct: t.markupPct })), minDownPct: EP_CFG.minDownPct, lateFee: 500, grace: 5, minPrice: EP_CFG.minPrice || 15000, enabled: true };

  const STATUS = { 'pending': 'Pending payment', 'pending-approval': 'Pending approval', 'processing': 'Processing', 'on-hold': 'On hold', 'completed': 'Completed', 'cancelled': 'Cancelled', 'refunded': 'Refunded', 'failed': 'Failed' };
  const ORDER_ROWS = [
    ['Nimal Perera', 'Colombo', 'Bank transfer', 'completed', 700], ['Kasun Fernando', 'Gampaha', 'PayHere', 'completed', 640],
    ['Sanduni Wickramasinghe', 'Kandy', 'Koko', 'completed', 590], ['Ruwan Jayasinghe', 'Galle', 'Easy Payment', 'completed', 540],
    ['Dilini Rathnayake', 'Kurunegala', 'Cash on delivery', 'completed', 500], ['Chathura Silva', 'Matara', 'Mintpay', 'completed', 460],
    ['Nadeesha Gunawardena', 'Ratnapura', 'PayHere', 'completed', 400], ['Tharindu Bandara', 'Kegalle', 'Easy Payment', 'cancelled', 360],
    ['Hasini Dissanayake', 'Colombo', 'Cash on delivery', 'completed', 320], ['Isuru Madushanka', 'Gampaha', 'Koko', 'refunded', 280],
    ['Pavithra Senanayake', 'Kandy', 'PayHere', 'failed', 240], ['Lakmal Herath', 'Anuradhapura', 'Bank transfer', 'on-hold', 200],
    ['Amali Karunaratne', 'Colombo', 'Easy Payment', 'processing', 160], ['Supun Weerasinghe', 'Kalutara', 'PayHere', 'completed', 120],
    ['Menaka Abeysekara', 'Badulla', 'Mintpay', 'on-hold', 96], ['Janith Amarasinghe', 'Matale', 'Easy Payment', 'processing', 70],
    ['Shanika Ekanayake', 'Colombo', 'Cash on delivery', 'processing', 48], ['Dhananjaya Liyanage', 'Colombo', 'PayHere', 'processing', 30],
    ['Rashmi Kodithuwakku', 'Gampaha', 'Koko', 'processing', 20], ['Buddhika Samarasinghe', 'Kurunegala', 'Bank transfer', 'pending', 14],
    ['Thilini Pathirana', 'Galle', 'PayHere', 'pending', 9], ['Sampath Jayawardena', 'Kandy', 'Easy Payment', 'pending-approval', 6],
    ['Gayani Mendis', 'Colombo', 'Easy Payment', 'pending-approval', 3], ['Roshan Dias', 'Kalutara', 'Easy Payment', 'pending-approval', 1]
  ];
  const STREETS = ['Temple Road', 'Lake Drive', 'Station Road', 'High Level Road', 'Main Street', 'Galle Road', 'Flower Road', 'School Lane'];
  const ORDERS = ORDER_ROWS.map((r, i) => {
    const n = PRODUCTS.length, a = PRODUCTS[(i * 5 + 1) % n], b = PRODUCTS[(i * 7 + 4) % n];
    const items = [{ p: a, qty: 1 }]; if (i % 3 === 1) items.push({ p: b, qty: 1 + (i % 2) });
    const sub = items.reduce((t, x) => t + x.p.price * x.qty, 0), ship = sub > 100000 ? 0 : 1500;
    const first = r[0].split(' ')[0].toLowerCase(), last = r[0].split(' ').slice(-1)[0].toLowerCase();
    return {
      id: 1001 + i, name: r[0], district: r[1], method: r[2], status0: r[3], at: NOW - r[4] * H, items, sub, ship, total: sub + ship,
      email: first + '.' + last + '@gmail.com', phone: '07' + (1 + i % 8) + ' ' + (100 + i * 37 % 900) + ' ' + (1000 + i * 733 % 9000),
      addr: (10 + i * 3) + ', ' + STREETS[i % STREETS.length], ep: null
    };
  });
  ORDERS.forEach(o => { Object.defineProperty(o, 'status', { get() { return S.orderStatus[o.id] || o.status0; } }); });
  const orderById = id => ORDERS.find(o => o.id === +id);

  const DOCS = [['NIC - front', 'img'], ['NIC - back', 'img'], ['Latest payslip (3 months)', 'pdf'], ['Bank statement (6 months)', 'pdf'], ['Proof of address', 'pdf'], ['Guarantor NIC', 'img']];
  const APP_ROWS = [
    ['EP-1001', 'Ruwan Jayasinghe', '901234567V', '077 214 8890', 12, 'approved', 1004, 'Teacher', 'Dept. of Education', 78000, 'Nov 4 2026', 4],
    ['EP-1002', 'Tharindu Bandara', '952345678V', '071 332 1045', 18, 'rejected', 1008, 'Casual labourer', 'Self-employed', 32000, '', 3],
    ['EP-1003', 'Amali Karunaratne', '198834512678', '076 556 7712', 12, 'approved', 1013, 'Accountant', 'Hayleys PLC', 145000, '', 6],
    ['EP-1004', 'Janith Amarasinghe', '200012345678', '070 912 3345', 24, 'approved', 1016, 'Software engineer', 'WSO2', 260000, '', 6],
    ['EP-1005', 'Sampath Jayawardena', '861112233V', '072 445 9981', 12, 'pending', 1022, 'Bank officer', 'People\'s Bank', 112000, '', 5],
    ['EP-1006', 'Gayani Mendis', '927788990V', '077 681 2203', 24, 'pending', 1023, 'Nurse', 'Lady Ridgeway Hospital', 96000, '', 6],
    ['EP-1007', 'Roshan Dias', '199045678912', '075 340 6618', 18, 'pending', 1024, 'Electrician', 'Self-employed', 85000, '', 4],
    ['EP-1008', 'Chamila Gunasekara', '883456721V', '078 226 5540', 36, 'rejected', null, 'Driver', 'Private', 41000, '', 3]
  ];
  const APPS = APP_ROWS.map((r, i) => {
    const o = r[6] ? orderById(r[6]) : null, prod = o ? o.items[0].p : PRODUCTS[(i * 3 + 2) % PRODUCTS.length], price = o ? o.items[0].p.price : prod.price;
    const down = Math.round(price * (S.ep.minDownPct + (i % 3) * 5) / 100 / 100) * 100;
    if (o) o.ep = r[0];
    return { id: r[0], name: r[1], nic: r[2], mobile: r[3], months: r[4], status0: r[5], order: r[6], job: r[7], employer: r[8], income: r[9], prod, price, down, docs: DOCS.slice(0, r[11] + 0), at: NOW - (i === 0 ? 30 : 30 - i * 3) * D + i * H };
  });
  APPS.forEach(a => { Object.defineProperty(a, 'status', { get() { return S.appStatus[a.id] || a.status0; } }); });
  const markup = m => { const t = S.ep.tenures.find(x => +x.months === +m); return t ? +t.markupPct : 0; };
  const calc = (price, downPct, months) => { const down = price * downPct / 100, fin = price - down, tot = fin * (1 + markup(months) / 100); return { down, fin, total: tot, monthly: tot / months, interest: tot - fin }; };
  const PLAN_ROWS = [
    ['PL-2001', 'EP-1001', 'Ruwan Jayasinghe', 22, []], ['PL-2002', 'EP-1003', 'Amali Karunaratne', 7, []], ['PL-2003', 'EP-1004', 'Janith Amarasinghe', 3, []],
    ['PL-2004', null, 'Wasantha Rodrigo', 150, [3]], ['PL-2005', null, 'Kumari Hettiarachchi', 125, [2, 3]], ['PL-2006', null, 'Anura Dahanayake', 205, []]
  ];
  const PLANS = PLAN_ROWS.map((r, i) => {
    const app = r[1] ? APPS.find(a => a.id === r[1]) : null, prod = app ? app.prod : PRODUCTS[(i * 4 + 3) % PRODUCTS.length], months = app ? app.months : [12, 12, 24][i % 3] + (i === 5 ? 0 : 0), price = prod.price;
    const c = calc(price, 25, months), start = NOW - r[3] * D;
    return { id: r[0], app: r[1], name: r[2], prod, price, months, monthly: c.monthly, total: c.total, down: c.down, start, missed: r[4] };
  });
  const inst = (pl, k) => {
    const due = pl.start + (k + 1) * 30 * D, paidOv = (S.paid[pl.id] || []).includes(k);
    let st; if (paidOv) st = 'paid'; else if (due < NOW) st = pl.missed.includes(k) ? 'overdue' : 'paid'; else st = 'upcoming';
    if (st === 'upcoming' && due - NOW < 10 * D && !(pl.start + k * 30 * D > NOW)) st = 'due';
    return { k, due, st };
  };
  const schedule = pl => Array.from({ length: pl.months }, (_, k) => inst(pl, k));
  const planStat = pl => { const s = schedule(pl), od = s.filter(x => x.st === 'overdue'); return { paid: s.filter(x => x.st === 'paid').length, overdue: od.length, next: s.find(x => x.st === 'due' || x.st === 'upcoming') }; };

  /* ---------- helpers ---------- */
  const fmtDate = t => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const ago = t => { const h = (NOW - t) / H; if (h < 1) return Math.max(1, Math.round(h * 60)) + ' mins ago'; if (h < 24) return Math.round(h) + ' hour' + (Math.round(h) > 1 ? 's' : '') + ' ago'; return fmtDate(t); };
  const pill = (s, label) => `<mark class="order-status status-${s}"><span>${esc(label || STATUS[s] || s.replace(/\b\w/g, c => c.toUpperCase()))}</span></mark>`;
  const notice = (msg, type) => { const n = document.createElement('div'); n.className = `notice notice-${type || 'success'} is-dismissible`; n.innerHTML = `<p>${msg}</p><button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>`; const h = $('.wp-header-end'); (h || $('.wrap')).after(n); n.querySelector('button').onclick = () => n.remove(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const pager = (total, per, cur) => { const pages = Math.max(1, Math.ceil(total / per)); return `<div class="tablenav-pages"><span class="displaying-num">${total} item${total === 1 ? '' : 's'}</span>${pages > 1 ? `<span class="pagination-links">${cur > 1 ? '<a class="button" data-pg="1" href="#">&laquo;</a> <a class="button" data-pg="' + (cur - 1) + '" href="#">&lsaquo;</a>' : '<span class="tablenav-pages-navspan">&laquo;</span> <span class="tablenav-pages-navspan">&lsaquo;</span>'} <span class="paging-input">${cur} of <span class="total-pages">${pages}</span></span> ${cur < pages ? '<a class="button" data-pg="' + (cur + 1) + '" href="#">&rsaquo;</a> <a class="button" data-pg="' + pages + '" href="#">&raquo;</a>' : '<span class="tablenav-pages-navspan">&rsaquo;</span> <span class="tablenav-pages-navspan">&raquo;</span>'}</span>` : ''}</div>`; };
  const PER = () => { try { return +localStorage.getItem('kv_admin_per') || 20; } catch (e) { return 20; } };

  /* ---------- shell ---------- */
  const pendingApps = () => APPS.filter(a => a.status === 'pending').length;
  const ep = qs.get('tab') || 'applications';
  function menuDef() {
    const woo = [['Home', 'index.html#woo'], ['Orders', 'orders.html', 'orders'], ['Customers', '#'], ['Reports', '#'], ['Settings', 'settings-payments.html', 'settings-payments'], ['Status', '#'], ['Extensions', '#']];
    return [
      { n: 'Dashboard', i: 'fa-gauge-high', h: 'index.html', cur: page === 'index', sub: [['Home', 'index.html', 1], ['Updates', '#']] },
      { sep: 1 },
      { n: 'Posts', i: 'fa-thumbtack', h: '#', sub: [['All Posts', '#'], ['Add New', '#'], ['Categories', '#'], ['Tags', '#']] },
      { n: 'Media', i: 'fa-photo-film', h: '#', sub: [['Library', '#'], ['Add New', '#']] },
      { n: 'Pages', i: 'fa-file', h: '#', sub: [['All Pages', '#'], ['Add New', '#']] },
      { n: 'Comments', i: 'fa-comment', h: '#', sub: [] },
      { sep: 1 },
      { n: 'WooCommerce', i: 'fa-bag-shopping', h: 'orders.html', cur: ['orders', 'order', 'settings-payments'].includes(page), badge: ORDERS.filter(o => o.status === 'processing').length, sub: woo.map(s => [s[0], s[1], s[2] && (s[2] === page || (s[2] === 'orders' && page === 'order'))]) },
      { n: 'Products', i: 'fa-box', h: 'products.html', cur: page === 'products', sub: [['All Products', 'products.html', page === 'products'], ['Add New', '#'], ['Categories', '#'], ['Tags', '#'], ['Attributes', '#'], ['Reviews', '#']] },
      { n: 'Payments', i: 'fa-credit-card', h: 'settings-payments.html', sub: [] },
      { n: 'Analytics', i: 'fa-chart-simple', h: '#', sub: [['Overview', '#'], ['Products', '#'], ['Revenue', '#'], ['Orders', '#']] },
      { n: 'Marketing', i: 'fa-bullhorn', h: '#', sub: [['Overview', '#'], ['Coupons', '#']] },
      { n: 'Easy Payment', i: 'fa-hand-holding-dollar', h: 'easy-payment.html', cur: page === 'easy-payment', badge: pendingApps(), sub: [['Applications', 'easy-payment.html?tab=applications', page === 'easy-payment' && ep === 'applications'], ['Plans', 'easy-payment.html?tab=plans', page === 'easy-payment' && ep === 'plans'], ['Settings', 'easy-payment.html?tab=settings', page === 'easy-payment' && ep === 'settings']] },
      { sep: 1 },
      { n: 'Appearance', i: 'fa-paintbrush', h: 'theme-settings.html', cur: ['banners', 'theme-settings'].includes(page), sub: [['Themes', 'theme-settings.html', false], ['Customize', '#'], ['Homepage banners', 'banners.html', page === 'banners'], ['Theme settings', 'theme-settings.html', page === 'theme-settings'], ['Menus', '#'], ['Widgets', '#']] },
      { n: 'Plugins', i: 'fa-plug', h: '#', badge: 2, sub: [['Installed Plugins', '#'], ['Add New Plugin', '#']] },
      { n: 'Users', i: 'fa-user', h: '#', sub: [['All Users', '#'], ['Add New User', '#'], ['Profile', '#']] },
      { n: 'Tools', i: 'fa-wrench', h: '#', sub: [['Available Tools', '#'], ['Import', '#'], ['Export', '#']] },
      { n: 'Settings', i: 'fa-gear', h: '#', sub: [['General', '#'], ['Writing', '#'], ['Reading', '#'], ['Permalinks', '#']] }
    ];
  }
  function buildShell() {
    const content = document.createElement('div'); content.id = 'wpbody-content';
    const menu = menuDef().map(m => {
      if (m.sep) return '<li class="sep"></li>';
      const cur = !!m.cur, subs = m.sub.length ? m.sub : [[m.n, m.h]];
      return `<li class="menu-top ${cur ? 'current wp-has-current-submenu wp-menu-open' : 'wp-not-current-submenu'} ${m.n === 'WooCommerce' ? 'woo' : ''}"><a href="${m.h}"><span class="menu-icon"><i class="fa-solid ${m.i}"></i></span><span class="menu-name">${m.n}</span>${m.badge ? `<span class="awaiting-mod">${m.badge}</span>` : ''}</a><ul class="wp-submenu"><li class="wp-submenu-head">${m.n}</li>${subs.map(s => `<li class="${s[2] ? 'current' : ''}"><a href="${s[1]}">${s[0]}</a></li>`).join('')}</ul></li>`;
    }).join('');
    $('#wpwrap').innerHTML = `
<div id="wpadminbar" role="navigation"><ul class="ab-left">
 <li id="menu-toggle"><a class="ab-item" href="#" aria-label="Menu"><i class="fa-solid fa-bars ab-icon"></i></a></li>
 <li><a class="ab-item" href="#"><i class="fa-brands fa-wordpress ab-icon"></i></a><ul class="ab-sub"><li><a href="#">About WordPress</a></li><li><a href="#">WordPress.org</a></li><li><a href="#">Documentation</a></li></ul></li>
 <li><a class="ab-item" href="../index.html"><i class="fa-solid fa-house ab-icon hide-m"></i><span>Kavindu Online Store</span></a><ul class="ab-sub"><li><a href="../index.html">Visit Site</a></li></ul></li>
 <li class="hide-m"><a class="ab-item" href="#"><i class="fa-solid fa-rotate ab-icon"></i> 3</a></li>
 <li class="hide-m"><a class="ab-item" href="#"><i class="fa-solid fa-comment ab-icon"></i> <span class="bubble" style="background:#4f94d4">0</span></a></li>
 <li class="hide-m"><a class="ab-item" href="#"><i class="fa-solid fa-plus ab-icon"></i> New</a><ul class="ab-sub"><li><a href="#">Post</a></li><li><a href="#">Media</a></li><li><a href="#">Page</a></li><li><a href="products.html">Product</a></li><li><a href="orders.html">Order</a></li><li><a href="#">User</a></li></ul></li>
 </ul><ul class="ab-right"><li><a class="ab-item" href="#"><span class="hide-m">Howdy, Admin</span><span class="avatar">A</span></a><ul class="ab-sub"><li><a href="#">Edit Profile</a></li><li><a href="#">Log Out</a></li></ul></li></ul></div>
<div id="adminmenumain"><div id="adminmenuwrap"><ul id="adminmenu">${menu}<li class="menu-top"><button type="button" id="collapse-button"><span class="menu-icon"><i class="fa-solid fa-circle-chevron-left"></i></span><span class="menu-name">Collapse menu</span></button></li></ul></div></div>
<div id="wpcontent"><div id="screen-meta-links"><button type="button" data-meta="opts">Screen Options</button><button type="button" data-meta="help">Help</button></div>
<div id="screen-meta"><div data-pane="opts"><h5>Pagination</h5><label>Number of items per page: <input type="number" id="per-page" class="small-text" min="5" max="100" value="${PER()}"></label> <button class="button" id="apply-per">Apply</button></div><div data-pane="help" hidden><h5>Overview</h5><p>This screen is part of the Kavindu Online Store admin demo. Data shown is sample data and changes are stored only in this browser.</p></div></div>
</div><div id="wpfooter"><span>Thank you for creating with <a href="#">WordPress</a>.</span><span style="float:right">Version 6.6.2</span></div>`;
    $('#wpcontent').appendChild(content);
    try { if (localStorage.getItem('kv_menu_folded') === '1') document.body.classList.add('folded'); } catch (e) {}
    $('#collapse-button').onclick = () => { const f = document.body.classList.toggle('folded'); try { localStorage.setItem('kv_menu_folded', f ? '1' : '0'); } catch (e) {} };
    $('#menu-toggle a').onclick = e => { e.preventDefault(); document.body.classList.toggle('menu-open'); };
    $$('#adminmenu a[href="#"], #wpadminbar a[href="#"], #wpfooter a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
    $$('#screen-meta-links button').forEach(b => b.onclick = () => {
      const sm = $('#screen-meta'), k = b.dataset.meta, was = sm.classList.contains('open') && !$('[data-pane="' + k + '"]').hidden;
      $$('#screen-meta [data-pane]').forEach(p => p.hidden = p.dataset.pane !== k); sm.classList.toggle('open', !was);
    });
    $('#apply-per').onclick = () => { try { localStorage.setItem('kv_admin_per', Math.max(5, Math.min(100, +$('#per-page').value || 20))); } catch (e) {} render(); $('#screen-meta').classList.remove('open'); };
    return content;
  }
  const head = (title, action) => `<h1 class="wp-heading-inline">${title}</h1>${action || ''}<hr class="wp-header-end">`;

  /* ---------- dashboard ---------- */
  function spark(vals, color) {
    const w = 120, h = 28, max = Math.max(...vals), min = Math.min(...vals), pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - 3 - (v - min) / ((max - min) || 1) * (h - 6)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline fill="none" stroke="${color}" stroke-width="1.6" points="${pts}"/></svg>`;
  }
  function renderIndex(root) {
    const valid = ORDERS.filter(o => !['cancelled', 'failed', 'refunded', 'pending'].includes(o.status));
    const sales = valid.reduce((t, o) => t + o.total, 0), items = valid.reduce((t, o) => t + o.items.reduce((a, x) => a + x.qty, 0), 0);
    const days = Array.from({ length: 30 }, (_, i) => ({ d: NOW - (29 - i) * D, v: 0 }));
    valid.forEach(o => { const idx = 29 - Math.floor((NOW - o.at) / D); if (days[idx]) days[idx].v += o.total; });
    const cards = [['Total sales', rs(sales), '+12.4%', 'up'], ['Net sales', rs(sales * 0.94), '+9.8%', 'up'], ['Orders', ORDERS.length, '+4.3%', 'up'], ['Items sold', items, '-2.1%', 'down'], ['Visitors', '3,482', '+18.0%', 'up']];
    const W = 640, Hh = 190, mx = Math.max(...days.map(x => x.v), 1), pts = days.map((x, i) => [40 + i / 29 * (W - 60), Hh - 30 - x.v / mx * (Hh - 50)]);
    const chart = `<svg viewBox="0 0 ${W} ${Hh}">${[0, .25, .5, .75, 1].map(f => `<line x1="40" x2="${W - 20}" y1="${Hh - 30 - f * (Hh - 50)}" y2="${Hh - 30 - f * (Hh - 50)}" stroke="#e0e0e0"/><text x="34" y="${Hh - 26 - f * (Hh - 50)}" font-size="10" text-anchor="end" fill="#757575">${Math.round(mx * f / 1000)}k</text>`).join('')}<polyline fill="rgba(127,84,179,.12)" stroke="none" points="40,${Hh - 30} ${pts.map(p => p.join(',')).join(' ')} ${W - 20},${Hh - 30}"/><polyline fill="none" stroke="#7f54b3" stroke-width="2" points="${pts.map(p => p.join(',')).join(' ')}"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="#7f54b3"/>`).join('')}${[0, 7, 14, 21, 29].map(i => `<text x="${pts[i][0]}" y="${Hh - 10}" font-size="10" text-anchor="middle" fill="#757575">${new Date(days[i].d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</text>`).join('')}</svg>`;
    const top = {}; valid.forEach(o => o.items.forEach(x => { top[x.p.name] = (top[x.p.name] || 0) + x.qty * x.p.price; }));
    const topRows = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5).map(r => `<li><span>${esc(r[0])}</span><b>${rs(r[1])}</b></li>`).join('');
    const recent = ORDERS.slice().sort((a, b) => b.at - a.at).slice(0, 6);
    const pa = APPS.filter(a => a.status === 'pending');
    const cnt = s => ORDERS.filter(o => o.status === s).length, low = PRODUCTS.filter(p => p.stockState === 'low').length, out = PRODUCTS.filter(p => p.stockState === 'out').length;
    root.innerHTML = `<div class="wrap" id="woo">${head('Dashboard')}
<div class="notice notice-success is-dismissible"><p><strong>Easy Payment:</strong> ${pa.length} application${pa.length === 1 ? '' : 's'} waiting for approval. <a href="easy-payment.html?tab=applications">Review applications</a></p><button class="notice-dismiss" type="button"></button></div>
<div class="welcome-panel"><span class="wc-badge">Woo</span><div style="flex:1;min-width:240px"><h2>Welcome to Kavindu Online Store</h2><p style="margin:0;color:#646970">Your store is live. ${ORDERS.filter(o => o.status === 'processing').length} orders to fulfil and ${pa.length} Easy Payment applications to review.</p></div><a class="button button-primary" href="orders.html">View orders</a><a class="button" href="../index.html">Visit store</a></div>
<div class="wc-cards">${cards.map((c, i) => `<div class="wc-card"><div class="lbl">${c[0]}</div><div class="val">${c[1]}</div><div class="delta ${c[3]}">${c[3] === 'up' ? '&#9650;' : '&#9660;'} ${c[2]} <span style="color:#757575">vs previous 30 days</span></div>${spark(days.map(d => d.v).slice(i * 3, i * 3 + 18).concat(days.slice(0, 2).map(d => d.v)), c[3] === 'up' ? '#007d4c' : '#cc1818')}</div>`).join('')}</div>
<div class="metabox-holder"><div class="col">
 <div class="postbox"><div class="postbox-header"><h2 class="hndle"><span class="legend-dot"></span>Revenue by date (last 30 days)</h2></div><div class="inside chart-box flush">${chart}</div></div>
 <div class="postbox"><div class="postbox-header"><h2 class="hndle">Recent orders</h2></div><div class="inside flush"><table class="wp-list-table widefat fixed striped"><tbody>${recent.map(o => `<tr><td><a href="order.html?id=${o.id}"><strong>#${o.id} ${esc(o.name)}</strong></a></td><td class="hide-mobile">${ago(o.at)}</td><td>${pill(o.status)}</td><td style="text-align:right">${rs(o.total)}</td></tr>`).join('')}</tbody></table></div></div>
 </div><div class="col">
 <div class="postbox"><div class="postbox-header"><h2 class="hndle">WooCommerce Status</h2></div><div class="inside"><ul class="status-list"><li><span><i class="fa-solid fa-sack-dollar"></i> Net sales this month</span><b>${rs(sales * 0.94)}</b></li><li><span>Awaiting processing</span><b><a href="orders.html?status=processing">${cnt('processing')} orders</a></b></li><li><span>On-hold</span><b><a href="orders.html?status=on-hold">${cnt('on-hold')} orders</a></b></li><li><span>Pending approval (Easy Payment)</span><b><a href="orders.html?status=pending-approval">${cnt('pending-approval')} orders</a></b></li><li class="warn"><span>Low in stock</span><b>${low} products</b></li><li class="warn"><span>Out of stock</span><b>${out} products</b></li></ul></div></div>
 <div class="postbox"><div class="postbox-header"><h2 class="hndle">Easy Payment - pending applications</h2></div><div class="inside flush"><table class="wp-list-table widefat fixed striped"><tbody>${pa.map(a => `<tr><td><a href="easy-payment.html?tab=applications&app=${a.id}"><strong>${a.id}</strong> ${esc(a.name)}</a><br><span class="na">${esc(a.prod.name.slice(0, 34))}</span></td><td style="text-align:right">${rs(a.price)}<br><span class="na">${a.months} months</span></td></tr>`).join('') || '<tr><td>No pending applications.</td></tr>'}</tbody></table></div></div>
 <div class="postbox"><div class="postbox-header"><h2 class="hndle">Top products</h2></div><div class="inside"><ul class="status-list">${topRows}</ul></div></div>
</div></div></div>`;
    $$('.notice-dismiss', root).forEach(b => b.onclick = () => b.parentNode.remove());
  }

  /* ---------- orders list ---------- */
  let oState = { status: qs.get('status') || 'all', q: '', month: '', pg: 1 };
  function renderOrders(root) {
    root.innerHTML = `<div class="wrap">${head('Orders', '<a href="#" class="page-title-action" id="add-order">Add order</a>')}
<ul class="subsubsub" id="status-tabs"></ul>
<form class="search-box" id="o-search"><input type="search" placeholder="Search orders" id="o-q" aria-label="Search orders"><input type="submit" class="button" value="Search orders"></form>
<div id="o-list" class="clear"></div></div>`;
    $('#add-order').onclick = e => { e.preventDefault(); notice('Adding orders is disabled in this demo.', 'info'); };
    $('#o-search').onsubmit = e => { e.preventDefault(); oState.q = $('#o-q').value.trim().toLowerCase(); oState.pg = 1; drawOrders(); };
    drawOrders();
  }
  function drawOrders() {
    const all = ORDERS.slice().sort((a, b) => b.at - a.at), counts = {};
    all.forEach(o => counts[o.status] = (counts[o.status] || 0) + 1);
    const order = ['processing', 'pending-approval', 'pending', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];
    $('#status-tabs').innerHTML = [`<li><a href="#" data-s="all" class="${oState.status === 'all' ? 'current' : ''}">All <span class="count">(${all.length})</span></a>`].concat(order.filter(s => counts[s]).map(s => `<li><a href="#" data-s="${s}" class="${oState.status === s ? 'current' : ''}">${STATUS[s]} <span class="count">(${counts[s]})</span></a>`)).join(' | </li>') + '</li>';
    $$('#status-tabs a').forEach(a => a.onclick = e => { e.preventDefault(); oState.status = a.dataset.s; oState.pg = 1; drawOrders(); });
    const months = [...new Set(all.map(o => new Date(o.at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })))];
    let rows = all.filter(o => (oState.status === 'all' || o.status === oState.status) && (!oState.month || new Date(o.at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) === oState.month) && (!oState.q || (`#${o.id} ${o.name} ${o.email} ${o.district} ${o.method} ${o.phone}`).toLowerCase().includes(oState.q)));
    const per = PER(), pages = Math.max(1, Math.ceil(rows.length / per)); oState.pg = Math.min(oState.pg, pages);
    const slice = rows.slice((oState.pg - 1) * per, oState.pg * per);
    const nav = pos => `<div class="tablenav ${pos}"><div class="actions bulkactions"><select class="bulk"><option value="">Bulk actions</option><option value="processing">Change status to processing</option><option value="on-hold">Change status to on-hold</option><option value="completed">Change status to completed</option><option value="cancelled">Change status to cancelled</option></select><button type="button" class="button do-bulk">Apply</button>${pos === 'top' ? `<select id="o-month"><option value="">All dates</option>${months.map(m => `<option ${m === oState.month ? 'selected' : ''}>${m}</option>`).join('')}</select><button type="button" class="button" id="o-filter">Filter</button>` : ''}</div>${pager(rows.length, per, oState.pg)}</div>`;
    const thead = '<tr><td class="manage-column column-cb check-column"><input type="checkbox" class="chk-all" aria-label="Select all"></td><th class="column-order_number column-primary"><a href="#">Order</a></th><th class="hide-mobile"><a href="#">Date</a></th><th>Status</th><th class="hide-mobile">Billing</th><th class="hide-mobile">Ship to</th><th>Total</th><th>Actions</th></tr>';
    $('#o-list').innerHTML = nav('top') + `<div class="table-wrap"><table class="wp-list-table widefat fixed striped table-view-list orders"><thead>${thead}</thead><tbody>${slice.map(o => `<tr data-id="${o.id}"><th scope="row" class="check-column"><input type="checkbox" class="chk" value="${o.id}"></th><td class="column-order_number column-primary"><a class="order-view" href="order.html?id=${o.id}"><strong>#${o.id} ${esc(o.name)}</strong></a>${o.ep ? `<div class="row-actions visible"><a href="easy-payment.html?tab=applications&app=${o.ep}"><i class="fa-solid fa-hand-holding-dollar"></i> ${o.ep}</a></div>` : ''}</td><td class="hide-mobile"><time>${ago(o.at)}</time></td><td>${pill(o.status)}</td><td class="hide-mobile">${esc(o.addr)}, ${esc(o.district)}<span class="na" style="display:block">via ${esc(o.method)}</span></td><td class="hide-mobile">${esc(o.name)}, ${esc(o.addr)}, ${esc(o.district)}</td><td><span class="amount">${rs(o.total)}</span></td><td class="column-actions">${o.status === 'processing' ? `<button type="button" class="wc-action-button" data-act="completed" title="Complete"><i class="fa-solid fa-check"></i></button>` : ''}${o.status === 'pending-approval' || o.status === 'on-hold' || o.status === 'pending' ? `<button type="button" class="wc-action-button" data-act="processing" title="Processing"><i class="fa-solid fa-ellipsis"></i></button>` : ''}<a class="wc-action-button" href="order.html?id=${o.id}" title="View"><i class="fa-solid fa-eye"></i></a></td></tr>`).join('') || `<tr class="no-items"><td colspan="8">No orders found</td></tr>`}</tbody><tfoot>${thead}</tfoot></table></div>` + nav('bottom');
    const ol = $('#o-list');
    $$('.chk-all', ol).forEach(c => c.onchange = () => $$('.chk', ol).forEach(x => { x.checked = c.checked; x.closest('tr').classList.toggle('selected', c.checked); }));
    $$('.chk', ol).forEach(c => c.onchange = () => c.closest('tr').classList.toggle('selected', c.checked));
    $$('[data-pg]', ol).forEach(a => a.onclick = e => { e.preventDefault(); oState.pg = +a.dataset.pg; drawOrders(); });
    $('#o-filter').onclick = () => { oState.month = $('#o-month').value; oState.pg = 1; drawOrders(); };
    $$('.do-bulk', ol).forEach(b => b.onclick = () => {
      const v = b.parentNode.querySelector('.bulk').value, ids = $$('.chk:checked', ol).map(x => +x.value);
      if (!v) return notice('Please select a bulk action.', 'warning');
      if (!ids.length) return notice('No orders selected.', 'warning');
      ids.forEach(id => S.orderStatus[id] = v); save(); drawOrders(); notice(`${ids.length} order${ids.length > 1 ? 's' : ''} changed to ${STATUS[v].toLowerCase()}.`);
    });
    $$('[data-act]', ol).forEach(b => b.onclick = () => { const id = +b.closest('tr').dataset.id; S.orderStatus[id] = b.dataset.act; save(); drawOrders(); notice(`Order #${id} status changed to ${STATUS[b.dataset.act].toLowerCase()}.`); });
  }

  /* ---------- single order ---------- */
  function renderOrder(root) {
    const o = orderById(qs.get('id')) || ORDERS[ORDERS.length - 1];
    const pay = o.method, paid = ['completed', 'processing', 'refunded'].includes(o.status);
    const notes0 = [{ t: o.at + 60e3, s: 'system', m: `Order status changed from ${o.status0 === 'pending-approval' ? 'Pending payment to Pending approval' : 'Pending payment to ' + STATUS[o.status0]}.` }, { t: o.at, s: 'system', m: `Order placed via ${pay}. ${paid ? 'Payment received.' : 'Awaiting payment.'}` }];
    S.notes[o.id] = S.notes[o.id] || [];
    const noteHtml = () => S.notes[o.id].concat(notes0).sort((a, b) => b.t - a.t).map(n => `<li style="background:${n.s === 'customer' ? '#a7cedc' : n.s === 'private' ? '#d7cad2' : '#efefef'};margin:0 0 10px;padding:10px 12px;list-style:none"><div>${esc(n.m)}</div><div class="na" style="margin-top:6px;font-size:11px">${new Date(n.t).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })} by ${n.s === 'system' ? 'system' : 'Admin'}</div></li>`).join('');
    const app = o.ep && APPS.find(a => a.id === o.ep);
    root.innerHTML = `<div class="wrap">${head('Edit order', '<a href="orders.html" class="page-title-action">Back to orders</a>')}
<div class="postbox-container-2" style="margin-top:14px"><div>
 <div class="postbox"><div class="postbox-header"><h2 class="hndle" style="font-size:18px;font-weight:400">Order #${o.id} details</h2></div><div class="inside" style="margin-top:12px">
  <p style="color:#646970;margin-top:0">Payment via <strong>${esc(pay)}</strong>${paid ? ' - paid on ' + fmtDate(o.at) : ''}. Customer IP: 112.134.${hash(o.name) % 200}.${hash(o.email) % 250}</p>
  <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px" class="order-cols">
   <div><h3 style="font-size:14px">General</h3><p><label>Date created:<br><input type="text" value="${new Date(o.at).toISOString().slice(0, 10)}" style="width:100%" readonly></label></p><p><label>Status:<br><select id="o-status" style="width:100%">${Object.keys(STATUS).map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${STATUS[s]}</option>`).join('')}</select></label></p><p><label>Customer:<br><input type="text" value="${esc(o.name)} (guest)" style="width:100%" readonly></label></p></div>
   <div><h3 style="font-size:14px">Billing <i class="fa-solid fa-pen" style="color:#a7aaad;font-size:11px"></i></h3><p>${esc(o.name)}<br>${esc(o.addr)}<br>${esc(o.district)}<br>Sri Lanka</p><p><strong>Email:</strong><br><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></p><p><strong>Phone:</strong><br><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></p><p><strong>Payment method:</strong><br>${esc(pay)}</p></div>
   <div><h3 style="font-size:14px">Shipping <i class="fa-solid fa-pen" style="color:#a7aaad;font-size:11px"></i></h3><p>${esc(o.name)}<br>${esc(o.addr)}<br>${esc(o.district)}<br>Sri Lanka</p><p><strong>Shipping method:</strong><br>${o.ship ? 'Island-wide delivery' : 'Free delivery (orders over Rs. 100,000)'}</p><p><strong>Customer note:</strong><br><em class="na">Please call before delivery.</em></p></div>
  </div></div>
  <div class="inside flush"><div class="table-wrap"><table class="wp-list-table widefat" style="border:0;border-top:1px solid #c3c4c7"><thead><tr><th colspan="2">Item</th><th style="text-align:right">Cost</th><th style="text-align:right">Qty</th><th style="text-align:right">Total</th></tr></thead><tbody>${o.items.map(x => `<tr><td style="width:44px">${x.p.img ? `<img class="thumb" src="${esc(x.p.img)}" alt="">` : ''}</td><td><a href="products.html"><strong>${esc(x.p.name)}</strong></a><br><span class="na">SKU: ${esc(x.p.sku)}</span></td><td style="text-align:right">${rs(x.p.price)}</td><td style="text-align:right">&times; ${x.qty}</td><td style="text-align:right">${rs(x.p.price * x.qty)}</td></tr>`).join('')}</tbody></table></div>
  <div style="display:flex;justify-content:flex-end;padding:12px"><table style="min-width:260px"><tr><td class="na">Items subtotal:</td><td style="text-align:right">${rs(o.sub)}</td></tr><tr><td class="na">Shipping:</td><td style="text-align:right">${rs(o.ship)}</td></tr><tr><td><strong>Order total:</strong></td><td style="text-align:right"><strong>${rs(o.total)}</strong></td></tr>${o.method === 'Easy Payment' && app ? `<tr><td class="na">Down payment (${app.months} mo):</td><td style="text-align:right">${rs(app.down)}</td></tr>` : ''}</table></div></div></div>
</div><div>
 <div class="postbox"><div class="postbox-header"><h2 class="hndle">Order actions</h2></div><div class="inside"><select id="o-action" style="width:100%"><option>Choose an action...</option><option>Email invoice / order details to customer</option><option>Resend new order notification</option><option>Regenerate download permissions</option></select><div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><a href="#" id="o-trash" style="color:#b32d2e">Move to Trash</a><button class="button button-primary" id="o-update">Update</button></div></div></div>
 ${app ? `<div class="postbox"><div class="postbox-header"><h2 class="hndle">Easy Payment application</h2></div><div class="inside"><dl class="kv"><dt>Reference</dt><dd><a href="easy-payment.html?tab=applications&app=${app.id}">${app.id}</a></dd><dt>Status</dt><dd id="app-pill">${pill(app.status)}</dd><dt>Plan</dt><dd>${app.months} months</dd><dt>NIC</dt><dd>${esc(app.nic)}</dd></dl></div></div>` : ''}
 <div class="postbox"><div class="postbox-header"><h2 class="hndle">Order notes</h2></div><div class="inside"><ul id="notes" style="margin:0;padding:0">${noteHtml()}</ul><textarea id="note-text" rows="3" placeholder="Add a note"></textarea><div style="display:flex;gap:6px;margin-top:8px"><select id="note-type"><option value="private">Private note</option><option value="customer">Note to customer</option></select><button class="button" id="note-add">Add</button></div></div></div>
</div></div></div>`;
    $('#o-update').onclick = () => { const v = $('#o-status').value; if (v !== o.status) { S.orderStatus[o.id] = v; S.notes[o.id].push({ t: Date.now(), s: 'system', m: `Order status changed to ${STATUS[v]}.` }); save(); $('#notes').innerHTML = noteHtml(); } notice(`Order updated. Status: ${STATUS[v]}.`); };
    $('#o-trash').onclick = e => { e.preventDefault(); S.orderStatus[o.id] = 'cancelled'; save(); location.href = 'orders.html'; };
    $('#note-add').onclick = () => { const t = $('#note-text').value.trim(); if (!t) return; S.notes[o.id].push({ t: Date.now(), s: $('#note-type').value, m: t }); save(); $('#note-text').value = ''; $('#notes').innerHTML = noteHtml(); };
    if (innerWidth < 782) $$('.order-cols', root).forEach(x => x.style.gridTemplateColumns = '1fr');
  }

  /* ---------- products ---------- */
  let pState = { cat: '', q: '', stock: '', pg: 1, f: 'all' };
  function renderProducts(root) {
    root.innerHTML = `<div class="wrap">${head('Products', '<a href="#" class="page-title-action" id="p-add">Add New Product</a> <a href="#" class="page-title-action">Import</a> <a href="#" class="page-title-action">Export</a>')}
<ul class="subsubsub" id="p-tabs"></ul><form class="search-box" id="p-search"><input type="search" id="p-q" placeholder="Search products"><input type="submit" class="button" value="Search products"></form><div id="p-list" class="clear"></div></div>`;
    $('#p-add').onclick = e => { e.preventDefault(); notice('Adding products is disabled in this demo.', 'info'); };
    $('#p-search').onsubmit = e => { e.preventDefault(); pState.q = $('#p-q').value.trim().toLowerCase(); pState.pg = 1; drawProducts(); };
    drawProducts();
  }
  function drawProducts() {
    const live = PRODUCTS.filter(p => !S.trashed.includes(p.id)), cats = [...new Set(PRODUCTS.map(p => p.category))];
    $('#p-tabs').innerHTML = `<li><a href="#" data-f="all" class="${pState.f === 'all' ? 'current' : ''}">All <span class="count">(${live.length})</span></a> | </li><li><a href="#" data-f="pub" class="${pState.f === 'pub' ? 'current' : ''}">Published <span class="count">(${live.length})</span></a> | </li><li><a href="#" data-f="trash" class="${pState.f === 'trash' ? 'current' : ''}">Trash <span class="count">(${S.trashed.length})</span></a></li>`;
    $$('#p-tabs a').forEach(a => a.onclick = e => { e.preventDefault(); pState.f = a.dataset.f; pState.pg = 1; drawProducts(); });
    let rows = (pState.f === 'trash' ? PRODUCTS.filter(p => S.trashed.includes(p.id)) : live).filter(p => (!pState.cat || p.category === pState.cat) && (!pState.stock || p.stockState === pState.stock || (pState.stock === 'in' && p.stockState === 'low')) && (!pState.q || (p.name + p.sku + p.brand).toLowerCase().includes(pState.q)));
    const per = PER(), pages = Math.max(1, Math.ceil(rows.length / per)); pState.pg = Math.min(pState.pg, pages);
    const slice = rows.slice((pState.pg - 1) * per, pState.pg * per);
    const nav = top => `<div class="tablenav"><div class="actions bulkactions"><select class="bulk"><option value="">Bulk actions</option><option value="trash">Move to Trash</option></select><button type="button" class="button do-bulk">Apply</button>${top ? `<select id="p-cat"><option value="">Select a category</option>${cats.map(c => `<option value="${c}" ${c === pState.cat ? 'selected' : ''}>${catLabel(c)}</option>`).join('')}</select><select id="p-stock"><option value="">Filter by stock status</option><option value="in" ${pState.stock === 'in' ? 'selected' : ''}>In stock</option><option value="out" ${pState.stock === 'out' ? 'selected' : ''}>Out of stock</option></select><button type="button" class="button" id="p-filter">Filter</button>` : ''}</div>${pager(rows.length, per, pState.pg)}</div>`;
    const thead = '<tr><td class="check-column"><input type="checkbox" class="chk-all"></td><th style="width:52px" class="hide-mobile"><i class="fa-regular fa-image"></i></th><th class="column-primary">Name</th><th class="hide-mobile">SKU</th><th>Stock</th><th>Price</th><th class="hide-mobile">Categories</th><th class="hide-mobile"><i class="fa-regular fa-star"></i></th><th class="hide-mobile">Date</th></tr>';
    const stock = p => p.stockState === 'out' ? '<mark class="stock-out" style="background:none">Out of stock</mark>' : `<mark class="${p.stockState === 'low' ? 'stock-low' : 'stock-in'}" style="background:none">In stock</mark> (${p.qty})`;
    $('#p-list').innerHTML = nav(true) + `<div class="table-wrap"><table class="wp-list-table widefat fixed striped posts"><thead>${thead}</thead><tbody>${slice.map(p => `<tr data-id="${esc(p.id)}"><th class="check-column"><input type="checkbox" class="chk" value="${esc(p.id)}"></th><td class="column-thumb hide-mobile">${p.img ? `<img class="thumb" src="${esc(p.img)}" alt="" loading="lazy">` : '<div class="thumb"></div>'}</td><td class="column-primary"><strong><a href="#" class="row-title">${esc(p.name)}</a></strong><div class="row-actions visible"><a href="#">Edit</a> | <a href="#">Quick&nbsp;Edit</a> | ${pState.f === 'trash' ? '<a href="#" data-r="restore">Restore</a>' : '<a href="#" data-r="trash" class="submitdelete" style="color:#b32d2e">Trash</a>'} | <a href="../product.html?id=${encodeURIComponent(p.id)}">View</a> | <a href="#">Duplicate</a></div></td><td class="hide-mobile">${esc(p.sku)}</td><td>${stock(p)}</td><td>${p.rrp ? `<del>${rs(p.rrp)}</del> <ins>${rs(p.price)}</ins>` : rs(p.price)}</td><td class="hide-mobile">${catLabel(p.category)}</td><td class="hide-mobile"><span class="star ${(S.featured[p.id] != null ? S.featured[p.id] : p.featured) ? 'on' : ''}" data-star><i class="fa-solid fa-star"></i></span></td><td class="hide-mobile">Published<br>${fmtDate(NOW - p.daysAgo * D)}</td></tr>`).join('') || '<tr class="no-items"><td colspan="9">No products found</td></tr>'}</tbody><tfoot>${thead}</tfoot></table></div>` + nav(false);
    const pl = $('#p-list');
    $$('.chk-all', pl).forEach(c => c.onchange = () => $$('.chk', pl).forEach(x => { x.checked = c.checked; x.closest('tr').classList.toggle('selected', c.checked); }));
    $$('.chk', pl).forEach(c => c.onchange = () => c.closest('tr').classList.toggle('selected', c.checked));
    $$('[data-pg]', pl).forEach(a => a.onclick = e => { e.preventDefault(); pState.pg = +a.dataset.pg; drawProducts(); });
    $('#p-filter').onclick = () => { pState.cat = $('#p-cat').value; pState.stock = $('#p-stock').value; pState.pg = 1; drawProducts(); };
    $$('a[href="#"]', pl).forEach(a => a.addEventListener('click', e => e.preventDefault()));
    $$('[data-star]', pl).forEach(s => s.onclick = () => { const id = s.closest('tr').dataset.id, p = PRODUCTS.find(x => x.id === id); S.featured[id] = !(S.featured[id] != null ? S.featured[id] : p.featured); save(); s.classList.toggle('on'); });
    $$('[data-r]', pl).forEach(a => a.onclick = e => { e.preventDefault(); const id = a.closest('tr').dataset.id; S.trashed = a.dataset.r === 'trash' ? S.trashed.concat(id) : S.trashed.filter(x => x !== id); save(); drawProducts(); notice(a.dataset.r === 'trash' ? '1 product moved to the Trash.' : '1 product restored from the Trash.'); });
    $$('.do-bulk', pl).forEach(b => b.onclick = () => { const ids = $$('.chk:checked', pl).map(x => x.value); if (b.parentNode.querySelector('.bulk').value !== 'trash') return notice('Please select a bulk action.', 'warning'); if (!ids.length) return notice('No products selected.', 'warning'); S.trashed = S.trashed.concat(ids); save(); drawProducts(); notice(`${ids.length} product${ids.length > 1 ? 's' : ''} moved to the Trash.`); });
  }

  /* ---------- payments settings ---------- */
  const PM = [
    ['payhere', 'PayHere', 'Cards, eZ Cash, Genie, mCash and bank 0% instalments via PayHere', ['payhere.png'], true, 'Sandbox mode enabled. Merchant ID: 1211149'],
    ['koko', 'Koko', 'Buy now, pay later in 3 interest-free instalments', ['koko.png'], true, 'Sandbox mode enabled.'],
    ['mintpay', 'Mintpay', 'Pay in 3 interest-free instalments with Mintpay', ['mintpay-small.png'], true, 'Sandbox mode enabled.'],
    ['easy', 'Easy Payment', 'In-house monthly instalment plan (requires approval)', [], true, 'Configured under Easy Payment &rsaquo; Settings.'],
    ['cod', 'Cash on delivery', 'Pay with cash upon delivery.', [], true, ''],
    ['bacs', 'Direct bank transfer', 'Make your payment directly into our bank account.', [], false, 'Sampath Bank - Avissawella - A/C 1234 5678 9012']
  ];
  function renderPayments(root) {
    const on = k => S.pay[k] != null ? S.pay[k] : PM.find(p => p[0] === k)[4];
    root.innerHTML = `<div class="wrap">${head('Settings')}
<nav class="nav-tab-wrapper wc-settings-nav"><a class="nav-tab" href="#">General</a><a class="nav-tab" href="#">Products</a><a class="nav-tab" href="#">Tax</a><a class="nav-tab" href="#">Shipping</a><a class="nav-tab nav-tab-active" href="settings-payments.html">Payments</a><a class="nav-tab" href="#">Accounts &amp; Privacy</a><a class="nav-tab" href="#">Emails</a><a class="nav-tab" href="#">Advanced</a></nav>
<h2 style="font-size:1.3em;margin:1em 0 .3em">Payment methods</h2><p class="description" style="margin-bottom:10px">Installed payment methods are listed below and can be sorted to control their display order on the frontend.</p>
<div class="table-wrap"><table class="wp-list-table widefat" id="pm-table"><thead><tr><th style="width:28px"></th><th>Method</th><th style="width:90px">Enabled</th><th class="hide-mobile">Description</th><th style="width:100px"></th></tr></thead><tbody>${PM.map(p => `<tr data-k="${p[0]}"><td class="pm-handle"><i class="fa-solid fa-grip-vertical"></i></td><td><a href="#" class="pm-name" data-manage>${p[1]}</a><div class="pm-logos" style="margin-top:4px">${p[3].map(l => `<img src="../assets/img/payments/${l}" alt="">`).join('')}</div></td><td><button type="button" class="woocommerce-input-toggle ${on(p[0]) ? 'enabled' : ''}" aria-label="Enable ${p[1]}" data-toggle></button></td><td class="hide-mobile">${p[2]}</td><td style="text-align:right"><button type="button" class="button" data-manage>Manage</button></td></tr>`).join('')}</tbody></table></div>
<p class="submit"><button class="button button-primary" id="pm-save">Save changes</button></p></div>`;
    $$('[data-toggle]').forEach(t => t.onclick = () => { const k = t.closest('tr').dataset.k; S.pay[k] = !t.classList.toggle('enabled') ? false : true; S.pay[k] = t.classList.contains('enabled'); save(); const nm = PM.find(p => p[0] === k)[1]; notice(`${nm} ${S.pay[k] ? 'enabled' : 'disabled'}. Your settings have been saved.`); });
    $$('[data-manage]').forEach(b => b.onclick = e => {
      e.preventDefault(); const tr = b.closest('tr'), nx = tr.nextElementSibling;
      if (nx && nx.classList.contains('pm-row-settings')) return nx.remove();
      const p = PM.find(x => x[0] === tr.dataset.k), row = document.createElement('tr'); row.className = 'pm-row-settings';
      row.innerHTML = p[0] === 'easy' ? `<td colspan="5"><p style="margin-top:0">Tenures, rates, down payment and late fees are managed on the plugin page.</p><a class="button button-primary" href="easy-payment.html?tab=settings">Open Easy Payment settings</a></td>` : `<td colspan="5"><table class="form-table" style="margin:0"><tr><th>Title</th><td><input type="text" class="regular-text" value="${esc(p[1])}"></td></tr><tr><th>Description</th><td><textarea rows="2" style="max-width:25em">${esc(p[2])}</textarea></td></tr>${p[5] ? `<tr><th>Mode</th><td><label><input type="checkbox" checked> Enable test / sandbox mode</label><p class="description">${p[5]}</p></td></tr>` : ''}</table><button class="button button-primary pm-row-save">Save changes</button> <button class="button pm-row-close">Cancel</button></td>`;
      tr.after(row); const sv = row.querySelector('.pm-row-save'); if (sv) sv.onclick = () => { row.remove(); notice(`${p[1]} settings saved.`); }; const cl = row.querySelector('.pm-row-close'); if (cl) cl.onclick = () => row.remove();
    });
    $('#pm-save').onclick = () => { save(); notice('Your settings have been saved.'); };
  }

  /* ---------- easy payment ---------- */
  let aSel = qs.get('app') || '';
  function renderEP(root) {
    const t = qs.get('tab') || 'applications', pa = pendingApps();
    root.innerHTML = `<div class="wrap">${head('Easy Payment', '<span style="color:#646970">Instalment plans by Kavindu Online Store</span>')}
<nav class="nav-tab-wrapper"><a class="nav-tab ${t === 'applications' ? 'nav-tab-active' : ''}" href="?tab=applications">Applications ${pa ? `<span class="count">${pa}</span>` : ''}</a><a class="nav-tab ${t === 'plans' ? 'nav-tab-active' : ''}" href="?tab=plans">Plans</a><a class="nav-tab ${t === 'settings' ? 'nav-tab-active' : ''}" href="?tab=settings">Settings</a></nav>
<div id="ep-body"></div></div>`;
    const b = $('#ep-body');
    if (t === 'plans') drawPlans(b); else if (t === 'settings') drawEPSettings(b); else drawApps(b);
  }

  /* ---------- appearance: homepage banners ---------- */
  const BANNER_DEFAULTS = {
    heroSlides: [1, 2, 3].map(i => ({ img: `assets/img/banners/hero-${i}.webp`, imgMobile: `assets/img/banners/hero-${i}-m.webp`, link: '#', alt: `Homepage hero banner ${i}`, visible: true })),
    heroSide: [1, 2].map(i => ({ img: `assets/img/banners/side-${i}.webp`, link: '#', alt: `Homepage side banner ${i}`, visible: true })),
    promoRow: [1, 2, 3].map(i => ({ img: `assets/img/banners/promo-${i}.webp`, link: '#', alt: `Homepage promotion banner ${i}`, visible: true })),
    wideBanner: { img: 'assets/img/banners/wide-easy.webp', imgMobile: 'assets/img/banners/wide-easy-m.webp', link: '#', alt: 'Easy Payment homepage banner', visible: true },
    furniture: { img: 'assets/img/banners/furniture.webp', link: '#', alt: 'Furniture homepage banner', visible: true }
  };
  const BANNER_META = {
    heroSlides: ['Hero slides', '1320 × 520', true], heroSide: ['Hero side banners', '640 × 252', false],
    promoRow: ['Promotion row', '424 × 220', false], wideBanner: ['Wide banner', '1320 × 200', true], furniture: ['Furniture banner', '640 × 560', false]
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  const readJson = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? clone(fallback) : v; } catch (e) { return clone(fallback); } };
  let bannerState = readJson('kv-banners', BANNER_DEFAULTS);
  const bannerImage = item => item && item.img ? item.img : '';
  const previewSrc = src => src && /^(assets\/|\.\/assets\/)/.test(src) ? `../${src.replace(/^\.\//, '')}` : src;
  const bannerCard = (slot, item, index, size, mobile, sortable) => `<article class="postbox banner-card" data-slot="${slot}" data-index="${index}">
    <div class="postbox-header"><h2 class="hndle"><span class="banner-drag" draggable="${sortable}" title="Drag to reorder" aria-label="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span>${BANNER_META[slot][0]}${sortable ? ` ${index + 1}` : ''}</h2><span class="banner-actions">${sortable ? '<button type="button" class="button button-small banner-remove">Remove</button>' : ''}</span></div>
    <div class="inside banner-inside"><div class="banner-editor"><div class="banner-preview ${bannerImage(item) ? '' : 'is-empty'}" data-preview><img src="${esc(previewSrc(bannerImage(item)))}" alt=""${bannerImage(item) ? '' : ' hidden'}><span>${size} px</span></div><div class="banner-fields"><p class="description"><strong>Recommended: ${size} px, JPG or WebP, under 200 KB</strong></p><button type="button" class="button select-image">Select image</button><input type="hidden" data-field="img" value="${esc(item.img || '')}">${mobile ? `<label>Mobile image <span class="description">(optional)</span><div class="inline-media"><input type="text" data-field="imgMobile" value="${esc(item.imgMobile || '')}" placeholder="assets/img/banners/...-m.webp"><button type="button" class="button button-small select-image" data-mobile="1">Select</button></div>` : ''}<label>Link URL<input type="text" data-field="link" value="${esc(item.link || '')}" placeholder="https://..."></label><label>Alt text <span class="required">required</span><input type="text" data-field="alt" value="${esc(item.alt || '')}" aria-describedby="alt-help-${slot}-${index}" required><span class="description" id="alt-help-${slot}-${index}">Describe the offer for screen readers.</span></label><label class="banner-visible"><input type="checkbox" data-field="visible"${item.visible !== false ? ' checked' : ''}> Visible</label></div></div></div></article>`;
  function normalizeBanners() {
    const s = readJson('kv-banners', BANNER_DEFAULTS);
    Object.keys(BANNER_DEFAULTS).forEach(k => { if (!s[k]) s[k] = clone(BANNER_DEFAULTS[k]); });
    return s;
  }
  function renderBanners(root) {
    bannerState = normalizeBanners();
    root.innerHTML = `<div class="wrap appearance-wrap">${head('Homepage banners', '<a class="page-title-action" href="../index.html">View homepage</a>')}<p>Manage the image-only banners shown on the storefront homepage. Text and prices should be included in the uploaded artwork.</p><div id="banner-notice"></div><div class="banner-toolbar"><button type="button" class="button button-primary" id="banner-save">Save changes</button><button type="button" class="button button-link-delete" id="banner-reset">Reset to defaults</button></div><div class="banner-layout"><main id="banner-slots"></main><aside><div class="postbox"><div class="postbox-header"><h2 class="hndle">Banner checklist</h2></div><div class="inside"><p>Use compressed JPG or WebP files under 200 KB where possible.</p><p>Alt text is required for every visible banner. Describe the offer for screen readers.</p><p class="description">Changes are saved in this browser for this demo.</p></div></div></aside></div></div><div class="media-modal" id="media-modal" hidden aria-labelledby="media-title" role="dialog" aria-modal="true"><div class="media-backdrop"></div><div class="media-dialog"><div class="media-header"><h2 id="media-title">Select image</h2><button type="button" class="media-close" aria-label="Close media library">×</button></div><div class="media-tabs"><button type="button" class="media-tab active" data-media-tab="library">Media Library</button><button type="button" class="media-tab" data-media-tab="upload">Upload files</button></div><div class="media-body"><div data-media-pane="library"><p class="description">Choose one of the sample banner files.</p><div class="media-grid" id="media-grid"></div></div><div data-media-pane="upload" hidden><label class="upload-drop">Choose a local image<input type="file" id="banner-upload" accept="image/jpeg,image/webp,image/png"></label><div class="upload-preview" id="upload-preview"></div></div></div></div></div>`;
    const slots = $('#banner-slots');
    const draw = () => { slots.innerHTML = Object.keys(BANNER_META).map(slot => { const [title, size, mobile] = BANNER_META[slot]; const val = bannerState[slot]; const arr = Array.isArray(val) ? val : [val]; return `<section class="banner-section" data-section="${slot}"><h2>${title}</h2><p class="description">${arr.length} slot${arr.length === 1 ? '' : 's'} · Recommended: ${size} px, JPG or WebP, under 200 KB</p><div class="banner-list">${arr.map((item, i) => bannerCard(slot, item, i, size, mobile, slot === 'heroSlides')).join('')}</div>${slot === 'heroSlides' ? '<button type="button" class="button add-slide">Add slide</button>' : ''}</section>`; }).join(''); bindCards(); };
    const sampleFiles = ['hero-1.webp', 'hero-2.webp', 'hero-3.webp', 'hero-1-m.webp', 'hero-2-m.webp', 'hero-3-m.webp', 'side-1.webp', 'side-2.webp', 'promo-1.webp', 'promo-2.webp', 'promo-3.webp', 'wide-easy.webp', 'wide-easy-m.webp', 'furniture.webp'];
    const modal = $('#media-modal'); let target = null, opener = null;
    const openMedia = btn => { opener = btn; target = { card: btn.closest('.banner-card'), mobile: btn.dataset.mobile === '1' }; $('#media-grid').innerHTML = sampleFiles.map(file => `<button type="button" class="media-item" data-file="${file}"><span class="media-thumb"><img src="../assets/img/banners/${file}" alt=""></span><span>${file}</span></button>`).join(''); modal.hidden = false; document.body.classList.add('modal-open'); $('.media-close', modal).focus(); };
    const closeMedia = () => { modal.hidden = true; document.body.classList.remove('modal-open'); target = null; if (opener) opener.focus(); opener = null; };
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMedia(); return; } if (e.key !== 'Tab') return; const focusable = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal).filter(x => !x.disabled && !x.hidden); if (!focusable.length) return; const first = focusable[0], last = focusable[focusable.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } });
    const setImage = (src, name) => { if (!target) return; const input = target.card.querySelector(`[data-field="${target.mobile ? 'imgMobile' : 'img'}"]`); if (!input) return; input.value = src; if (!target.mobile) { const p = target.card.querySelector('[data-preview]'); p.classList.remove('is-empty'); p.querySelector('img').src = previewSrc(src); p.querySelector('img').hidden = false; } closeMedia(); };
    const bindCards = () => { $$('.select-image', slots).forEach(b => b.onclick = () => openMedia(b)); $$('.banner-remove', slots).forEach(b => b.onclick = () => { const c = b.closest('.banner-card'), s = c.dataset.slot; if (bannerState[s].length > 1) { bannerState[s].splice(+c.dataset.index, 1); draw(); } }); $$('.add-slide', slots).forEach(b => b.onclick = () => { bannerState.heroSlides.push({ img: '', imgMobile: '', link: '#', alt: '', visible: true }); draw(); }); $$('.banner-card input', slots).forEach(i => i.addEventListener('input', () => { if (i.dataset.field === 'img') { const p = i.closest('.banner-card').querySelector('[data-preview]'); p.classList.toggle('is-empty', !i.value); p.querySelector('img').src = previewSrc(i.value); p.querySelector('img').hidden = !i.value; } }));
      $$('.banner-drag[draggable="true"]', slots).forEach(handle => { const card = handle.closest('.banner-card'); card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', card.dataset.index); card.classList.add('is-dragging'); }); card.addEventListener('dragend', () => card.classList.remove('is-dragging')); card.addEventListener('dragover', e => e.preventDefault()); card.addEventListener('drop', e => { e.preventDefault(); const from = +e.dataTransfer.getData('text/plain'), to = +card.dataset.index; if (from === to) return; const moved = bannerState.heroSlides.splice(from, 1)[0]; bannerState.heroSlides.splice(to, 0, moved); draw(); }); }); };
    $$('.media-tab', modal).forEach(tab => tab.onclick = () => { $$('.media-tab', modal).forEach(t => t.classList.toggle('active', t === tab)); $$('[data-media-pane]', modal).forEach(p => p.hidden = p.dataset.mediaPane !== tab.dataset.mediaTab); });
    $$('.media-close, .media-backdrop', modal).forEach(b => b.onclick = closeMedia); $('#media-grid').onclick = e => { const b = e.target.closest('[data-file]'); if (b) setImage(`assets/img/banners/${b.dataset.file}`, b.dataset.file); };
    $('#banner-upload').onchange = e => { const file = e.target.files[0]; if (!file) return; if (file.size > 300 * 1024) { $('#banner-notice').innerHTML = '<div class="notice notice-error"><p>File is too large. Use an image under 300 KB; try compressing it first.</p></div>'; e.target.value = ''; return; } const reader = new FileReader(); reader.onload = () => { $('#upload-preview').innerHTML = `<img src="${reader.result}" alt="Upload preview">`; setImage(reader.result, file.name); }; reader.readAsDataURL(file); };
    $('#banner-save').onclick = () => { const data = {}; let invalid = null; Object.keys(BANNER_META).forEach(slot => { const section = $(`[data-section="${slot}"]`), cards = $$('.banner-card', section); const values = cards.map(c => { const out = {}; $$('[data-field]', c).forEach(i => out[i.dataset.field] = i.type === 'checkbox' ? i.checked : i.value.trim()); if (out.visible && !out.alt) invalid = c.querySelector('[data-field="alt"]'); return out; }); data[slot] = Array.isArray(bannerState[slot]) ? values : values[0]; }); if (invalid) { $('#banner-notice').innerHTML = '<div class="notice notice-error"><p>Visible banners must have alt text.</p></div>'; invalid.focus(); return; } try { localStorage.setItem('kv-banners', JSON.stringify(data)); } catch (e) { $('#banner-notice').innerHTML = '<div class="notice notice-error"><p>Browser storage full – use smaller images</p></div>'; return; } bannerState = data; $('#banner-notice').innerHTML = '<div class="notice notice-success"><p>Banners updated. <a href="../index.html">View homepage</a></p></div>'; window.scrollTo({ top: 0, behavior: 'smooth' }); };
    $('#banner-reset').onclick = () => { if (!window.confirm('Reset all banners to the supplied defaults?')) return; localStorage.removeItem('kv-banners'); bannerState = clone(BANNER_DEFAULTS); draw(); $('#banner-notice').innerHTML = '<div class="notice notice-success"><p>Banners reset to defaults.</p></div>'; };
    draw();
  }

  /* ---------- appearance: theme settings ---------- */
  const OPTION_DEFAULTS = { header: '1', hero: '1', cats: '1', card: '1', rail1: '1', rail2: '3', rail3: '2', footer: '1' };
  const OPTION_GROUPS = [{ tab: 'Header', fields: [['header', 'Header', ['Retail band', 'Classic white', 'Compact']]] }, { tab: 'Homepage', fields: [['hero', 'Hero layout', ['Slider + 2 side banners', 'Full-width slider', 'Category list + slider']], ['cats', 'Categories', ['Circle product images with count', 'Image tiles', 'Icon row']], ['rail1', 'Best sellers', ['Tabs grid', 'Carousel', 'Deal card + grid']], ['rail2', 'Deals this week', ['Tabs grid', 'Carousel', 'Deal card + grid']], ['rail3', 'New arrivals – furniture', ['Tabs grid', 'Carousel', 'Deal card + grid']]] }, { tab: 'Product card', fields: [['card', 'Product card', ['Standard retail', 'Clean with hover icons', 'List-style detailed']]] }, { tab: 'Footer', fields: [['footer', 'Footer', ['Navy 4-column', 'Service strip + columns', 'Compact']]] }];
  function themeSketch(key, n) { return `<span class="theme-sketch sketch-${key}-${n}" aria-hidden="true"><i></i><b></b><em></em></span>`; }
  function renderThemeSettings(root) { let opts = readJson('kv-options', OPTION_DEFAULTS); opts = Object.assign({}, OPTION_DEFAULTS, opts); root.innerHTML = `<div class="wrap appearance-wrap theme-settings-wrap">${head('Kavindu Theme Settings', '<a class="page-title-action" href="../index.html">View store</a>')}<p>Choose the storefront layout options used by the Kavindu Online Store theme.</p><div id="theme-notice"></div><div class="theme-settings"><nav class="theme-tabs" aria-label="Theme settings sections">${OPTION_GROUPS.map((g, i) => `<button type="button" class="theme-tab${i === 0 ? ' active' : ''}" data-tab="${g.tab.replace(/\s/g, '-').toLowerCase()}">${g.tab}</button>`).join('')}<button type="button" class="theme-tab" data-tab="colors">Colors</button></nav><div class="theme-panels">${OPTION_GROUPS.map((g, i) => `<section class="theme-panel${i === 0 ? ' active' : ''}" data-panel="${g.tab.replace(/\s/g, '-').toLowerCase()}">${g.fields.map(f => `<fieldset class="option-group"><legend>${f[1]}</legend><div class="option-cards">${f[2].map((label, j) => `<label class="option-card"><input type="radio" name="${f[0]}" value="${j + 1}"${String(opts[f[0]]) === String(j + 1) ? ' checked' : ''}><span class="option-card-body">${themeSketch(f[0], j + 1)}<strong>${j + 1}. ${label}</strong></span></label>`).join('')}</div></fieldset>`).join('')}</section>`).join('')}<section class="theme-panel" data-panel="colors"><h2>Fixed palette</h2><p class="description">These colours are part of the approved store design and are changed by the developer.</p><div class="palette">${[['Primary blue', '#1C6FB0'], ['Navy', '#16213A'], ['Page grey', '#F4F6F8'], ['Text', '#1F2937'], ['Muted', '#5B6573'], ['Border', '#E3E6EA'], ['Sale red', '#C62828'], ['Easy Payment green', '#1F8A5B'], ['Star', '#E8A317']].map(c => `<div><span style="background:${c[1]}"></span><strong>${c[0]}</strong><code>${c[1]}</code></div>`).join('')}</div></section></div></div><p class="submit"><button type="button" class="button button-primary" id="theme-save">Save changes</button><a class="button" href="../index.html">Cancel</a></p></div>`; $$('.theme-tab').forEach(t => t.onclick = () => { $$('.theme-tab').forEach(x => x.classList.toggle('active', x === t)); $$('.theme-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === t.dataset.tab)); }); $('#theme-save').onclick = () => { const out = {}; Object.keys(OPTION_DEFAULTS).forEach(k => { const checked = $(`input[name="${k}"]:checked`); out[k] = checked ? checked.value : OPTION_DEFAULTS[k]; }); localStorage.setItem('kv-options', JSON.stringify(out)); $('#theme-notice').innerHTML = '<div class="notice notice-success"><p>Theme settings saved. <a href="../index.html">View store</a></p></div>'; window.scrollTo({ top: 0, behavior: 'smooth' }); }; }
  let aFilter = 'all';
  function drawApps(b) {
    const cnt = s => APPS.filter(a => a.status === s).length;
    const rows = APPS.filter(a => aFilter === 'all' || a.status === aFilter);
    b.innerHTML = `<ul class="subsubsub"><li><a href="#" data-f="all" class="${aFilter === 'all' ? 'current' : ''}">All <span class="count">(${APPS.length})</span></a> | </li><li><a href="#" data-f="pending" class="${aFilter === 'pending' ? 'current' : ''}">Pending <span class="count">(${cnt('pending')})</span></a> | </li><li><a href="#" data-f="approved" class="${aFilter === 'approved' ? 'current' : ''}">Approved <span class="count">(${cnt('approved')})</span></a> | </li><li><a href="#" data-f="rejected" class="${aFilter === 'rejected' ? 'current' : ''}">Rejected <span class="count">(${cnt('rejected')})</span></a></li></ul>
<div class="clear"></div><div class="ep-grid ${aSel ? '' : 'single'}"><div class="table-wrap"><table class="wp-list-table widefat fixed striped"><thead><tr><th style="width:80px">Ref</th><th class="column-primary">Applicant</th><th class="hide-mobile">Product</th><th>Plan</th><th>Status</th><th class="hide-mobile">Submitted</th></tr></thead><tbody>${rows.map(a => `<tr data-id="${a.id}" class="${a.id === aSel ? 'active-row' : ''}"><td><a href="#" data-open="${a.id}"><strong>${a.id}</strong></a></td><td class="column-primary"><strong>${esc(a.name)}</strong><br><span class="na">${esc(a.nic)} &middot; ${esc(a.mobile)}</span><div class="row-actions visible"><a href="#" data-open="${a.id}">Review</a>${a.order ? ` | <a href="order.html?id=${a.order}">Order #${a.order}</a>` : ''}</div></td><td class="hide-mobile">${esc(a.prod.name.slice(0, 40))}<br><span class="na">${rs(a.price)}</span></td><td>${a.months} mo<br><span class="na">${rs(calc(a.price, Math.round(a.down / a.price * 100), a.months).monthly)}/mo</span></td><td>${pill(a.status)}</td><td class="hide-mobile">${fmtDate(a.at)}</td></tr>`).join('') || '<tr><td colspan="6">No applications found.</td></tr>'}</tbody></table></div><div id="ep-detail"></div></div>`;
    $$('[data-f]', b).forEach(a => a.onclick = e => { e.preventDefault(); aFilter = a.dataset.f; drawApps(b); });
    $$('[data-open]', b).forEach(a => a.onclick = e => { e.preventDefault(); aSel = a.dataset.open; drawApps(b); });
    const app = APPS.find(a => a.id === aSel); if (app) drawDetail(app, b);
    $$('tbody tr[data-id]', b).forEach(tr => tr.onclick = e => { if (e.target.closest('a')) return; aSel = tr.dataset.id; drawApps(b); });
  }
  function drawDetail(a, b) {
    const dp = Math.round(a.down / a.price * 100), c = calc(a.price, dp, a.months), st = a.status;
    $('#ep-detail').innerHTML = `<div class="postbox"><div class="postbox-header"><h2 class="hndle">Application ${a.id}</h2><span style="padding-right:12px">${pill(st)}</span></div><div class="inside">
<dl class="kv"><dt>Applicant</dt><dd>${esc(a.name)}</dd><dt>NIC</dt><dd>${esc(a.nic)}</dd><dt>Mobile</dt><dd>${esc(a.mobile)}</dd><dt>Occupation</dt><dd>${esc(a.job)}, ${esc(a.employer)}</dd><dt>Monthly income</dt><dd>${rs(a.income)}</dd><dt>Product</dt><dd>${esc(a.prod.name)}</dd><dt>Price</dt><dd>${rs(a.price)}</dd><dt>Down payment</dt><dd>${rs(a.down)} (${dp}%)</dd><dt>Tenure</dt><dd>${a.months} months at +${markup(a.months)}%</dd><dt>Instalment</dt><dd><strong>${rs(c.monthly)}</strong> / month</dd>${a.order ? `<dt>Order</dt><dd><a href="order.html?id=${a.order}">#${a.order}</a></dd>` : ''}</dl>
<p style="margin:14px 0 4px"><strong>Documents</strong></p>${a.docs.map(d => `<div class="doc-chip"><i class="fa-solid ${d[1] === 'pdf' ? 'fa-file-pdf' : 'fa-image'}"></i><span>${d[0]}</span><a href="#" class="button button-small">View</a></div>`).join('')}
<div style="display:flex;gap:8px;margin-top:14px">${st === 'pending' ? '<button class="button button-primary" id="ep-ok">Approve</button><button class="button button-link-delete" id="ep-no">Reject</button>' : '<span class="description">This application has been ' + st + '.</span>'}<button class="button" id="ep-close" style="margin-left:auto">Close</button></div></div></div>`;
    $$('#ep-detail a[href="#"]').forEach(x => x.onclick = e => { e.preventDefault(); notice('Document preview is not available in the demo.', 'info'); });
    $('#ep-close').onclick = () => { aSel = ''; drawApps(b); };
    const act = (s) => { S.appStatus[a.id] = s; if (a.order) S.orderStatus[a.order] = s === 'approved' ? 'processing' : 'cancelled'; save(); const keep = aSel; drawApps(b); aSel = keep; refreshBadge(); notice(`Application <strong>${a.id}</strong> for ${esc(a.name)} has been <strong>${s}</strong>.${a.order ? ` Order #${a.order} moved to ${s === 'approved' ? 'Processing' : 'Cancelled'}; the customer has been notified.` : ''}`, s === 'approved' ? 'success' : 'error'); };
    if (st === 'pending') { $('#ep-ok').onclick = () => act('approved'); $('#ep-no').onclick = () => act('rejected'); }
  }
  function refreshBadge() { const p = pendingApps(), bd = $('#adminmenu .menu-top.current .awaiting-mod'); if (page === 'easy-payment' && bd) { if (p) bd.textContent = p; else bd.remove(); } const tc = $('.nav-tab .count'); if (tc) { if (p) tc.textContent = p; else tc.remove(); } }
  function drawPlans(b) {
    const od = PLANS.reduce((t, p) => t + planStat(p).overdue, 0), odAmt = PLANS.reduce((t, p) => t + planStat(p).overdue * p.monthly, 0);
    b.innerHTML = `${od ? `<div class="notice notice-warning"><p><strong>${od} overdue instalment${od > 1 ? 's' : ''}</strong> totalling ${rs(odAmt)}. Late fee of ${rs(S.ep.lateFee)} applies after ${S.ep.grace} grace days.</p></div>` : ''}
<div class="tablenav"><div class="actions"><button class="button" id="remind">Send reminders to overdue</button></div>${`<div class="tablenav-pages"><span class="displaying-num">${PLANS.length} plans</span></div>`}</div>
<div class="table-wrap"><table class="wp-list-table widefat fixed"><thead><tr><th style="width:80px">Plan</th><th class="column-primary">Customer</th><th class="hide-mobile">Product</th><th>Instalment</th><th>Progress</th><th>Next due</th><th>Status</th></tr></thead><tbody>${PLANS.map(p => { const s = planStat(p); return `<tr class="${s.overdue ? 'overdue' : ''}" data-id="${p.id}"><td><a href="#" data-sched="${p.id}"><strong>${p.id}</strong></a></td><td class="column-primary"><strong>${esc(p.name)}</strong>${p.app ? `<br><a href="easy-payment.html?tab=applications&app=${p.app}">${p.app}</a>` : ''}<div class="row-actions visible"><a href="#" data-sched="${p.id}">View schedule</a></div></td><td class="hide-mobile">${esc(p.prod.name.slice(0, 36))}<br><span class="na">${rs(p.price)}</span></td><td>${rs(p.monthly)}<br><span class="na">&times; ${p.months}</span></td><td>${s.paid} / ${p.months} paid</td><td>${s.next ? fmtDate(s.next.due) : '&mdash;'}</td><td>${s.overdue ? pill('overdue', s.overdue + ' overdue') : pill(s.paid === p.months ? 'paid' : 'processing', s.paid === p.months ? 'Completed' : 'Active')}</td></tr>`; }).join('')}</tbody></table></div>`;
    $$('[data-sched]', b).forEach(a => a.onclick = e => {
      e.preventDefault(); const tr = a.closest('tr'), nx = tr.nextElementSibling; if (nx && nx.classList.contains('sched-row')) return nx.remove();
      $$('.sched-row', b).forEach(x => x.remove()); const p = PLANS.find(x => x.id === a.dataset.sched), row = document.createElement('tr'); row.className = 'sched-row';
      row.innerHTML = `<td colspan="7"><table class="widefat sched" style="max-width:640px"><thead><tr><th>#</th><th>Due date</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${schedule(p).map(i => `<tr class="${i.st === 'overdue' ? 'overdue' : ''}"><td>${i.k + 1}</td><td>${fmtDate(i.due)}</td><td>${rs(p.monthly)}${i.st === 'overdue' ? ` <span class="late">+ ${rs(S.ep.lateFee)} late fee</span>` : ''}</td><td>${pill(i.st)}</td><td>${i.st === 'paid' ? '' : `<button class="button button-small" data-pay="${p.id}:${i.k}">Mark paid</button>`}</td></tr>`).join('')}</tbody></table></td>`;
      tr.after(row); $$('[data-pay]', row).forEach(x => x.onclick = () => { const [pid, k] = x.dataset.pay.split(':'); (S.paid[pid] = S.paid[pid] || []).push(+k); save(); drawPlans(b); notice(`Instalment ${+k + 1} of plan ${pid} marked as paid.`); });
    });
    $('#remind').onclick = () => notice(od ? `Reminder SMS sent to ${PLANS.filter(p => planStat(p).overdue).length} customers with overdue instalments.` : 'No overdue instalments.', od ? 'success' : 'info');
  }
  function drawEPSettings(b) {
    const cfg = S.ep;
    b.innerHTML = `<div class="ep-grid" style="margin-top:6px"><div><h2 style="font-size:1.3em">Plan rates</h2><p class="description">Mark-up applied on the financed balance for each tenure. Placeholder rates - waiting on client confirmation.</p>
<table class="wp-list-table widefat" style="margin-top:10px;max-width:520px"><thead><tr><th>Tenure (months)</th><th>Mark-up %</th><th style="width:70px"></th></tr></thead><tbody id="tn-body"></tbody></table><p><button class="button" id="tn-add">Add tenure</button></p>
<table class="form-table"><tr><th>Enable Easy Payment</th><td><button type="button" class="woocommerce-input-toggle ${cfg.enabled ? 'enabled' : ''}" id="ep-en"></button></td></tr><tr><th><label for="min-down">Minimum down payment (%)</label></th><td><input type="number" id="min-down" class="small-text" min="0" max="90" value="${cfg.minDownPct}"></td></tr><tr><th><label for="min-price">Minimum order value (Rs.)</label></th><td><input type="number" id="min-price" value="${cfg.minPrice}" style="width:120px"></td></tr><tr><th><label for="late-fee">Late fee (Rs. per late instalment)</label></th><td><input type="number" id="late-fee" value="${cfg.lateFee}" style="width:120px"></td></tr><tr><th><label for="grace">Grace period (days)</label></th><td><input type="number" id="grace" class="small-text" value="${cfg.grace}"></td></tr></table>
<p class="submit"><button class="button button-primary" id="ep-save">Save changes</button></p></div>
<div class="postbox"><div class="postbox-header"><h2 class="hndle">Example calculation</h2></div><div class="inside"><p><label>Product price (Rs.)<br><input type="number" id="ex-price" value="131900" style="width:100%"></label></p><p><label>Down payment (%)<br><input type="number" id="ex-down" value="${Math.max(25, cfg.minDownPct)}" style="width:100%"></label></p><p><label>Tenure<br><select id="ex-ten" style="width:100%"></select></label></p><div class="calc-out" id="ex-out"></div></div></div></div>`;
    const body = $('#tn-body');
    const drawT = () => { body.innerHTML = cfg.tenures.map((t, i) => `<tr data-i="${i}"><td><input type="number" class="tenure-input" data-f="months" value="${t.months}" min="1"></td><td><input type="number" class="tenure-input" data-f="markupPct" value="${t.markupPct}" step="0.5"></td><td><a href="#" data-del style="color:#b32d2e">Remove</a></td></tr>`).join(''); fillSel(); out(); $$('[data-f]', body).forEach(inp => inp.oninput = () => { cfg.tenures[+inp.closest('tr').dataset.i][inp.dataset.f] = +inp.value; fillSel(true); out(); }); $$('[data-del]', body).forEach(a => a.onclick = e => { e.preventDefault(); if (cfg.tenures.length < 2) return; cfg.tenures.splice(+a.closest('tr').dataset.i, 1); drawT(); }); };
    const fillSel = keep => { const sel = $('#ex-ten'), cur = sel.value; sel.innerHTML = cfg.tenures.map(t => `<option value="${t.months}">${t.months} months (+${t.markupPct}%)</option>`).join(''); if (keep && cur) sel.value = cur; };
    const out = () => { const price = +$('#ex-price').value || 0, dp = Math.max(+$('#ex-down').value || 0, cfg.minDownPct), m = +$('#ex-ten').value, c = calc(price, dp, m); $('#ex-out').innerHTML = `Down payment (${dp}%): <b>${rs(c.down)}</b><br>Financed balance: ${rs(c.fin)}<br>Mark-up (+${markup(m)}%): ${rs(c.interest)}<br>Total payable: ${rs(c.total + c.down)}<br><br>Monthly instalment: <b>${rs(c.monthly)}</b> &times; ${m}`; };
    drawT(); ['ex-price', 'ex-down', 'ex-ten'].forEach(id => $('#' + id).oninput = out);
    $('#min-down').oninput = () => { cfg.minDownPct = +$('#min-down').value || 0; out(); };
    $('#tn-add').onclick = () => { cfg.tenures.push({ months: (cfg.tenures[cfg.tenures.length - 1].months || 0) + 6, markupPct: 50 }); drawT(); };
    $('#ep-en').onclick = e => { cfg.enabled = !cfg.enabled; e.currentTarget.classList.toggle('enabled', cfg.enabled); };
    $('#ep-save').onclick = () => { cfg.minDownPct = +$('#min-down').value || 0; cfg.minPrice = +$('#min-price').value || 0; cfg.lateFee = +$('#late-fee').value || 0; cfg.grace = +$('#grace').value || 0; cfg.tenures.sort((a, b) => a.months - b.months); save(); drawT(); notice('Easy Payment settings saved.'); };
  }

  /* ---------- boot ---------- */
  function render() {
    const root = $('#wpbody-content'); if (!root) return;
    ({ 'index': renderIndex, 'orders': renderOrders, 'order': renderOrder, 'products': renderProducts, 'settings-payments': renderPayments, 'easy-payment': renderEP, 'banners': renderBanners, 'theme-settings': renderThemeSettings }[page] || renderIndex)(root);
    $$('#wpbody-content a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
  }
  buildShell(); render();
})();
