(function (window, document) {
  'use strict';
  const CM = window.CM;
  const safe = (fn, fallback) => { try { return fn(); } catch (e) { return fallback; } };
  const read = (key, fallback) => safe(() => JSON.parse(localStorage.getItem(key)) || fallback, fallback);
  const write = (key, value) => safe(() => localStorage.setItem(key, JSON.stringify(value)), null);
  const page = document.body.dataset.page || '';

  CM.fmt = n => `Rs ${Math.round(Number(n) || 0).toLocaleString('en-LK')}`;
  CM.calc = (price, downPct, months) => {
    const tenure = CM.easyPayment.tenures.find(t => t.months === Number(months)) || CM.easyPayment.tenures[1];
    const down = Math.round(Number(price) * Number(downPct) / 100);
    const financed = Math.max(0, Number(price) - down);
    const total = Math.round(down + financed * (1 + tenure.markupPct / 100));
    const monthly = Math.ceil((financed * (1 + tenure.markupPct / 100) / tenure.months) / 10) * 10;
    return { down, financed, total, monthly, extra: total - Number(price) };
  };
  CM.fromMonthly = price => CM.calc(price, CM.easyPayment.defaultDownPct, Math.max(...CM.easyPayment.tenures.map(t => t.months))).monthly;

  const getCart = () => read('cm-cart', []);
  const getList = key => read(key, []);
  const setList = (key, values) => { write(key, values); updateCounts(); };
  const toast = message => {
    let el = document.querySelector('.cm-toast');
    if (!el) { el = document.createElement('div'); el.className = 'cm-toast toast align-items-center text-bg-dark border-0'; el.setAttribute('role', 'status'); el.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>'; document.body.appendChild(el); }
    el.querySelector('.toast-body').textContent = message;
    if (window.bootstrap) bootstrap.Toast.getOrCreateInstance(el, { delay: 2200 }).show();
  };
  const updateCounts = () => {
    const cart = getCart(); const wishlist = getList('cm-wishlist'); const compare = getList('cm-compare');
    const cartCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    document.querySelectorAll('[data-count="cart"]').forEach(el => { el.textContent = cartCount; el.hidden = !cartCount; });
    document.querySelectorAll('[data-count="wishlist"]').forEach(el => { el.textContent = wishlist.length; el.hidden = !wishlist.length; });
    document.querySelectorAll('[data-count="compare"]').forEach(el => { el.textContent = compare.length; el.hidden = !compare.length; });
    renderDrawer();
  };
  const product = id => CM.products.find(p => p.id === id);
  const cartCount = () => getCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const renderDrawer = () => {
    const title = document.querySelector('[data-drawer-title]');
    const items = document.querySelector('[data-drawer-items]');
    const summary = document.querySelector('[data-drawer-summary]');
    if (!title || !items || !summary) return;
    const cart = getCart().map(item => ({ ...item, product: product(item.id) })).filter(item => item.product);
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    title.textContent = `Your cart (${cartCount()})`;
    if (!cart.length) {
      items.innerHTML = '<div class="cm-drawer-empty"><i class="fa-solid fa-bag-shopping"></i><h3>Your cart is empty</h3><p>Add something you love and it will appear here.</p><a class="btn-cm btn-cm-primary" href="shop.html">Start shopping</a></div>';
      summary.innerHTML = '';
      return;
    }
    items.innerHTML = cart.map(({ product: p, qty }) => `<article class="cm-drawer-item"><a class="cm-drawer-thumb" href="product.html?id=${encodeURIComponent(p.id)}"><img src="${p.images[0]}" alt="${p.name}"></a><div class="cm-drawer-item-info"><a class="cm-drawer-item-name" href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a><strong>${CM.fmt(p.price)}</strong><div class="cm-drawer-item-controls"><button type="button" data-cart-qty="minus" data-cart-id="${p.id}" aria-label="Decrease ${p.name}">−</button><span>${qty}</span><button type="button" data-cart-qty="plus" data-cart-id="${p.id}" aria-label="Increase ${p.name}">+</button><button class="cm-drawer-remove" type="button" data-cart-remove="${p.id}" aria-label="Remove ${p.name}"><i class="fa-regular fa-trash-can"></i></button></div></div></article>`).join('');
    const remaining = Math.max(0, 50000 - subtotal);
    const progress = Math.min(100, subtotal / 50000 * 100);
    summary.innerHTML = `<div class="cm-drawer-delivery"><div><strong>${remaining ? `Add ${CM.fmt(remaining)} for free delivery` : 'You have unlocked free delivery'}</strong><span>${remaining ? 'Free delivery on orders over Rs 50,000' : 'Your order qualifies for islandwide free delivery'}</span></div><div class="cm-drawer-progress"><i style="width:${progress}%"></i></div></div><div class="cm-drawer-subtotal"><span>Subtotal</span><strong>${CM.fmt(subtotal)}</strong></div><p class="cm-drawer-easy">or from ${CM.fmt(CM.fromMonthly(subtotal))}/mo with Easy Payment</p><div class="cm-drawer-actions"><a class="btn-cm btn-cm-primary" href="checkout.html">Checkout</a><a class="btn-cm btn-cm-outline" href="cart.html">View cart</a></div>`;
  };
  const openDrawer = () => {
    renderDrawer();
    const drawer = document.getElementById('cmCartDrawer');
    if (drawer && window.bootstrap) bootstrap.Offcanvas.getOrCreateInstance(drawer).show();
    else if (!drawer) window.location.href = 'cart.html';
  };
  const toggleList = (key, id, label) => {
    const values = getList(key); const index = values.indexOf(id);
    if (index >= 0) { values.splice(index, 1); toast(`${label} removed`); } else { values.push(id); toast(`${label} saved`); }
    setList(key, values);
  };
  const addToCart = id => {
    const cart = getCart(); const found = cart.find(item => item.id === id);
    if (found) found.qty = Number(found.qty || 0) + 1; else cart.push({ id, qty: 1 });
    write('cm-cart', cart); updateCounts(); openDrawer();
  };

  /* Simple real-shop card: whole card clickable, image, name, price, offer + timer, favourite, add to cart */
  CM.saleEnds = p => { if (!p.was) return 0; let h = 0; for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const t = new Date(); t.setHours(23, 59, 0, 0); return t.getTime() + (h % 5) * 86400000; };
  CM.endsText = ms => { const left = ms - Date.now(); if (left <= 0) return 'Offer ended'; const d = Math.floor(left / 864e5), h = Math.floor(left % 864e5 / 36e5), m = Math.floor(left % 36e5 / 6e4); return `Offer ends in ${d ? d + 'd ' : ''}${h}h ${String(m).padStart(2, '0')}m`; };
  CM.productCard = p => {
    const discount = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
    const ends = CM.saleEnds(p);
    const url = `product.html?id=${encodeURIComponent(p.id)}`;
    return `<article class="cm-card cm-product-card kv-simple-card" data-product-id="${p.id}">
      <div class="ks-media"><img src="${p.images[0]}" alt="${p.name}" loading="lazy" decoding="async">
        ${p.was ? `<span class="ks-badge">-${discount}%</span>` : ''}
        <button class="ks-wish" type="button" data-wishlist="${p.id}" aria-label="Add ${p.name} to favourites"><i class="fa-regular fa-heart"></i></button></div>
      <span class="ks-brand">${p.brand}</span>
      <h3 class="ks-title"><a class="ks-link" href="${url}">${p.name}</a></h3>
      <div class="ks-price"><span class="ks-now ${p.was ? 'is-sale' : ''}">${CM.fmt(p.price)}</span>${p.was ? `<del class="ks-was">${CM.fmt(p.was)}</del>` : ''}</div>
      ${ends ? `<span class="ks-offer" data-ends="${ends}"><i class="fa-regular fa-clock"></i> <span>${CM.endsText(ends)}</span></span>` : ''}
      <button class="ks-add btn-cm btn-cm-primary" type="button" data-add-cart="${p.id}">Add to cart</button>
    </article>`;
  };
  setInterval(() => document.querySelectorAll('.ks-offer[data-ends]').forEach(el => { el.querySelector('span').textContent = CM.endsText(+el.dataset.ends); }), 30000);


  const header = () => {
    const links = [['refrigerators', 'Refrigerators'], ['washing-machines', 'Washing Machines'], ['tv-audio', 'TV & Audio'], ['air-conditioners', 'Air Conditioners'], ['kitchen-appliances', 'Kitchen Appliances'], ['furniture', 'Furniture'], ['laptops-phones', 'Laptops & Phones']];
    const categories = CM.categories.map(c => `<a class="cm-mega-item" href="shop.html?category=${c.id}"><i class="${c.icon}"></i><span>${c.name}</span></a>`).join('');
    document.querySelector('#cm-header').innerHTML = `<div class="cm-topbar"><div class="cm-container"><span><i class="fa-solid fa-phone me-1"></i> ${CM.brand.hotline}</span><div class="cm-topbar-right"><a href="stores.html">Store locator</a><a href="account.html#orders">Track order</a><span>LKR ▾</span></div></div></div><div class="cm-mainbar"><div class="cm-container"><button class="cm-mobile-menu" type="button" data-bs-toggle="offcanvas" data-bs-target="#cmOffcanvas" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button><a class="cm-logo" href="index.html" aria-label="Kavindu Online Store home"><img src="assets/img/logo.svg?v=2" alt="Kavindu Online Store"></a><form class="cm-search" action="shop.html"><select aria-label="Search category"><option>All categories</option><option>Furniture</option><option>Appliances</option><option>Electronics</option></select><input name="q" type="search" placeholder="Search for products, brands and more..." aria-label="Search products"><button type="submit" aria-label="Search"><i class="fa-solid fa-magnifying-glass"></i></button></form><button class="cm-mobile-search" type="button" aria-label="Search" data-mobile-search><i class="fa-solid fa-magnifying-glass"></i></button><div class="cm-head-actions"><a class="cm-head-action" href="account.html"><i class="fa-regular fa-user"></i><span>Account</span></a><a class="cm-head-action" href="account.html#wishlist"><i class="fa-regular fa-heart"></i><span>Wishlist</span><b class="cm-count" data-count="wishlist" hidden>0</b></a><a class="cm-head-action" href="shop.html?compare=1"><i class="fa-solid fa-code-compare"></i><span>Compare</span><b class="cm-count" data-count="compare" hidden>0</b></a><a class="cm-head-action cm-cart-action" href="cart.html" data-cart-open><i class="fa-solid fa-bag-shopping"></i><span>Cart</span><b class="cm-count" data-count="cart" hidden>0</b></a></div></div></div><nav class="cm-nav"><div class="cm-container"><a class="cm-nav-link ${page === 'home' ? 'active' : ''}" href="index.html"><i class="fa-solid fa-house"></i> Home</a><button class="cm-nav-link" type="button" data-mega-toggle><i class="fa-solid fa-table-cells-large"></i> All Categories <i class="fa-solid fa-chevron-down ms-1 small"></i></button>${links.map(([id, label]) => `<a class="cm-nav-link ${page === id ? 'active' : ''}" href="shop.html?category=${id}">${label}</a>`).join('')}<a class="cm-nav-link payment" href="easy-payment.html"><i class="fa-solid fa-wallet"></i> Easy Payment</a><a class="cm-nav-link" href="shop.html?sort=deals">Deals</a></div><div class="cm-mega" data-mega><div class="cm-container"><div class="cm-mega-grid">${categories}</div></div></div></nav><div class="offcanvas offcanvas-start" tabindex="-1" id="cmOffcanvas" aria-labelledby="cmOffcanvasLabel"><div class="offcanvas-header"><h5 id="cmOffcanvasLabel">Shop Kavindu Online Store</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body"><a class="btn-cm btn-cm-primary w-100 mb-3" href="shop.html">Browse all products</a>${CM.categories.map(c => `<a class="d-flex align-items-center gap-3 py-3 border-bottom" href="shop.html?category=${c.id}"><i class="${c.icon} text-primary"></i>${c.name}<i class="fa-solid fa-chevron-right ms-auto small text-muted"></i></a>`).join('')}<a class="d-flex align-items-center gap-3 py-3 text-accent" href="easy-payment.html"><i class="fa-solid fa-wallet"></i> Easy Payment</a></div></div><div class="offcanvas offcanvas-end cm-drawer" tabindex="-1" id="cmCartDrawer" aria-labelledby="cmCartDrawerLabel"><div class="offcanvas-header"><h2 class="offcanvas-title" id="cmCartDrawerLabel" data-drawer-title>Your cart (0)</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body cm-drawer-body"><div class="cm-drawer-items" data-drawer-items></div><div class="cm-drawer-summary" data-drawer-summary></div></div></div>`;
  };
  const footer = () => {
    document.querySelector('#cm-footer').innerHTML = `<footer class="cm-footer"><div class="cm-container cm-footer-main"><div><h3>Kavindu Online Store</h3><p>Your everyday destination for furniture, electronics and home appliances.</p><p class="text-accent"><i class="fa-solid fa-circle-info me-1"></i> ${CM.brand.note}</p><a class="btn-cm btn-cm-light btn-cm-sm" href="about.html">About our store</a></div><div><h4>Shop</h4><ul><li><a href="shop.html">All products</a></li><li><a href="shop.html?sort=deals">Deals of the week</a></li><li><a href="easy-payment.html">Easy Payment</a></li><li><a href="stores.html">Our showrooms</a></li></ul></div><div><h4>Help</h4><ul><li><a href="contact.html">Contact us</a></li><li><a href="account.html#orders">Track your order</a></li><li><a href="account.html">My account</a></li><li><a href="contact.html">Delivery & returns</a></li></ul></div><div><h4>Easy Payment</h4><ul><li><a href="easy-payment.html">How it works</a></li><li><a href="easy-payment.html#eligibility">Eligibility</a></li><li><a href="easy-payment.html#faq">FAQs</a></li></ul></div><div><h4>Contact</h4><ul><li><a href="tel:${CM.brand.hotline}">${CM.brand.hotline}</a></li><li><a href="mailto:${CM.brand.email}">${CM.brand.email}</a></li><li>Mon–Sat, 9:00 AM–7:00 PM</li></ul></div></div><div class="cm-container cm-footer-bottom"><span>© 2026 Kavindu Online Store. All rights reserved.</span><div class="cm-footer-payment"><span>Visa</span><span>Mastercard</span><span>Amex</span><span>PayHere</span><span>Koko</span><span>Mintpay</span></div></div></footer>`;
  };
  const mobileBar = () => { const el = document.createElement('div'); el.className = 'cm-bottom-bar'; el.innerHTML = `<a class="cm-bottom-item ${page === 'home' ? 'active' : ''}" href="index.html"><i class="fa-solid fa-house"></i><span>Home</span></a><a class="cm-bottom-item" href="shop.html"><i class="fa-solid fa-table-cells-large"></i><span>Categories</span></a><a class="cm-bottom-item easy" href="easy-payment.html"><i class="fa-solid fa-wallet"></i><span>Easy Pay</span></a><a class="cm-bottom-item" href="cart.html"><i class="fa-solid fa-bag-shopping"></i><span>Cart</span><b class="cm-count" data-count="cart" hidden>0</b></a><a class="cm-bottom-item" href="account.html"><i class="fa-regular fa-user"></i><span>Account</span></a>`; document.body.appendChild(el); };
  const globalEvents = () => {
    document.addEventListener('click', event => {
      const add = event.target.closest('[data-add-cart]'); if (add) { event.preventDefault(); addToCart(add.dataset.addCart); return; }
      const cartOpen = event.target.closest('[data-cart-open], .cm-bottom-item[href="cart.html"]'); if (cartOpen) { event.preventDefault(); openDrawer(); return; }
      const qty = event.target.closest('[data-cart-qty]'); if (qty) { const cart = getCart(); const item = cart.find(x => x.id === qty.dataset.cartId); if (item) item.qty = Math.max(0, item.qty + (qty.dataset.cartQty === 'plus' ? 1 : -1)); write('cm-cart', cart.filter(x => x.qty)); updateCounts(); return; }
      const remove = event.target.closest('[data-cart-remove]'); if (remove) { write('cm-cart', getCart().filter(x => x.id !== remove.dataset.cartRemove)); updateCounts(); return; }
      const wish = event.target.closest('[data-wishlist]'); if (wish) { toggleList('cm-wishlist', wish.dataset.wishlist, 'Wishlist item'); wish.classList.toggle('active'); return; }
      const compare = event.target.closest('[data-compare]'); if (compare) { toggleList('cm-compare', compare.dataset.compare, 'Compare item'); compare.classList.toggle('active'); return; }
      const mega = event.target.closest('[data-mega-toggle]'); if (mega) { document.querySelector('[data-mega]').classList.toggle('open'); }
    });
    const searchButton = document.querySelector('[data-mobile-search]');
    searchButton?.addEventListener('click', () => { const search = document.querySelector('.cm-search'); search.style.display = search.style.display === 'flex' ? '' : 'flex'; search.querySelector('input').focus(); });
    window.addEventListener('scroll', () => document.body.classList.toggle('cm-sticky', window.scrollY > 80), { passive: true });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
    const watch = root => root.querySelectorAll?.('.reveal:not(.is-visible)').forEach(el => observer.observe(el));
    watch(document);
    // Reveal elements rendered later by page scripts too
    new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches('.reveal')) observer.observe(n); watch(n); } }))).observe(document.body, { childList: true, subtree: true });
    updateCounts();
  };
  header(); footer(); mobileBar(); globalEvents();
})(window, document);
