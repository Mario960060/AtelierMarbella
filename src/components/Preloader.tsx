import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LOGO_SRC } from '../lib/brand';
import { BRAND_MORPH_EASE } from './BrandMark';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Phase = 'toss' | 'shine' | 'exit';

/**
 * Intro: the logo is a tossed coin. It flies in from far away spinning on
 * its axis, lands in the centre at a quarter of the page size, catches a
 * sun ray sweeping across its golden face, then flies up into the navbar
 * where the name types itself in (BrandMark).
 */
export default function Preloader({
  onMorph,
  onFinished,
}: {
  onMorph: () => void;
  onFinished: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('toss');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers: number[] = [];
    if (reduce) {
      timers.push(
        window.setTimeout(() => {
          setPhase('exit');
          onMorph();
        }, 700)
      );
    } else {
      timers.push(window.setTimeout(() => setPhase('shine'), 1250));
      timers.push(
        window.setTimeout(() => {
          setPhase('exit');
          onMorph();
        }, 2150)
      );
    }
    return () => {
      timers.forEach((t) => clearTimeout(t));
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ivory"
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={{ duration: 0.5, ease: EASE, delay: phase === 'exit' ? 0.15 : 0 }}
      onAnimationComplete={() => {
        if (phase === 'exit') onFinished();
      }}
      style={{ pointerEvents: phase === 'exit' ? 'none' : 'auto', perspective: 1400 }}
    >
      {phase !== 'exit' && (
        <div className="relative h-[25vmin] w-[25vmin] min-h-36 min-w-36">
          {/* Warm golden halo behind the coin */}
          <motion.span
            aria-hidden
            className="absolute -inset-[18%] rounded-full"
            style={{
              background:
                'radial-gradient(closest-side, rgba(216,168,80,0.45), rgba(216,168,80,0))',
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === 'shine' ? [0.5, 1, 0.7] : 0.5,
              scale: phase === 'shine' ? [1, 1.12, 1.05] : 1,
            }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: phase === 'toss' ? 0.9 : 0 }}
          />

          {/* The coin: tossed from far below, spinning on its vertical axis,
              landing flat with a small settle. */}
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ y: '58vh', scale: 0.05, rotateY: 0, rotateZ: -10, opacity: 0 }}
            animate={{
              y: ['58vh', '-7vh', '1.5vh', '0vh'],
              scale: [0.05, 1.07, 0.98, 1],
              rotateY: [0, 210, 330, 360],
              rotateZ: [-10, 2.5, -0.6, 0],
              opacity: [0, 1, 1, 1],
            }}
            transition={{
              y: { duration: 1.25, times: [0, 0.55, 0.82, 1], ease: ['easeOut', 'easeInOut', 'easeOut'] },
              scale: { duration: 1.25, times: [0, 0.55, 0.82, 1], ease: ['easeOut', 'easeInOut', 'easeOut'] },
              rotateY: { duration: 1.25, times: [0, 0.52, 0.84, 1], ease: ['easeOut', 'linear', 'easeOut'] },
              rotateZ: { duration: 1.25, times: [0, 0.55, 0.82, 1], ease: ['easeOut', 'easeInOut', 'easeOut'] },
              opacity: { duration: 1.25, times: [0, 0.55, 0.82, 1], ease: ['easeOut', 'easeInOut', 'easeOut'] },
            }}
          >
            {/* The one true logo: unmounted at exit in the same tick the
                navbar mounts its twin (layout morph back to the top nav). */}
            <motion.img
              layoutId="brand-logo"
              src={LOGO_SRC}
              alt="Atelier Marbella"
              initial={{ filter: 'blur(10px)' }}
              animate={{ filter: 'blur(0px)' }}
              transition={{
                filter: { duration: 0.6, ease: EASE },
                layout: { duration: 0.6, ease: BRAND_MORPH_EASE },
              }}
              className="absolute inset-0 h-full w-full rounded-full object-cover"
              draggable={false}
            />

            {/* Golden rim, like the milled edge of a coin */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                boxShadow:
                  'inset 0 0 0 3px rgba(216,168,80,0.55), inset 0 0 22px rgba(216,168,80,0.25), 0 18px 50px rgba(29,27,22,0.22)',
              }}
            />

            {/* Sun ray passing across the golden face after it lands */}
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <motion.span
                aria-hidden
                className="absolute inset-y-[-20%] w-[55%]"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 0%, rgba(255,214,130,0.55) 35%, rgba(255,248,225,0.95) 50%, rgba(255,214,130,0.55) 65%, transparent 100%)',
                  mixBlendMode: 'soft-light',
                }}
                initial={{ x: '-170%' }}
                animate={phase === 'shine' ? { x: '350%' } : { x: '-170%' }}
                transition={{ duration: 0.85, ease: 'easeInOut', delay: 0.05 }}
              />
            </span>

            {/* Bright glint that travels with the ray */}
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <motion.span
                aria-hidden
                className="absolute inset-y-0 w-[18%]"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)',
                }}
                initial={{ x: '-220%' }}
                animate={phase === 'shine' ? { x: '650%' } : { x: '-220%' }}
                transition={{ duration: 0.85, ease: 'easeInOut', delay: 0.05 }}
              />
            </span>
          </motion.div>

          {/* Soft landing dust ring */}
          <motion.span
            aria-hidden
            className="absolute -inset-3 rounded-full border-2"
            style={{ borderColor: 'rgba(216,168,80,0.4)' }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.85, 1.5, 1.8] }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 1.15 }}
          />
        </div>
      )}
    </motion.div>
  );
}
