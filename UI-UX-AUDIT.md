# Desktop and mobile UI/UX audit — 22 October 2026

The existing design and all client comparison options are retained. This pass corrects visible layout inconsistencies and a few functional UI defects. Shared finishing rules now live in `v3/assets/css/polish.css`, loaded after the page-specific styles.

## Fixes

| Area | Root cause | Result |
| --- | --- | --- |
| Mobile navigation | Cart was repeated in the header and bottom bar | Top-right Cart remains. Bottom navigation is Shop, Search, Deals, Account. Deals/Shop active state follows changes to catalogue ordering. |
| Login/register | Bootstrap `.col-1`/`.col-2` imposed fractional widths inside a separate grid | Forms fill their columns: 444px each at desktop1440; 332px at mobile375; 276px at mobile320. Previously desktop columns were37px/74px. |
| Product purchase controls | Large payment explanation preceded the cart form | Quantity, Add to cart and Buy now appear before the payment panel, with all plan options retained. |
| Cart recommendations | Card-option changes never rerendered cross-sells | Cross-sell card styles refresh on option/preset/breakpoint changes without replacing the cart form or losing typed coupon text. |
| Page density | Modern sections applied88px on both sides; cards reserved three title lines | Section spacing is56px desktop and36px tablet/mobile; mobile Easy Payment bands use40px. The sampled desktop image-first card fell from652px to533px while retaining its content/actions. |
| Compact desktop navigation | Search, logo and payment badge left insufficient room for links | The compact header's standard navigation fits one row at1440px; smaller desktop widths retain a deliberate wrapped layout. |
| Shapes and icons | Conflicting rounded-square circles and mixed button treatments | Circle categories are circular. Shared modern buttons use8px corners. Compare uses the balance-scale icon consistently; service/contact icons do not shrink. |
| Small-screen density | Service tiles and buying guides consumed long full-width stacks | Service benefits use a balanced2×2 grid from360–767px; buying guides use compact image/text rows; brand links use three columns where space permits. |
| Single location | A location filter and selector were retained for one showroom | Redundant filtering/selector controls are hidden; showroom details remain visible. |
| Mobile header independence | Desktop header3's announcement/sticky rules leaked into mobile layouts | Mobile header choices behave independently of the desktop announcement. |
| Bottom overlays | Purchase/comparison bars assumed a fixed60px bottom offset | Navigation clearance accounts for the floating pill style and safe-area inset. Purchase, comparison and WhatsApp controls clear each other in tested states. |
| Provider previews | Koko/Mintpay pages had no primary heading | Provider payment pages have a clear H1 before their step headings. |

## Verification

- 42 fresh-asset page/viewport samples at1440px and375px: 13 storefront pages, two additional provider variants, and six admin views. No document overflow, missing H1, blank unlabeled main action buttons, empty main icon glyphs, or broken **loaded** main images were detected. This is a sampled runtime check, not proof that every deferred/external image will always load.
- 30 homepage option-family samples: both skins, all three layout families, five viewport sizes around320/375/768/1025/1440px. No document overflow or escaped action toolbars. All original choices remain available; this is not every possible permutation.
- Guest login/register checked separately at320/375/1440px.
- Browser interactions checked: Deals navigation and active state after changing sort; cart recommendation style switch while preserving `WELCOME5` text in the coupon field; product purchase control order; settled purchase/navigation bar clearance; comparison/WhatsApp clearance at320px.
- 15 runtime regression tests pass, including dynamic Shop/Deals state. All local JavaScript syntax and HTML file references checked; whitespace checks pass. A separate read-only review found issues during the pass; they were corrected and the targeted final review found no remaining findings.

Evidence is in the workspace `review/` folder: `ui-audit-desktop.jpg`, `ui-audit-mobile.jpg`, `account-mobile-fixed.jpg`, `ui-ux-audit-evidence.json`.

Asset version33. Changes are local; no push or deployment was performed in this pass. Real catalogue media, provider accounts, business details and finance terms remain subject to the existing client-confirmation list.


### Featured-rail balance correction
Replaced the single double-height highlighted product with two distinct featured picks stacked beside four regular products. Images have a bounded aspect ratio; the old image-stretch rule is removed. The feature cards remain fully clickable with independent cart buttons. Mobile follows the chosen one/two-column setting. Verified30 skin/card/viewport/column samples: each featured section has two featured products plus four distinct regular products, with no duplicates, document overflow or clipped feature content. All15 runtime tests still pass. Asset version34. Screenshot: workspace `review/two-featured-products.jpg`.


### Shared-card highlight (replaces the separate featured-card design)
The highlighted column now calls the same `KV.grid` / `KV.card` renderer as the remaining products. There are still only three selectable product-card styles, with independent desktop/mobile selection; no fourth featured-card style. A single pale background surrounds the two highlighted products. The section contains six distinct products total: two highlighted, four regular. All30 skin/card/viewport/column samples passed style consistency, uniqueness, overflow and clipping checks. Native card links and independent action buttons are retained. Asset version35. Evidence: workspace `review/shared-highlight-cards.jpg`.


### Final featured-panel clarification
The existing blue highlighted panel is restored at its original desktop column proportions. It contains one Deals/Top picks heading and exactly two standard product cards rendered by the existing selected card style. The regular product grid alongside it is unchanged. There is no separate featured-card component and no new card style. Verified nine desktop/mobile card/column samples with two cards per blue panel and no overflow or clipping. Asset version36 supersedes the pale-background treatment described above.


## Navigation correction — version 40

