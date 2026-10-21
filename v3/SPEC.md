# Kavindu Online Store — v3 Build Spec (WooCommerce-ready, real-business look)

**Current implementation rules (22 October 2026):** `README.md` and `../CLIENT-REVIEW.md` record the verified client-presentation revision. Keep all design options. Hero/banner slots are image-only; current desktop hero height is 560px in all layouts. Standard cards are bordered, fully clickable, with favourite/Add to cart and no stock or finance lines. The older component descriptions below are historical where they conflict. No real payment, authentication, document submission or email service is connected.

Client: **Kavindu Enterprises** (Sri Lanka). Store: **Kavindu Online Store**. Sells home & office furniture, home appliances
(fridges, washing machines, AC, kitchen), TVs/audio, laptops/phones. Has showrooms. Key feature: **Easy Payment** — in-house
monthly instalments (cash price lowest; monthly plan costs more; formula from client still pending → placeholder table in data.js).
Gateways: PayHere (cards, wallets, bank card instalments), Koko (pay in 3), Mintpay (pay in 3), Cash on Delivery, Bank transfer, Easy Payment (in-house, needs approval). PayPal NOT offered.
Will be built on **WordPress + WooCommerce** → HTML must use WooCommerce default markup/classes (see /home/vjranga/Documents/chamara/research/woocommerce-patterns.md section 2 — copy those structures).

Root: /home/vjranga/Documents/chamara/demo/v3/   (static HTML, no build step)
Research to read: research/intl-retail-patterns.md, research/woocommerce-patterns.md, research/payment-brand-assets.md (all under /home/vjranga/Documents/chamara/).

## 1. Look & feel — "real established retailer", accessible, NOT AI-looking
Reference feel: Courts (MY/SG), The Brick, Harvey Norman, Currys — offer-led, dense but orderly, one brand colour, white page.
- AVOID: gradient heroes with centred slogan, blobs, glassmorphism, emoji, generic icon trios, 16–24px rounded soft-shadow cards everywhere,
  pill badges everywhere, purple gradients, fake counters/testimonials with avatars, "Elevate your home"-style copy, over-animated scroll reveals,
  identical 4-card rows repeated for every section, "Demo"/"Lorem" text in the UI.
- DO: specific retail copy (model numbers, capacities, RRP + saving, "Rs 12,450 x 12 months"), named rails by buying intent
  ("Best sellers in refrigerators", "Under Rs 100,000", "New arrivals – furniture"), service info (delivery, installation, warranty, showrooms),
  real payment logos, store locator, hotline, legal pages.
- Corners: 6px buttons/inputs, 8px cards/images. Borders 1px #E3E6EA. Shadows only on dropdowns/drawers.
- Motion: hover colour changes + simple slide for slider. No scroll-reveal animations.

## 2. Design tokens (CSS custom properties on :root in assets/css/theme.css — names map to WP Customizer later)
--color-primary: #1C6FB0 (logo blue, AA on white for text ≥ 15px bold / buttons with white text)
--color-primary-dark: #155A91
--color-secondary: #16213A (navy — top bar, footer, dark bands)
--color-easy: #1F8A5B (Easy Payment only) ; --color-easy-soft: #E8F5EE
--color-sale: #C62828 ; --color-sale-soft: #FDECEC
--color-star: #E8A317
--color-text: #1F2937 ; --color-text-muted: #5B6573 (AA) ; --color-border: #E3E6EA ; --color-bg-alt: #F4F6F8 ; --color-white: #fff
--font-body: 'Poppins', system-ui, sans-serif ; base 15px desktop / 15px mobile, line-height 1.6; min text 13px.
Type scale: h1 40/1.15 (mobile 28) w600 · h2 28 (mobile 22) w600 · h3 20 w600 · h4 16 w600 · body 15 · small 13. Weights used: 400, 500, 600.
--container: 1320px ; gutters 24px (16 mobile) ; section spacing 64px desktop / 40px mobile; section heading row: title left + "View all" link right.
Buttons (.button WooCommerce class + .btn variants): height 44px, padding 0 20px, radius 6px, 15px/600.
 primary = blue bg white text; secondary = navy; outline = 1px border text colour; easy = green; ghost link. Focus: 3px outline rgba(28,111,176,.35) offset 2px. Disabled .5.
Accessibility: WCAG AA contrast, visible focus everywhere, 44px touch targets, labels on all inputs, aria on icon buttons, skip link, alt text, lang="en", prefers-reduced-motion.

## 3. Libraries (pinned CDN)
Bootstrap 5.3.3 (grid/utilities/offcanvas/modal/collapse only), Font Awesome 6.5.2 free, Poppins (Google Fonts 400/500/600). No Swiper — small vanilla slider in theme.js.

