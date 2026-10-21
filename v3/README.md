# Kavindu Online Store — v3 (WooCommerce-ready)

Static HTML build for **Kavindu Enterprises**, structured with WooCommerce markup/classes so it ports to a WordPress + WooCommerce theme with minimal rework. Spec: `SPEC.md`.

Run from any folder: `python3 -m http.server 8130 --directory /home/vjranga/Documents/chamara/demo` → http://localhost:8130/v3/

## Pages
| Storefront | Admin (wp-admin look) |
|---|---|
| index · shop · product (`?id=`) · cart · checkout · pay (`?gw=payhere\|koko\|mintpay`) · order-received · easy-payment · my-account · stores · about · contact · policies | admin/index · orders · order (`?id=`) · products · easy-payment · settings-payments |

## Theme options (floating "Theme options" button, bottom-left)
Design style (skin) ×2 · Header ×3 · Hero ×3 · Category display ×3 · Product card ×3 · Homepage product sections (rail1 Best sellers, rail2 Deals, rail3 New arrivals) ×3 each · Footer ×3. Skin 2 = Modern: `?opt=skin-2`. Defaults rail1-1, rail2-3, rail3-2; old `rail-N` still sets all three.
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
Run `node /home/vjranga/Documents/chamara/demo/tests/runtime.test.cjs` for the eight regression checks. Browser evidence and remaining client inputs are recorded in `../CLIENT-REVIEW.md` (relative to this folder).

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
Desktop navigation is independently selectable with `menu-1` (standard links), `menu-2` (category icons), or `menu-3` (department mega menu), alongside all existing layout options. Shared preview links preserve this choice. Mobile quick navigation is exactly Shop, Search, Cart, Account. Easy Payment and all departments remain available in the mobile menu. See `../CLIENT-REVIEW.md` for verification coverage.


### Mobile options and search — 22 October 2026
Three independent mobile controls are available in Theme options: `mheader` (retail / compact / search first), `bottom` (standard / floating pill / compact tiles), and `mcard` (retail grid / image first / detailed list). Each has values 1–3, persists locally, is included in preview links, and resets with the complete design. Desktop header/card selections remain independent; card markup updates at the 992px breakpoint. All bottom styles contain exactly Shop, Search, Cart, Account. The logo links home. Search opens an accessible dialog with autofocus, suggestions, no-results feedback, category shortcuts, Escape dismissal and search form submission. Image-first card actions remain visible on mobile.

Verification: all three values in both skins at 375px, all 27 mobile combinations in Modern at 320px, real search submission and no-results state, live radio updates, desktop/mobile breakpoint restoration, and 11 passing runtime tests. A targeted read-only code review found no remaining issues. Screenshots: `review/mobile-search.jpg` and `review/mobile-options.jpg` under the workspace root. Changes remain local.