Modern showcase now starts with Header 1 and Menu 2: the familiar retail header, full search and category navigation, modern styling and category icons. The oversized department/promotion mega menu has been removed. All three menu choices retain the same shopping destinations: text categories, inline category icons, or compact icon tabs. Each category has a native catalogue link and a separate disclosure for its actual brands, product count, category deals and new arrivals. Easy Payment remains in the top header, without another menu entry.

Header 1 retains seven direct category links plus all eight categories under All categories; Headers 2 and 3 expose all eight directly. Removed an old rule hiding a category on narrower desktops. Popup alignment follows the available screen space. Checked 23 category popovers across all three headers at1025px without clipping; Escape dismissal/focus return, a real brand-filter destination,1440px Modern header, and375px mobile without document overflow. The earlier36 header/menu/skin desktop samples identified the popup-edge issue corrected here. All17 runtime regression cases pass. Mobile retains Shop, Search, Deals, Account and its existing centered logo/cart header. Screenshot: `../review/modern-retail-header.jpg` (workspace evidence, outside this repo). Changes remain local.


## Simple category menus — version 42

Supersedes version40's brand/deals disclosure panels. Desktop categories now use plain nested lists of the existing subcategory labels. Hover or keyboard focus opens the list; clicking the parent goes directly to its category. Removed separate arrow buttons, repeated Deals/New arrivals shortcuts, brand headings and product counts. The single main Deals destination remains. The three presentation choices only alter text/icon placement. Subcategory destinations retain the demo's existing parent-category landing links; actual child category archives are to be assigned when building the WordPress taxonomy. No new product taxonomy or backend is implied.

Verified Furniture focus opening, Escape closing, direct category navigation,17 runtime cases and JavaScript syntax. Hover behavior uses delegated mouse entry/exit handlers; automated browser controls here did not provide a pointer-hover action, so keyboard behavior was exercised live.


## Header spacing correction — version 44

Removed the centered compressed category group in Header1. The first category now starts at the navigation edge (previously about90px of unused leading space at1440px). Links distribute across the available row with a16px gap after All categories and14px text at1400px and above. Medium desktop spacing adapts so icon menu2 fits a single row at1200px; small desktops retain natural wrapping. No menu content or shopping destinations changed.

Checked all three menu presentations at1025,1200,1440 and1920px (12 samples, no item clipping or document overflow). The initial1200px icon-row wrap found in those samples was corrected and rechecked: all8 entries share one row. Mobile375px retains Shop/Search/Deals/Account without document overflow. Furniture keyboard submenu opening still works after the spacing change. Screenshot: `../review/header-spacing-fixed.jpg`.


## Classic isolation and clear dropdowns — version 46

Restored Classic Header1's250px category button, blue retail row,14px links and original left alignment. Modern navigation spacing overrides now explicitly target skin2. Category icons remain in icon modes. Added a visible chevron button alongside each category; hover/focus opens the list and the button toggles it. Child entries have distinct44px rows, separators and hover/focus backgrounds.

Header1 shows five category destinations on larger desktops, three below1200px, plus Deals; all eight remain under All categories. This avoids a solitary Deals item creating a second row. Verified Classic/Modern at1025,1200,1440,1680px: one row of top destinations and no document overflow. Verified five distinct Furniture submenu rows, eight available All categories destinations, visible chevrons and Escape dismissal. Evidence: `../review/classic-menu-restored.jpg`, `../review/modern-menu-final.jpg`.


## Matched submenu spacing — version 47

Matched top category dropdowns and All categories flyout rows to the supplied reference:46px row rhythm,16px horizontal padding,14px medium-weight text, subtle full-width separators, square dropdown corners and no inset panel padding. Header styling is unchanged. Browser verification at1280px confirmed five separate46px Furniture rows and no document overflow. Evidence: `../review/submenu-spacing-matched.jpg`.


## Compact featured picks — version 52

Kept exactly two standard product cards inside the existing blue panel plus four regular cards. Desktop layout now gives all six cards equal widths, caps image-first/retail media at160–210px, and aligns the two product rows by reserving the same heading clearance in the regular grid. The panel uses16px padding and a smaller heading. Changes are scoped to featured-layout sections on desktop; other rail styles and mobile card sizing are unchanged.

At1440px the sampled retail layout shrank from1385px to938px (32 percent), with card heights reduced from642–683px to428px. All six cards measured409px wide in the final Modern sample. All three card styles retained two featured items and four grid items with no document overflow or escaped card content. Detailed cards now remain in two regular columns in this layout.375px mobile retained two featured items without document overflow. Evidence: `../review/compact-featured-picks.jpg`.


## Four-column correction — version 53

User corrected the intended density to four columns. Featured layout now contains one blue column of two standard product cards plus three regular columns of six cards (eight products total, where available). At1440px all eight cards measured297px wide. Checked all three card styles at1025px: three regular grid columns alongside the featured column, no document overflow or escaped card content. Detailed cards stack their existing content within each narrow column. This supersedes version52's three-column layout. Evidence: `../review/four-column-featured-picks.jpg`.


## Detailed card grid density — version 54

Standard desktop grids now show two detailed cards per row instead of one stretched list item. Each card keeps image/details together and moves purchase controls below, eliminating the distant right-hand purchase column. Carousel and four-column featured layouts retain their separate structures; mobile detailed cards remain one per row. Verified1440px homepage cards at626px each,1025px Shop with two301px cards and no content/document overflow, and375px mobile with one328px card column and no document overflow. Evidence: `../review/detailed-two-columns.jpg`.
