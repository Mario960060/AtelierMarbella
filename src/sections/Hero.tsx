import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useIntro } from '../lib/intro';
import { scrollToId } from '../lib/scroll';
import { IMAGES } from '../lib/images';

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const show = useIntro();

  const fadeUp = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    animate: show ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <div className="relative flex min-h-[100dvh] items-end overflow-hidden">
      {/* Swap this image for the 3D villa render when it is ready */}
      <motion.img
        src={IMAGES.costa}
        alt=""
        initial={reduce ? false : { scale: 1.1 }}
        animate={show ? { scale: 1 } : {}}
        transition={{ duration: 1.8, ease: EASE }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/10" />
      <div className="relative z-10 w-full px-6 pb-12 lg:px-12 lg:pb-16">
        <motion.p
          {...fadeUp(0.15)}
          className="text-[11px] uppercase tracking-[0.18em] text-limestone/75"
        >
          {t('hero.eyebrow')}
        </motion.p>
        <motion.h1
          {...fadeUp(0.25)}
          className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.04] tracking-tight text-limestone md:text-6xl"
        >
          {t('hero.title1')} {t('hero.title2')}
        </motion.h1>
        <motion.p
          {...fadeUp(0.37)}
          className="mt-5 max-w-xl text-base leading-relaxed text-limestone/85 md:text-lg"
        >
          {t('hero.sub')}
        </motion.p>
        <motion.div {...fadeUp(0.49)} className="mt-8 flex flex-wrap items-center gap-7">
          <button
            onClick={() => navigate('/contact')}
            className="bg-azure px-7 py-3.5 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-azure-deep active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-limestone focus-visible:ring-offset-2 focus-visible:ring-offset-ink/40"
          >
            {t('hero.ctaPrimary')}
          </button>
          <button
            onClick={() => scrollToId('services')}
            className="border-b border-limestone/60 pb-0.5 text-sm font-medium text-limestone transition-colors duration-200 hover:border-limestone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-limestone"
          >
            {t('hero.ctaSecondary')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
