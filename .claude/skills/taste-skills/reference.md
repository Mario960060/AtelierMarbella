# Deeper material

Loaded on demand from [SKILL.md](SKILL.md). Reference content that does not need to sit in context for every task.

## 10. Reference vocabulary (pattern names to know)

A vocabulary, not a library. Know these names to communicate about them and reach for them when the read calls for them.

**Hero:** Asymmetric Split, Editorial Manifesto, Video/Media Mask, Kinetic-Type, Curtain-Reveal, Scroll-Pinned.
**Navigation:** macOS Dock Magnification, Magnetic Button, Gooey Menu, Dynamic Island, Contextual Radial Menu, Floating Speed Dial, Mega Menu Reveal.
**Layout & grids:** Bento Grid, Masonry, Chroma Grid, Split-Screen Scroll, Sticky-Stack Sections.
**Cards:** Parallax Tilt, Spotlight Border, Glassmorphism Panel, Holographic Foil, Tinder Swipe Stack, Morphing Modal.
**Scroll:** Sticky Scroll Stack, Horizontal Scroll Hijack, Locomotive/Sequence Scroll, Zoom Parallax, Scroll Progress Path, Liquid Swipe Transition.
**Galleries:** Dome Gallery, Coverflow Carousel, Drag-to-Pan Grid, Accordion Image Slider, Hover Image Trail, Glitch Effect Image.
**Typography:** Kinetic Marquee, Text Mask Reveal, Text Scramble, Circular Text Path, Gradient Stroke Animation, Kinetic Typography Grid.
**Micro-interactions:** Particle Explosion Button, Liquid Pull-to-Refresh, Skeleton Shimmer, Directional Hover-Aware Button, Ripple Click, Animated SVG Line Drawing, Mesh Gradient Background, Lens Blur Depth.

**Animation library choice:** Motion (`motion/react`) for UI/bento/state-change; GSAP + ScrollTrigger for full-page scrolltelling and hijacks; Three.js/WebGL for canvas/3D. Isolate each in dedicated leaf components with `useEffect` cleanup. **Never mix GSAP/Three.js with Motion in the same component tree** - they fight over frames.

## 12. Block library (contract)

The vocabulary names patterns; the block library implements them with real props, motion specs, and code sketches. Schema below; blocks are added iteratively. Do not freelance blocks without following the schema.

```
skills/<skill-name>/blocks/
  hero/ feature/ social-proof/ pricing/ cta/ footer/ navigation/ portfolio/ transition/
```

**Required frontmatter:**
```yaml
---
name: asymmetric-split-hero
category: hero
dial_compatibility: { variance: [6,10], motion: [3,10], density: [2,5] }
when_to_use: "Landing pages with one strong asset and one strong message."
not_for: "Editorial / manifesto launches where the message is the design."
stack: ["react", "next", "tailwind", "motion"]
---
```

**Required body:** visual sketch, props API, code sketch (RSC default + client island for motion), mobile fallback, motion variants (one per MOTION band + reduced-motion), dark-mode notes, anti-patterns, references.

**Discipline:** one block per file; every block works standalone; every block passes the pre-flight check; system-specific blocks live under `blocks/<category>/<name>--<system>.md`.

## Appendix A - Install commands per design system

```bash
npm install @material/web                              # Material Web (Material 3)
npm install @fluentui/react-components                 # Fluent UI React v9
npm install @fluentui/web-components @fluentui/tokens   # Fluent UI Web Components
npm install @carbon/react @carbon/styles               # IBM Carbon
npm install @radix-ui/themes                            # Radix Themes
npx shadcn@latest init && npx shadcn@latest add button card badge separator input
npm install --save @primer/css                          # GitHub product UI
npm install @primer/react-brand                         # GitHub marketing UI
npm install govuk-frontend                              # GOV.UK Frontend
npm install uswds                                       # US Web Design System
yarn add @atlaskit/css-reset @atlaskit/tokens @atlaskit/button @atlaskit/badge
npm install bootstrap                                   # Bootstrap 5.3
# Shopify Polaris (apps only): add to <head>:
#   <meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
#   <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
```

## Appendix B - Canonical sources (read before reinventing)

- **Material Web:** material-web.dev/theming/material-theming · m3.material.io/develop/web
- **Fluent UI:** fluent2.microsoft.design · learn.microsoft.com/en-us/fluent-ui/web-components
- **Carbon:** carbondesignsystem.com · /developing/react-tutorial
- **Shopify Polaris:** shopify.dev/docs/api/app-home/web-components · polaris-react.shopify.com/components
- **Atlassian:** atlassian.design/get-started/develop · /tokens/design-tokens
- **Primer:** primer.style · github.com/primer/css · github.com/primer/brand
- **GOV.UK:** design-system.service.gov.uk
- **USWDS:** designsystem.digital.gov/documentation/developers
- **Bootstrap:** getbootstrap.com/docs/5.3
- **Tailwind:** tailwindcss.com/docs/dark-mode · /blog/tailwindcss-v4
- **Radix:** radix-ui.com/themes/docs
- **shadcn/ui:** ui.shadcn.com/docs
- **Native CSS:** MDN backdrop-filter, prefers-color-scheme, prefers-reduced-motion, Grid layout, Scroll-driven animations · drafts.csswg.org/scroll-animations-1
- **Apple Liquid Glass (Apple platforms only):** developer.apple.com/design/human-interface-guidelines/materials · /documentation/TechnologyOverviews/liquid-glass

## Appendix C - Apple Liquid Glass: honest web approximation

There is **no official `liquid-glass.css`** for normal websites. Apple documents Liquid Glass for Apple platforms (HIG → Materials, Developer Docs → Liquid Glass, SwiftUI → Material). A web version is glassmorphism using `backdrop-filter`, transparent backgrounds, layered borders, highlight overlays, gradients, motion, and contrast fallbacks. Label it as an approximation in comments.

```css
.liquid-glass-web-approx {
  position: relative; isolation: isolate; overflow: hidden; border-radius: 999px;
  border: 1px solid rgb(255 255 255 / .32);
  background:
    linear-gradient(135deg, rgb(255 255 255 / .30), rgb(255 255 255 / .08)),
    rgb(255 255 255 / .12);
  backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  -webkit-backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .48),
    inset 0 -1px 0 rgb(255 255 255 / .12),
    0 18px 60px rgb(0 0 0 / .18);
}
.liquid-glass-web-approx::before {
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background:
    radial-gradient(circle at 20% 0%, rgb(255 255 255 / .55), transparent 34%),
    linear-gradient(90deg, rgb(255 255 255 / .18), transparent 42%, rgb(255 255 255 / .14));
}
.liquid-glass-web-approx::after {
  content: ""; position: absolute; inset: 1px; border-radius: inherit; pointer-events: none;
  border: 1px solid rgb(255 255 255 / .14);
}
@media (prefers-color-scheme: dark) {
  .liquid-glass-web-approx {
    border-color: rgb(255 255 255 / .18);
    background:
      linear-gradient(135deg, rgb(255 255 255 / .16), rgb(255 255 255 / .04)),
      rgb(15 23 42 / .42);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / .22), 0 18px 60px rgb(0 0 0 / .42);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .liquid-glass-web-approx { background: rgb(255 255 255 / .96); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
```
`prefers-reduced-transparency` has uneven support; test it and keep enough contrast without blur.
