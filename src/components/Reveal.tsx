import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: reduce ? 0.4 : 1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function MaskReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: '110%' }}
        whileInView={reduce ? { opacity: 1 } : { y: '0%' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: reduce ? 0.4 : 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}
