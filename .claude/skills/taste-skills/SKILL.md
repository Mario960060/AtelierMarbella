---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. Reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check. Not for dashboards or dense product UI.
---

# tasteskill: Anti-Slop Frontend

> Landing pages, portfolios, redesigns. Not dashboards, not data tables, not multi-step product UI.
> Every rule is contextual. Nothing fires automatically. Read the brief first, then pull only what fits.

## 0. Brief inference (read the room first)

Most LLM design output is bad because the model jumps to a default aesthetic. Before any code, infer:
- **Page kind** - landing (SaaS / consumer / agency / event), portfolio, redesign, editorial.
- **Vibe words** the user used ("minimalist", "Linear-style", "Awwwards", "brutalist", "premium", "playful", "dark tech").
- **Reference signals** - URLs, screenshots, products, competitors named.
- **Audience** - the audience picks the aesthetic, not your taste.
- **Existing brand assets** - logo, color, type, photography (for redesigns these are starting material, see Section 11).
- **Quiet constraints** - accessibility-first, public-sector, regulated, trust-first, kids. These OVERRIDE aesthetic preference.

**Output a one-line "Design Read" before generating:** *"Reading this as: \<page kind> for \<audience>, with a \<vibe> language, leaning toward \<system or aesthetic family>."*

If the brief is ambiguous, ask exactly **one** question, only when the read genuinely diverges. Otherwise declare the read and proceed.

**Anti-default discipline.** Do not default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism on everything, infinite micro-animations everywhere, Inter + slate-900.

## 1. The three dials

Set after the design read. Every layout/motion/density decision is gated by these.
- **`DESIGN_VARIANCE: 8`** - 1 = symmetry, 10 = artsy chaos
- **`MOTION_INTENSITY: 6`** - 1 = static, 10 = cinematic
- **`VISUAL_DENSITY: 4`** - 1 = airy, 10 = packed data

Baseline `8 / 6 / 4` unless the read overrides. Overrides happen conversationally, never by editing this file.

| Signal | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| minimalist / clean / Linear-style / editorial | 5-6 | 3-4 | 2-3 |
| premium consumer / Apple-y / luxury | 7-8 | 5-7 | 3-4 |
| playful / Awwwards / agency / experimental | 9-10 | 8-10 | 3-4 |
| landing / portfolio (default) | 7-9 | 6-8 | 3-5 |
| trust-first / public-sector / a11y-critical | 3-4 | 2-3 | 4-5 |
| redesign-preserve | match | +1 | match |
| redesign-overhaul | +2 | +2 | match |

Cross-references use these exact variable names. Never invent aliases like `LAYOUT_VARIANCE`.

## 2. Brief → design system map

Pick the right foundation. Do not invent CSS for things that have an official package.

**Reach for a real, official package when the brief reads as:** Microsoft/enterprise → Fluent UI; Material-flavored → `@material/web` + Material 3; IBM B2B analytics → Carbon; Shopify admin → Polaris; Atlassian → Atlaskit; GitHub devtool → Primer; UK public-sector → `govuk-frontend`; US trust-first → `uswds`; fast local/agency MVP → Bootstrap 5.3; accessible React base → `@radix-ui/themes`; owned components → shadcn/ui; Tailwind SaaS/marketing → Tailwind v4. (Install commands and canonical docs in `reference.md`.)

**Honesty rule:** if the brief is a named system, install the official package. Do not recreate its CSS by hand or override 90% of its tokens. **One system per project.**

**When the brief is an aesthetic, not a system** (glassmorphism, bento, brutalism, editorial, dark-tech, aurora/mesh, kinetic type), build with native CSS + Tailwind + a maintained component lib. Be honest in comments about borrowed inspiration vs official material. There is **no official `liquid-glass.css`** - web versions are `backdrop-filter` approximations, label them as such.

## 3. Default architecture

