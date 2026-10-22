# Product card audit — 22 October 2026

The card layouts should help shoppers identify a product, judge its main feature and price, and act without controls overlapping the content.

## Findings and fixes

| Finding | Change |
| --- | --- |
| Image-first action icons extended beyond the card | Removed inherited top/right offsets. Save, Compare and View now occupy a bordered, labeled toolbar with equal cells. |
| Two columns left little room for large products | Added Mobile grid columns in Theme options: one product per row or two. Modern showcase defaults to one. Selections persist and are shareable. |
| Some cards lacked a useful comparison detail | Added the existing key specification to image-first cards, while retaining brand, title, rating and price. |
| Verbose offer timer wrapped awkwardly | Replaced it with a compact days/hours or hours/minutes countdown. |
| Detailed mobile cards showed very small images | The one-column setting uses a larger image above the details; two-column browsing retains a single detailed list instead of squeezing two detailed cards side by side. |
| Catalogue List view shrank content into a legacy 240px wrapper | List view now renders the existing detailed card layout across the available width. |

Images remain uncropped with contain sizing. Full-card native product links, independent actions, visible keyboard focus and stable hover surfaces are preserved. Sample image accuracy still depends on client-supplied catalogue photography; this pass does not replace product media with invented images.

## Research used

- [Baymard: Product Listing Page UX](https://baymard.com/blog/product-listing-page-plp-ux): product thumbnails and relevant listing details support evaluation; layouts should suit visual versus specification-driven products.
- [Baymard: Product-list thumbnail best practices](https://baymard.com/blog/Secondary-hover-information): adequate image size and additional views help shoppers assess products. This pass improves image space and retains access to the product detail gallery; it does not claim to add listing galleries.

## Verification

- 42 catalogue combinations: both skins, all three card styles, both mobile column settings at CSS 320/375/768px, plus each desktop card style at 1440px. Measured no document overflow, escaped toolbars/buttons, or image regions below 70px.
- 12 homepage combinations at 375px: both skins, three cards, both column settings, with grid/feature/carousel rails present. No document overflow or escaped toolbars.
- Catalogue List view retested at1440px: detailed card fills the975px available width instead of a240px inner wrapper.
- One-column radio immediately updates the page and shared preview link.
- 14 runtime tests passed. JavaScript syntax and whitespace checks passed. Targeted read-only review found no new card/column regressions.

Changes remain local. Asset version29. Evidence under the workspace root: `review/cards-two-column-audited.jpg`, `review/cards-one-column-audited.jpg`, `review/card-audit-measurements.json`.