## 4. Theme options (like a ThemeForest demo switcher) — ALL must work
Floating "Theme options" button bottom-left (gear icon) → offcanvas panel with radio groups. Saved in localStorage key `kv-options` (try/catch), applied as `<body data-header="1" data-hero="1" data-cats="1" data-card="1" data-rail="1" data-footer="1">`. Changing an option re-renders instantly.
- **Header** (data-header):
  1. *Retail classic* (Courts/Electro): navy top bar (hotline, "Free delivery Colombo over Rs 50,000", Store locator, Track order) → white main row (logo · wide search with category select · Easy Payment link · account · wishlist · cart with total) → blue nav bar with "All categories" vertical mega dropdown + main category links + "Deals" (red text).
  2. *Centered* (furniture boutique): thin utility bar → logo centred, search icon left + icons right → centred nav links with mega menu panels (3 cols of links + 1 promo image).
  3. *Compact sticky*: single white row: logo · inline nav · search field (collapsible) · icons; announcement strip above (one-line offer, dismissible).
  Mobile (all): hamburger · logo · search icon · cart; full-width search row below; offcanvas menu with categories accordion.
- **Hero** (data-hero) — desktop heights given:
  1. *Small slider + 2 banners*: left slider 2/3 width 460px tall (3 slides: offer banners with headline, price/finance line, "Shop now"), right 2 stacked promo banners 222px each.
  2. *Full-width banner*: edge-to-edge 560px image banner, text panel left on solid white/navy box (not gradient blob), 2 CTAs; below it 4 small service tiles.
  3. *Category hero*: left vertical category list (always open, like Electro) + right slider 480px.
  Mobile: slider/banners 260–320px, text below image if needed for readability.
- **Category display** (data-cats): 1 image tiles grid (8, photo + name + "x products") · 2 icon row (FA icons in square outline boxes + label, horizontal scroll) · 3 circle images row.
- **Product card** (data-card) — all use WooCommerce `li.product` markup:
  1. *Standard retail* (Courts): image, badges (−% red, Free Gift, New), brand, name (2 lines), key spec line, rating, price (ins) + RRP (del) + "Save Rs X", Easy Payment line "Rs 12,450 x 12 months" (green), stock line, Add to cart button full width.
  2. *Hover actions* (Woodmart): cleaner, icons stack on image hover (wishlist, compare, quick view), add-to-cart bar slides up on hover (always visible on touch).
  3. *Detailed list-style* (Currys): horizontal on desktop: image | name + 3 spec bullets + rating | price block + finance + delivery + button.
