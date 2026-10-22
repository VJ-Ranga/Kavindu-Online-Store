# Kavindu client presentation — 22 October 2026

## Intended outcome
One static demonstration site at `v3/`, with all Classic/Modern and layout choices preserved so the client can compare designs. No production backend or live merchant account is connected. Archive folders remain historical.

## Presentation controls
Open Theme options. Choose Everyday retail, Modern showcase or Catalogue first to apply a complete combination, then use the original individual controls to adjust it. Copy link includes the full selection and preserves the current page/filter query. The homepage preview link carries those same choices home. Reset restores the original defaults across all product lists as well as the header/footer/hero.

## Fixes and polish
- Correct category counts, sale-only Deals view sorted by saving, removable category/sale filters, and consistent reset behaviour on shop/product/wishlist pages.
- Human-readable bank names and provider-dependent BNPL schedule wording.
- Completed buying-guide articles in accessible dialogs, with fallback catalogue links and focus returned on close.
- Image-only banner rendering retained, explicit image loading priority, slideshow cleanup on layout switches, pause while focused/hovered, keyboard navigation and manual slide announcements.
- Sanitized saved carts and bounded add quantities, live cart page updates on cross-sell add, cross-tab cart updates and checkout empty/refill recovery.
- Checkout submission protected from duplicate orders and synchronous cart-clear reloads; showroom selection retained through payment changes.
- Exact repayment totals with an adjusted final instalment; invalid tenure/down-payment inputs cannot create invalid plans. Rates remain placeholders.
- Correct sample receipt links and sample instalment payment amounts; sandbox instalment completion updates the account schedule.
- Sample Easy Payment application continuation retains the cash base and down-payment percentage; sample receipt identifiers are validated.
- Wide comparison/account tables stay inside local scroll regions. Mobile admin filters wrap. Compact desktop header wraps at intermediate widths. Floating controls account for the product/compare bars.
- No false newsletter email-subscription confirmation; unknown social accounts explain that official links await the client.
- Homepage has a primary heading and skip link comes before page navigation. Scripts defer in their existing dependency order. Asset versions bumped to 22.

## Verification performed
- Nine Node regression tests passed, with failures reproduced before the corresponding runtime changes.
- All 12 active JavaScript files passed `node --check`; `git diff --check` passed.
- Local HTML references checked for missing files.
- Homepage layout families 1/2/3 exercised at 375, 768, 1024 and 1440 pixels (12 combinations). This covers each individual option value; it is not an exhaustive test of every possible combined permutation.
- All 13 storefront pages (including homepage layout checks), all six admin pages, and all three provider payment views inspected. The 20 mobile page/provider checks at 375px found four overflow issues; all four passed a targeted 375px retest after fixes. A final repeated 40-page pass at the browser default 1280px found no document overflow, missing primary headings, or `[object Object]` output. No console errors were captured. The browser viewport control stopped targeting the recovered preview tab after a local-server restart, so that final pass is recorded as 1280px rather than claimed as another mobile pass.
- Checkout required-field validation and COD, bank transfer, Easy Payment, PayHere, Koko and Mintpay demo flows exercised. Card/provider simulations returned paid-order confirmations.
- Full six-step Easy Payment application exercised using synthetic contact details and a tiny generated PNG fixture; submission appeared in My account.
- Reset, complete presets and Copy link exercised in the browser. Buying guide article and focus restoration checked.
- Empty checkout recovered after another tab added items, then recovered again after an empty/refill cycle.
- Sample finance continuation preserved cash Rs 131,900, 25% down and its original total.
- A separate read-only code review found three regressions during implementation; all were fixed and the targeted re-review reported no remaining findings.

Browser evidence is local development evidence. It does not prove production installation, a live payment integration, performance on a physical device, every lazy-loaded external image, or an external link's continued availability.

## Navigation and option completion pass
- All existing options retained. Added an independent desktop navigation control: standard category links, category icons, and an eight-department mega menu. Modern showcase uses the mega menu; Catalogue first uses icons.
- Menus open with explicit buttons, expose expanded state, close on outside click or Escape, and return focus on Escape. Category links remain navigable.
- Mobile bottom navigation contains exactly Shop, Search, Cart, Account. Shop opens the catalogue; Cart opens the existing mini-cart. All eight categories and Easy Payment remain in the hamburger menu.
- Fixed modern search dropdown clipping, modern footer service-strip contrast and dark-footer logo/copy/social contrast, detailed-card containers, feature/list column alignment, and excessive modern mobile section spacing. Compact header remains usable at intermediate desktop widths.
- Browser verification: all 18 skin/header/menu combinations at CSS 1440px and 1025px; all 18 skin/card/rail combinations at 1440px; every layout value in both skins at 1440px and 375px. No document overflow or collapsed product cards in these samples. Feature/list columns aligned in every tested card style. This is coverage of every option value and targeted combinations, not every possible permutation.
- Exercised all four mobile buttons, mobile department drawer, live menu radio changes, modern preset, search suggestions, and Escape dismissal. Nine runtime tests and a targeted code re-review passed. No captured console errors.
- Screenshots and measured results: `../review/modern-mega-menu.jpg`, `../review/mobile-four-buttons.jpg`, `../review/options-qa.json`.

