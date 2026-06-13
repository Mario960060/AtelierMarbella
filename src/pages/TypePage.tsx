import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageShell from '../components/PageShell';
import { EASE, Reveal } from '../components/Reveal';
import { ELEMENT_TYPES } from '../lib/images';

type TypeEntry = {
  slug: string;
  label: string;
  phrase: string;
  blurb: string;
  marks: string[];
};
type Item = { slug: string; title: string; desc: string; types: TypeEntry[] };
type Group = { name: string; items: Item[] };

export default function TypePage() {
  const { slug, type } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const groups = t('hardPage.groups', { returnObjects: true }) as Group[];
  let item: Item | null = null;
  for (const group of groups) {
    const match = group.items.find((i) => i.slug === slug);
    if (match) {
      item = match;
      break;
    }
  }
  const photos = slug ? ELEMENT_TYPES[slug] : undefined;
  const typeIndex = item ? item.types.findIndex((entry) => entry.slug === type) : -1;

  if (!item || !photos) {
    return <Navigate to="/hard-landscaping" replace />;
  }
  if (typeIndex === -1) {
    return <Navigate to={`/hard-landscaping/${item.slug}`} replace />;
  }

  const entry = item.types[typeIndex];
  // All gallery frames are crops of this one verified photo for now — swap
  // each src for a real project photo of this kind when available.
  const photo = photos[typeIndex];
  const siblings = item.types.filter((sibling) => sibling.slug !== entry.slug);

  return (
    <PageShell>
      <div className="bg-limestone font-body text-ink">
        <section className="relative flex h-[56vh] min-h-[400px] items-end overflow-hidden">
          <motion.img
            src={photo}
            alt={entry.label}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.3, ease: EASE }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-ink/10" />
          <div className="relative z-10 w-full px-6 pb-12 lg:px-12">
            <p className="text-[11px] uppercase tracking-[0.18em] text-limestone/70">
              {item.title}
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-limestone md:text-5xl">
              {entry.label}
            </h1>
          </div>
        </section>

        {/* The catch-phrase, given the whole stage */}
        <section className="px-6 py-20 lg:px-12 lg:py-28">
          <Reveal>
            <p className="mx-auto max-w-4xl text-center font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              {entry.phrase}
            </p>
          </Reveal>
        </section>

        {/* Gallery: four crops of the same photo until real project shots land */}
        <section className="px-6 pb-20 lg:px-12 lg:pb-28">
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal className="md:col-span-2">
              <div className="overflow-hidden bg-plaster">
                <img
                  src={photo}
                  alt={entry.label}
                  className="aspect-[21/9] w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="overflow-hidden bg-plaster">
                <img
                  src={photo}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="aspect-[4/5] w-full scale-[1.7] object-cover"
                  style={{ objectPosition: '24% 70%' }}
                />
              </div>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="overflow-hidden bg-plaster">
                <img
                  src={photo}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="aspect-[4/5] w-full scale-[2.3] object-cover"
                  style={{ objectPosition: '72% 32%' }}
                />
              </div>
            </Reveal>
            <Reveal delay={0.2} className="md:col-span-2">
              <div className="overflow-hidden bg-plaster">
                <img
                  src={photo}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="aspect-[16/7] w-full scale-[1.35] object-cover"
                  style={{ objectPosition: '50% 85%' }}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Craft */}
        <section className="bg-plaster px-6 py-20 lg:px-12 lg:py-28">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t('hardPage.craftTitle')}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-12 lg:grid-cols-2">
            <Reveal delay={0.08}>
              <p className="max-w-[58ch] text-base leading-relaxed text-ink/70 md:text-lg">
                {entry.blurb}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <ul className="space-y-3.5">
                {entry.marks.map((mark) => (
                  <li key={mark} className="flex items-center gap-3 text-sm text-ink/75">
                    <span className="h-px w-6 shrink-0 bg-azure" />
                    {mark}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/contact')}
                className="mt-9 bg-azure px-7 py-3.5 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-azure-deep active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-2"
              >
                {t('hardPage.ctaQuote')}
              </button>
            </Reveal>
          </div>
        </section>

        {/* Other kinds of this element */}
        <section className="px-6 py-20 lg:px-12 lg:py-24">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {t('hardPage.moreTypes')}
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {siblings.map((sibling, i) => {
              const siblingIndex = item.types.findIndex((entry2) => entry2.slug === sibling.slug);
              return (
                <Reveal key={sibling.slug} delay={i * 0.08}>
                  <Link to={`/hard-landscaping/${item.slug}/${sibling.slug}`} className="group block">
                    <div className="overflow-hidden bg-plaster">
                      <img
                        src={photos[siblingIndex]}
                        alt={sibling.label}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.04]"
                      />
                    </div>
                    <span className="mt-3 flex items-center gap-2 font-display text-lg font-medium transition-colors duration-300 group-hover:text-azure">
                      {sibling.label}
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={0.15}>
            <Link
              to={`/hard-landscaping/${item.slug}`}
              className="mt-12 inline-flex items-center gap-2 text-sm text-ink/60 transition-colors duration-200 hover:text-azure"
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
              {t('hardPage.backToElement', { element: item.title })}
            </Link>
          </Reveal>
        </section>
      </div>
    </PageShell>
  );
}
