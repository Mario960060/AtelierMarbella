import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MaskReveal, Reveal } from '../components/Reveal';
import { SHOWCASE_IMAGES } from '../lib/images';

type Stat = { v: string; k: string };

const FLIP_EASE = [0.4, 0, 0.2, 1] as const; // smooth, organic page-turn
const HOLD_MS = 2000; // full cycle per photo (~2s)
const FLIP_MS = 950; // how long a page takes to turn

/** Slow auto-advancing photo slideshow with a book page-turn between frames. */
function PageFlipShow({ alt }: { alt: string }) {
  const reduce = useReducedMotion();
  const n = SHOWCASE_IMAGES.length;
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (reduce || n < 2) return;
    let flipTimer = 0;
    const hold = window.setInterval(() => {
      setFlipping(true);
      flipTimer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % n);
        setFlipping(false);
      }, FLIP_MS);
    }, HOLD_MS);
    return () => {
      window.clearInterval(hold);
      window.clearTimeout(flipTimer);
    };
  }, [reduce, n]);

  // Reduced motion: a single still photo, no auto-changing.
  if (reduce) {
    return (
      <div className="aspect-[4/5] w-full">
        <img src={SHOWCASE_IMAGES[0]} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  const next = SHOWCASE_IMAGES[(index + 1) % n];
  return (
    <div
      className="relative aspect-[4/5] w-full [perspective:1500px]"
      style={{ perspectiveOrigin: 'left center' }}
    >
      {/* the next photo, revealed as the page turns */}
      <img src={next} alt="" className="absolute inset-0 h-full w-full object-cover" />

      {/* shadow the lifting page casts on the revealed photo, near the spine —
          strongest mid-turn, gone once the page lays flat */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/15 to-transparent"
        animate={{ opacity: flipping ? [0, 0.5, 0] : 0 }}
        transition={{ duration: FLIP_MS / 1000, times: [0, 0.55, 1], ease: 'easeInOut' }}
      />

      {/* the current photo — the page that turns away on its left spine */}
      <motion.div
        key={index}
        className="absolute inset-0 [will-change:transform]"
        style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: flipping ? -180 : 0 }}
        transition={{ duration: FLIP_MS / 1000, ease: FLIP_EASE }}
      >
        <img
          src={SHOWCASE_IMAGES[index]}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ backfaceVisibility: 'hidden' }}
        />
        {/* gutter shading on the page surface, deepening as the page angles away */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/0 via-black/10 to-black/55"
          style={{ backfaceVisibility: 'hidden' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: flipping ? 1 : 0 }}
          transition={{ duration: FLIP_MS / 1000, ease: FLIP_EASE }}
        />
      </motion.div>
    </div>
  );
}

export default function Manifesto() {
  const { t } = useTranslation();
  const stats = t('manifesto.stats', { returnObjects: true }) as Stat[];

  return (
    <div className="px-6 pt-24 lg:px-12 lg:pt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:gap-20">
        {/* Statement */}
        <div>
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.28em] text-azure">
              {t('manifesto.eyebrow')}
            </p>
          </Reveal>
          <h2 className="mt-6 font-display text-4xl font-bold leading-[1.04] tracking-tight text-ink md:text-6xl">
            <MaskReveal delay={0.05}>
              <span className="block">{t('manifesto.line1')}</span>
            </MaskReveal>
            <MaskReveal delay={0.16}>
              <span className="block text-ink/35">{t('manifesto.line2')}</span>
            </MaskReveal>
          </h2>
          <Reveal delay={0.3}>
            <p className="mt-7 max-w-[54ch] text-base leading-relaxed text-ink/65 md:text-lg">
              {t('manifesto.body')}
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
              {stats.map((s) => (
                <div key={s.k}>
                  <dt className="font-display text-4xl font-bold tracking-tight text-azure md:text-5xl">
                    {s.v}
                  </dt>
                  <dd className="mt-2 text-[12px] leading-snug text-ink/55">{s.k}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Photograph — a slow page-flip slideshow of the work */}
        <Reveal delay={0.15} y={40}>
          <figure className="relative overflow-hidden rounded-md shadow-[0_45px_90px_-45px_rgba(20,18,13,0.55)]">
            <PageFlipShow alt={t('manifesto.imageAlt')} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-limestone/15" />
          </figure>
        </Reveal>
      </div>
    </div>
  );
}
