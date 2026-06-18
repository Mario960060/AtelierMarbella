import { motion, useReducedMotion } from 'framer-motion';
import { LOGO_SRC } from '../lib/brand';

const LETTERS = 'Atelier'.split('');
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const BRAND_MORPH_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type BrandMarkProps = {
  variant?: 'intro' | 'nav';
  /** Type the name in letter by letter (used once, right after the intro). */
  animateLetters?: boolean;
  morph?: boolean;
  /** 'light' flips the wordmark to limestone for dark backgrounds (e.g. mobile menu). */
  tone?: 'dark' | 'light';
  className?: string;
};

export default function BrandMark({
  variant = 'nav',
  animateLetters = false,
  morph = true,
  tone = 'dark',
  className = '',
}: BrandMarkProps) {
  const reduce = useReducedMotion();
  const animate = animateLetters && !reduce;
  const nameColor = tone === 'light' ? 'text-limestone' : 'text-ink';
  const subColor = tone === 'light' ? 'text-limestone/60' : 'text-muted';

  if (variant === 'intro') {
    // The logo carries the name, so the intro shows the mark alone
    return (
      <img
        src={LOGO_SRC}
        alt="Atelier Marbella"
        className={`h-24 w-24 rounded-full object-cover md:h-28 md:w-28 ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.img
        layoutId={morph ? 'brand-logo' : undefined}
        transition={{ duration: 0.6, ease: BRAND_MORPH_EASE }}
        src={LOGO_SRC}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover md:h-11 md:w-11"
      />
      <div className="flex flex-col">
        <span className={`font-serif text-2xl leading-none ${nameColor}`} aria-label="Atelier">
          {animate
            ? LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.55, delay: 0.45 + i * 0.055, ease: EASE }}
                >
                  {letter}
                </motion.span>
              ))
            : 'Atelier'}
        </span>
        {animate ? (
          <motion.span
            className={`mt-1 text-[8px] uppercase tracking-[0.45em] ${subColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
          >
            Marbella
          </motion.span>
        ) : (
          <span className={`mt-1 text-[8px] uppercase tracking-[0.45em] ${subColor}`}>Marbella</span>
        )}
      </div>
    </div>
  );
}
