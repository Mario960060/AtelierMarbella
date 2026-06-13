import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageShell from '../components/PageShell';
import { EASE, Reveal } from '../components/Reveal';
import { ELEMENT_TYPES } from '../lib/images';
import { scrollToId } from '../lib/scroll';

type TypeEntry = { slug: string; label: string; phrase: string };
type Item = {
  slug: string;
  title: string;
  desc: string;
  body: string;
  details: string[];
  types: TypeEntry[];
};
type Group = { name: string; items: Item[] };

export default function ElementPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const groups = t('hardPage.groups', { returnObjects: true }) as Group[];
  let found: { item: Item; groupName: string } | null = null;
  for (const group of groups) {
    const item = group.items.find((i) => i.slug === slug);
    if (item) {
      found = { item, groupName: group.name };
      break;
    }
  }
  const photos = slug ? ELEMENT_TYPES[slug] : undefined;

  if (!found || !photos) {
    return <Navigate to="/hard-landscaping" replace />;
  }
  const { item, groupName } = found;

  const backToBuild = () => {
    navigate('/hard-landscaping');
    setTimeout(() => scrollToId('build'), 650);
  };

  return (
    <PageShell>
      <div className="bg-limestone font-body text-ink">
        <section className="relative flex h-[46vh] min-h-[360px] items-end overflow-hidden">
          <motion.img
            src={photos[0]}
            alt={item.title}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.3, ease: EASE }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-ink/10" />
          <div className="relative z-10 w-full px-6 pb-12 lg:px-12">
            <p className="text-[11px] uppercase tracking-[0.18em] text-limestone/70">{groupName}</p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-limestone md:text-5xl">
              {item.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-limestone/85">{item.desc}</p>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-12 lg:py-28">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t('hardPage.typesTitle')}
            </h2>
          </Reveal>
          {/* Timeline: kinds alternate sides of a centre line and swing in
              with a 3D turn as you scroll down to them */}
          <div className="relative mt-14 lg:mt-20">
            <div className="absolute inset-y-2 left-4 w-px bg-ink/15 md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-16 md:space-y-24">
              {photos.map((src, i) => {
                const typeEntry = item.types[i];
                if (!typeEntry) return null;
                const onLeft = i % 2 === 0;
                return (
                  <motion.div
                    key={typeEntry.slug}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.85, ease: EASE }}
                    className={`relative pl-12 md:w-[calc(50%-3rem)] md:pl-0 ${
                      onLeft ? 'md:mr-auto' : 'md:ml-auto'
                    }`}
                  >
                    {/* node on the line + connector to the card */}
                    <span
                      className={`absolute top-10 left-4 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-limestone bg-azure shadow-[0_0_0_4px_rgba(31,111,139,0.15)] md:left-auto ${
                        onLeft
                          ? 'md:-right-12 md:translate-x-1/2'
                          : 'md:-left-12 md:-translate-x-1/2'
                      }`}
                    />
                    <span
                      className={`absolute top-[2.85rem] left-4 h-px w-8 bg-ink/15 md:w-12 ${
                        onLeft ? 'md:left-auto md:-right-12' : 'md:-left-12'
                      }`}
                    />
                    <Link
                      to={`/hard-landscaping/${item.slug}/${typeEntry.slug}`}
                      className="group block"
                    >
                      <figure>
                        <div className="overflow-hidden bg-plaster">
                          <img
                            src={src}
                            alt={typeEntry.label}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.05]"
                          />
                        </div>
                        <figcaption className="mt-4">
                          <span className="flex items-center gap-2 font-display text-xl font-medium transition-colors duration-300 group-hover:text-azure">
                            {typeEntry.label}
                            <ArrowRight
                              size={16}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </span>
                          <span className="mt-1 block text-sm text-ink/55">
                            {typeEntry.phrase}
                          </span>
                        </figcaption>
                      </figure>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-plaster px-6 py-20 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="max-w-[58ch] text-base leading-relaxed text-ink/70 md:text-lg">
                {item.body}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="space-y-3.5">
                {item.details.map((detail) => (
                  <li key={detail} className="flex items-center gap-3 text-sm text-ink/75">
                    <span className="h-px w-6 shrink-0 bg-azure" />
                    {detail}
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
          <Reveal delay={0.15}>
            <button
              onClick={backToBuild}
              className="mt-14 flex items-center gap-2 text-sm text-ink/60 transition-colors duration-200 hover:text-azure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-2"
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
              {t('hardPage.backToBuild')}
            </button>
          </Reveal>
        </section>
      </div>
    </PageShell>
  );
}
