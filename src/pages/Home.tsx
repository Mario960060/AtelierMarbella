import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import PageShell from '../components/PageShell';
import { EASE } from '../components/Reveal';
import Hero from '../sections/Hero';
import Manifesto from '../sections/Manifesto';
import ServicesChoice from '../sections/ServicesChoice';
import Locations from '../sections/Locations';

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: EASE }}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  return (
    <PageShell>
      <div className="font-body text-ink">
        <section className="overflow-hidden">
          <Hero />
        </section>
        <Card className="bg-limestone">
          <Manifesto />
        </Card>
        <Card className="bg-limestone">
          <ServicesChoice />
        </Card>
        <Card className="bg-limestone">
          <Locations />
        </Card>
      </div>
    </PageShell>
  );
}
