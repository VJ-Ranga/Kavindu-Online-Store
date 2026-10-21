# Kavindu Online Store — Design System v2 (minimal premium)

Client: Kavindu Enterprises. Electronics + furniture + home appliances store, Sri Lanka. Easy Payment (in-house monthly installments) is the key feature.

## Direction (client feedback 2026-10-21)
"Not a color box." Premium, calm, human-friendly, easy to understand. Standard 2026 minimal retail
(reference feel: Apple Store, Samsung, IKEA, Dyson, Muji). Products and photos carry the color — the UI stays neutral.
Light weight: no unnecessary heavy things. NO rainbow / logo-circle colors in the UI (logo image itself stays as-is).
NO Swiper/slider library — use one static hero and CSS scroll-snap rows. Few animations (subtle fade only).

## 1. Colors — neutral + ONE accent
| token | value | use |
|---|---|---|
| --cm-ink | #111827 | headings, primary buttons, icons |
| --cm-body | #4B5563 | body text |
| --cm-muted | #9CA3AF | meta, captions |
| --cm-line | #E5E7EB | borders, dividers (1px) |
| --cm-surface | #F6F6F4 | warm light grey: product image bg, section bg |
| --cm-white | #FFFFFF | page bg |
| --cm-primary | #111827 | primary button = near-black |
| --cm-primary-dark | #000000 | hover |
| --cm-accent | #1D6FB8 | the ONLY accent (from logo blue, darkened for AA): Easy Payment monthly price, links, active states, focus ring |
| --cm-accent-soft | #EEF5FC | Easy Payment hint background |
| --cm-navy | #1D1B4C | logo navy — only for footer bg OR not at all |
| --cm-sale | #B91C1C | sale % text only (small) |
| --cm-success | #15803D | in stock / paid |
| --cm-warning | #B45309 | due |
Keep the old `--cm-primary-soft` alias = #F3F4F6 so page CSS still works. NO orange, NO pink, NO gradients except subtle photo overlays.

## 2. Typography — Poppins 400/500/600 (700 only for hero)
- Hero h1 52/1.08 (mobile 32), weight 600, letter-spacing -0.02em
- h2 32/1.2 (mobile 24) weight 600, letter-spacing -0.01em
- h3 20 weight 600 · card title 15/1.45 weight 500 · body 15/1.65 · small 13 · eyebrow 12 uppercase .1em weight 500 muted (not colored)
- Prices: cash 18 weight 600 ink; monthly 13 weight 500 accent.

## 3. Buttons `.btn-cm`
Height 46px (sm 38, lg 52), padding 0 22px, radius 12px, font 14/500, icon gap 8.
- `.btn-cm-primary` ink bg, white text → hover black.
- `.btn-cm-outline` 1px ink border, transparent → hover ink bg white text.
- `.btn-cm-accent` accent bg (Easy Payment only).
- `.btn-cm-ghost` text only. `.btn-cm-light` white bg ink text (on photos).
- Icon button `.btn-icon` 40×40 round, 1px line border, hover surface.
- Focus ring 3px rgba(29,111,184,.3). Disabled opacity .45. No translate/jump effects, only color transitions .15s.

## 4. Spacing / layout
4px base: 4 8 12 16 24 32 48 64 96. Container 1280px, gutter 20px (16 mobile). Section padding 72px / 48px mobile.
Radius: cards 16, images 12, inputs 12, pills 999. Shadows almost none: only drawers/dropdowns `0 12px 40px rgba(17,24,39,.12)`.
Borders 1px --cm-line instead of shadows.

## 5. Icons
Font Awesome 6 Free — use **regular** style (`fa-regular`) for UI icons where it exists (user, heart, bag via `fa-solid fa-bag-shopping` exception), consistent size 20px in header, 16px inline. No colored icon boxes/circles. Icons ink or muted.

## 6. Components
- **Header** (white, sticky, 1px bottom line):
  Row 1 (72px): logo (height 40) · centered rounded search pill (light surface bg, placeholder "Search fridges, sofas, TVs…") · right icons: Easy Payment text link, account, wishlist, cart (count dot). 
  Row 2 (44px): simple text category links (Refrigerators, Washing Machines, TV & Audio, Air Conditioners, Kitchen, Furniture, Laptops & Phones, Deals) + "All categories" opens clean mega panel (2–4 columns text links + one image). Small muted top utility line optional ONLY as text in row 2 right side: "Hotline 011 234 5678".
  Mobile: menu icon · logo · search icon · cart. Search expands full width.
- **Mobile bottom bar** white, 1px top line, 5 items (Home, Categories, Easy Pay, Cart, Account), icons regular, active = ink + small dot. NO raised colored circle.
- **WhatsApp**: small 48px, sits above bottom bar on mobile. Single green is fine (brand of WhatsApp).
- **Product card**: no border, no shadow. Image area square, bg --cm-surface, radius 16, product contain + padding 12%; hover: image scale 1.03. Top-left tiny pill badge (white bg, ink text: "−12%" in sale red, or "New"). Top-right wishlist icon button appears (always visible on mobile). Below: brand (muted 12), name (2 lines), cash price + was price (muted strike), Easy Payment hint line: "or Rs 9,990/mo · Easy Payment" in accent. Add-to-cart = small round icon button (+bag) bottom-right of image on hover/desktop, full-width outline button on mobile? → keep: round icon button always visible bottom-right of image.
- **Cart drawer** (NEW, offcanvas right, 420px): opens when adding to cart or clicking cart icon. Title "Your cart (2)", line items (thumb, name, price, qty stepper, remove), free delivery progress line ("Rs 12,000 away from free delivery"), subtotal, "or from Rs X/mo with Easy Payment", buttons Checkout (primary) + View cart (outline). Empty state with icon + "Start shopping".
- **Hero**: ONE static hero, bento layout: big left tile (lifestyle photo, text on soft dark overlay bottom-left: eyebrow, h1, sub, 2 buttons) + right column 2 stacked tiles (Easy Payment tile on surface bg with "From Rs 4,990/month" + link; Furniture tile with photo). Height ~560 desktop. Mobile: big tile then 2 tiles horizontal scroll.
- **Sections on home (in order, nothing else)**: hero bento → category row (circle/rounded image + label, horizontal scroll on mobile) → "Popular right now" product row (scroll-snap) with tabs → Easy Payment explainer (3 steps + compact calculator, surface bg, no colored boxes) → "This week's deals" row → Furniture showcase (one big photo + 4 products) → brands strip (muted text logos) → service row (4 items: delivery, warranty, Easy Payment, showrooms — icon + 2 lines, no boxes) → footer.
- **Footer**: light (#F6F6F4) with ink text, 4 link columns + newsletter/WhatsApp, payment method text badges muted, bottom line. No rainbow.
- Forms: 48px inputs, 12 radius, 1px line, label above, accent focus.
- Tables: simple lines, no zebra colors.
