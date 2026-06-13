import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { IMAGES } from '../lib/images';
import { MaskReveal, Reveal } from '../components/Reveal';

type Side = 'hard' | 'maintenance';

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

// Jagged seam between the two panels: x positions (in %) at y = 0/35/65/100.
// Hovering a side pushes the whole seam so the favourite takes ~60%.
const SEAM: Record<'idle' | Side, number[]> = {
  idle: [52, 47, 53, 48],
  hard: [62, 57, 63, 58],
  maintenance: [42, 37, 43, 38],
};

const clipLeft = (xs: number[]) =>
  `polygon(0% 0%, ${xs[0]}% 0%, ${xs[1]}% 35%, ${xs[2]}% 65%, ${xs[3]}% 100%, 0% 100%)`;
const clipRight = (xs: number[]) =>
  `polygon(${xs[0]}% 0%, 100% 0%, 100% 100%, ${xs[3]}% 100%, ${xs[2]}% 65%, ${xs[1]}% 35%)`;
const seamPath = (xs: number[]) => `M ${xs[0]} 0 L ${xs[1]} 35 L ${xs[2]} 65 L ${xs[3]} 100`;

const PANELS: { key: Side; to: string; image: string }[] = [
  { key: 'hard', to: '/hard-landscaping', image: IMAGES.hard },
  { key: 'maintenance', to: '/property-maintenance', image: IMAGES.maintenance },
];

export default function ServicesChoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<Side | null>(null);

  const xs = SEAM[hover ?? 'idle'];
  const seamTransition = { duration: reduce ? 0 : 0.7, ease: EASE };

  return (
    <div id="services" className="px-5 py-16 lg:px-8 lg:py-20">
      <div className="px-1 text-center">
        <MaskReveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-5xl">
            {t('services.title')} <span className="text-ink/40">{t('services.titleItalic')}</span>
          </h2>
        </MaskReveal>
        <Reveal delay={0.12}>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-ink/50">
            {t('services.hint')}
          </p>
        </Reveal>
      </div>

      {/* Desktop: two panels fighting over a glowing, jagged seam */}
      <Reveal delay={0.15}>
        <div className="relative mt-10 hidden h-[74vh] overflow-hidden rounded-xl bg-night md:block">
          {PANELS.map((p) => {
            const isLeft = p.key === 'hard';
            const clip = isLeft ? clipLeft(xs) : clipRight(xs);
            const dimmed = hover !== null && hover !== p.key;
            return (
              <motion.div
                key={p.key}
                initial={false}
                animate={{ clipPath: clip }}
                transition={seamTransition}
                onMouseEnter={() => setHover(p.key)}
                onMouseLeave={() => setHover(null)}
                onClick={() => navigate(p.to)}
                className="absolute inset-0 cursor-pointer"
              >
                <motion.img
                  src={p.image}
                  alt={t(`services.${p.key}.label`)}
                  animate={{ scale: hover === p.key ? 1.06 : 1 }}
                  transition={{ duration: 1.2, ease: EASE }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-ink/5" />
                <motion.div
                  animate={{ opacity: dimmed ? 0.4 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="pointer-events-none absolute inset-0 bg-night"
                />
                <div
                  className={`absolute bottom-0 p-8 lg:p-12 ${
                    isLeft ? 'left-0 text-left' : 'right-0 text-right'
                  }`}
                >
                  <h3 className="font-display text-5xl font-bold tracking-tight text-limestone md:text-6xl">
                    {t(`services.${p.key}.word`)}
                  </h3>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-limestone/70">
                    {t(`services.${p.key}.label`)}
                  </p>
                  <p
                    className={`mt-3 max-w-sm text-sm leading-relaxed text-limestone/80 ${
                      isLeft ? '' : 'ml-auto'
                    }`}
                  >
                    {t(`services.${p.key}.desc`)}
                  </p>
                  <span
                    className={`mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-limestone ${
                      isLeft ? '' : 'flex-row-reverse'
                    }`}
                  >
                    {t(`services.${p.key}.cta`)}
                    <ArrowRight size={14} className={isLeft ? '' : 'rotate-180'} />
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* The lit seam */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <motion.path
              d={seamPath(SEAM.idle)}
              animate={{ d: seamPath(xs) }}
              transition={seamTransition}
              fill="none"
              stroke="rgba(42,147,184,0.7)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              style={{ filter: 'blur(4px)' }}
            />
            <motion.path
              d={seamPath(SEAM.idle)}
              animate={{ d: seamPath(xs) }}
              transition={seamTransition}
              fill="none"
              stroke="rgba(246,243,236,0.9)"
              strokeWidth="0.75"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </Reveal>

      {/* Mobile: stacked panels */}
      <div className="mt-8 space-y-4 md:hidden">
        {PANELS.map((p, i) => (
          <Reveal key={p.key} delay={i * 0.08}>
            <div
              onClick={() => navigate(p.to)}
              className="relative h-[46vh] cursor-pointer overflow-hidden rounded-xl"
            >
              <img
                src={p.image}
                alt={t(`services.${p.key}.label`)}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-ink/5" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-display text-4xl font-bold text-limestone">
                  {t(`services.${p.key}.word`)}
                </h3>
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.25em] text-limestone/70">
                  {t(`services.${p.key}.label`)}
                </p>
                <span className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-limestone">
                  {t(`services.${p.key}.cta`)}
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
