import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useIsDesktop } from '../lib/hooks';
import { progressToY, runSnap } from '../lib/scroll';

const StackCardArrivalContext = createContext<MotionValue<number> | null>(null);

/**
 * Magnetic snap, mirroring ServiceStage3D. A magnetic band sits around each
 * card-to-card midpoint; once the scroll commits past `threshold` of that band
 * in a direction, it glides onto the next/previous card. `band` is a fraction
 * of one card segment and is < 0.5, so the cards (the snap targets) sit in the
 * non-magnetic gaps between bands — a completed snap can't re-trigger the next.
 */
const STACK_SNAP = { band: 0.45, threshold: 0.25, duration: 0.4 } as const;

/**
 * Mobile: a short vertical swipe commits to the adjacent card and glides there.
 * The thresholds are deliberately small so even a gentle flick advances one card;
 * while the finger drags we hold the deck still, then commit on release so the
 * transition always lands cleanly on the next/previous card.
 */
const MOBILE_SWIPE_TRIGGER = 10; // px of vertical travel that commits the swipe
const MOBILE_SWIPE_VELOCITY = 0.12; // px/ms — a quick flick commits even if short
const MOBILE_SNAP_DURATION = 0.4; // s — the glide onto the next/previous card
const MOBILE_SETTLE_MS = 140;

function cardIndexFromProgress(v: number, n: number) {
  if (n < 2) return 0;
  const step = 1 / (n - 1);
  return Math.round(Math.min(1, Math.max(0, v)) / step);
}

function progressFromCardIndex(index: number, n: number) {
  if (n < 2) return 0;
  return index / (n - 1);
}

/** Scroll progress (0→1) for the active stack card — drives parallax and content stagger. */
export function useStackCardArrival(explicit?: MotionValue<number>) {
  const fromContext = useContext(StackCardArrivalContext);
  const fallback = useMotionValue(1);
  return explicit ?? fromContext ?? fallback;
}

/**
 * Scroll-driven card deck: each card pins to the top of the viewport and the
 * next one swings in over it with a slight rotation, while the buried cards
 * scale down and dim (but stay sharp) — the "soft shuffling deck" effect.
 * Scroll snaps card-to-card so it always settles on a single card.
 */