## Still needed from the client
Real catalogue, prices, photos and banner artwork; contact/showroom details; actual Easy Payment formula and eligibility/late-fee/ownership terms; gateway merchant accounts and provider limits; bank details; approved policy copy and official social URLs. The original WooCommerce package and custom finance features still require separate scope confirmation.

## Delivery state
Changes are local and reviewable. No commit, push, GitHub Pages update or client message was made. Run locally with:

```bash
python3 -m http.server 8130 --directory /home/vjranga/Documents/chamara/demo
```

Open `http://localhost:8130/v3/`. Run regression checks with:

```bash
node /home/vjranga/Documents/chamara/demo/tests/runtime.test.cjs
```


### Mobile options and search — 22 October 2026
Three independent mobile controls are available in Theme options: `mheader` (retail / compact / search first), `bottom` (standard / floating pill / compact tiles), and `mcard` (retail grid / image first / detailed list). Each has values 1–3, persists locally, is included in preview links, and resets with the complete design. Desktop header/card selections remain independent; card markup updates at the 992px breakpoint. All bottom styles contain exactly Shop, Search, Cart, Account. The logo links home. Search opens an accessible dialog with autofocus, suggestions, no-results feedback, category shortcuts, Escape dismissal and search form submission. Image-first card actions remain visible on mobile.

Verification: all three values in both skins at 375px, all 27 mobile combinations in Modern at 320px, real search submission and no-results state, live radio updates, desktop/mobile breakpoint restoration, and 11 passing runtime tests. A targeted read-only code review found no remaining issues. Screenshots: `review/mobile-search.jpg` and `review/mobile-options.jpg` under the workspace root. Changes remain local.


### Header cleanup and confirmed location count
Removed repeated Easy Payment links from all desktop navigation/mega-menu variants; each desktop header retains one top-row Easy Payment entry. Removed the mobile Deals / Easy Payment / Stores shortcut strip. All three mobile headers now center the logo independently of left/right control widths. The business has one location: Avissawella. Replaced six sample branches with that single existing brand address throughout pickup, showroom availability and store views; removed multiple-showroom claims from home, footer, about and contact copy. Exact address/hours/phone still use the existing demonstration values pending client confirmation.

Verified three centered mobile logos at375px, all nine header/menu combinations at1440px (zero payment links inside main navigation, one primary Easy Payment entry each, no document overflow), and 12 passing runtime tests. Asset version23.


### Product-card hover cleanup
Removed card/image lift, shadows and hover-triggered transparent surfaces in both skins. All three card variants retain stable white bordered containers. Cart buttons use a consistent blue rectangular treatment, with color feedback on interaction. The image-first variant exposes Wishlist, Compare and Quick View in a normal-flow toolbar beneath the details, followed by Add to cart; controls no longer slide over the image. List-style cards retain their separate information/purchase layout and use aligned spacing. All original card options remain available.

Verification: all 18 skin/card/viewport combinations were inspected with the pointer actually hovering the card at320px,375px and1440px. Computed surfaces stayed white, transforms/shadows stayed absent, image-first actions stayed visible/static, and no document overflow appeared. The three homepage card variants also passed a375px grid/feature/carousel check. Twelve runtime tests and a targeted code review passed; no browser console errors captured. Asset version24. Evidence: `review/cards-mobile-refined.jpg`, `review/cards-desktop-refined.jpg`, `review/cards-refined-qa.json` under the workspace root.


### Full-card links and device option tabs
All three product card styles and homepage feature cards use native stretched product links: clicking the image, information or unused card surface opens product details. Cart, wishlist, compare and quick-view controls sit above the product link and retain their separate behavior. Hover remains a subtle border/button/link color treatment, with no movement, shadow or surface swap. Keyboard focus has a visible outline.

Theme options now opens with Desktop and Mobile tabs. Desktop contains header/navigation/card choices; Mobile contains header/bottom-bar/card choices. Shared appearance clearly labels the settings used on both screens. Device tab defaults to the viewport at load and supports Left/Right/Home/End keyboard navigation. Presets and sharing remain available below.

Verified full-card navigation across all three styles at375px and1440px, a homepage feature-card click, independent wishlist/quick-view actions, device tab filtering/defaults and keyboard changes. All13 runtime tests and targeted read-only review passed. Asset version26. Screenshot: `review/theme-options-device-tabs.jpg` under the workspace root.


### Card presentation audit
See `CARD-AUDIT.md` for findings, research sources, the contained labeled action toolbar, independent one/two-column mobile setting, larger images and repaired catalogue List view. All54 sampled catalogue/homepage combinations passed overflow/toolbar checks;14 runtime tests passed. Asset version29.
