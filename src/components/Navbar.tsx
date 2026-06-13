import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useIntro } from '../lib/intro';
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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 160 && !open);
    setScrolled(y > 40);
  });

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? '-100%' : '0%', opacity: introDone ? 1 : 0 }}
        transition={{ y: { duration: 0.55, ease: EASE }, opacity: { duration: 0.6 } }}
      >
        <div
          className={`flex h-20 items-center justify-between px-6 transition-all duration-500 lg:px-12 ${
            scrolled
              ? 'border-b border-line bg-ivory/85 backdrop-blur-md'
              : 'border-b border-transparent bg-transparent'
          }`}
        >
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
            className="fixed inset-0 z-[70] flex flex-col bg-ivory px-6 pb-10 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="flex h-14 items-center justify-between">
              <BrandMark variant="nav" morph={false} />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-ink">
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-3">
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
                    className="font-serif text-4xl text-ink"
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
                  className="mt-8 border border-ink px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-ink"
                >
                  {t('nav.cta')}
                </button>
              </motion.div>
            </nav>
            <LanguageSwitcher />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
