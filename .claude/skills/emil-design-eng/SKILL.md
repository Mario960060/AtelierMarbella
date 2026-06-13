---
name: emil-design-eng
description: Emil Kowalski's design engineering philosophy on UI polish, animation decisions, and the invisible details that make interfaces feel right. Use when building transitions, scroll-driven animations, micro-interactions, drawers, toasts, popovers, or reviewing UI motion code. Triggers on animate, easing, transition, spring, drag, scroll animation.
---

# Design Engineering

You build interfaces where every detail compounds into something that feels right. In a world where everyone's software is good enough, taste is the differentiator.

## Core philosophy

**Taste is trained, not innate.** Reverse-engineer animations, inspect interactions, ask why the best interfaces feel the way they do.

**Unseen details compound.** Most details users never consciously notice — that's the point. The aggregate of invisible correctness makes interfaces people love without knowing why.

**Beauty is leverage.** People choose tools on overall experience, not just function. Good defaults and good motion are real differentiators.

## Animation decision framework

Answer in order before writing any animation:

### 1. Should this animate at all?

| Frequency | Decision |
| --- | --- |
| 100+ times/day (shortcuts, command palette) | No animation. Ever. |
| Tens of times/day (hover, list nav) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare/first-time (onboarding, celebrations) | Can add delight |

Never animate keyboard-initiated actions — repeated hundreds of times daily, animation makes them feel slow. Raycast has no open/close animation; that's optimal for something used constantly.

### 2. What's the purpose?

Every animation needs a clear "why": spatial consistency, state indication, explanation, feedback, or preventing jarring changes. If the purpose is just "looks cool" and users see it often, don't animate.

### 3. What easing?

- Entering/exiting → `ease-out` (starts fast, responsive)
- Moving/morphing on screen → `ease-in-out`
- Hover/color change → `ease`
- Constant motion (marquee, progress) → `linear`
- Default → `ease-out`

**Never use `ease-in` for UI** — it delays initial movement exactly when the user is watching most. A dropdown with ease-in at 300ms feels slower than ease-out at 300ms.

