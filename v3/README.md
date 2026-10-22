# Kavindu Online Store — v3 (WooCommerce-ready)

Static HTML build for **Kavindu Enterprises**, structured with WooCommerce markup/classes so it ports to a WordPress + WooCommerce theme with minimal rework. Spec: `SPEC.md`.

Run from any folder: `python3 -m http.server 8130 --directory /home/vjranga/Documents/chamara/demo` → http://localhost:8130/v3/

## Pages
| Storefront | Admin (wp-admin look) |
|---|---|
| index · shop · product (`?id=`) · cart · checkout · pay (`?gw=payhere\|koko\|mintpay`) · order-received · easy-payment · my-account · stores · about · contact · policies | admin/index · orders · order (`?id=`) · products · easy-payment · settings-payments |

## Theme options (floating "Theme options" button, bottom-left)
Design style (skin) ×2 · Desktop header ×1 (Retail) · Hero ×3 · Category display ×3 · Product card ×3 · Homepage product sections (rail1 Best sellers, rail2 Deals, rail3 New arrivals) ×3 each · Footer ×3. Skin 2 = Modern: `?opt=skin-2`. Defaults rail1-1, rail2-3, rail3-2; old `rail-N` still sets all three.
Shareable preview links (also saves the choice):
- `index.html?opt=header-1,hero-1,cats-1,card-1,rail1-1,rail2-1,rail3-1,footer-1` — Retail classic (Courts style)
- `index.html?opt=header-2,hero-2,cats-2,card-2,rail1-2,rail2-2,rail3-2,footer-2` — Centered header, full-width banner
- `index.html?opt=header-3,hero-3,cats-3,card-3,rail1-3,rail2-3,rail3-3,footer-3` — Category sidebar hero, detailed cards

## Client presentation improvements — 22 October 2026
- All Classic/Modern and individual layout options remain available.
- Theme options includes three complete combinations: Everyday retail, Modern showcase, Catalogue first. Each is a starting point; all individual controls still work.
- Copy link shares the complete selection on the current page, retaining catalogue filters. Homepage preview link applies the same choices to the homepage. Reset restores all page components.
- Buying-guide cards now open complete articles. Banners remain image-only.
- Deals filters sale products and sorts by percentage saving; category counts reflect the 32-item demo catalogue.
- Calculators retain the placeholder formula but disclose a smaller final instalment where rounding is needed, so schedule amounts reconcile with total payable.
- Sample account orders open matching receipts; instalment payment links pass the actual amount and update the sample schedule after sandbox success.
- Cart contents stay in sync across tabs; checkout recovers if an emptied cart is filled again.

## Verification
Run `node /home/vjranga/Documents/chamara/demo/tests/runtime.test.cjs` for the 15 regression checks. Browser evidence and remaining client inputs are recorded in `../CLIENT-REVIEW.md` (relative to this folder).

## Payment flow (sandbox mock — no real payment)
Checkout → PayHere / bank-card instalments / Koko / Mintpay → provider-branded page (`pay.html`) → order received → shows in My account.
COD, bank transfer and Easy Payment (pending approval) go straight to order received.
Preview helpers: `cart.html?sample=1`, `checkout.html?sample=1`, `order-received.html?sample=bacs|cod|easy_payment|payhere`, `pay.html?gw=koko&step=2`, `my-account.html?sample=1&tab=plans`.

## WooCommerce mapping notes
- Loops use `ul.products > li.product`, prices use `woocommerce-Price-amount`, checkout uses `#payment ul.wc_payment_methods` with gateway ids `payhere`, `payhere_instalment`, `koko`, `mintpay`, `easy_payment`, `cod`, `bacs` (confirm real plugin ids before build).
- Easy Payment = custom plugin: product-page calculator + `easy_payment` gateway with custom order status "Pending approval" + admin Applications/Plans/Settings screens.
- Design tokens are CSS custom properties in `assets/css/theme.css` → map to Customizer settings.

## WAITING ON CLIENT
- Easy Payment formula (tenures, markup, min down payment, late fee) — current values are placeholders
- Real products, prices, photos; showroom list/addresses/hours; hotline, WhatsApp, email, head office
- Bank account details for bank transfer; coupon codes (WELCOME5 / KAVINDU10 are samples)
- Which gateway merchant accounts exist (PayHere / Koko / Mintpay) and their basket limits
- Policy texts (delivery, returns, warranty, privacy, Easy Payment terms) need client/legal review
- Company story facts on About page (marked `<!-- TO CONFIRM -->` in source)