export default function StackCards({ cards }: { cards: ReactNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const desktopSnap = isDesktop && !reduced;
  const mobileSnap = !isDesktop && !reduced;
  const { scrollY } = useScroll();
  const [metrics, setMetrics] = useState({ top: 0, range: 1 });
  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;

  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = {
        top: rect.top + window.scrollY,
        range: Math.max(1, el.offsetHeight - window.innerHeight),
      };
      metricsRef.current = next;
      setMetrics(next);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [cards.length]);

  useMotionValueEvent(scrollY, 'change', () => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const range = Math.max(1, el.offsetHeight - window.innerHeight);
    if (Math.abs(top - metricsRef.current.top) > 2 || Math.abs(range - metricsRef.current.range) > 2) {
      const next = { top, range };
      metricsRef.current = next;
      setMetrics(next);
    }
  });

  const containerProgress = useTransform(scrollY, (v) => {
    const { top, range } = metricsRef.current;
    return Math.min(1, Math.max(0, (v - top) / range));
  });

  // Snap: cards settle at evenly-spaced detents (one per card), with a magnetic
  // band around each card-to-card midpoint.
  const snappingRef = useRef(false);
  const lastProgressRef = useRef(0);
  const directionRef = useRef(0);
  const settleTimerRef = useRef<number>();

  const snapToProgress = (target: number, duration = STACK_SNAP.duration) => {
    // Measure fresh from the container so the target is correct even when a
    // programmatic scroll hasn't refreshed metricsRef yet.
    let { top, range } = metricsRef.current;
    const el = containerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      top = rect.top + window.scrollY;
      range = Math.max(1, el.offsetHeight - window.innerHeight);
    }
    runSnap(progressToY(target, top, range), {
      duration,
      onStart: () => {
        snappingRef.current = true;
      },
      onEnd: () => {
        snappingRef.current = false;
      },
    });
  };

  // Mobile: hold the pinned deck still under the finger, then on release glide to
  // the adjacent card if the swipe passed a small distance/velocity threshold —
  // one short swipe always lands on the next/previous of the cards. At the deck's
  // first and last card we let the gesture through so the page scrolls in and out.
  useEffect(() => {
    if (!mobileSnap) return;
    const el = containerRef.current;
    if (!el) return;

    let startY = 0;
    let startX = 0;
    let startTime = 0;
    let startIndex = 0;
    let tracking = false;

    const isPinned = () => {
      const rect = el.getBoundingClientRect();
      return rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    };

    // Read the live card index from the real scroll position — lastProgressRef
    // can lag behind a programmatic scroll and point at the wrong card.
    const currentIndex = () => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const range = Math.max(1, el.offsetHeight - window.innerHeight);
      const v = Math.min(1, Math.max(0, (window.scrollY - top) / range));
      return cardIndexFromProgress(v, cards.length);
    };

    const onTouchStart = (e: TouchEvent) => {
      window.clearTimeout(settleTimerRef.current);
      const touch = e.touches[0];
      startY = touch.clientY;
      startX = touch.clientX;
      startTime = performance.now();
      startIndex = currentIndex();
      tracking = isPinned() && !snappingRef.current;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return;
      const touch = e.touches[0];
      const deltaY = startY - touch.clientY; // > 0 = swipe up = next card
      const deltaX = startX - touch.clientX;
      if (Math.abs(deltaY) <= Math.abs(deltaX)) return; // leave horizontal gestures alone

      const n = cards.length;
      const goNext = deltaY > 0 && startIndex < n - 1;
      const goPrev = deltaY < 0 && startIndex > 0;
      if (!goNext && !goPrev) return; // at an edge — let the page scroll out

      // Hold the deck still so the finger can't free-scroll past a card.
      if (e.cancelable) e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      const deltaY = startY - (touch?.clientY ?? startY);
      const deltaX = startX - (touch?.clientX ?? startX);
      if (Math.abs(deltaY) <= Math.abs(deltaX)) return;

      const velocity = Math.abs(deltaY) / Math.max(1, performance.now() - startTime);
      if (Math.abs(deltaY) < MOBILE_SWIPE_TRIGGER && velocity < MOBILE_SWIPE_VELOCITY) return;

      const n = cards.length;
      let target = -1;
      if (deltaY > 0 && startIndex < n - 1) target = startIndex + 1;
      else if (deltaY < 0 && startIndex > 0) target = startIndex - 1;
      if (target < 0) return;

      // Defer past this event so Lenis' own touchend handler (which runs after
      // ours) doesn't swallow the programmatic scroll we're about to start.
      requestAnimationFrame(() => snapToProgress(progressFromCardIndex(target, n), MOBILE_SNAP_DURATION));
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [mobileSnap, cards.length]);

  const tryThresholdSnap = (v: number) => {
    if (snappingRef.current) return;
    const n = cards.length;
    if (n < 2) return;
    if (v <= 0.0001 || v >= 0.9999) return; // let the deck enter / release at its edges

    const step = 1 / (n - 1);
    const b = STACK_SNAP.band * step;
    const bandWidth = 2 * b;
    const dir = directionRef.current;

    for (let i = 0; i < n - 1; i++) {
      const mid = (i + 0.5) * step; // crossover point between card i and i+1
      const bandStart = mid - b;
      const bandEnd = mid + b;
      if (v <= bandStart || v >= bandEnd) continue;

      const intoFromStart = (v - bandStart) / bandWidth;
      const intoFromEnd = (bandEnd - v) / bandWidth;

      if (dir > 0 && intoFromStart > STACK_SNAP.threshold) {
        snapToProgress((i + 1) * step); // advance to the next card
        return;
      }
      if (dir < 0 && intoFromEnd > STACK_SNAP.threshold) {
        snapToProgress(i * step); // ease back to the current card
        return;
      }
    }
  };

  useMotionValueEvent(containerProgress, 'change', (v) => {
    directionRef.current = Math.sign(v - lastProgressRef.current) || directionRef.current;
    lastProgressRef.current = v;

    if (desktopSnap) {
      tryThresholdSnap(v);
    }

    if (!mobileSnap) return;
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      if (snappingRef.current) return;
      const n = cards.length;
      if (n < 2) return;
      const nearest = progressFromCardIndex(cardIndexFromProgress(v, n), n);
      if (Math.abs(v - nearest) > 0.015) {
        snapToProgress(nearest);
      }
    }, MOBILE_SETTLE_MS);
  });

  useEffect(
    () => () => {
      window.clearTimeout(settleTimerRef.current);
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${Math.max(cards.length, 1) * 100}vh` }}
    >
      {cards.map((card, i) => (
        <StackCard key={i} index={i} total={cards.length} containerProgress={containerProgress}>
          {card}
        </StackCard>
      ))}
    </div>
  );
}

const SPRING = { stiffness: 130, damping: 28, mass: 0.85 };

type StackCardChildProps = { arrival?: MotionValue<number> };

function StackCard({
  children,
  index,
  total,
  containerProgress,
}: {
  children: ReactNode;
  index: number;
  total: number;
  containerProgress: MotionValue<number>;
}) {
  const reduced = useReducedMotion();
  const staticArrival = useMotionValue(1);

  const step = 1 / Math.max(1, total - 1);
  // Each card finishes arriving exactly as it pins (its detent), so a snap
  // always lands on a fully-revealed card. Card 0 is present from the top.
  const settledAt = index * step; // === index / (total - 1)
  const arriveStart = index === 0 ? -step : settledAt - step;
  const arriveEnd = settledAt;

  const rawArrival = useTransform(containerProgress, [arriveStart, arriveEnd], [0, 1]);
  const smoothArrival = useSpring(rawArrival, SPRING);

  const entryAngle = index === 0 ? 0 : index % 2 ? 5 : -5;
  const rotate = useTransform(smoothArrival, [0, 1], [entryAngle, 0]);
  const y = useTransform(smoothArrival, [0, 1], [36, 0]);
  const entryScale = useTransform(smoothArrival, [0, 1], [0.97, 1]);

  const isLast = index === total - 1;
  const buriedDepth = isLast ? 0 : (total - 1 - index) * 0.04;

  // Buried cards recede and dim for depth, but never blur — the captions must
  // stay legible the whole time a card is leaving.
  const stackScale = useTransform(
    containerProgress,
    [settledAt, 1],
    [1, isLast ? 1 : 1 - buriedDepth]
  );
  const dim = useTransform(containerProgress, [settledAt, 1], [0, isLast ? 0 : 0.18]);

  const arrivalValue = reduced ? staticArrival : smoothArrival;

  const content =
    isValidElement(children) && !reduced
      ? cloneElement(children as ReactElement<StackCardChildProps>, { arrival: arrivalValue })
      : children;

  return (
    <div className="sticky top-0 flex h-screen items-center px-0 lg:px-6">
      <StackCardArrivalContext.Provider value={arrivalValue}>
        <motion.div
          style={reduced ? undefined : { scale: stackScale, transformOrigin: 'center top' }}
          className="relative mx-auto h-[84vh] w-full max-w-6xl will-change-transform lg:h-[78vh]"
        >
          <motion.div
            style={
              reduced
                ? undefined
                : { rotate, y, scale: entryScale, transformOrigin: 'center top' }
            }
            className="relative h-full w-full overflow-hidden rounded-md border border-line bg-ivory shadow-[0_30px_60px_-25px_rgba(20,18,13,0.35)] will-change-transform"
          >
            {content}
            <motion.div
              style={{ opacity: reduced ? 0 : dim }}
              className="pointer-events-none absolute inset-0 bg-night"
            />
          </motion.div>
        </motion.div>
      </StackCardArrivalContext.Provider>
    </div>
  );
}
