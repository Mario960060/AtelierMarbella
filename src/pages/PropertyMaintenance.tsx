import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import PageShell from '../components/PageShell';
import ServiceHero from '../components/ServiceHero';
import StackCards, { useStackCardArrival } from '../components/StackCards';
import { MaskReveal, Reveal } from '../components/Reveal';
import { IMAGES, MAINTENANCE_CATEGORY_IMAGES } from '../lib/images';

type Category = { title: string; blurb: string; items: string[] };

function staggerRange(arrivalStart: number, spread = 0.18) {
  return [arrivalStart, arrivalStart + spread] as [number, number];
}

function CategoryCard({
  category,
  image,
  index,
  total,
  arrival: arrivalProp,
}: {
  category: Category;
  image: string;
  index: number;
  total: number;
  arrival?: MotionValue<number>;
}) {
  const reduced = useReducedMotion();
  const arrival = useStackCardArrival(arrivalProp);

  const imageY = useTransform(arrival, [0, 1], ['7%', '-2%']);
  const imageScale = useTransform(arrival, [0, 1], [1.07, 1]);

  const eyebrowOpacity = useTransform(arrival, staggerRange(0.32), [0, 1]);
  const eyebrowY = useTransform(arrival, staggerRange(0.32), [14, 0]);

  const titleOpacity = useTransform(arrival, staggerRange(0.4), [0, 1]);
  const titleY = useTransform(arrival, staggerRange(0.4), [18, 0]);

  const blurbOpacity = useTransform(arrival, staggerRange(0.48), [0, 1]);
  const blurbY = useTransform(arrival, staggerRange(0.48), [14, 0]);

  const numberOpacity = useTransform(arrival, staggerRange(0.28), [0, 1]);
  const numberY = useTransform(arrival, staggerRange(0.28), [12, 0]);

  return (
    <article className="grid h-full grid-rows-[11rem,1fr] lg:grid-cols-5 lg:grid-rows-1">
      <div className="relative overflow-hidden lg:col-span-2 lg:h-full">
        <motion.img
          src={image}
          alt=""
          style={reduced ? undefined : { y: imageY, scale: imageScale }}
          className="absolute inset-0 h-[112%] w-full object-cover will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent lg:bg-gradient-to-r" />
        <motion.span
          style={reduced ? undefined : { opacity: numberOpacity, y: numberY }}
          className="absolute bottom-4 left-5 font-serif text-5xl text-ivory/80 will-change-transform lg:bottom-8 lg:left-8 lg:text-7xl"
        >
          {String(index + 1).padStart(2, '0')}
        </motion.span>
      </div>
      <div className="p-6 lg:col-span-3 lg:flex lg:flex-col lg:justify-center lg:p-14">
        <motion.p
          style={reduced ? undefined : { opacity: eyebrowOpacity, y: eyebrowY }}
          className="text-[11px] uppercase tracking-[0.3em] text-muted will-change-transform"
        >
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </motion.p>
        <motion.h3
          style={reduced ? undefined : { opacity: titleOpacity, y: titleY }}
          className="mt-3 font-serif text-3xl text-ink will-change-transform lg:text-5xl"
        >
          {category.title}
        </motion.h3>
        <motion.p
          style={reduced ? undefined : { opacity: blurbOpacity, y: blurbY }}
          className="mt-3 max-w-md text-sm leading-relaxed text-muted will-change-transform lg:text-base"
        >
          {category.blurb}
        </motion.p>
        <ul className="mt-6 grid gap-x-10 lg:mt-8 lg:grid-cols-2">
          {category.items.map((item, i) => (
            <CategoryListItem
              key={item}
              item={item}
              index={i}
              arrival={arrival}
              reduced={!!reduced}
            />
          ))}
        </ul>
      </div>
    </article>
  );
}

function CategoryListItem({
  item,
  index,
  arrival,
  reduced,
}: {
  item: string;
  index: number;
  arrival: MotionValue<number>;
  reduced: boolean;
}) {
  const start = 0.54 + index * 0.045;
  const range = staggerRange(start, 0.14);

  const opacity = useTransform(arrival, range, [0, 1]);
  const y = useTransform(arrival, range, [10, 0]);

  return (
    <motion.li
      style={reduced ? undefined : { opacity, y }}
      className="border-b border-line py-2.5 text-[13px] leading-snug text-ink/80 will-change-transform lg:text-sm"
    >
      {item}
    </motion.li>
  );
}

export default function PropertyMaintenance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const categories = t('maintenancePage.categories', { returnObjects: true }) as Category[];
  const planSteps = t('maintenancePage.planSteps', { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];

  return (
    <PageShell>
      <ServiceHero
        image={IMAGES.maintenance}
        eyebrow={t('maintenancePage.eyebrow')}
        title={t('maintenancePage.title')}
        sub={t('maintenancePage.sub')}
      />

      <section className="px-6 py-24 text-center lg:px-12 lg:py-36">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
            {t('maintenancePage.introEyebrow')}
          </p>
        </Reveal>
        <MaskReveal delay={0.1}>
          <h2 className="mt-5 font-serif text-4xl text-ink md:text-6xl">
            {t('maintenancePage.introTitle1')}{' '}
            <em className="italic">{t('maintenancePage.introTitle2')}</em>
          </h2>
        </MaskReveal>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted">
            {t('maintenancePage.introBody')}
          </p>
        </Reveal>
      </section>

      <section className="bg-sand pb-10">
        <StackCards
          cards={categories.map((category, i) => (
            <CategoryCard
              key={category.title}
              category={category}
              image={MAINTENANCE_CATEGORY_IMAGES[i]}
              index={i}
              total={categories.length}
            />
          ))}
        />
      </section>

      <section className="px-6 py-24 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
              {t('maintenancePage.planEyebrow')}
            </p>
          </Reveal>
          <MaskReveal delay={0.1}>
            <h2 className="mt-5 font-serif text-4xl text-ink md:text-6xl">
              {t('maintenancePage.planTitle')}
            </h2>
          </MaskReveal>
          <Reveal delay={0.25}>
            <p className="mt-8 max-w-3xl font-serif text-xl leading-relaxed text-ink/80 md:text-2xl">
              {t('maintenancePage.planBody')}
            </p>
          </Reveal>

          <div className="mt-16 grid gap-10 md:grid-cols-3 lg:mt-20">
            {planSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.12}>
                <div className="border-t border-ink/30 pt-6">
                  <span className="text-[11px] tracking-[0.2em] text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 font-serif text-2xl text-ink">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <button
              onClick={() => navigate('/contact')}
              className="mt-14 bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors duration-500 hover:bg-ink/85"
            >
              {t('maintenancePage.planCta')}
            </button>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
