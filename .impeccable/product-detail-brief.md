# Product Detail

Mode: Operate

Audience: shoppers arriving from the catalog. Job: assess one published product from documented information, choose a quantity, and add it to the cart only when the API-supported conditions allow. Scope: responsive product detail at `src/features/product-detail/`, including loading, not-found, out-of-stock, signed-out, add-failure, and success states. Keep the Home and Catalog storefront world and standard web controls. Avoid unsupported product information, including ratings, reviews, discounts, variants, or unprovided specifications.

API constraints: public `GET /products/{public_product}` accepts the catalog slug and returns product name, description, integer price, stock, category, tags, store, and ordered image paths where available; image paths resolve as `/storage/{path}` against the API origin. Cart addition is authenticated `POST /cart/items/{public_product}` with integer quantity >= 1. Product currency is not documented; do not imply one without resolving the existing app convention against product truth. No gallery, variants, ratings, reviews, or discounts are supported by this surface.

## Direction contract

THESIS: Pair one real product image with a concise, complete summary so the shopper can assess the item without navigating a marketplace feed or an overbuilt fact sheet.

OWN-WORLD: Inherit The Shop: charcoal storefront navigation over a bone reading field, compact Archivo typography, square controls, flat image grounds, fine rules, and one restrained spectral-citron action signal. Keep image and name prominent; use spacing, not enclosing cards, to organize the content.

STORY: Arrive from a catalog slug, identify the product, inspect its documented description and available details, check stock, choose a positive integer quantity, then add it only when signed in and available. Loading, not-found, out-of-stock, signed-out, add-failure, and success states remain explicit and recoverable where the contract allows.

FIRST VIEWPORT: Retain the charcoal storefront header and centered responsive content frame. Below a quiet breadcrumb, place one primary API image at roughly 55% of the desktop content width on the left and the product name, category when present, API price without an invented currency, stock, quantity control, and conditional cart action on the right. The action is the strongest control but does not overwhelm the product information. Continue below with description, then store and tags only when supplied. At compact widths, stack image before the summary and keep the quantity/action controls together.

FORM: Image-led summary, first of the three dealt product-detail structures; seed key de25d831. The product image and concise overview share the first read, with documented details continuing below.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance