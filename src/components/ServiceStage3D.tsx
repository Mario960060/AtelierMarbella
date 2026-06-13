import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type Lenis from 'lenis';
import { Reveal } from './Reveal';
import { useIsDesktop } from '../lib/hooks';

function getLenis(): Lenis | undefined {
  return (window as unknown as { lenis?: Lenis }).lenis;
}

export type StageItem = { title: string; desc: string; slug: string };
export type StageGroup = { name: string; scene: string; items: StageItem[] };

const TITLE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STAGE_SNAP = {
  band: 0.12,
  threshold: 0.25,
  duration: 0.28,
} as const;

function progressToY(v: number, top: number, range: number) {
  return top + v * range;
}

function runSnap(targetY: number, onStart: () => void, onEnd: () => void) {
  onStart();
  const lenis = getLenis();
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(fallback);
    onEnd();
  };

  const fallback = window.setTimeout(finish, STAGE_SNAP.duration * 1000 + 400);

  if (lenis) {
    lenis.scrollTo(targetY, { duration: STAGE_SNAP.duration, onComplete: finish });
  } else {
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    window.setTimeout(finish, STAGE_SNAP.duration * 1000);
  }
}

// Annotation anchor per element, in % of the scene frame. Hand-tuned to the
// scene photos in src/lib/images.ts — retune when the photos are swapped.
const HOTSPOTS: Record<string, { x: number; y: number; down?: boolean; rise?: number }> = {
  // Scene 1 — Stone & structure (scene-stone.jpg)
  terraces: { x: 80, y: 72 }, // travertine patio paving, right
  'walls-steps': { x: 50, y: 45 }, // centre of the lit staircase
  // Scene 2 — Living outdoors (scene-living.jpg)
  pergolas: { x: 6, y: 45 }, // middle of the front-left pergola leg
  'outdoor-kitchens': { x: 84, y: 53 }, // the grill on the island
  lighting: { x: 34, y: 85 }, // just below the glowing bollard lamp
  // Scene 3 — Water & green (scene-water.jpg)
  'water-features': { x: 46, y: 20 }, // middle of the dark scupper where water pours
  irrigation: { x: 23, y: 77 }, // on the black sprinkler riser
  'artificial-grass': { x: 68, y: 60 }, // down onto the open lawn
  // Scene 4 — Gates & fencing (scene-gates.png)
  gates: { x: 48, y: 56 }, // timber driveway gate, centre
  fencing: { x: 17, y: 33, down: true, rise: 120 }, // long drop so the label lands on the wall
};

/**
 * "What we build" as four full-screen annotated scenes. The section pins and
 * scroll drives a soft dissolve-front that sweeps up the screen, revealing
 * the next scene beneath it. Hovering an annotation tilts the scene toward
 * that element; clicking opens the element's own page.
 */
export default function ServiceStage3D({
  eyebrow,
  title,
  groups,
  hotspotCta,
}: {
  eyebrow: string;
  title: string;
  groups: StageGroup[];
  hotspotCta: string;
}) {
  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();
  const stage = isDesktop && !reduce;

  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLElement>(null);

  // Window-scroll based progress with manual section measurement (framer's
  // target-based useScroll silently froze at 0 for this pinned section).
  const { scrollY } = useScroll();
  const [metrics, setMetrics] = useState({ top: 0, range: 1 });
  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;

  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
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
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [stage, groups.length]);

  // Keep section metrics in sync while scrolling — stale values freeze progress at 0.
  useMotionValueEvent(scrollY, 'change', () => {
    const el = wrapRef.current;
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

  const progress = useTransform(scrollY, (v) => {
    const { top, range } = metricsRef.current;
    return Math.min(1, Math.max(0, (v - top) / range));
  });

  const snappingRef = useRef(false);
  const lastProgressRef = useRef(0);
  const directionRef = useRef(0);

  const snapToProgress = (targetProgress: number) => {
    const { top, range } = metricsRef.current;
    runSnap(
      progressToY(targetProgress, top, range),
      () => {
        snappingRef.current = true;
      },
      () => {
        snappingRef.current = false;
      }
    );
  };

  const tryThresholdSnap = (v: number) => {
    if (snappingRef.current) return;
    if (v <= 0.0001 || v >= 0.9999) return;

    const n = groups.length;
    const { band, threshold } = STAGE_SNAP;
    const bandWidth = 2 * band;

    for (let i = 1; i < n; i++) {
      const boundary = i / n;
      const bandStart = boundary - band;
      const bandEnd = boundary + band;

      if (v <= bandStart || v >= bandEnd) continue;

      const intoFromStart = (v - bandStart) / bandWidth;
      const intoFromEnd = (bandEnd - v) / bandWidth;

      if (directionRef.current > 0 && intoFromStart > threshold) {
        snapToProgress(bandEnd);
        return;
      }
      if (directionRef.current < 0 && intoFromEnd > threshold) {
        snapToProgress(bandStart);
        return;
      }
    }
  };

  useMotionValueEvent(progress, 'change', (v) => {
    setActive(Math.min(groups.length - 1, Math.max(0, Math.floor(v * groups.length))));

    if (!stage) return;
    directionRef.current = Math.sign(v - lastProgressRef.current) || directionRef.current;
    lastProgressRef.current = v;
    tryThresholdSnap(v);
  });

  useEffect(() => {
    return () => {
      getLenis()?.start();
    };
  }, []);

  if (!stage) {
    return (
      <section id="build" className="px-6 pb-24 lg:px-12 lg:pb-32">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">{eyebrow}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-5xl">
            {title}
          </h2>
        </Reveal>
        {groups.map((group) => (
          <div key={group.name} className="mt-14">
            <Reveal>
              <div className="overflow-hidden bg-plaster">
                <img
                  src={group.scene}
                  alt={group.name}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="mt-5 font-display text-2xl font-medium">{group.name}</h3>
            </Reveal>
            <ul className="mt-2">
              {group.items.map((item, i) => (
                <Reveal key={item.slug} delay={i * 0.06}>
                  <li className="border-b border-line">
                    <Link
                      to={`/hard-landscaping/${item.slug}`}
                      className="group flex items-center justify-between gap-4 py-4"
                    >
                      <span>
                        <span className="block font-display text-lg font-medium leading-snug">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm text-ink/60">{item.desc}</span>
                      </span>
                      <ArrowRight
                        size={18}
                        className="shrink-0 text-ink/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-azure"
                      />
                    </Link>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      id="build"
      ref={wrapRef}
      className="relative"
      style={{ height: `${groups.length * 110}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-night">
        {groups.map((group, g) => (
          <SceneSlide
            key={group.name}
            group={group}
            index={g}
            total={groups.length}
            progress={progress}
            isActive={active === g}
            hotspotCta={hotspotCta}
          />
        ))}

        {/* Header over the scenes */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-end justify-between px-6 pt-24 lg:px-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-limestone/70">{eyebrow}</p>
            <h2 className="mt-2 max-w-xl font-display text-2xl font-bold tracking-tight text-limestone md:text-3xl">
              {title}
            </h2>
          </div>
          <div className="hidden items-center gap-6 pb-1 lg:flex">
            {groups.map((group, i) => (
              <span
                key={group.name}
                className={`text-sm transition-colors duration-300 ${
                  active === i ? 'font-medium text-limestone' : 'text-limestone/40'
                }`}
              >
                {group.name}
              </span>
            ))}
          </div>
        </div>

        {/* Single animated group title — avoids stacked labels during scene crossfade */}
        <div className="pointer-events-none absolute bottom-10 left-6 z-40 lg:left-12">
          <div className="relative min-h-[2.5rem] md:min-h-[3.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h3
                key={groups[active]?.name ?? active}
                initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.5, ease: TITLE_EASE }}
                className="absolute inset-x-0 bottom-0 font-display text-3xl font-bold tracking-tight text-limestone md:text-5xl"
              >
                {groups[active]?.name}
              </motion.h3>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

const IS_TOUCH = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

function SceneSlide({
  group,
  index,
  total,
  progress,
  isActive,
  hotspotCta,
}: {
  group: StageGroup;
  index: number;
  total: number;
  progress: MotionValue<number>;
  isActive: boolean;
  hotspotCta: string;
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const f = 0.12;
  const p0 = index / total;
  const p1 = (index + 1) / total;

  // Dissolve-front: a soft band sweeps up the screen and reveals this scene
  const edge = useTransform(progress, [p0 - f, p0 + f], [-30, 130]);
  const feather = useTransform(edge, (v) => v + 28);
  const mask = useMotionTemplate`linear-gradient(to top, black ${edge}%, transparent ${feather}%)`;
  const lift = useTransform(progress, [p0 - f, p0 + f], [36, 0]);

  // While the next scene sweeps over, this one sinks back and dims
  const isLast = index === total - 1;
  const sink = useTransform(progress, [p1 - f, p1 + f], [1, isLast ? 1 : 1.07]);
  const dim = useTransform(progress, [p1 - f, p1 + f], [0, isLast ? 0 : 0.5]);

  // Camera dives toward the hovered annotation: the scene zooms around the
  // hotspot point (transform-origin pins it in place) with a slight tilt.
  // Origin is pinned to the hotspot INSTANTLY; only the scale eases. The zoom
  // therefore grows around that fixed point — straight in, no drift through
  // the centre, no double move.
  const zoom = useSpring(1, { stiffness: 120, damping: 20 });
  const originX = useMotionValue(50);
  const originY = useMotionValue(50);
  const tiltX = useSpring(0, { stiffness: 110, damping: 17 });
  const tiltY = useSpring(0, { stiffness: 110, damping: 17 });
  const sceneOrigin = useMotionTemplate`${originX}% ${originY}%`;
  const sceneScale = useTransform([zoom, sink], (latest) => {
    const [z, s] = latest as number[];
    return z * s;
  });

  const lookAt = (slug: string | null) => {
    setHovered(slug);
    const pos = slug ? HOTSPOTS[slug] : undefined;
    if (pos) {
      originX.set(pos.x);
      originY.set(pos.y);
      zoom.set(1.6);
      tiltY.set(((pos.x - 50) / 50) * 2.5);
      tiltX.set(-((pos.y - 50) / 50) * 2);
    } else {
      zoom.set(1);
      tiltX.set(0);
      tiltY.set(0);
    }
  };

  // Touch: first tap zooms in and shows the CTA, a tap elsewhere zooms back
  // out, a second tap on the armed hotspot opens the page.
  const openItem = (item: StageItem) => {
    if (IS_TOUCH() && hovered !== item.slug) {
      lookAt(item.slug);
      return;
    }
    navigate(`/hard-landscaping/${item.slug}`);
  };

  useEffect(() => {
    if (!isActive) {
      setHovered(null);
      zoom.set(1);
      tiltX.set(0);
      tiltY.set(0);
      originX.set(50);
      originY.set(50);
    }
  }, [isActive, originX, originY, zoom, tiltX, tiltY]);

  return (
    <motion.div
      aria-hidden={!isActive}
      style={index > 0 ? { WebkitMaskImage: mask, maskImage: mask, y: lift } : undefined}
      className={`absolute inset-0 ${isActive ? '' : 'pointer-events-none'}`}
      onClick={() => lookAt(null)}
    >
      <div className="absolute inset-0 [perspective:1200px]">
        <motion.div
          style={{ rotateX: tiltX, rotateY: tiltY, scale: sceneScale, transformOrigin: sceneOrigin }}
          className="absolute inset-0"
        >
          <img
            src={group.scene}
            alt={group.name}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/10 to-ink/65" />
        </motion.div>
      </div>

      {/* Annotations only on the active scene — stops labels bleeding across panels */}
      <div
        className={`absolute inset-0 z-20 transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {group.items.map((item) => (
          <Hotspot
            key={item.slug}
            item={item}
            cta={hotspotCta}
            active={hovered === item.slug}
            dimmed={hovered !== null && hovered !== item.slug}
            onEnter={() => lookAt(item.slug)}
            onLeave={() => {
              if (!IS_TOUCH()) lookAt(null);
            }}
            onOpen={() => openItem(item)}
          />
        ))}
      </div>

      <motion.div
        style={{ opacity: dim }}
        className="pointer-events-none absolute inset-0 bg-night"
      />
    </motion.div>
  );
}

function Hotspot({
  item,
  cta,
  active,
  dimmed,
  onEnter,
  onLeave,
  onOpen,
}: {
  item: StageItem;
  cta: string;
  active: boolean;
  dimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onOpen: () => void;
}) {
  const pos = HOTSPOTS[item.slug] ?? { x: 50, y: 50 };
  const labelLeft = pos.x > 58;
  const labelBelow = pos.down ?? false;
  const reach = 72; // horizontal length of the leader
  const rise = pos.rise ?? 21; // vertical offset of the flat segment / label

  return (
    <div
      className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
        dimmed ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <button
        type="button"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        aria-label={`${item.title}: ${cta}`}
        aria-expanded={active}
        className="group relative block cursor-pointer focus-visible:outline-none"
      >
        <span
          className={`relative z-10 block h-4 w-4 rounded-full border-2 border-limestone bg-azure shadow-[0_0_0_5px_rgba(246,243,236,0.22)] transition-transform duration-300 group-hover:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-limestone ${
            active ? 'scale-125' : ''
          }`}
        />
        {/* Bent leader: a diagonal kick off the dot, then flat to the label */}
        <svg
          aria-hidden
          width={reach}
          height={rise}
          viewBox={`0 0 ${reach} ${rise}`}
          fill="none"
          className="pointer-events-none absolute overflow-visible"
          style={{
            top: '50%',
            left: labelLeft ? undefined : '50%',
            right: labelLeft ? '50%' : undefined,
            transform: `${labelLeft ? 'scaleX(-1) ' : ''}${
              labelBelow ? 'scaleY(-1)' : 'translateY(-100%)'
            }`,
          }}
        >
          <polyline
            points={`1,${rise - 1} 24,2 ${reach},2`}
            stroke="rgba(246,243,236,0.85)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="24" cy="2" r="1.9" fill="rgba(246,243,236,0.95)" />
        </svg>
        <span
          className={`label-beam absolute bg-night/70 px-5 py-3 backdrop-blur-sm ${
            labelLeft ? 'text-right' : 'text-left'
          }`}
          style={{
            top: '50%',
            left: '50%',
            transform: labelLeft
              ? `translate(calc(-100% - ${reach + 4}px), calc(-50% ${labelBelow ? '+' : '-'} ${rise}px))`
              : `translate(${reach + 4}px, calc(-50% ${labelBelow ? '+' : '-'} ${rise}px))`,
          }}
        >
          <span className="block whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.16em] text-limestone">
            {item.title}
          </span>
          <span
            className={`flex items-center gap-2 overflow-hidden whitespace-nowrap text-xs font-medium text-[#9ed3e6] transition-all duration-300 group-hover:max-h-7 group-hover:pt-1.5 group-hover:opacity-100 group-focus-visible:max-h-7 group-focus-visible:pt-1.5 group-focus-visible:opacity-100 ${
              active ? 'max-h-7 pt-1.5 opacity-100' : 'max-h-0 opacity-0'
            } ${labelLeft ? 'justify-end' : ''}`}
          >
            {cta}
            <ArrowRight size={13} />
          </span>
        </span>
      </button>
    </div>
  );
}
