import { useLayoutEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import type Lenis from 'lenis';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function PageShell({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  // Reset scroll on the NEW page as it mounts (before paint), so the outgoing
  // page is never seen jumping to the top during the route change.
  useLayoutEffect(() => {
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 14 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
    >
      {children}
    </motion.div>
  );
}