- **Homepage product sections** (data-rail1 Best sellers, data-rail2 Deals this week, data-rail3 New arrivals - furniture; legacy `rail` key = alias setting all three; defaults 1/3/2): each 1 tabs + grid (4 cols) · 2 horizontal carousel with arrows · 3 feature/deal big card + grid (Deals keeps countdown).
- **Skin** (data-skin, default 1): 1 Classic retail · 2 Modern (overrides scoped under `body[data-skin="2"]`: full-width white/#F3F4F6/navy bands, eyebrow labels, 34px h2, 12px radius, pill CTAs, grey product image area, white header with underline nav + pill search, navy footer and Easy Payment band). `?opt=skin-2,rail1-2,rail2-1`.
- **Footer** (data-footer): 1 navy 4 columns (about+contact, shop, customer service, newsletter) + bottom bar copyright + payment logos · 2 USP strip (delivery, warranty, Easy Payment, showrooms) + light 5 columns · 3 compact centred (logo, links row, social, payments, copyright).

## 5. Shared UI (theme.js renders into placeholders on every page: `#site-header`, `#site-footer`)
- WooCommerce mini-cart drawer (offcanvas end): `.widget_shopping_cart_content`, `ul.woocommerce-mini-cart`, totals, buttons View cart / Checkout; opens on add-to-cart. Free delivery progress (Rs 50,000).
- Mobile bottom bar (<992px): Home, Categories, Easy Pay, Cart, Account (icons + labels, active state, no gimmicks).
- WhatsApp float button (above bottom bar on mobile).
- Quick view modal (card 2), compare drawer (up to 3), wishlist (localStorage).
- Notices: `.woocommerce-message` on add to cart (in addition to drawer for accessibility via aria-live).
- Prices: `<span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">Rs</span>&nbsp;131,900</bdi></span>`.
- localStorage keys: `kv-cart` [{id,qty}], `kv-wishlist` [id], `kv-compare` [id], `kv-options`, `kv-orders`.
- Global JS API (window.KV): fmt(n), price(n) html, calc(price, downPct, months) → {down, financed, total, monthly, extra}, product(id), products, cart.add/remove/setQty/items/subtotal/count, openCart(), card(p) (respects current card option), render() .

## 6. Pages
Home index.html (body.home): header · hero (option) · category display (option) · rail "Best sellers" (option) · Easy Payment explainer band (navy or easy-soft; 3 steps + compact calculator + partner logos Koko/Mintpay/PayHere) · rail "Deals this week" · two promo banners (furniture / AC) · rail "New arrivals – furniture" · brands strip (text logos in bordered boxes) · buying guides (3 article cards: "How to choose an inverter fridge", "Sofa fabric guide", "AC size by room") · showroom strip (nearest showroom + hotline) · footer (option).
Shop shop.html (WC archive): breadcrumb, header with title + category description, sidebar filters (categories, price, brand, Easy Payment max monthly, availability, rating) / offcanvas on mobile, toolbar (result count, ordering, per-page, grid/list), ul.products, pagination. `?cat=`, `?q=`, `?sort=`.
Product product.html?id= (single-product): gallery + thumbs, summary (brand, title, model/SKU, rating, price + RRP + saving, stock, short spec bullets), **payment options box** (Pay in full / Easy Payment calculator with tenure buttons + down % / Bank card 0% instalments via PayHere (3/6/12) / Koko & Mintpay pay-in-3 with logos), form.cart qty + add to cart + buy now, delivery & installation box (district select), warranty, showroom availability; tabs (Description, Specifications table, Warranty, Delivery & returns, Reviews); related products; recently viewed; mobile sticky add-to-cart bar.
Cart cart.html (WC cart table, coupon, cart totals with shipping options, cross-sells, Easy Payment hint).
Checkout checkout.html (WC checkout: billing fields incl. NIC optional, district select (25), shipping method, order review, **#payment methods** with real logos: PayHere (cards/eZ Cash/Genie), Bank card instalments (PayHere), Koko, Mintpay, Easy Payment (in-house), Cash on delivery, Direct bank transfer → `payment_box` descriptions; terms checkbox; Place order).
 On place order: PayHere/Koko/Mintpay/bank-instalment → redirect to **pay.html?gw=payhere|koko|mintpay&order=…** — a convincing mock of each provider's hosted page (provider branding/colours/logo from payment-brand-assets.md, merchant "Kavindu Online Store", amount, steps: PayHere card form/method tabs; Koko & Mintpay: mobile number → OTP (any 6 digits) → instalment plan 3 x amount → card → success) → returns to order-received.html. COD/bank → order-received directly (bank shows account details). Easy Payment → order-received with "Pending approval" + application link.
 Small "Sandbox — no real payment" ribbon on pay.html only.
Order received order-received.html (`.woocommerce-order`, overview list, order details table, payment instructions).
Easy Payment easy-payment.html: how it works, full calculator (all tenures table), eligibility & documents, multi-step application (product/plan → personal (NIC, mobile) → employment/income → guarantor (optional) → document upload → review & consent → submitted ref "EP-…"), FAQ.
My account my-account.html (WC account nav: Dashboard, Orders, Easy Payment plans, Downloads? no → Addresses, Account details, Wishlist, Logout): Easy Payment plan schedule table with status, pay instalment button (→ pay.html?gw=payhere), application tracker.
Stores stores.html, About about.html, Contact contact.html, Policies policies.html (tabs: Delivery, Returns & refunds, Warranty, Privacy, Terms, Easy Payment terms).
**Admin** admin/ (wp-admin look: #1d2327 sidebar, #2271b1 links, system font stack as WP uses, WooCommerce menus): index.html (WC Home: stats cards, recent orders, Easy Payment applications pending), orders.html (WC orders list table with status pills, filters, bulk actions), order.html (edit order: items, billing/shipping, payment method, status select, notes), products.html (products list: thumb, name, SKU, stock, price, categories), easy-payment.html (custom plugin page: Applications table (pending/approved/rejected) + detail panel with documents + approve/reject; Plans tab with schedules, overdue highlighting; Settings tab: tenure rates table editable, min down %, late fee), settings-payments.html (WC Settings > Payments list with toggles for PayHere, Koko, Mintpay, Easy Payment, COD, BACS). Admin uses its own admin/assets/admin.css + admin.js and reads ../assets/js/data.js.

## 7. Data — assets/js/data.js (window.KV_DATA)
Copy base from /home/vjranga/Documents/chamara/demo/assets/js/data.js (20 products, categories, stores, easyPayment, banks) and extend each product with: model, keySpec (one line), specs (object for table), rrp (where sale), stock ('In stock'/'Only 3 left'), freeGift (optional), rating, reviews, gallery images. Add more products to reach ~32 (furniture incl. office chairs/desks, beds, wardrobes; appliances; TVs; laptops; phones) using ONLY verified image URLs: Innovex S3 product images already in data, and Unsplash IDs listed below.
Store info (placeholders, to be confirmed by client — keep realistic, not "demo"): hotline 011 234 5678, WhatsApp 077 123 4567, hello@kavindustore.lk, Head office: No. 45, Main Street, Avissawella; showrooms from existing data.
Easy Payment config: keep placeholder tenures {6:+8%,12:+16%,18:+24%,24:+32%,36:+45%}, min down 20%.
Verified Unsplash IDs (use `https://images.unsplash.com/<id>?auto=format&fit=crop&w=1600&q=80`): photo-1556911220-bff31c812dba (kitchen), photo-1555041469-a586c61ea9bc (sofa room), photo-1584622650111-993a426fbf0a, photo-1622372738946-62e02505feb3 (kitchen w fridge), photo-1665826254141-bfa10685e002 (AC), photo-1631679706909-1844bbd07221 (living room), photo-1593359677879-a4bb92f829d1 (TV), photo-1626806787461-102c1bfaaea1 (washer), photo-1496181133206-80ce9b88a853 (laptop), photo-1511707171634-5f897ff02aa9 (phone), photo-1631049307264-da0ec9d70304 (bedroom), photo-1586023492125-27b2c045efd7 (chair/interior), photo-1585659722983-3a675dabf23d (microwave), photo-1570222094114-d054a817e56b (blender), photo-1595526114035-0d45ed16cfbf (bedroom), photo-1615066390971-03e4e1c36ddf (dining), photo-1604578762246-41134e37f9cc (dining room), photo-1617806118233-18e1de247200 (dining). Do NOT invent other IDs.
Logo: ../assets/img/logo.svg (copy to v3/assets/img/), payment logos in v3/assets/img/payments/ (payhere.png, koko.png, mintpay.png dark-bg, mintpay-small.png, visa.svg, mastercard.svg, amex.svg — simple-icons SVGs are monochrome: render via <img> inside white boxes or use FA `fa-cc-visa` etc).

## 8. File ownership (parallel builders must not touch others' files)
- CORE: assets/css/theme.css, assets/js/data.js, assets/js/theme.js, assets/img/*, index.html, assets/js/home.js
- SHOP: shop.html, product.html, assets/css/shop.css, assets/js/shop.js, assets/js/product.js
- CHECKOUT: cart.html, checkout.html, pay.html, order-received.html, assets/css/checkout.css, assets/js/cart.js, assets/js/checkout.js, assets/js/pay.js
- ACCOUNT: easy-payment.html, my-account.html, assets/css/account.css, assets/js/easy-payment.js, assets/js/account.js
- INFO: stores.html, about.html, contact.html, policies.html, assets/css/info.css, assets/js/info.js
- ADMIN: admin/** only
Every storefront page: `<div id="site-header"></div>` … `<div id="site-footer"></div>`, loads theme.css, data.js, theme.js (+ own css/js). Asset URLs end with `?v=1`.


### Completed navigation options (22 October 2026)
Desktop navigation is independently selectable with `menu-1` (standard links), `menu-2` (category icons), or `menu-3` (department mega menu), alongside all existing layout options. Shared preview links preserve this choice. Mobile quick navigation is exactly Shop, Search, Cart, Account. Easy Payment and all departments remain available in the mobile menu. See `../CLIENT-REVIEW.md` for verification coverage.


### Mobile options and search — 22 October 2026
Three independent mobile controls are available in Theme options: `mheader` (retail / compact / search first), `bottom` (standard / floating pill / compact tiles), and `mcard` (retail grid / image first / detailed list). Each has values 1–3, persists locally, is included in preview links, and resets with the complete design. Desktop header/card selections remain independent; card markup updates at the 992px breakpoint. All bottom styles contain exactly Shop, Search, Cart, Account. The logo links home. Search opens an accessible dialog with autofocus, suggestions, no-results feedback, category shortcuts, Escape dismissal and search form submission. Image-first card actions remain visible on mobile.

Verification: all three values in both skins at 375px, all 27 mobile combinations in Modern at 320px, real search submission and no-results state, live radio updates, desktop/mobile breakpoint restoration, and 11 passing runtime tests. A targeted read-only code review found no remaining issues. Screenshots: `review/mobile-search.jpg` and `review/mobile-options.jpg` under the workspace root. Changes remain local.