When the read does not pick a real design system:
- **Framework:** React / Next.js, default to RSC. Anything using Motion, scroll listeners, or pointer physics is an isolated leaf with `'use client'` at the top. Server Components render static layouts only.
- **Styling:** Tailwind v4 default. v4 uses `@tailwindcss/postcss` or the Vite plugin, not the `tailwindcss` PostCSS plugin.
- **Animation:** Motion (`import { motion } from "motion/react"`). `framer-motion` is a legacy alias; prefer `motion/react` in new code.
- **Fonts:** `next/font` or self-host with `@font-face` + `font-display: swap`. Never `<link>` Google Fonts in production.
- **State:** local `useState`/`useReducer`; global (Zustand/Jotai/context) only to avoid deep drilling. **NEVER** `useState` for continuous values (mouse, scroll, pointer physics) - use `useMotionValue`/`useTransform`/`useScroll`.
- **Icons:** Phosphor / HugeIcons / Radix / Tabler (priority order). Lucide only on explicit request. Never hand-roll SVG icon paths. One family per project, standardize `strokeWidth` globally.
- **Emoji:** discouraged by default; allow only for explicit playful/social vibe, used sparingly.
- **Layout mechanics:** standard breakpoints (`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`); contain with `max-w-[1400px] mx-auto` or `max-w-7xl`; **never `h-screen` for heroes, always `min-h-[100dvh]`**; CSS Grid over flexbox percentage math.
- **Dependency check (mandatory):** before importing any 3rd-party lib, check `package.json` and output the install command if missing. Never assume a library exists.

## 4. Design engineering directives (bias correction)

### 4.1 Typography
- Display default `text-4xl md:text-6xl tracking-tighter leading-none`. Body `text-base text-gray-600 leading-relaxed max-w-[65ch]`.
- **Inter discouraged as default** - prefer Geist, Outfit, Cabinet Grotesk, Satoshi, or brand-appropriate. Inter OK only for explicit neutral/Linear-style or public-sector.
- **Serif very discouraged as default.** "Feels creative/premium" is NOT a reason. Default to a sans display (Geist Display, Cabinet Grotesk, PP Neue Montreal, GT Walsheim, etc.). Serif only when the brand literally names one, OR the family is genuinely editorial/luxury/heritage AND you can articulate why this specific serif fits. **Banned serif defaults:** Fraunces, Instrument_Serif.
- **Emphasis rule:** emphasize a word with italic/bold of the **same** font, never a random injected serif.
- **Italic descender clearance (mandatory):** italic display words with `y g j p q` need `leading-[1.1]` min + `pb-1` reserve or they clip.

### 4.2 Color
- Max 1 accent. Saturation < 80% by default. Neutral bases (Zinc/Slate/Stone) with one high-contrast accent.
- **The Lila rule:** AI-purple/blue glow discouraged as default. If the brand explicitly wants purple, embrace it with intent (consistent palette, restrained gradients), not generic AI slop.
- **Color consistency lock (mandatory):** one accent for the WHOLE page. No surprise blue CTA in section 7 on a warm-grey site. Audit every component.
- **Premium-consumer palette ban (mandatory):** for premium/artisan/luxury/wellness briefs, the AI default is warm beige/cream + brass/clay/oxblood + espresso text. **Banned as the default reach.** Rotate to a distinct family instead (cold luxury silver-grey, forest green + bone + amber, black + tan, cobalt + cream, terracotta + slate, olive + brick + paper, or monochrome + one saturated pop). Override only when the brand explicitly names those colors or is genuinely vintage/artisan AND justified.

### 4.3 Layout
- **Anti-center bias:** centered hero avoided when `DESIGN_VARIANCE > 4` - use split-screen, left-content/right-asset, asymmetric white-space, or scroll-pinned. Centered OK for editorial/manifesto/launch.

### 4.4 Materiality
- Cards ONLY when elevation communicates real hierarchy; otherwise group with `border-t`, `divide-y`, negative space. Tint shadows to the background hue, no pure-black drop shadows. For `VISUAL_DENSITY > 7`, generic cards banned.
- **Shape consistency lock (mandatory):** one corner-radius scale per page, or a documented rule (buttons pill, cards 16px, inputs 8px) followed everywhere.

