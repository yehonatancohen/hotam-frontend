---
version: 1
slug: "customer-frontend-src-pages-home-jsx"
primary_target: "customer-frontend/src/pages/Home.jsx"
related_targets: ["customer-frontend/src/pages/Products.jsx","customer-frontend/src/pages/Customizer.jsx","customer-frontend/src/pages/Checkout.jsx"]
---

# Surface: Hotam customer site (all customer routes)

Mode: Persuade (home, products, product page); Operate (customizer, checkout, confirmation) inside the same world.
Audience: Israeli gift buyers and small businesses, mostly on phones from WhatsApp/Instagram. Job: find an item, see their words on it, order or start a WhatsApp chat.
Proof on hand: none real (no photos, no stats, no reviews). Demonstration = the visitor's own words printed onto drawn product stickers. Constraints: Hebrew RTL, React/Vite/Tailwind, API catalog, customizer/checkout engine preserved.

## Direction contract

THESIS: Five friends printing their own zine. The site is a risograph-printed sheet: loud condensed Hebrew in two misregistered inks, and every product is a die-cut sticker slapped on the page. It refuses the category default (stock lifestyle photo + neat product-card grid) and the previous rejected plate world.

OWN-WORLD: Paper stock #f3f3ef with fine halftone grain. Three riso inks only, printed flat and multiplied: fluoro pink #ff48b0 (action), medium blue #0078bf (structure, headings), yellow #ffe800 (highlight). Ink #1d1d1f for text. Display: Karantina 700, huge, blue with a pink misregistered copy offset a few px. UI/body: Rubik. Products = drawn SVG stickers (white die-cut border, halftone shading, pink/blue offset text). Pill buttons, pink with a hard blue offset (riso misprint, the one sanctioned offset shadow). Marquee ticker strip in blue. Taped paper sheets for forms.

STORY: Visitor lands on a loud printed page, types what to engrave, and sees it printed onto every sticker. They browse the sticker catalog, learn "proof before laser", and order or open WhatsApp. Businesses get a full blue section.

FIRST VIEWPORT: Desktop: right half, headline "חורטים לכם שם" at ~250px Karantina in blue with pink offset, lead with yellow-highlighted proof promise, pink primary CTA + WhatsApp pill, then a "מה לחרוט?" input. Left half: 4 tilted product stickers (door sign, wallet, cup, keychain) with price tags. Blue marquee strip at the fold. Mobile: headline, lead, CTAs, input, then stickers in a 2-up scatter.

FORM: Riso Zine & Stickers, position 3 on the re-rolled list, seed key b22c04a3 (re-roll 1). Signature interaction: the "print pass" — typed words appear on all stickers and the pink layer slides from heavy misregistration into register. The name persists (localStorage) into product stickers and the customizer.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions
- Future: replace drawn stickers with generated 3D product renders (owner plans this in a separate session). Keep the ProductVisual/StickerArt seam so renders can drop in.
- Real product photography shot list.
- Free shipping over ₪300 rule not yet confirmed by the team.
