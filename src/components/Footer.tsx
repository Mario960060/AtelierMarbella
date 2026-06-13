import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer() {
  const { t } = useTranslation();
  const year = 2025;
  const serviceList = t('footer.serviceList', { returnObjects: true }) as string[];

  return (
    <footer id="contact" className="bg-night px-6 py-14 text-ivory lg:px-12">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="font-display text-2xl font-bold leading-none">Atelier</p>
          <p className="mt-1.5 text-[9px] uppercase tracking-[0.45em] text-ivory/50">
            Marbella
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/60">{t('footer.blurb')}</p>
          <div className="mt-5">
            <LanguageSwitcher dark />
          </div>
        </div>

        <div className="lg:col-span-2">
          <p className="text-[11px] uppercase tracking-[0.25em] text-ivory/40">{t('footer.explore')}</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/75">
            <li>
              <Link className="transition-colors hover:text-ivory" to="/">
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ivory" to="/hard-landscaping">
                {t('nav.hard')}
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ivory" to="/property-maintenance">
                {t('nav.maintenance')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.25em] text-ivory/40">{t('footer.services')}</p>
          <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-ivory/75 sm:grid-cols-2 lg:grid-cols-1">
            {serviceList.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.25em] text-ivory/40">{t('footer.contact')}</p>
          <ul className="mt-4 space-y-2 text-sm text-ivory/75">
            <li>
              <a href="tel:+34600000000" className="transition-colors hover:text-ivory">
                +34 600 000 000
              </a>
            </li>
            <li>
              <a
                href="mailto:info@ateliermarbella.com"
                className="transition-colors hover:text-ivory"
              >
                info@ateliermarbella.com
              </a>
            </li>
            <li className="text-ivory/50">{t('footer.areas')}</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t border-ivory/10 pt-5 text-[11px] uppercase tracking-[0.18em] text-ivory/35 md:flex-row md:items-center md:justify-between">
        <span>
          © {year} Atelier Marbella. {t('footer.rights')}
        </span>
        <span className="flex gap-6">
          <span>{t('footer.privacy')}</span>
          <span>{t('footer.legal')}</span>
        </span>
      </div>
    </footer>
  );
}
