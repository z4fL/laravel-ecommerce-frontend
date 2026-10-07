---
name: The Shop
description: A shopper-first storefront for clear product discovery.
colors:
  charcoal: "#252720"
  bone: "#f0efe8"
  paper: "#faf9f4"
  muted: "#66675f"
  rule: "#cecec4"
  spectral-citron: "#d9e96d"
  marker-olive: "#5b681b"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, sans-serif"
    fontSize: "46–68px"
    fontWeight: 520
    lineHeight: 0.99
    letterSpacing: "0"
  title:
    fontFamily: "Archivo Variable, Archivo, sans-serif"
    fontSize: "26–30px"
    fontWeight: 560
    lineHeight: 1.15
  body:
    fontFamily: "Archivo Variable, Archivo, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo Variable, Archivo, sans-serif"
    fontSize: "11–13px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  none: "0px"
spacing:
  wide: "48px"
  medium: "32px"
  compact: "20px"
components:
  search-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "58px"
  search-submit:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.spectral-citron}"
    rounded: "{rounded.none}"
    size: "58px"
  navigation-link:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    minHeight: "44px"
  category-filter:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.muted}"
    rounded: "{rounded.none}"
    minHeight: "42px"
---

# Design System: The Shop

## Overview

**Creative North Star: "Spectrum-index storefront"**

The Shop makes product discovery easy to scan through clear hierarchy, confident whitespace, and real catalog data. Charcoal navigation anchors the bone-colored reading field; compact Archivo typography and fine rules keep the experience precise without making it feel technical. Product imagery and product names lead wherever real catalog images are available.

The spectrum source stays quiet: color is a restrained state signal, not a dashboard language. Storefront navigation, search, category controls, and product links remain familiar web patterns. When the API provides a placeholder image, show an honest unavailable state rather than substitute unrelated imagery.

**Key Characteristics:**
- Product-first, editorial-commerce hierarchy.
- Charcoal and bone surfaces with one restrained spectral accent.
- Square forms, fine rules, and no decorative elevation.
- Familiar controls with explicit, accessible state.
- Mobile-first composition that progressively expands on wider screens.

## Colors

The palette pairs a deep green-charcoal shell with a soft neutral field; spectral citron is reserved for a small number of high-signal details.

### Primary
- **Spectral Citron**: The small action and brand-mark accent. Keep it rare and pair it with a dark surface or ink for legibility.

### Neutral
- **Charcoal**: Navigation, primary ink, and the search action.
- **Bone**: The main page field.
- **Paper**: Input surfaces and light text on charcoal.
- **Muted Ink**: Supporting copy and secondary product metadata.
- **Rule**: Fine separators between related areas.
- **Marker Olive**: The doubled active-category marker and visible focus outline.

**The One Signal Rule.** Spectral citron marks an action or selected state; it never becomes a decorative wash across the page.

## Typography

**Display Font:** Archivo Variable (Archivo, sans-serif fallback)  
**Body Font:** Archivo Variable (Archivo, sans-serif fallback)  
**Character:** A clear, compact grotesque gives product names and controls a shared voice. Size and weight establish hierarchy; tracking stays neutral.

### Hierarchy
- **Display** (520, 46–68px / 0.99): The page-level discovery question. The scale grows progressively with viewport width rather than using a single fixed desktop size.
- **Title** (560, 26–30px / 1.15): Product-group headings. The scale increases on wider screens.
- **Body** (400, 15px / 1.5): Supporting copy and product details.
- **Label** (600, 11–13px / 1.5): Category metadata, navigation, counts, and field labels.

**The Product Name Rule.** Keep names readable before metadata; clamp preview titles to two lines rather than shrinking their type.

## Layout

Design from the narrowest usable layout upward. Compact screens use a 20px horizontal gutter, a single-column introduction, and a two-column product grid. Wider screens progressively increase gutters, content width, product columns, and whitespace without changing the information hierarchy.

The content frame is centered and capped at 1400px. Horizontal gutters grow from compact to medium to wide layouts: 20px, 32px, then 48px.

The discovery introduction starts as a single-column stack and expands into a split layout on wider screens. Product grids start with two columns, expand to three at medium widths, and four at wide widths.

Category filters remain a horizontal, keyboard-operable rail on narrow screens. Do not force category controls into multiple rows when horizontal scrolling preserves the hierarchy.

Keep separators thin and reserve more space above section headings than below them.

