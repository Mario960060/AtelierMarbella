# Deeper techniques

Loaded on demand from [SKILL.md](SKILL.md). Contains the technical patterns that don't need to sit in context for every motion task.

## CSS transform mastery

**translateY with percentages** — percentage values are relative to the element's own size. `translateY(100%)` moves an element by its own height regardless of actual dimensions. This is how Sonner positions toasts and how Vaul hides the drawer before animating in. Prefer percentages over hardcoded pixels — less error-prone, adapts to content.

```css
.drawer-hidden { transform: translateY(100%); }   /* any drawer height */
.toast-enter   { transform: translateY(-100%); }  /* any toast height */
```

**scale() scales children too** — unlike width/height. When scaling a button on press, font size, icons, and content scale proportionally. Feature, not bug.

**3D transforms for depth** — `rotateX()`/`rotateY()` with `transform-style: preserve-3d` create real 3D in CSS. Orbits, coin flips, depth — no JS needed.

```css
.wrapper { transform-style: preserve-3d; }

@keyframes orbit {
  from { transform: translate(-50%, -50%) rotateY(0deg)   translateZ(72px) rotateY(360deg); }
  to   { transform: translate(-50%, -50%) rotateY(360deg) translateZ(72px) rotateY(0deg);   }
}
```

**transform-origin** — every element transforms from an anchor point (default center). Set it to match where the trigger lives for origin-aware interactions.

## clip-path for animation

Not just for shapes — one of the most powerful animation tools in CSS. `clip-path: inset(top right bottom left)` defines a rectangular clip; each value eats into the element from that side.

```css
.hidden  { clip-path: inset(0 100% 0 0); }  /* fully hidden from right */
.visible { clip-path: inset(0 0 0 0); }     /* fully visible */

.overlay {                                   /* reveal left to right */
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms ease-out;
}
```

**Tabs with perfect color transitions** — duplicate the tab list, style the copy as active (different bg + text color), clip the copy so only the active tab shows, animate the clip on change. Seamless color transition that timing individual color transitions can't match.

**Hold-to-delete** — colored overlay with `clip-path: inset(0 100% 0 0)`. On `:active`, transition to `inset(0 0 0 0)` over 2s linear. On release, snap back 200ms ease-out. Add `scale(0.97)` for press feedback.

**Image reveals on scroll** — start `clip-path: inset(0 0 100% 0)` (hidden from bottom), animate to `inset(0 0 0 0)` on viewport entry. Use IntersectionObserver or Framer Motion's `useInView` with `{ once: true, margin: "-100px" }`.

**Comparison sliders** — overlay two images, clip the top with `clip-path: inset(0 50% 0 0)`, adjust right inset from drag position. No extra DOM, fully hardware-accelerated.

## Gesture and drag interactions

**Momentum-based dismissal** — don't require dragging past a threshold. Calculate velocity and dismiss on a quick flick:

```js
const timeTaken = new Date().getTime() - dragStartTime.current.getTime();
const velocity = Math.abs(swipeAmount) / timeTaken;
if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) dismiss();
```

**Damping at boundaries** — when dragging past a natural boundary, the more they drag the less it moves. Things in real life slow before stopping, they don't snap.

**Pointer capture** — once dragging starts, capture all pointer events so drag continues even when the pointer leaves the element bounds.

**Multi-touch protection** — ignore additional touch points after the initial drag begins, or switching fingers mid-drag makes the element jump.

```js
function onPress() {
  if (isDragging) return;
  // start drag...
}
```

**Friction instead of hard stops** — allow over-drag with increasing friction rather than an invisible wall.

## Sonner principles (building loved components)

From building Sonner (13M+ weekly npm downloads), applies to any component:

- **DX is key** — no hooks, no context, no setup. Insert `<Toaster />` once, call `toast()` from anywhere. Less friction = more adoption.
- **Good defaults beat options** — ship beautiful out of the box. Most users never customize, so default easing/timing/design must be excellent.
- **Naming creates identity** — "Sonner" (French, "to ring") over "react-toast". Trade discoverability for memorability when it fits.
- **Handle edge cases invisibly** — pause timers when the tab is hidden, fill gaps between stacked toasts with pseudo-elements to keep hover state, capture pointer events during drag. Users never notice, which is exactly right.
- **Transitions, not keyframes, for dynamic UI** — toasts add rapidly; keyframes restart from zero on interruption.
- **Build a great docs site** — let people touch and play before they adopt. Interactive examples with copy-paste snippets lower the barrier.

**Cohesion** — Sonner feels satisfying because the whole experience is coherent: slightly slower than typical UI, uses `ease` rather than `ease-out` to feel elegant, and the motion matches the design, the page, the name. Match motion to the component's personality.

**The opacity + height combination** — when items enter/exit a list, the opacity change must work with the height animation. Trial and error; no formula — adjust until it feels right.

## Debugging animations

**Slow-motion testing** — play at 2-5x duration (or DevTools animation inspector) to catch what's invisible at full speed:

- Do colors transition smoothly, or do two states overlap?
- Does easing feel right, or stop abruptly?
- Is transform-origin correct?
- Are opacity / transform / color in sync?

**Frame-by-frame** — Chrome DevTools Animations panel reveals timing issues between coordinated properties.

**Test on real devices** — for touch interactions, connect a phone via USB and use Safari remote devtools. Real hardware beats the simulator for gestures.

**Review the next day** — fresh eyes catch imperfections you missed during development.