Built-in CSS easings are too weak. Use custom curves:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer */
```

Find stronger variants at easing.dev or easings.co — don't build curves from scratch.

### 4. How fast?

| Element | Duration |
| --- | --- |
| Button press feedback | 100-160ms |
| Tooltips, small popovers | 125-200ms |
| Dropdowns, selects | 150-250ms |
| Modals, drawers | 200-500ms |
| Marketing/explanatory | Can be longer |

UI animations stay under 300ms. Perceived performance matters as much as actual: a fast-spinning spinner makes loading feel faster even at identical load times.

## Spring animations

Springs simulate physics — no fixed duration, they settle on parameters. Use for drag with momentum, elements that feel "alive" (Dynamic Island), interruptible gestures, decorative mouse-tracking.

Apple-style config is easier to reason about:

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

Keep bounce subtle (0.1-0.3) and avoid it in most UI — reserve for drag-to-dismiss and playful interactions. Springs keep velocity when interrupted; CSS keyframes restart from zero, which is why springs win for gestures users change mid-motion.

For mouse-tracking, interpolate with `useSpring` instead of tying values directly to pointer position (feels artificial otherwise). This only works because it's decorative — a functional graph should have no animation.

## Component principles

**Buttons must feel responsive.** `transform: scale(0.97)` on `:active` gives instant feedback. Keep it subtle (0.95-0.98).

```css
.button { transition: transform 160ms ease-out; }
.button:active { transform: scale(0.97); }
```

**Never animate from `scale(0)`.** Nothing in the real world appears from nothing. Start from `scale(0.95)` + opacity.

```css
/* Bad */  .entering { transform: scale(0); }
/* Good */ .entering { transform: scale(0.95); opacity: 0; }
```

**Popovers are origin-aware.** They scale from their trigger, not center. Modals are the exception — keep them centered (not anchored to a trigger).

```css
.popover { transform-origin: var(--radix-popover-content-transform-origin); }
```

**Tooltips skip delay on subsequent hovers.** First one delays to prevent accidental activation; once one is open, adjacent ones open instantly with no animation (`transition-duration: 0ms`).

**CSS transitions over keyframes for interruptible UI.** Transitions retarget mid-animation; keyframes restart from zero. For anything triggered rapidly (toasts, toggles), use transitions.

**Use blur to mask imperfect transitions.** When a crossfade feels off despite tuning easing/duration, add `filter: blur(2px)` during the transition — it blends the two states so the eye sees one transformation, not two objects swapping. Keep blur under 20px (expensive in Safari).

**Animate entry with `@starting-style`.** Modern CSS replacement for the `useEffect`/`mounted` pattern:

```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style { opacity: 0; transform: translateY(100%); }
}
```

**Asymmetric enter/exit.** Slow where the user is deciding, fast where the system responds. Hold-to-delete: 2s linear press, 200ms ease-out release.

**Stagger entering lists.** 30-80ms delay between items for a cascade. Longer feels slow. Never block interaction while stagger plays.

**Match motion to mood.** Playful component → bouncier. Professional dashboard → crisp and fast. Cohesion across easing, duration, design, and name is what makes motion feel satisfying.

## Performance rules

- **Only animate `transform` and `opacity`** — they skip layout and paint, run on GPU. Animating width/height/margin/padding triggers all three rendering steps.
- **CSS variables are inheritable** — changing one on a parent recalcs all children. Update `transform` directly on the element instead of a `--swipe-amount` var.
- **Framer Motion shorthand (`x`, `y`, `scale`) is NOT hardware-accelerated** — it runs on the main thread via rAF. Use the full string for hardware acceleration: `animate={{ transform: "translateX(100px)" }}`. Matters under load (page loads, scripts).
- **CSS animations beat JS under load** — they run off the main thread. Use CSS for predetermined animations, JS for dynamic/interruptible ones. WAAPI (`element.animate(...)`) gives JS control with CSS performance.

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  /* keep opacity/color that aids comprehension, remove movement */
  .element { animation: fade 0.2s ease; }
}
```

Reduced motion means fewer/gentler, not zero. Gate hover behind `@media (hover: hover) and (pointer: fine)` so touch devices don't fire false hover on tap.

## Review format (required)

When reviewing UI code, output a single markdown table with `| Before | After | Why |` columns, one row per issue. Never use separate "Before:" / "After:" lines.

| Before | After | Why |
| --- | --- | --- |
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Specify exact properties; avoid `all` |
| `transform: scale(0)` | `scale(0.95); opacity: 0` | Nothing appears from nothing |
| `ease-in` on dropdown | `ease-out` with custom curve | ease-in feels sluggish |
| no `:active` on button | `scale(0.97)` on `:active` | Buttons must feel responsive |
| `transform-origin: center` on popover | trigger-anchored origin | Popovers scale from trigger (modals exempt) |

## Review checklist

| Issue | Fix |
| --- | --- |
| `transition: all` | Specify exact properties |
| `scale(0)` entry | Start from `scale(0.95)` + opacity |
| `ease-in` on UI | Switch to ease-out/custom curve |
| `transform-origin: center` on popover | Anchor to trigger (modals exempt) |
| Animation on keyboard action | Remove entirely |
| Duration > 300ms on UI | Reduce to 150-250ms |
| Hover without media query | Add `@media (hover: hover) and (pointer: fine)` |
| Keyframes on rapid element | Use transitions for interruptibility |
| Framer Motion `x`/`y` under load | Use `transform: "translateX()"` |
| Same enter/exit speed | Make exit faster than enter |
| Elements appear at once | Add stagger (30-80ms) |

## Deeper techniques

For clip-path animation patterns, gesture/drag mechanics, 3D transforms, the Sonner component principles, and animation debugging workflow, see [reference.md](reference.md).
