# Kavindu Online Store — UI Demo (Kavindu Enterprises)

Static HTML demo for client review before the full build. Bootstrap 5 + Font Awesome + Poppins. No build step.

Run locally: `python3 -m http.server 8130 --directory demo` → http://localhost:8130

## Pages
index · shop · product (`?id=`) · easy-payment · cart · checkout · account · stores · about · contact

## Where to change things
- Products, categories, showrooms, bank plans, Easy Payment rates: `assets/js/data.js`
- Brand colors / buttons / spacing: `:root` tokens in `assets/css/style.css` (system in `DESIGN.md`)
- Logo: `assets/img/logo.svg` (SVG recreation of client logo), original in `assets/img/logo-original.jpg`

## WAITING ON CLIENT
- **Easy Payment formula** — current rates are placeholders (6/12/18/24/36 months, +8/16/24/32/45%, min 20% down)
- Down payment rules, documents list, guarantor policy, late-payment terms
- Hotline, WhatsApp number, email, showroom list & addresses (all demo)
- Real product list, prices and photos (10 real products sourced from Innovex/Arpico/Singer for demo; 10 extra marked `demo: true`)
- Which payment gateways they have accounts for (PayHere / Koko / Mintpay). PayPal shown "coming soon" (SL business withdrawals not live yet)
- Company story, years in business, stats on About page
- Mobile app: demo uses app-style bottom bar; real app/PWA is a later phase

## Notes
- Product images from competitor sites are for internal demo only — replace before going public.
- Old quote EST-000198 (LKR 57k WooCommerce, 10 products) does not cover in-house Easy Payment, customer accounts with installment schedules, or app-style mobile — re-scope before full build.
