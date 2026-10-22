/* Cart page - WooCommerce cart markup. Uses window.KV (theme.js). Shipping choice shared with checkout via localStorage "kv-ship"; coupon via "kv-coupon". */
(function (w, d) {
  'use strict';
  var root = d.getElementById('cart-root'); if (!root) return;
  var qs = new URLSearchParams(location.search);
  var COUPONS = { WELCOME5: { pct: 5, label: 'Welcome offer 5%' }, KAVINDU10: { pct: 10, label: 'Kavindu 10% off' } };
  var SHIP = [
    { id: 'standard', title: 'Standard delivery (islandwide)', note: '3-5 working days. Free over Rs 50,000.' },
    { id: 'express', title: 'Colombo express delivery', note: 'Next working day, Colombo district only.' },
    { id: 'pickup', title: 'Showroom pickup', note: 'Free. Collect from our Avissawella showroom in 2 working days.' }
  ];
  function ship(id) { return id === 'express' ? 2500 : id === 'pickup' ? 0 : KV.cart.shippingFee(); }
  function getShip() { var s = KV.load('kv-ship', 'standard'); return SHIP.some(function (x) { return x.id === s; }) ? s : 'standard'; }
  function coupon() { var c = KV.load('kv-coupon', ''); return COUPONS[c] ? c : ''; }
  function discount() { var c = coupon(); return c ? Math.round(KV.cart.subtotal() * COUPONS[c].pct / 100) : 0; }
  function notice(html, type) {
    var n = d.getElementById('co-notices');
    n.innerHTML = type === 'error' ? '<ul class="woocommerce-error" role="alert"><li>' + html + '</li></ul>' : '<div class="woocommerce-' + (type || 'message') + '" role="alert">' + html + '</div>';
  }
  function emptyCart() {
    root.innerHTML = '<p class="cart-empty woocommerce-info">Your cart is currently empty.</p>' +
      '<p class="return-to-shop"><a class="button wc-backward" href="shop.html">Return to shop</a></p>' +
      '<p class="small text-muted-kv sample-link"><a href="cart.html?sample=1">Add sample items</a> to preview this page.</p>';
  }
  function render() {
    var items = KV.cart.items();
    if (!items.length) { emptyCart(); return; }
    var sub = KV.cart.subtotal(), disc = discount(), sid = getShip(), fee = ship(sid), total = sub - disc + fee;
    var rows = items.map(function (i) {
      var p = i.product, url = KV.url(p);
      return '<tr class="woocommerce-cart-form__cart-item cart_item" data-id="' + KV.esc(p.id) + '">' +
        '<td class="product-remove"><button type="button" class="remove" data-rm="' + KV.esc(p.id) + '" aria-label="Remove ' + KV.esc(p.name) + ' from cart">&times;</button></td>' +
        '<td class="product-thumbnail"><a href="' + url + '"><img src="' + KV.esc(p.images[0]) + '" alt="" width="80" height="80" loading="lazy"></a></td>' +
        '<td class="product-name" data-title="Product"><a href="' + url + '">' + KV.esc(p.name) + '</a><span class="cart-meta">' + KV.esc(p.brand) + ' &middot; Model ' + KV.esc(p.model) + '</span>' +
        (p.price >= KV.easy.minPrice ? '<span class="easy-line">Or Rs ' + KV.easyMonthly(p).toLocaleString('en-US') + ' x 12 months with Easy Payment</span>' : '') + '</td>' +
        '<td class="product-price" data-title="Price">' + KV.price(p.price) + '</td>' +
        '<td class="product-quantity" data-title="Quantity"><div class="quantity"><label class="screen-reader-text" for="qty_' + KV.esc(p.id) + '">Quantity for ' + KV.esc(p.name) + '</label>' +
        '<input type="number" id="qty_' + KV.esc(p.id) + '" class="input-text qty text" data-qty="' + KV.esc(p.id) + '" value="' + i.qty + '" min="1" max="99" step="1" inputmode="numeric"></div></td>' +
        '<td class="product-subtotal" data-title="Subtotal">' + KV.price(p.price * i.qty) + '</td></tr>';
    }).join('');
    var c = coupon();
    var shipRows = SHIP.map(function (s) {
      var f = ship(s.id);
      return '<li><input type="radio" name="shipping_method" id="ship_' + s.id + '" value="' + s.id + '" class="shipping_method"' + (s.id === sid ? ' checked' : '') + '>' +
        '<label for="ship_' + s.id + '"><span>' + s.title + '</span> <strong>' + (f ? KV.price(f) : 'Free') + '</strong><small>' + s.note + '</small></label></li>';
    }).join('');
    var inst = KV.calc(total, KV.easy.minDownPct, 12);
    var cross = KV.products.filter(function (p) { return !items.some(function (i) { return i.id === p.id; }); }).sort(function (a, b) { return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0); }).slice(0, 4);
    root.innerHTML =
      '<div class="cart-layout"><form class="woocommerce-cart-form" id="cart-form" action="cart.html" method="post" novalidate>' +
      '<table class="shop_table shop_table_responsive cart woocommerce-cart-form__contents"><thead><tr><th class="product-remove"><span class="screen-reader-text">Remove</span></th><th class="product-thumbnail"><span class="screen-reader-text">Image</span></th><th class="product-name">Product</th><th class="product-price">Price</th><th class="product-quantity">Quantity</th><th class="product-subtotal">Subtotal</th></tr></thead><tbody>' + rows +
      '</tbody></table>' +
      '<div class="actions"><div class="coupon"><label for="coupon_code" class="screen-reader-text">Coupon:</label><input type="text" name="coupon_code" class="input-text" id="coupon_code" placeholder="Coupon code" autocomplete="off" value="' + KV.esc(c) + '"><button type="submit" class="button btn-kv-outline" name="apply_coupon" value="Apply coupon">Apply coupon</button></div>' +
      '<a class="button btn-kv-outline" href="shop.html">Continue shopping</a></div></form>' +
      '<div class="cart-collaterals"><div class="cart_totals"><h2>Cart totals</h2><table class="shop_table shop_table_responsive">' +
      '<tr class="cart-subtotal"><th>Subtotal</th><td data-title="Subtotal">' + KV.price(sub) + '</td></tr>' +
      (disc ? '<tr class="cart-discount coupon-' + c.toLowerCase() + '"><th>Coupon: ' + c.toLowerCase() + '</th><td data-title="Coupon">-' + KV.price(disc) + ' <button type="button" class="link-btn" data-rm-coupon>[Remove]</button></td></tr>' : '') +
      '<tr class="woocommerce-shipping-totals shipping"><th>Shipping</th><td data-title="Shipping"><ul id="shipping_method" class="woocommerce-shipping-methods">' + shipRows + '</ul><p class="woocommerce-shipping-destination small text-muted-kv">Shipping options update at checkout once you choose your district.</p></td></tr>' +
      '<tr class="order-total"><th>Total</th><td data-title="Total"><strong>' + KV.price(total) + '</strong></td></tr></table>' +
      (total >= KV.easy.minPrice ? '<p class="cart-easy-hint"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> <span>Pay monthly with <a href="easy-payment.html">Easy Payment</a>: from <strong>' + KV.fmt(inst.monthly) + ' x 12 months</strong> after a ' + KV.easy.minDownPct + '% down payment. Choose it at checkout.</span></p>' : '') +
      '<div class="wc-proceed-to-checkout"><a href="checkout.html" class="checkout-button button alt wc-forward">Proceed to checkout</a></div>' +
      '<p class="cart-secure small text-muted-kv"><i class="fa-solid fa-lock" aria-hidden="true"></i> Secure checkout. We accept cards, Koko, Mintpay, Easy Payment and cash on delivery.</p></div></div></div>' +
      '<section class="cross-sells"><h2>You may also like</h2>' + KV.grid(cross, { cols: 4 }) + '</section>';
    KV.sync();
  }
  root.addEventListener('click', function (e) {
    var b;
    if ((b = e.target.closest('[data-rm]'))) { KV.cart.remove(b.getAttribute('data-rm')); notice('Item removed from your cart.', 'message'); }
    else if ((b = e.target.closest('[data-rm-coupon]'))) { KV.save('kv-coupon', ''); render(); notice('Coupon has been removed.', 'message'); }
  });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('[data-qty]')) { KV.cart.setQty(t.getAttribute('data-qty'), t.value); }
    else if (t.name === 'shipping_method') { KV.save('kv-ship', t.value); render(); var r = d.getElementById('ship_' + t.value); if (r) r.focus(); }
  });
  root.addEventListener('submit', function (e) {
    e.preventDefault();
    var code = (d.getElementById('coupon_code').value || '').trim().toUpperCase();
    if (!code) { notice('Please enter a coupon code.', 'error'); return; }
    if (!COUPONS[code]) { notice('Coupon &ldquo;' + KV.esc(code.toLowerCase()) + '&rdquo; does not exist!', 'error'); return; }
    KV.save('kv-coupon', code); render(); notice('Coupon code applied successfully.', 'message');
  });
  w.addEventListener('kv:options', function (e) {
    if (e.detail.key !== 'card' && e.detail.key !== 'all') return;
    var host = root.querySelector('.cross-sells ul.products');
    if (!host) return;
    var products = Array.prototype.map.call(host.children, function (li) { return KV.product(li.getAttribute('data-id')); }).filter(Boolean);
    host.outerHTML = KV.grid(products, { cols: 4 }); KV.sync();
  });
  w.addEventListener('kv:cart', function (e) { render(); });
  KV.ready(function () {
    if (qs.get('sample') === '1' && !KV.cart.count()) {
      ['innovex-no-frost-inverter-fridge-250l', 'panasonic-25l-microwave', 'philips-blender-15l'].forEach(function (id, n) { KV.cart.add(id, n === 2 ? 2 : 1, { silent: true }); });
    }
    render();
  });
})(window, document);