### Completed navigation options (22 October 2026)
Desktop navigation is independently selectable with `menu-1` (text categories with submenus), `menu-2` (category icons with submenus), or `menu-3` (compact icon tabs with category submenus), alongside all existing layout options. Shared preview links preserve this choice. Mobile quick navigation is exactly Shop, Search, Cart, Account. Easy Payment and all departments remain available in the mobile menu. See `../CLIENT-REVIEW.md` for verification coverage.


### Mobile options and search — 22 October 2026
Three independent mobile controls are available in Theme options: `mheader` (retail / compact / search first), `bottom` (standard / floating pill / compact tiles), and `mcard` (retail grid / image first / detailed list). Each has values 1–3, persists locally, is included in preview links, and resets with the complete design. Desktop header/card selections remain independent; card markup updates at the 992px breakpoint. All bottom styles contain exactly Shop, Search, Cart, Account. The logo links home. Search opens an accessible dialog with autofocus, suggestions, no-results feedback, category shortcuts, Escape dismissal and search form submission. Image-first card actions remain visible on mobile.

Verification: all three values in both skins at 375px, all 27 mobile combinations in Modern at 320px, real search submission and no-results state, live radio updates, desktop/mobile breakpoint restoration, and 11 passing runtime tests. A targeted read-only code review found no remaining issues. Screenshots: `review/mobile-search.jpg` and `review/mobile-options.jpg` under the workspace root. Changes remain local.


## Final UI/UX finishing pass
Shared finishing rules are in `assets/css/polish.css`, loaded after each page stylesheet. Desktop/Mobile tabs retain independent headers/cards and mobile grid-column choices; common appearance remains shared. Mobile bottom navigation is Shop, Search, Deals, Account, with Cart in the header. See `../UI-UX-AUDIT.md` for fixes, measurements and verification coverage.


## Navigation correction — version 40

Modern showcase now starts with Header 1 and Menu 2: the familiar retail header, full search and category navigation, modern styling and category icons. The oversized department/promotion mega menu has been removed. All three menu choices retain the same shopping destinations: text categories, inline category icons, or compact icon tabs. Each category has a native catalogue link and a separate disclosure for its actual brands, product count, category deals and new arrivals. Easy Payment remains in the top header, without another menu entry.

Header 1 retains seven direct category links plus all eight categories under All categories; Headers 2 and 3 expose all eight directly. Removed an old rule hiding a category on narrower desktops. Popup alignment follows the available screen space. Checked 23 category popovers across all three headers at1025px without clipping; Escape dismissal/focus return, a real brand-filter destination,1440px Modern header, and375px mobile without document overflow. The earlier36 header/menu/skin desktop samples identified the popup-edge issue corrected here. All17 runtime regression cases pass. Mobile retains Shop, Search, Deals, Account and its existing centered logo/cart header. Screenshot: `../review/modern-retail-header.jpg` (workspace evidence, outside this repo). Changes remain local.


## Simple category menus — version 42

Supersedes version40's brand/deals disclosure panels. Desktop categories now use plain nested lists of the existing subcategory labels. Hover or keyboard focus opens the list; clicking the parent goes directly to its category. Removed separate arrow buttons, repeated Deals/New arrivals shortcuts, brand headings and product counts. The single main Deals destination remains. The three presentation choices only alter text/icon placement. Subcategory destinations retain the demo's existing parent-category landing links; actual child category archives are to be assigned when building the WordPress taxonomy. No new product taxonomy or backend is implied.

Verified Furniture focus opening, Escape closing, direct category navigation,17 runtime cases and JavaScript syntax. Hover behavior uses delegated mouse entry/exit handlers; automated browser controls here did not provide a pointer-hover action, so keyboard behavior was exercised live.


Version48: desktop Header is fixed to Retail (logo, full search and category row). Removed Header2/3 choices and renderers. All presets and older saved/header2/header3 links resolve to Retail. Mobile header choices and all other style controls remain available.18 runtime checks pass; verified a single Header radio in the live Desktop options tab.


Version49: removed Compact icon tabs from desktop navigation. Remaining choices are Text categories and Category icons, both with submenus. Older menu3 saved selections and preview links migrate to Category icons (menu2). Other controls are unchanged.
