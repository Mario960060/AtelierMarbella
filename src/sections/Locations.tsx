import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../components/Reveal';

const GlobeMap = lazy(() => import('../components/GlobeMap'));

const SPOTS = [
  { key: 'uk', lat: 52.6, lon: -1.8 },
  { key: 'ibiza', lat: 38.91, lon: 1.43 },
  { key: 'costa', lat: 36.51, lon: -4.89 },
] as const;

export default function Locations() {
  const { t } = useTranslation();
  const markers = SPOTS.map((s) => ({
    name: t(`locations.${s.key}.name`),
    lat: s.lat,
    lon: s.lon,
  }));

  return (
    <div className="grid gap-10 px-6 py-20 lg:grid-cols-[1fr,1.3fr] lg:items-center lg:px-12 lg:py-24">
      <div className="flex flex-col lg:h-[560px] lg:justify-between">
        <h2 className="shrink-0 font-display text-3xl font-bold leading-[1.06] tracking-tight text-ink md:text-5xl">
          <span className="block">{t('locations.titleLine1')}</span>
          <span className="block text-ink/40">{t('locations.titleLine2')}</span>
        </h2>

        <ul className="mt-10 space-y-7 lg:mt-0">
          {SPOTS.map((s, i) => (
            <Reveal key={s.key} delay={i * 0.08}>
              <li className="border-l-2 border-azure/70 pl-5">
                <h3 className="font-display text-xl font-medium text-ink">
                  {t(`locations.${s.key}.name`)}
                </h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-ink/60">
                  {t(`locations.${s.key}.desc`)}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>

      <Reveal delay={0.1}>
        <Suspense fallback={<div className="h-[420px] md:h-[560px]" />}>
          <GlobeMap markers={markers} />
        </Suspense>
      </Reveal>
    </div>
  );
}