### 4.5 Interactive states
- Implement full cycles: skeleton loaders (not generic spinners), composed empty states, clear inline errors. `:active` → `-translate-y-[1px]` or `scale-[0.98]`.
- **Button contrast check (mandatory, a11y):** every CTA text readable against its bg, WCAG AA (4.5:1 body, 3:1 large). No white-on-white, no transparent-on-page-bg without border/scrim.
- **CTA wrap ban:** button text fits one line at desktop (3 words max for primary, ideally 1-2).
- **No duplicate CTA intent:** "Get in touch" + "Let's talk" + "Contact us" on one page = fail. One label per intent everywhere.
- **Form contrast check (mandatory):** inputs, placeholders, focus rings, labels all pass WCAG AA against the section bg. No placeholder-as-label, ever. Label above, error below, `gap-2`.

### 4.7 Layout discipline (hard rules)
- **Hero fits the viewport:** headline ≤ 2 lines, subtext ≤ 20 words AND ≤ 4 lines, CTA visible without scroll. A 4-line headline is a font-size error, not a copy error. Default `text-4xl md:text-5xl lg:text-6xl`; `text-6xl md:text-7xl` only for 3-5 word headlines.
- **Hero top padding cap:** `pt-24` max at desktop.
- **Hero stack discipline (max 4 text elements):** (eyebrow OR brand strip OR neither) + headline + subtext + CTAs (1 primary, max 1 secondary). Banned in hero: tagline below CTAs, trust micro-strip, pricing teaser, feature bullets, avatar row. Logo wall lives UNDER the hero, never inside.
- **Navigation on ONE line** at desktop, height ≤ 80px (default 64-72px).
- **Eyebrow restraint (mandatory, #1 violated rule):** max 1 eyebrow (small uppercase tracked label above a headline) per 3 sections. Hero counts as 1. Mechanical check: count `uppercase tracking` micro-labels; if > ceil(sectionCount / 3), fail. Default to dropping the eyebrow entirely.
- **Split-header ban:** "left big headline + right small explainer paragraph" as a section header is banned as default. Stack vertically (headline, then body, max-w 65ch).
- **Zigzag alternation cap:** max 2 consecutive image+text-split sections. 3rd in a row = fail. Break with full-width / vertical-stack / bento / marquee.
- **Section-layout-repetition ban:** each layout family appears at most once. 8 sections need ≥ 4 different families.
- **Bento:** has rhythm (not 6 repeated left-image/right-text rows), exact cell count (N items → N cells, no empty middle/end tiles), and ≥ 2-3 cells with real visual variation (image, brand gradient, pattern), not all white-on-white text cards.
- **Mobile collapse explicit per section** (`w-full`, `px-4`), no "Tailwind handles it" assumptions.

### 4.8 Images (landing pages are visual products)
Priority: (1) **image-gen tool first** if any is available - generate section-specific assets at the right aspect ratio. (2) **Real web images** - `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}`, brand URLs, open-license sources. (3) **Last resort:** leave labelled placeholder slots and tell the user what images are needed.
- Even minimalist sites need 2-3 real images. Pure-text is incomplete work, not minimalism.
- **Real logos for social proof:** Simple Icons (`https://cdn.simpleicons.org/{slug}/{color}`) or devicon. For invented brands, generate a simple inline SVG monogram, not plain text wordmarks. Logo wall = logos only, no category labels underneath.
- **Banned:** div-based fake screenshots/dashboards/terminals, hand-rolled decorative SVGs as default, broken Unsplash links. Hero needs a real visual, not a gradient blob.

### 4.9 Content density
- Per section: short headline (≤ 8 words) + sub-paragraph (≤ 25 words) + one visual OR one CTA.
- **No data-dump sections.** A 20-row spec table with a hairline under every row is the worst default. For > 5 items use: grouped 2-3 chunks, card-per-item grid, tabs/accordion, scroll-snap pills, carousel, or marquee. Never a long `<ul>` with `divide-y`.
- **Copy self-audit (mandatory before ship):** re-read every visible string. Flag and rewrite anything grammatically broken, with unclear referents, or that reads like AI trying to sound thoughtful (fake-craftsman labels, mock-poetic micro-meta). Plain functional beats cute.
- **Fake-precise numbers flagged:** `92%`, `4.1x`, `13.4 lb` are fine only if real, or labelled mock. AI-invented spec precision is banned.

### 4.10 Quotes
Max 3 lines of body. Attribution = name + role + (optional) company, never name-only. Real typographic quotes or none. No em-dash inside (Section 9.G).

### 4.11 Page theme lock
ONE theme per page (light, dark, or auto). No section inverts mid-scroll. Section-level background tints within the same family are fine (`bg-zinc-950` next to `bg-zinc-900`); flipping to `bg-amber-50` mid dark-page is broken. Set theme once at the root for systems with built-in theming.

## 5. Context-aware proactivity (tools, not defaults)

None of these fire automatically.
- **Glassmorphism / liquid glass:** premium/Apple-adjacent/media-overlay only. Go beyond `backdrop-blur`: 1px inner border + inset highlight. Solid-fill fallback under `prefers-reduced-transparency`.
- **Magnetic micro-physics:** when `MOTION_INTENSITY > 5` AND premium/playful/agency. `useMotionValue`/`useTransform` only, never `useState`.
- **Perpetual micro-interactions** (pulse, float, shimmer): when `MOTION_INTENSITY > 5` AND the section benefits. Not every card needs an infinite loop. Spring physics, no linear easing.
- **Motion must be motivated (mandatory):** every animation answers hierarchy / storytelling / feedback / state-transition in one sentence. "Looked cool" is not an answer. GSAP-everywhere is amateur.
- **Motion claimed = motion shown:** if `MOTION_INTENSITY > 4` the page actually moves (hero entry, scroll-reveal, CTA hover). If you cannot ship working motion, drop the dial to 3 and ship clean static. Never half-build motion that breaks.
- **Marquee max one per page.**

### 5.A Sticky-stack (canonical skeleton)
```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card, start: "top top",
          endTrigger: cardEls[cardEls.length - 1], end: "top top",
          pin: true, pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92, opacity: 0.55, ease: "none",
          scrollTrigger: { trigger: cardEls[i + 1], start: "top bottom", end: "top top", scrub: true },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);
  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div key={i} className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center">{card}</div>
      ))}
    </div>
  );
}
```
Critical: `start: "top top"`, `pin: true`, every card but the last is pinned, the shrink is driven by the NEXT card's trigger.

### 5.B Horizontal-pan (canonical skeleton)
```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
gsap.registerPlugin(ScrollTrigger);

export function HorizontalPan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: -distance, ease: "none",
        scrollTrigger: {
          trigger: wrap.current, start: "top top",
          end: () => `+=${distance}`, pin: true, scrub: 1, invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);
  return (
    <section ref={wrap} className="relative overflow-hidden">
      <div ref={track} className="flex h-[100dvh] items-center">{children}</div>
    </section>
  );
}
```
Critical: `start: "top top"`, `pin: true`, `end: "+=${distance}"`, `scrub: 1`.

### 5.C Scroll-reveal stagger (lighter, no GSAP)
```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
export function RevealStagger({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li key={item}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}>
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```
Use for feature lists, testimonial grids, logo walls. Save GSAP for actual pin/scrub work.

### 5.D Forbidden animation patterns
Banned: `window.addEventListener("scroll", ...)`, custom scroll-progress in React state, `requestAnimationFrame` loops touching React state. Use `useScroll()` / ScrollTrigger / IntersectionObserver / CSS `animation-timeline: view()`. Use Motion `layout`/`layoutId` for real state changes only, not "for safety".

## 6. Performance & accessibility

- Animate ONLY `transform` and `opacity`. `will-change: transform` sparingly.
- **Reduced motion (mandatory):** anything `MOTION_INTENSITY > 3` honors `prefers-reduced-motion`. Infinite loops, parallax, scroll-hijack, magnetic physics collapse to static. `useReducedMotion()` in Motion; gate CSS behind the media query.
- **Dark mode:** design both modes from the start unless told otherwise. Tailwind `dark:` OR CSS variables, one strategy. WCAG AA (AAA for hero body). No pure `#000`/`#fff` - off-black, off-white. Respect `prefers-color-scheme`.
- **Core Web Vitals:** LCP < 2.5s (hero image `priority`/preloaded), INP < 200ms, CLS < 0.1. Run Lighthouse before declaring done.
- **DOM cost:** grain/noise on fixed `pointer-events-none` pseudo-elements only, never scrolling containers. Lazy-load below-the-fold. Motion is not tiny, Three.js is large.
- **Z-index restraint:** no arbitrary `z-50`/`z-10` spam. Document the scale in constants.

## 7. Dial definitions (quick reference)
- **VARIANCE** 1-3 symmetric grid · 4-7 offsets/overlaps/mixed aspect ratios · 8-10 masonry/fractional grids/large empty zones. Levels 4-10 collapse to strict single column < 768px.
- **MOTION** 1-3 hover/active only · 4-7 CSS transitions + delay cascades · 8-10 scroll-triggered/parallax/scroll-driven (GSAP or CSS `animation-timeline`). `window.addEventListener('scroll')` is a hard ban at all levels.
- **DENSITY** 1-3 huge gaps (`py-32`+) · 4-7 standard (`py-16` to `py-24`) · 8-10 tight, 1px dividers, `font-mono` for numbers.

## 9. AI tells (forbidden patterns)

Avoid unless the brief explicitly asks.
- **Visual:** no neon/outer glows by default, no pure black, no oversaturated accents, no gradient text on large headers, no custom cursors.
- **Typography:** Inter not default, no oversized scream-H1s (control with weight+color), serif only for editorial/luxury.
- **Layout:** mathematically clean spacing; **no 3 equal feature cards** (use zig-zag/asymmetric/scroll-pinned/horizontal-scroll).
- **Content ("Jane Doe" effect):** no generic names ("John Doe"), no egg/Lucide avatars, no fake-perfect numbers (`99.99%`, `50%`), no startup-slop brands ("Acme", "Nexus", "SmartFlow"), no filler verbs ("Elevate", "Seamless", "Unleash", "Next-Gen").
- **Resources:** no hand-rolled SVG icons, no div fake screenshots, no broken Unsplash, shadcn never in default state.

### 9.F Production-test tells (hard bans)
- **No version labels in hero** (`V0.6`, `BETA`, `EARLY ACCESS`) unless the brief is a launch. No "Brand · No. 01" sub-eyebrows.
- **No section-number eyebrows** (`00 / INDEX`, `001 · Capabilities`, `06 · how it works`). No `01 / 4` pagination on tiles. No `Scroll · 001` cues.
- **Middle-dot (`·`) rationed:** max 1 per metadata line. Not the default separator for everything.
- **No decorative colored status dots** on every nav/list/badge (only for real semantic state, sparingly).
- **No `<br>`-broken-and-italicized headlines** as a default move. No vertical rotated text. No crosshair/hairline decoration grids.
- **No fake product UI in hero** (div task lists, fake terminals, fake version footers). #1 LLM tell.
- **Marketing-copy tells banned:** "Quietly in use at", "Field notes" / "On our desks" / "Currently on the bench" poetic labels, mock-humble industry references, weather/locale strips ("LIS 14:23 · 18°C"), micro-meta-sentences under eyebrows, generic step labels ("Stage 1 / Step 2 / Phase 03" - use the verb directly).
- **No pills/labels overlaid on images.** No decorative photo-credit captions. No version footers (`v1.4.2`, `Build 0048`) on marketing pages. No live-stock counters as decoration.
- **No decoration text strip at hero bottom** (`BRAND. MOTION. SPATIAL.`). No floating top-right sub-text in section headings.
- **No `border-t` + `border-b` on every row** of long lists. No filled-track scoring bars as comparison decoration.
- **Locale/city/time/weather strips banned for ~99% of briefs.** **Scroll cues banned** (`Scroll`, `↓ scroll`, animated mouse-wheel).

### 9.G Em-dash ban (the single most-violated tell)
**Em-dash (`—`) is completely banned** in everything visible: headlines, eyebrows, pills, body, quotes, attribution, captions, buttons, alt text. No "limited use" allowance. Also banned: en-dash (`–`) as a separator (ranges use a hyphen `2018-2026`). Replace with period, comma, parentheses, colon, line break, or the regular hyphen with spaces (` - `). The only permitted dashes are the regular hyphen `-` and the math minus. A single `—` anywhere visible fails pre-flight.

## 11. Redesign protocol

This skill handles greenfield AND redesigns. Misclassifying the mode is the biggest source of bad redesign output.
- **Detect mode first:** greenfield (no site / overhaul approved), redesign-preserve (modernise without breaking brand), redesign-overhaul (new visuals, preserve content + IA). If ambiguous, ask once.
- **Audit before touching:** brand tokens, IA, content blocks, patterns to preserve vs retire, the existing site's inferred dials (your starting point, not the baseline), and SEO baseline. **SEO migration is the #1 redesign risk.**
- **Preserve:** IA, slugs, anchor IDs, nav labels, copy voice, existing a11y wins, analytics event names. Extract existing brand color before applying Section 4.2 (a purple brand stays purple).
- **Modernisation levers (in order, stop when satisfied):** typography refresh → spacing/rhythm → color recalibration → motion layer → hero/key-section recomposition → full block replacement (only when unsalvageable).
- **Never change silently** without approval: URL structure, nav labels, form field names/order, logo, legal/consent copy.

## 13. Out of scope
Not for dashboards / dense product UI / admin panels (use Fluent/Carbon/Atlassian/Polaris), data tables (TanStack/AG Grid), multi-step wizards, code editors (Monaco/CodeMirror), native mobile (HIG/Material), realtime collab UIs. If the brief is one of these, say so, point to the right tool, and apply only the marketing/about/landing parts.

## 14. Final pre-flight check

Run before outputting. If any box fails, it is not done.
- [ ] Design read declared, dials reasoned from the brief (not silent baseline)
- [ ] Design system chosen or aesthetic labelled honestly; redesign mode + audit done if applicable
- [ ] **ZERO em-dashes anywhere visible** (9.G, non-negotiable)
- [ ] Page theme lock, color consistency lock, shape consistency lock all hold
- [ ] Every CTA passes contrast, fits one line, no duplicate-intent CTAs; forms pass contrast
- [ ] Serif (if any) not Fraunces/Instrument_Serif; premium-consumer palette not the beige+brass default
- [ ] Italic descender clearance on `y g j p q`
- [ ] Hero fits viewport (≤2-line headline, ≤20-word subtext, CTA visible, `pt-24` max, ≤4 text elements)
- [ ] Eyebrow count ≤ ceil(sections/3); no split-header; no 3+ consecutive zigzags; ≥4 layout families across 8 sections
- [ ] Bento has rhythm, exact cell count, ≥2-3 varied cells; logo wall under hero, real SVG logos, logos only
- [ ] Real images (gen → picsum → labelled slots); no div fake screenshots, no hand-rolled decorative SVG, no pure-text minimalism
- [ ] Copy self-audit done; no broken/AI-hallucinated strings; no fake-precise numbers
- [ ] Motion motivated, claimed = shown; max one marquee; GSAP per 5.A/5.B skeleton; no `window` scroll listeners
- [ ] Reduced motion for everything `MOTION > 3`; dark mode tested both modes; mobile collapse explicit; `min-h-[100dvh]`
- [ ] `useEffect` animations have cleanup; empty/loading/error states present; cards omitted where spacing works; icons from an allowed lib; motion isolated in `'use client'` leaves
- [ ] No 9.F tells (version labels, section numbers, decorative dots, locale/scroll cues, fake UI, poetic labels)
- [ ] Core Web Vitals plausibly hit; one design system per project

## Deeper material
Pattern vocabulary (Section 10), the block-library schema (Section 12), install commands, canonical docs per design system, and the honest Apple Liquid Glass web approximation all live in [reference.md](reference.md).
