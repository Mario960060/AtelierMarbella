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
  const snap = isDesktop && !reduced;
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

  const snapToProgress = (target: number) => {
    const { top, range } = metricsRef.current;
    runSnap(progressToY(target, top, range), {
      duration: STACK_SNAP.duration,
      onStart: () => {
        snappingRef.current = true;
      },
      onEnd: () => {
        snappingRef.current = false;
      },
    });
  };

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
    if (!snap) return;
    directionRef.current = Math.sign(v - lastProgressRef.current) || directionRef.current;
    lastProgressRef.current = v;
    tryThresholdSnap(v);
  });

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
    <div className="sticky top-0 flex h-screen items-center px-3 lg:px-6">
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
