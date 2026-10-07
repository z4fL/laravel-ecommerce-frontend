---
version: 1
slug: "src-app-router-tsx"
primary_target: "src/app/router.tsx"
related_targets: []
---

# Home

Mode: Operate

Shopper discovery entry point at `/`. Audience: shoppers arriving to find a relevant published product, browse categories, and continue into the catalog. Scope is a responsive Home surface with storefront navigation, search, category discovery, initial product selection and previews, plus loading, empty/no-match, and recoverable error states. Use generated Orval hooks and TanStack Query; keep feature code in `src/features/home/`. Product truth and API constraints are in PRODUCT.md and the OpenAPI contract.

## Direction contract

THESIS: Make the catalog feel browsable at a glance: products, names, prices, and categories lead; the standard storefront shell stays familiar. Refuse the crowded marketplace feed and the instrument-dashboard costume.

OWN-WORLD: Spectrum-index storefront in charcoal and bone, with a restrained spectral accent, compact precise typography, disciplined alignment, and editorial-commerce spacing. Product imagery is the material, not decorative chrome. Conventional navigation, search, category controls, and product links remain recognizable web patterns.

STORY: Arrive, orient through category or search, scan published products, and continue to the catalog or product destination. The active category receives a doubled marker plus text/state semantics. Use only contract-backed data; no popularity, promotion, review, or featured claims.

FIRST VIEWPORT: A charcoal storefront header anchors the page with wordmark, catalog navigation, account/cart entry points, and search. Below, a bone discovery field pairs a concise page title and search with an aligned category rail; the first product row follows immediately, with image, name, IDR price, category, and clear catalog continuation. At mobile widths, navigation condenses accessibly, categories scroll horizontally, and products reflow without losing hierarchy.

FORM: Spectrum-index storefront, confirmed from concept seed d1008e68. Keep the source subtle: its contribution is palette, compact information rhythm, and the doubled active-category marker, never instrument controls or dashboard topology.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
