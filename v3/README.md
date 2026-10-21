# Kavindu Online Store — v3 (WooCommerce-ready)

Static HTML build for **Kavindu Enterprises**, structured with WooCommerce markup/classes so it ports to a WordPress + WooCommerce theme with minimal rework. Spec: `SPEC.md`.

Run: `python3 -m http.server 8130 --directory demo` → http://localhost:8130/v3/

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
