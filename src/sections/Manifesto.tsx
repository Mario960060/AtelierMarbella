import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MaskReveal, Reveal } from '../components/Reveal';
import { STAGE_SCENES } from '../lib/images';

type Stat = { v: string; k: string };

export default function Manifesto() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const stats = t('manifesto.stats', { returnObjects: true }) as Stat[];

  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-7%', '7%']);

  return (
    <div className="px-6 py-24 lg:px-12 lg:py-32">
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

        {/* Photograph — the work does the talking */}
        <Reveal delay={0.15} y={40}>
          <figure
            ref={imageRef}
            className="relative overflow-hidden rounded-md shadow-[0_45px_90px_-45px_rgba(20,18,13,0.55)]"
          >
            <div className="aspect-[4/5] w-full overflow-hidden">
              <motion.img
                src={STAGE_SCENES[0]}
                alt={t('manifesto.imageAlt')}
                loading="lazy"
                style={reduce ? undefined : { y: imageY, scale: 1.14 }}
                className="h-full w-full object-cover will-change-transform"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            {/* hairline frame for a crafted, finished feel */}
            <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-limestone/15" />
          </figure>
        </Reveal>
      </div>
    </div>
  );
}
