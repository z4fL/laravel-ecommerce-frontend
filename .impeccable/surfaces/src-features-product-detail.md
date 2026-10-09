---
version: 1
slug: "src-features-product-detail"
primary_target: "src/features/product-detail"
related_targets: []
---

# Product Detail

Mode: Operate

Audience: shoppers arriving from the catalog. Job: assess one published product from documented information, choose a quantity, and add it to the cart only when the API-supported conditions allow. Scope: responsive product detail at `src/features/product-detail/`, including loading, not-found, out-of-stock, signed-out, add-failure, and success states. Keep the Home and Catalog storefront world and standard web controls. Avoid unsupported product information, including ratings, reviews, discounts, variants, or unprovided specifications.

API constraints: public `GET /products/{public_product}` accepts the catalog slug and returns product name, description, integer price, stock, category, tags, store, and image paths with API-provided `sort_order`; image paths resolve as `/storage/{path}` against the API origin. Show available images in ascending sort order, with the first ordered image selected initially. Cart addition is authenticated `POST /cart/items/{public_product}` with integer quantity >= 1. Product currency is not documented; use the existing storefront price formatter without introducing a new currency assumption. Variants, ratings, reviews, and discounts are not supported by this surface.

## Direction contract

THESIS: Pair the selected real product image with a concise, complete summary so the shopper can assess the item without navigating a marketplace feed or an overbuilt fact sheet.

OWN-WORLD: Inherit The Shop: charcoal storefront navigation over a bone reading field, compact Archivo typography, square controls, flat image grounds, fine rules, and one restrained spectral-citron action signal. Keep image and name prominent; use spacing, not enclosing cards, to organize the content.

STORY: Arrive from a catalog slug, identify the product, inspect its documented description and available details, check stock, choose a positive integer quantity, then add it only when signed in and available. Loading, not-found, out-of-stock, signed-out, add-failure, and success states remain explicit and recoverable where the contract allows.

FIRST VIEWPORT: Retain the charcoal storefront header and centered responsive content frame. Below a quiet breadcrumb, place the selected API image at roughly 55% of the desktop content width on the left, with a selectable thumbnail rail ordered by API `sort_order`; place product name, category when present, API price using the existing formatter, stock, quantity control, and visible cart action on the right. A signed-out click opens a focused sign-in dialog. Continue below with description, then store and tags only when supplied. At compact widths, stack the image and thumbnail rail before the summary and keep the quantity/action controls together.

FORM: Image-led summary, first of the three dealt product-detail structures; seed key de25d831. The selected product image and concise overview share the first read, with documented details continuing below.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