**The Mobile-First Rule.** Responsive layouts should add space, columns, and composition progressively rather than redesigning the information hierarchy at larger widths.

## Elevation & Depth

The system is flat by default. Charcoal and bone fields, image grounds, and fine rules provide separation; there is no shadow vocabulary. Hover feedback is limited to a small image-scale change and clear text underlines.

**The Flat Surface Rule.** Do not add shadows to manufacture hierarchy that spacing, type, or a rule can carry.

## Shapes

Use square corners throughout controls and product frames (0px radius). Product artwork is a plain rectangular crop with a stable 4:4.65 aspect ratio. Use a fine outline for fields and separators rather than rounded pills or card shells.

## Components

### Buttons
- **Shape:** Square, familiar web controls (0px radius).
- **Primary:** The search action is a 58px charcoal square with a spectral-citron search icon.
- **Hover / Focus:** Slightly lighter charcoal on hover; a visible olive outline on keyboard focus.
- **Secondary / Ghost / Tertiary:** Text actions use an underline on hover and keep a 40px minimum target height.

### Chips
- **Style:** Category filters are unboxed text controls on the bone field, not pill chips.
- **State:** The selected label gains weight and a doubled olive marker; `aria-pressed` communicates state independently of color.

### Product Tiles
- **Structure:** Product listings consist of an image followed by aligned metadata, not an enclosed card.
- **Image:** Use a plain rectangular image frame with a stable 4:4.65 aspect ratio.
- **Image Ground:** Use a quiet neutral surface behind product imagery and loading states.
- **Metadata:** Category, product name, and price remain visually connected through spacing rather than borders or containers.
- **Interaction:** Product imagery may scale subtly on hover; product names use clear text underlines.
- **Shadow / Border:** None around the complete product tile.

**The Product Tile Rule.** Do not introduce card backgrounds, enclosing borders, shadows, rounded containers, badges, or decorative elevation around the complete product item.

### Inputs / Fields
- **Style:** Paper field with a fine neutral outline and square corners.
- **Focus:** Olive outline and border-color change; retain the native caret and search affordance.
- **Error / Disabled:** Errors state the problem and offer an explicit retry when recovery is possible.

### Navigation
- **Style:** Charcoal band with paper text, compact Archivo labels, and a single-line horizontal arrangement. Links underline on hover and retain visible keyboard focus.
- **Mobile:** Keep catalog, cart, and sign-in destinations visible; do not replace them with a dashboard rail or hidden navigation pattern.

### Category Marker
The active category carries two short vertical olive strokes and a stronger label. Keep this as the only repeated spectral-index motif; the state remains available to assistive technology through the control label and pressed state.

### Loading
Skeletons use the same quiet neutral surface language as product image grounds. They remain flat, rectangular, and low contrast.

Do not introduce animated decorative effects or new colors solely for loading states.

### Empty / Error States
Empty and error states use plain typography and spacing rather than cards, banners, or decorative illustrations.

Errors should clearly state the problem and provide a direct retry action when recovery is possible. Empty states should explain the absence of results and provide a relevant next action when filters or search terms can be changed.

### Image Unavailable State
When a product image is absent, fails to load, or is a known placeholder, show an explicit unavailable state within the product image frame.

Do not substitute unrelated imagery or fabricate product artwork.

## Do's and Don'ts

### Do:
- **Do** let product names, prices, categories, and real product images lead.
- **Do** design from compact screens upward and progressively enhance the layout for wider screens.
- **Do** use the doubled marker only to reinforce a selected category.
- **Do** preserve standard storefront navigation and native web control behavior.
- **Do** show an explicit image-unavailable fallback when the API image is absent or is a known placeholder.
- **Do** keep product listings flat and image-led rather than turning them into generic card components.
- **Do** use spacing, typography, and rules as the primary tools for hierarchy.

### Don't:
- **Don't** turn the storefront into an instrument dashboard or use instrument-specific controls.
- **Don't** invent featured status, popularity, discounts, reviews, or ratings.
- **Don't** substitute unrelated imagery when catalog images are unavailable.
- **Don't** use color as the only indication of selection or focus.
- **Don't** introduce rounded cards, pills, shadows, gradients, or decorative elevation.
- **Don't** create separate visual treatments for muted, subtle, notice, or similar near-identical neutral states without a clear semantic need.
- **Don't** introduce multiple product-tile background variants when a single quiet neutral surface is sufficient.