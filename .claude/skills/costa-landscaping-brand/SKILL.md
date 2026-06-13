---
name: costa-landscaping-brand
description: Brand lock for a hard-landscaping and property-maintenance company on the Costa del Sol (Marbella, Estepona, Mijas, Sotogrande). Mediterranean / Andalusian visual language. Use whenever building or editing this company's website. Sits on top of design-taste-frontend and overrides palette, type, dials, and imagery for a warm, sun-and-sea, trust-first service brand. Triggers on Costa del Sol, hard landscaping, garden maintenance, villa, Mediterranean site.
---

# Costa del Sol Hard Landscaping - Brand Lock

Apply on top of `design-taste-frontend`. The base rules hold **except** where this file overrides. Drop the real company name in where this file says `[COMPANY]`.

## Locked design read

> Reading this as: local hard-landscaping + property-maintenance service landing for Costa del Sol villa owners, expats, and property managers (Marbella, Estepona, Mijas, Sotogrande), with a warm Mediterranean / Andalusian language, leaning toward native CSS + Tailwind v4 + restrained Motion, trust-first and grounded.

This is a service business, not a tech product. The page sells reliability, craft, and local knowledge. Calm and premium, not flashy.

## Dials (override baseline)

- **`DESIGN_VARIANCE: 6`** - clean and confident, light asymmetry, not chaotic. The work (the stone, the gardens, the terraces) is the spectacle, not the UI.
- **`MOTION_INTENSITY: 4`** - calm. Gentle scroll-reveals (use the 5.C stagger from the base), soft hover states, before/after slider. No cyberpunk scrolltelling, no GSAP hijacks, no parallax overload. Trust-first audiences want steadiness.
- **`VISUAL_DENSITY: 3`** - airy, generous whitespace, lots of room for big photography.

## Palette (locked, Mediterranean - NOT the banned default)

The base bans the AI-default premium-consumer palette (beige/cream + brass/clay/oxblood + espresso). **Do not drift into it.** This brand is genuinely Mediterranean and place-rooted, which justifies a warm palette, but it must be the specific Andalusian-coast family below, executed with intention - not generic warm-craft beige.

One accent system, locked across the whole page:
- **Primary neutral base:** whitewashed off-white / warm limestone (`#f6f3ec` to `#efe9df` range), evoking Andalusian whitewashed walls. Off-white, never pure `#fff`.
- **Accent (the one accent, per the consistency lock):** Mediterranean sea blue - azure to cobalt (`#1f6f8b` to `#2a93b8` range). This is the single UI accent: CTAs, links, active states, icons.
- **Warm secondary (material tone, not a UI accent):** terracotta / warm clay (`#c06a42` to `#b15a36`), used sparingly as a material/photographic tone (roof tiles, pots, terracotta detail), NOT as a second button color. Keeping azure as the only interactive accent satisfies the one-accent rule.
- **Green (the trade itself):** muted olive / sage (`#7a8b5a` to `#5f7048`) for planting cues, supporting detail, never neon.
- **Text:** warm near-black / deep charcoal-brown (off-black, not `#000`).

This is the Mediterranean azure + terracotta + olive family, deliberately distinct from the banned beige+brass. If a previous Mediterranean project used this exact mix, vary it; do not ship the same palette twice in a row.

## Typography (locked)

- **Display:** a warm humanist sans with character - Cabinet Grotesk, GT Walsheim, or a soft grotesk. Confident but approachable, not cold-tech.
- **Optional justified serif:** a restrained serif display is acceptable here IF a heritage / craftsmanship feel is wanted, because the brand is genuinely place-and-craft rooted (this is the base's articulated-justification override). If used, pick from the base's approved pool (e.g. Reckless Neue, Tiempos Headline, GT Sectra) - **never Fraunces or Instrument_Serif**. Pair with a clean humanist sans body. Default to sans-only if unsure.
- **Body:** humanist sans, `max-w-[65ch]`, generous line-height for a calm read.
- No mono (this is not a tech brand).

## Imagery (the product is visual - lead with real photography)

- Real Mediterranean photography is mandatory and central: natural stone and dry-stone walls, paved terraces, whitewashed villas, olive and citrus trees, pools, golden-hour coast light. Texture of stone, plaster, warm sun.
- **Before/after galleries** are a core section for hard landscaping - use a comparison slider (clip-path based, hardware-accelerated). This is the strongest trust signal in the trade.
- Use the base image priority: gen-tool first if available, then `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}` placeholders (seed describing the shot, e.g. `marbella-stone-terrace-villa`), then labelled slots. Even the calmest section needs a real image, not a flat block.
- No uncanny generic stock "diverse team" shots - real crew/work photos or none.

## Trust & local signals (service-business essentials)

- **Areas served** strip (Marbella, Estepona, Mijas, Benahavís, Sotogrande) - real and useful, not a decorative locale strip. (The base bans atmospheric locale/weather strips; a genuine "areas we cover" service section is the allowed exception.)
- Real reviews/testimonials (≤ 3 lines each, name + area, per base quote rules).
- Clear single contact intent - one CTA label across the page ("Get a quote" OR "Request a callback", pick one, per the no-duplicate-intent rule).
- Optional bilingual note: the audience is EN + ES (expats + locals). If a language toggle is built, set it cleanly in the nav, not as a sun/moon-style gimmick.

## What stays from the base

Everything not overridden: layout hard rules, hero discipline (≤2-line headline, real visual, `min-h-[100dvh]`), eyebrow cap, anti-slop content rules, the em-dash ban, performance and a11y guardrails, reduced-motion, and the full pre-flight check. Run pre-flight before shipping. The page should feel warm, sunlit, and trustworthy, with the stone and gardens doing the talking.
