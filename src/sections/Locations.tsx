import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Reveal, EASE } from '../components/Reveal';

const SPOTS = ['uk', 'mallorca', 'costa'] as const;

type Spot = (typeof SPOTS)[number];
type MarkerCfg = { key: Spot; x: number; y: number; dx: 1 | -1; dy: 1 | -1 };

// Positions are % of the coasts.png frame (frame aspect matches the image),
// hand-placed on the photo. dx/dy set the leader/label direction.
const MARKERS: MarkerCfg[] = [
  { key: 'uk', x: 35.5, y: 19, dx: 1, dy: 1 },
  { key: 'mallorca', x: 70.5, y: 53, dx: -1, dy: -1 },
  { key: 'costa', x: 64, y: 85, dx: -1, dy: -1 },
];

const LEAD = 48;
const RISE = 30;

function Marker({
  name,
  cfg,
  delay,
  reduce,
}: {
  name: string;
  cfg: MarkerCfg;
  delay: number;
  reduce: boolean;
}) {
  const ax = cfg.dx * LEAD;
  const ay = cfg.dy * RISE;
  return (
    <motion.div
      className="absolute"
      style={{ left: `${cfg.x}%`, top: `${cfg.y}%` }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {/* leader from the dot to the label anchor */}
      <svg
        aria-hidden
        width="1"
        height="1"
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
      >
        <line x1="0" y1="0" x2={ax} y2={ay} stroke="rgba(246,243,236,0.95)" strokeWidth="1.25" />
      </svg>

      {/* location dot */}
      <span className="absolute left-0 top-0 block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-limestone bg-azure shadow-[0_0_0_4px_rgba(246,243,236,0.22)]" />

      {/* label */}
      <span
        className="absolute whitespace-nowrap rounded-sm bg-limestone/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink shadow-[0_4px_14px_-6px_rgba(20,18,13,0.6)] backdrop-blur-sm"
        style={{ left: ax, top: ay, transform: `translate(${cfg.dx < 0 ? '-100%' : '0'}, -50%)` }}
      >
        {name}
      </span>
    </motion.div>
  );
}

export default function Locations() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-10 px-6 py-20 lg:grid-cols-[1fr,1.3fr] lg:items-center lg:px-12 lg:py-24">
      <div className="flex flex-col lg:h-[560px] lg:justify-between">
        <h2 className="shrink-0 font-display text-3xl font-bold leading-[1.06] tracking-tight text-ink md:text-5xl">
          <span className="block">{t('locations.titleLine1')}</span>
          <span className="block text-ink/40">{t('locations.titleLine2')}</span>
        </h2>

        <ul className="mt-10 space-y-7 lg:mt-0">
          {SPOTS.map((key, i) => (
            <Reveal key={key} delay={i * 0.08}>
              <li className="border-l-2 border-azure/70 pl-5">
                <h3 className="font-display text-xl font-medium text-ink">
                  {t(`locations.${key}.name`)}
                </h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-ink/60">
                  {t(`locations.${key}.desc`)}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>

      <Reveal delay={0.1}>
        <figure className="relative overflow-hidden rounded-md shadow-[0_45px_90px_-45px_rgba(20,18,13,0.5)]">
          <img
            src="/images/coasts.png?v=2"
            alt={t('locations.imageAlt')}
            loading="lazy"
            className="aspect-[1361/784] w-full object-cover"
          />
          {/* gentle vignette so dots and labels stay legible on bright water */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink/10 via-transparent to-ink/15" />

          {MARKERS.map((cfg, i) => (
            <Marker
              key={cfg.key}
              cfg={cfg}
              name={t(`locations.${cfg.key}.name`)}
              delay={0.25 + i * 0.12}
              reduce={!!reduce}
            />
          ))}

          <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-ink/10" />
        </figure>
      </Reveal>
    </div>
  );
}
