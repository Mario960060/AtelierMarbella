import { useTranslation } from 'react-i18next';

const LANGS = ['en', 'es'] as const;

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? 'en';

  return (
    <div
      className={`flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] ${
        dark ? 'text-ivory/50' : 'text-muted'
      }`}
    >
      {LANGS.map((lng, i) => (
        <span key={lng} className="flex items-center gap-3">
          {i > 0 && <span className="opacity-40">/</span>}
          <button
            onClick={() => i18n.changeLanguage(lng)}
            className={`transition-colors duration-300 ${
              dark ? 'hover:text-ivory' : 'hover:text-ink'
            } ${
              current.startsWith(lng)
                ? `${dark ? 'text-ivory' : 'text-ink'} underline underline-offset-4`
                : ''
            }`}
          >
            {lng.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
