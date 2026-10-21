/* My account page: WooCommerce-style account area. Session flag in localStorage "kv-account". */
(function (w, d) {
  'use strict';
  KV.ready(function () {
    var $ = KV.$, esc = KV.esc, fmt = KV.fmt, root = $('#acc-root');
    var qs = new URLSearchParams(location.search);
    var SAMPLE = { name: 'Nimali Perera', email: 'nimali.perera@example.com', mobile: '0771234567' };
    if (qs.get('sample') === '1') KV.save('kv-account', SAMPLE);
    var DAY = 864e5, now = Date.now();
    function user() { return KV.load('kv-account', null); }
    function dt(x) { var t = new Date(x); return isNaN(t) ? '' : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    function money(n) { return KV.price(n); }

    var TABS = [['dashboard', 'Dashboard', 'fa-gauge'], ['orders', 'Orders', 'fa-box'], ['easy-payment', 'Easy Payment plans', 'fa-calendar-check'], ['edit-address', 'Addresses', 'fa-location-dot'], ['edit-account', 'Account details', 'fa-user'], ['wishlist', 'Wishlist', 'fa-heart'], ['customer-logout', 'Log out', 'fa-right-from-bracket']];
    var ALIAS = { addresses: 'edit-address', account: 'edit-account', logout: 'customer-logout', plans: 'easy-payment', 'easy-payment-plans': 'easy-payment' };

    /* ---- sample data ---- */
    var fridge = KV.products.filter(function (p) { return p.category === 'refrigerators'; })[0] || KV.products[0];
    var tv = KV.products.filter(function (p) { return p.category === 'tv-audio'; })[0] || KV.products[1];
    var chair = KV.products.filter(function (p) { return p.price < 60000 && p.id !== fridge.id; })[0] || KV.products[2];
    var plan = { ref: 'EP-2026-0417', product: fridge, months: 12, downPct: 25, calc: KV.calc(fridge.price, 25, 12), paid: Math.max(3, Math.min(12, +KV.load('kv-plan-paid', 3) || 3)) };
    var d4 = new Date(now - 6 * DAY);
    plan.sched = []; for (var i = 1; i <= 12; i++) { var dd = new Date(d4.getFullYear(), d4.getMonth() + (i - 4), d4.getDate()); plan.sched.push({ n: i, due: dd, amt: i === 12 ? plan.calc.finalMonthly : plan.calc.monthly, paid: i <= plan.paid }); }
    function schedStatus(s) { if (s.paid) return 'Paid'; var diff = (s.due - now) / DAY; return diff < -0.5 ? 'Overdue' : diff <= 7 ? 'Due' : 'Upcoming'; }
    var sampleOrders = [
      { id: 'EP-2026-0417', date: new Date(now - 112 * DAY).toISOString(), status: 'Processing', total: fridge.price, items: 1, method: 'Easy Payment', href: 'order-received.html?sample=easy_payment&product=' + fridge.id + '&number=EP-2026-0417' },
      { id: 'KV-10461', date: new Date(now - 41 * DAY).toISOString(), status: 'Completed', total: tv.price, items: 1, method: 'PayHere', href: 'order-received.html?sample=payhere&product=' + tv.id + '&number=KV-10461' },
      { id: 'KV-10388', date: new Date(now - 163 * DAY).toISOString(), status: 'Completed', total: chair.price, items: 1, method: 'Cash on delivery', href: 'order-received.html?sample=cod&product=' + chair.id + '&number=KV-10388' }
    ];
    function allOrders() {
      var mine = KV.load('kv-orders', []); mine = Array.isArray(mine) ? mine : [];
      var norm = mine.map(function (o) {
        var items = Array.isArray(o.items) ? o.items.reduce(function (s, x) { return s + (x.qty || 1); }, 0) : (o.items || o.count || 1);
        var st = o.status || 'Processing'; st = String(st).replace(/^wc-/, ''); st = st.charAt(0).toUpperCase() + st.slice(1).replace(/-/g, ' ');
        return { id: String(o.id || o.number || o.ref || o.orderId || ''), date: o.date || o.created || o.ts || now, status: st, total: +o.total || 0, items: items, method: o.methodTitle || o.paymentMethod || o.method || o.gateway || '' };
      }).filter(function (o) { return o.id; });
      return norm.concat(sampleOrders);
    }
    function stClass(s) { return 'st st-' + String(s).toLowerCase().replace(/\s+/g, '-'); }

    /* ---- views ---- */
    function loginView() {
      return '<div class="acc-sample"><i class="fa-solid fa-circle-info text-easy" aria-hidden="true"></i> This is a preview store. No real sign-in is needed: <a href="#" id="acc-sample">Continue as sample customer</a></div>' +
        '<div class="u-columns col2-set" id="customer_login">' +
        '<div class="u-column1 col-1"><h2>Login</h2><form class="woocommerce-form woocommerce-form-login login" id="f-login" novalidate>' +
        '<p class="woocommerce-form-row woocommerce-form-row--wide form-row"><label for="username">Username or email address&nbsp;<span class="required">*</span></label><input type="text" class="woocommerce-Input input-text" name="username" id="username" autocomplete="username" required></p>' +
        '<p class="woocommerce-form-row woocommerce-form-row--wide form-row"><label for="password">Password&nbsp;<span class="required">*</span></label><input class="woocommerce-Input input-text" type="password" name="password" id="password" autocomplete="current-password" required></p>' +
        '<p class="form-row"><label class="woocommerce-form__label woocommerce-form__label-for-checkbox woocommerce-form-login__rememberme" for="rememberme"><input class="woocommerce-form__input woocommerce-form__input-checkbox" name="rememberme" type="checkbox" id="rememberme" value="forever"> <span>Remember me</span></label></p>' +
        '<p class="form-row"><button type="submit" class="woocommerce-button button woocommerce-form-login__submit" name="login" value="Log in">Log in</button></p>' +
        '<p class="woocommerce-LostPassword lost_password"><a href="#" id="lost">Lost your password?</a></p><p class="small text-muted-kv mb-0">Use sample details. Passwords are never saved; profile details stay in this browser.</p></form></div>' +
        '<div class="u-column2 col-2"><h2>Register</h2><form class="woocommerce-form woocommerce-form-register register" id="f-reg" novalidate>' +
        '<p class="woocommerce-form-row woocommerce-form-row--wide form-row"><label for="reg_name">Full name&nbsp;<span class="required">*</span></label><input type="text" class="woocommerce-Input input-text" name="name" id="reg_name" autocomplete="name" required></p>' +
        '<p class="woocommerce-form-row woocommerce-form-row--wide form-row"><label for="reg_email">Email address&nbsp;<span class="required">*</span></label><input type="email" class="woocommerce-Input input-text" name="email" id="reg_email" autocomplete="email" required></p>' +
        '<p class="small text-muted-kv">Preview registration saves a sample profile in this browser. No email is sent.</p>' +
        '<p class="form-row"><button type="submit" class="woocommerce-Button woocommerce-button button woocommerce-form-register__submit" name="register" value="Register">Register</button></p></form></div></div>';
    }
    function hello(u) { return '<p>Hello <strong>' + esc(u.name) + '</strong> (not ' + esc(u.name) + '? <a href="?tab=customer-logout">Log out</a>)</p>'; }

    function dashboard(u) {
      var o = allOrders(), apps = KV.load('kv-applications', []), out = plan.sched.filter(function (s) { return !s.paid; }).reduce(function (total, s) { return total + s.amt; }, 0), over = plan.sched.some(function (s) { return schedStatus(s) === 'Overdue'; });
      return hello(u) + '<p>From your account you can view recent orders, pay Easy Payment instalments, manage addresses and update your details.</p>' +
        '<div class="acc-tiles"><a class="acc-tile" href="?tab=orders"><i class="fa-solid fa-box" aria-hidden="true"></i><strong>' + o.length + '</strong><span>Orders</span></a>' +
        '<a class="acc-tile easy" href="?tab=easy-payment"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i><strong>' + fmt(out) + '</strong><span>Easy Payment outstanding</span></a>' +
        '<a class="acc-tile easy" href="?tab=easy-payment#applications"><i class="fa-solid fa-file-lines" aria-hidden="true"></i><strong>' + apps.length + '</strong><span>Applications</span></a>' +
        '<a class="acc-tile" href="?tab=wishlist"><i class="fa-solid fa-heart" aria-hidden="true"></i><strong>' + KV.wishlist.items().length + '</strong><span>Wishlist items</span></a></div>' +
        (over ? '<div class="woocommerce-error" role="alert" style="list-style:none"><strong>Instalment overdue.</strong> Your Easy Payment instalment for ' + esc(plan.product.name) + ' is overdue. <a href="?tab=easy-payment">Pay now</a></div>' : '') +
        '<h3>Recent orders</h3>' + ordersTable(o.slice(0, 3));
    }
    function ordersTable(list) {
      if (!list.length) return '<div class="acc-empty">No orders yet. <a href="shop.html">Browse products</a></div>';
      return '<table class="woocommerce-orders-table woocommerce-MyAccount-orders shop_table shop_table_responsive my_account_orders account-orders-table"><thead><tr>' +
        '<th class="woocommerce-orders-table__header woocommerce-orders-table__header-order-number" scope="col">Order</th><th class="woocommerce-orders-table__header woocommerce-orders-table__header-order-date" scope="col">Date</th><th class="woocommerce-orders-table__header woocommerce-orders-table__header-order-status" scope="col">Status</th><th class="woocommerce-orders-table__header woocommerce-orders-table__header-order-total" scope="col">Total</th><th class="woocommerce-orders-table__header woocommerce-orders-table__header-order-actions" scope="col"><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' +
        list.map(function (o) {
          return '<tr class="woocommerce-orders-table__row woocommerce-orders-table__row--status-' + o.status.toLowerCase().replace(/\s+/g, '-') + ' order">' +
            '<td class="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-number" data-title="Order"><a href="' + esc(o.href || ('order-received.html?order=' + encodeURIComponent(o.id))) + '">#' + esc(o.id) + '</a></td>' +
            '<td class="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-date" data-title="Date"><time datetime="' + esc(new Date(o.date).toISOString ? safeIso(o.date) : '') + '">' + dt(o.date) + '</time></td>' +
            '<td class="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-status" data-title="Status"><span class="' + stClass(o.status) + '">' + esc(o.status) + '</span></td>' +
            '<td class="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-total" data-title="Total">' + money(o.total) + ' for ' + o.items + ' item' + (o.items == 1 ? '' : 's') + '</td>' +
            '<td class="woocommerce-orders-table__cell woocommerce-orders-table__cell-order-actions" data-title="Actions"><a href="' + esc(o.href || ('order-received.html?order=' + encodeURIComponent(o.id))) + '" class="woocommerce-button button view" aria-label="View order ' + esc(o.id) + '">View</a></td></tr>';
        }).join('') + '</tbody></table>';
    }
    function safeIso(x) { var t = new Date(x); return isNaN(t) ? '' : t.toISOString().slice(0, 10); }
    function orders() { return '<h2>Orders</h2>' + ordersTable(allOrders()); }

    function easy() {
      var left = plan.sched.filter(function (s) { return !s.paid; }), next = left[0], over = left.filter(function (s) { return schedStatus(s) === 'Overdue'; }), pct = Math.round(plan.paid / plan.months * 100), c = plan.calc;
      var payHref = 'pay.html?gw=payhere&ref=' + encodeURIComponent(plan.ref) + '&amt=' + (next ? next.amt : 0) + '&instalment=' + (next ? next.n : 0);
      var h = '<h2>Easy Payment plans</h2><div class="plan-card"><div class="plan-head"><img src="' + esc(plan.product.images[0]) + '" alt="" width="72" height="72"><div><h3>' + esc(plan.product.name) + '</h3><p>Plan ' + plan.ref + ' &middot; ' + plan.months + ' months &middot; Down payment ' + fmt(c.down) + ' (' + plan.downPct + '%) &middot; <span class="st st-processing">Active</span></p></div></div>' +
        '<div class="plan-progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + plan.months + '" aria-valuenow="' + plan.paid + '" aria-label="Instalments paid"><span style="width:' + pct + '%"></span></div><p class="small text-muted-kv mb-0">' + plan.paid + ' of ' + plan.months + ' instalments paid (' + pct + '%)</p>' +
        '<dl class="plan-meta"><div><dt>Outstanding</dt><dd>' + fmt(left.reduce(function (total, s) { return total + s.amt; }, 0)) + '</dd></div><div><dt>Monthly instalment</dt><dd>' + fmt(c.monthly) + '</dd></div><div><dt>Next due</dt><dd>' + (next ? dt(next.due) : 'Settled') + '</dd></div><div><dt>Total plan value</dt><dd>' + fmt(c.total) + '</dd></div></dl>' +
        (over.length ? '<div class="plan-alert" role="alert"><strong>' + over.length + ' instalment overdue.</strong> Please pay ' + fmt(c.monthly) + ' now to avoid late fees under your agreement.</div>' : '') +
        '<div class="plan-actions">' + (next ? '<a class="btn-kv btn-kv-easy" href="' + payHref + '">Pay instalment ' + next.n + ' (' + fmt(next.amt) + ')</a>' : '') + '<a class="btn-kv btn-kv-outline" href="policies.html#easy-payment">Plan terms</a></div></div>' +
        KV.planNote(c) + '<h3>Payment schedule</h3><div class="sched-wrap" tabindex="0" role="region" aria-label="Payment schedule"><table class="kv-table sched shop_table"><thead><tr><th scope="col">#</th><th scope="col">Due date</th><th scope="col">Amount</th><th scope="col">Status</th><th scope="col"><span class="visually-hidden">Action</span></th></tr></thead><tbody>' +
        plan.sched.map(function (s) { var st = schedStatus(s); return '<tr class="row-' + st.toLowerCase() + '"><td>' + s.n + '</td><td>' + dt(s.due) + '</td><td>' + fmt(s.amt) + '</td><td><span class="' + stClass(st) + '">' + st + '</span></td><td>' + (!s.paid && (st === 'Overdue' || st === 'Due' || s === next) ? '<a class="button btn-kv-sm" href="' + payHref + '">Pay</a>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        '<h3 id="applications" style="margin-top:28px">Applications</h3>';
      var apps = KV.load('kv-applications', []);
      if (!apps.length) h += '<div class="acc-empty">No applications yet. <a href="easy-payment.html#apply">Apply for Easy Payment</a></div>';
      else h += apps.map(function (a) {
        return '<article class="app-card"><header><div><strong>' + esc(a.product) + '</strong><div class="small text-muted-kv">' + esc(a.ref) + ' &middot; submitted ' + dt(a.date) + ' &middot; ' + fmt(a.monthly) + ' x ' + a.months + ' months</div></div><span class="st st-review">' + esc(a.status || 'Under review') + '</span></header>' +
          '<ol class="track" aria-label="Application progress"><li class="done">Submitted</li><li class="done">Documents received</li><li class="cur">Credit review</li><li>Decision by phone</li><li>Delivery</li></ol></article>';
      }).join('') + '<p><a href="easy-payment.html#apply">Start another application</a></p>';
      return h;
    }
    function addresses(u) {
      return '<h2>Addresses</h2><p>These addresses are used on the checkout page by default.</p><div class="addr-grid"><div class="kv-card-box"><h3>Billing address</h3><address>' + esc(u.name) + '<br>No. 24, Temple Road<br>Nugegoda, Colombo<br>' + esc(u.mobile || '0771234567') + '</address><a class="button btn-kv-sm btn-kv-outline" href="checkout.html">Edit</a></div>' +
        '<div class="kv-card-box"><h3>Shipping address</h3><address>' + esc(u.name) + '<br>No. 24, Temple Road<br>Nugegoda, Colombo</address><a class="button btn-kv-sm btn-kv-outline" href="checkout.html">Edit</a></div></div>';
    }
    function details(u) {
      var parts = u.name.split(' '), f = parts.shift(), l = parts.join(' ');
      return '<h2>Account details</h2><form class="woocommerce-EditAccountForm edit-account" id="f-acc" novalidate>' +
        '<p class="woocommerce-form-row form-row form-row-first"><label for="account_first_name">First name&nbsp;<span class="required">*</span></label><input type="text" class="input-text" id="account_first_name" value="' + esc(f) + '" required></p>' +
        '<p class="woocommerce-form-row form-row form-row-last"><label for="account_last_name">Last name</label><input type="text" class="input-text" id="account_last_name" value="' + esc(l) + '"></p>' +
        '<p class="woocommerce-form-row form-row"><label for="account_email">Email address&nbsp;<span class="required">*</span></label><input type="email" class="input-text" id="account_email" value="' + esc(u.email) + '" required></p>' +
        '<p class="woocommerce-form-row form-row"><label for="account_mobile">Mobile number</label><input type="tel" class="input-text" id="account_mobile" maxlength="10" value="' + esc(u.mobile || '') + '"></p>' +
        '<p class="small text-muted-kv">To change your password, use the reset link we email to you. We do not take passwords on this page.</p>' +
        '<p><button type="submit" class="woocommerce-Button button">Save changes</button></p></form>';
    }
    function wish() {
      var ids = KV.wishlist.items(), list = ids.map(KV.product).filter(Boolean);
      return '<div class="acc-wish"><h2>Wishlist</h2>' + (list.length ? KV.grid(list, { cols: 3 }) : '<div class="acc-empty">Your wishlist is empty. Tap the heart on any product to save it. <a href="shop.html">Browse products</a></div>') + '</div>';
    }

    /* ---- router ---- */
    function render() {
      var u = user(), tab = qs.get('tab') || 'dashboard'; tab = ALIAS[tab] || tab;
      if (!TABS.some(function (t) { return t[0] === tab; })) tab = 'dashboard';
      if (tab === 'customer-logout') { try { localStorage.removeItem('kv-account'); } catch (e) {} u = null; history.replaceState(null, '', 'my-account.html'); qs = new URLSearchParams(''); tab = 'dashboard'; }
      d.title = (u ? TABS.filter(function (t) { return t[0] === tab; })[0][1] : 'Login') + ' | My account | Kavindu Online Store';
      if (!u && tab === 'wishlist') { root.className = 'woocommerce'; root.innerHTML = wish(); KV.sync(); return; }
      if (!u) { root.className = 'woocommerce'; root.innerHTML = loginView(); bindLogin(); return; }
      var body = { dashboard: dashboard, orders: orders, 'easy-payment': easy, 'edit-address': addresses, 'edit-account': details, wishlist: wish }[tab](u);
      root.className = 'woocommerce is-in';
      root.innerHTML = '<nav class="woocommerce-MyAccount-navigation" aria-label="Account pages"><ul>' + TABS.map(function (t) {
        return '<li class="woocommerce-MyAccount-navigation-link woocommerce-MyAccount-navigation-link--' + t[0] + (t[0] === tab ? ' is-active' : '') + '"><a href="?tab=' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '><i class="fa-solid ' + t[2] + '" aria-hidden="true"></i>' + t[1] + '</a></li>';
      }).join('') + '</ul></nav><div class="woocommerce-MyAccount-content">' + body + '</div>';
      if (tab === 'wishlist') KV.sync();
      var f = $('#f-acc'); if (f) f.addEventListener('submit', function (e) {
        e.preventDefault(); var fn = $('#account_first_name').value.trim(), em = $('#account_email'); if (!fn || !em.checkValidity() || !em.value) { KV.notice('Please enter your first name and a valid email address.', 'error'); return; }
        KV.save('kv-account', { name: (fn + ' ' + $('#account_last_name').value.trim()).trim(), email: em.value.trim(), mobile: $('#account_mobile').value.trim() }); KV.notice('Account details changed successfully.'); render();
      });
      if (location.hash) { var el = d.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
    }
    function bindLogin() {
      $('#acc-sample').addEventListener('click', function (e) { e.preventDefault(); KV.save('kv-account', SAMPLE); render(); });
      $('#lost').addEventListener('click', function (e) { e.preventDefault(); KV.notice('Password reset is not active in this preview.', 'info'); });
      $('#f-login').addEventListener('submit', function (e) { e.preventDefault(); var n = $('#username').value.trim(); if (!n) { KV.notice('Username is required.', 'error'); $('#username').focus(); return; } $('#password').value = ''; KV.save('kv-account', { name: SAMPLE.name, email: /@/.test(n) ? n : SAMPLE.email, mobile: SAMPLE.mobile }); render(); });
      $('#f-reg').addEventListener('submit', function (e) { e.preventDefault(); var n = $('#reg_name').value.trim(), m = $('#reg_email'); if (!n || !m.value || !m.checkValidity()) { KV.notice('Please enter your name and a valid email address.', 'error'); return; } KV.save('kv-account', { name: n, email: m.value.trim(), mobile: '' }); render(); });
    }
    w.addEventListener('kv:wishlist', function () { if (qs.get('tab') === 'wishlist') render(); });
    w.addEventListener('kv:options', function (e) { if (qs.get('tab') === 'wishlist' && (e.detail.key === 'card' || e.detail.key === 'all')) render(); });
    render();
  });
})(window, document);
