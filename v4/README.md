# Kavindu Online Store — website demo

Traditional retail layout with a light modern touch, blue brand colour, built for day-to-day family shoppers on normal mobile internet. WooCommerce-ready markup (same as v3). Brief: `V4.md` (design brief).

## Image-only banners — easy for the shop team
Every banner on the homepage is just an image + link. No text, prices or buttons are typed on the website; the shop's social media team designs the image and staff upload it.

| Slot | Desktop size | Mobile size |
|---|---|---|
| Hero slider (up to 3+ slides) | 1320 × 520 | 800 × 800 |
| Side banners (2) | 640 × 252 | — (stacks full width) |
| Promo row (3) | 424 × 220 | — |
| Wide banner | 1320 × 200 | 800 × 400 |
| Furniture feature | 640 × 560 | — |

Update: **Admin → Appearance → Homepage banners** → Select image (desktop + mobile), Link, Alt text, Visible → Save.
Sample banners in `assets/img/banners/` are placeholders (text is inside the picture). Source templates: `banner-src/`.

## Layout options (Admin → Appearance → Theme settings, or the store's "Theme options" button)
Header ×3 (Retail band / Classic white / Compact) · Hero ×3 (Slider + 2 side banners / Full-width slider / Category list + slider) ·
Categories ×3 · Product card ×3 · Homepage product sections ×3 each (Best sellers, Deals, New arrivals) · Footer ×3.
Preview link example: `index.html?opt=header-2,hero-2,cats-2`.

## Pages
Storefront: index, shop, product, cart, checkout, pay (PayHere / Koko / Mintpay sandbox), order-received, easy-payment, my-account, stores, about, contact, policies.
Admin (WordPress look): dashboard, orders, order, products, easy-payment, settings-payments, banners, theme-settings.

## WAITING ON CLIENT
Easy Payment formula · real products/prices/photos · banner artwork · showroom details · hotline/WhatsApp/email · bank details · gateway merchant accounts · policy text review.
