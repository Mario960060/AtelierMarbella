import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useIntro } from '../lib/intro';
import { IMAGES } from '../lib/images';
import LanguageSwitcher from './LanguageSwitcher';
import BrandMark from './BrandMark';
import { EASE } from './Reveal';

const LINKS = [
  { to: '/', key: 'home' },
  { to: '/hard-landscaping', key: 'hard' },
  { to: '/property-maintenance', key: 'maintenance' },
] as const;

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const introDone = useIntro();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 160 && !open);
  });

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? '-100%' : '0%', opacity: introDone ? 1 : 0 }}
        transition={{ y: { duration: 0.55, ease: EASE }, opacity: { duration: 0.6 } }}
      >
        <div className="flex h-20 items-center justify-between border-b border-line bg-ivory px-6 lg:px-12">
          <Link to="/" aria-label="Atelier Marbella — home">
            {introDone && <BrandMark variant="nav" animateLetters />}
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className="group relative text-xs uppercase tracking-[0.18em] text-ink"
              >
                {({ isActive }) => (
                  <span className="relative inline-block py-1">
                    {t(`nav.${l.key}`)}
                    <span
                      className={`absolute bottom-0 left-0 h-px w-full origin-left bg-ink transition-transform duration-500 ease-luxe ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-8 lg:flex">
            <LanguageSwitcher />
            <button
              onClick={() => navigate('/contact')}
              className="border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:bg-ink hover:text-ivory"
            >
              {t('nav.cta')}
            </button>
          </div>

          <button
            className="text-ink lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={26} strokeWidth={1.5} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-night px-6 pb-10 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {/* Mediterranean photo backdrop with a dark wash for legible light text */}
            <div className="pointer-events-none absolute inset-0">
              <motion.img
                src={IMAGES.hard}
                alt=""
                className="h-full w-full object-cover"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-night/95 via-night/88 to-night/82" />
            </div>

            <div className="relative z-10 flex h-14 items-center justify-between">
              <BrandMark variant="nav" morph={false} tone="light" />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-limestone"
              >
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="relative z-10 flex flex-1 flex-col justify-start gap-4 pt-12">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: EASE }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setOpen(false)}
                    className="font-serif text-5xl font-medium text-limestone [text-shadow:0_1px_2px_rgba(11,10,7,0.55),0_2px_28px_rgba(11,10,7,0.55)]"
                  >
                    {t(`nav.${l.key}`)}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.42, ease: EASE }}
              >
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/contact');
                  }}
                  className="mt-10 border border-limestone/70 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-limestone transition-colors duration-500 hover:bg-limestone hover:text-night"
                >
                  {t('nav.cta')}
                </button>
              </motion.div>
            </nav>
            <div className="relative z-10">
              <LanguageSwitcher dark />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
