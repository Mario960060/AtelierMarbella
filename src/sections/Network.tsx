import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../components/Reveal';

type Company = {
  key: string;
  name: string;
  href: string;
  logo: string;
  /** Wordmark logos that ship white-on-transparent; inverted so they read on the light coin. */
  invert?: boolean;
};

const COMPANIES: Company[] = [
  { key: 'piomar', name: 'Piomar Design & Build', href: 'https://piomarltd.com/', logo: '/images/partners/piomar.png' },
  { key: 'spcs', name: 'SPCS', href: 'https://www.spcs-limited.com/', logo: '/images/partners/spcs.png' },
  { key: 'bespoke', name: 'Bespoke Garden Living', href: 'https://bespokegardenliving.com/', logo: '/images/partners/bespoke.png' },
  { key: 'concept', name: 'Concept Developments', href: 'https://concept-developments.com/', logo: '/images/partners/concept.png', invert: true },
];

const FACE =
  'absolute inset-0 grid place-items-center rounded-full bg-white ring-1 ring-ink/5 shadow-[0_18px_40px_-26px_rgba(20,18,13,0.55)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]';
const LOGO = 'max-h-[58%] w-auto max-w-[74%] object-contain';

function CoinLogo({ c, index }: { c: Company; index: number }) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [flipped, setFlipped] = useState(false);

  // Flip once, when the coin scrolls into view, via a plain IntersectionObserver
  // (CSS transforms hold their final value reliably, unlike a 3D motion variant).
  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setFlipped(true);
          io.disconnect();
        }
      },
      { rootMargin: '-80px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // Reduced motion: no flip, just the colour face on a static coin.
  if (reduce) {
    return (
      <a
        href={c.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${c.name} — ${t('network.visit')}`}
        className="group mx-auto block h-32 w-32"
      >
        <span className={FACE}>
          <img src={c.logo} alt={c.name} loading="lazy" className={`${LOGO} ${c.invert ? 'invert' : ''}`} />
        </span>
      </a>
    );
  }

  return (
    <a
      ref={ref}
      href={c.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${c.name} — ${t('network.visit')}`}
      className="group mx-auto block h-32 w-32 [perspective:1200px] transition-transform duration-500 hover:scale-[1.06]"
    >
      <div
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{
          // Opacity settles fast (before the coin turns past edge-on) so the colour
          // face shows at full colour the instant it is revealed; the turn itself is slow.
          transition: `transform 1100ms ease-out ${index * 140}ms, opacity 300ms ease-out ${index * 140}ms`,
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          opacity: flipped ? 1 : 0,
        }}
      >
        {/* Front — heads: muted grayscale */}
        <span className={FACE}>
          <img
            src={c.logo}
            alt={c.name}
            loading="lazy"
            className={`${LOGO} opacity-70 grayscale ${c.invert ? 'invert' : ''}`}
          />
        </span>
        {/* Back — tails: full colour, pre-rotated so it reads upright after the flip */}
        <span className={`${FACE} [transform:rotateY(180deg)]`}>
          <img src={c.logo} alt="" aria-hidden loading="lazy" className={`${LOGO} ${c.invert ? 'invert' : ''}`} />
        </span>
      </div>
    </a>
  );
}

export default function Network() {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-24 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.28em] text-azure">{t('network.eyebrow')}</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mx-auto mt-6 max-w-[20ch] font-display text-3xl font-bold leading-[1.06] tracking-tight text-ink md:text-4xl">
            {t('network.title')}
          </h2>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mx-auto mt-6 max-w-[58ch] text-base leading-relaxed text-ink/65">{t('network.sub')}</p>
        </Reveal>
      </div>

      <ul className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
        {COMPANIES.map((c, i) => (
          <li key={c.key}>
            <CoinLogo c={c} index={i} />
          </li>
        ))}
      </ul>
    </div>
  );
}
