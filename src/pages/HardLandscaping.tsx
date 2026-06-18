import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import ServiceStage3D, { type StageGroup } from '../components/ServiceStage3D';
import { Reveal } from '../components/Reveal';
import { HARD_SERVICE_IMAGES, STAGE_SCENES } from '../lib/images';
import { scrollToId } from '../lib/scroll';

const HERO_EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

type GroupSource = {
  name: string;
  items: { slug: string; title: string; desc: string }[];
};
type Step = { title: string; desc: string };

export default function HardLandscaping() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const groupSources = t('hardPage.groups', { returnObjects: true }) as GroupSource[];
  const steps = t('hardPage.steps', { returnObjects: true }) as Step[];

  const stageGroups: StageGroup[] = groupSources.map((group, g) => ({
    name: group.name,
    scene: STAGE_SCENES[g],
    items: group.items.map(({ slug, title, desc }) => ({ slug, title, desc })),
  }));

  const heroIn = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: HERO_EASE },
  });

  return (
    <PageShell>
      <div className="bg-limestone font-body text-ink">
        {/* Hero */}
        <section className="relative flex min-h-[100dvh] items-end overflow-hidden">
          <motion.img
            src={HARD_SERVICE_IMAGES[0]}
            alt={t('hardPage.heroAlt')}
            initial={reduce ? false : { scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: HERO_EASE }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-ink/0" />
          <div className="relative z-10 w-full px-6 pb-16 lg:px-12 lg:pb-20">
            <motion.p
              {...heroIn(0.1)}
              className="text-[11px] uppercase tracking-[0.18em] text-limestone/75"
            >
              {t('hardPage.heroEyebrow')}
            </motion.p>
            <motion.h1
              {...heroIn(0.2)}
              className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-limestone md:text-6xl"
            >
              {t('hardPage.heroTitle')}
            </motion.h1>
            <motion.p
              {...heroIn(0.32)}
              className="mt-5 max-w-xl text-base leading-relaxed text-limestone/85 md:text-lg"
            >
              {t('hardPage.heroSub')}
            </motion.p>
            <motion.div {...heroIn(0.44)} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                onClick={() => navigate('/contact')}
                className="bg-azure px-7 py-3.5 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-azure-deep active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-limestone focus-visible:ring-offset-2 focus-visible:ring-offset-ink/40"
              >
                {t('hardPage.ctaQuote')}
              </button>
              <button
                onClick={() => scrollToId('build')}
                className="border-b border-limestone/60 pb-0.5 text-sm font-medium text-limestone transition-colors duration-200 hover:border-limestone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-limestone"
              >
                {t('hardPage.ctaSee')}
              </button>
            </motion.div>
          </div>
        </section>

        {/* Positioning */}
        <section className="px-6 py-24 lg:px-12 lg:py-32">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
                {t('hardPage.introTitle')}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-ink/65 md:text-lg">
                {t('hardPage.introBody')}
              </p>
            </Reveal>
          </div>
        </section>

        {/* What we build: four pinned annotated scenes, scroll sweeps between them */}
        <ServiceStage3D
          eyebrow={t('hardPage.servicesEyebrow')}
          title={t('hardPage.servicesTitle')}
          groups={stageGroups}
          hotspotCta={t('hardPage.hotspotCta')}
        />

        {/* Before / after */}
        <section className="bg-plaster px-6 py-24 lg:px-12 lg:py-32">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
                {t('hardPage.baTitle')}
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-ink/65">
                {t('hardPage.baBody')}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-10">
                <BeforeAfterSlider
                  before={HARD_SERVICE_IMAGES[1]}
                  after={HARD_SERVICE_IMAGES[1]}
                  beforeLabel={t('hardPage.baBefore')}
                  afterLabel={t('hardPage.baAfter')}
                  hint={t('hardPage.baHint')}
                  alt={t('hardPage.heroAlt')}
                />
                <p className="mt-3 text-xs text-ink/45">{t('hardPage.baNote')}</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Process — a numbered timeline from first walk to final stone */}
        <section className="px-6 py-24 lg:px-12 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.18em] text-azure">
                {t('hardPage.processEyebrow')}
              </p>
            </Reveal>
            <Reveal delay={0.07}>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-5xl">
                {t('hardPage.processTitle')}
              </h2>
            </Reveal>

            <div className="relative mt-16">
              {/* hairline that draws across the steps as the section arrives */}
              <motion.div
                aria-hidden
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.2, ease: HERO_EASE }}
                className="absolute inset-x-0 top-[7px] hidden h-px origin-left bg-ink/15 lg:block"
              />
              <ol className="grid gap-x-10 gap-y-10 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4">
                {steps.map((step, i) => (
                  <Reveal key={step.title} delay={i * 0.1}>
                    <li className="relative">
                      <span className="relative z-10 block h-3.5 w-3.5 rounded-full border-2 border-azure bg-limestone" />
                      <span className="mt-7 block font-display text-5xl font-bold leading-none tracking-tight text-ink/15">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-4 font-display text-xl font-medium text-ink">{step.title}</h3>
                      <p className="mt-2.5 max-w-[34ch] text-sm leading-relaxed text-ink/60">
                        {step.desc}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Closing CTA — full-bleed photo */}
        <section className="relative overflow-hidden">
          <img
            src="/images/contactusbackground.jpg"
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/60 to-ink/45" />
          <div className="relative z-10 mx-auto max-w-3xl px-6 py-28 text-center lg:py-40">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.22em] text-limestone/70">
                {t('hardPage.ctaEyebrow')}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-limestone md:text-6xl">
                {t('hardPage.ctaTitle')}
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-6 max-w-[52ch] text-base leading-relaxed text-limestone/80 md:text-lg">
                {t('hardPage.ctaSub')}
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <button
                onClick={() => navigate('/contact')}
                className="mt-10 bg-azure px-8 py-4 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-azure-deep active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-limestone focus-visible:ring-offset-2 focus-visible:ring-offset-ink/40"
              >
                {t('hardPage.ctaQuote')}
              </button>
              <div className="mt-8">
                <Link
                  to="/"
                  className="text-sm text-limestone/60 underline-offset-4 transition-colors duration-200 hover:text-limestone hover:underline"
                >
                  {t('hardPage.back')}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
