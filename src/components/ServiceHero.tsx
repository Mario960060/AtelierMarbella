import { motion } from 'framer-motion';
import { EASE } from './Reveal';

export default function ServiceHero({
  image,
  eyebrow,
  title,
  sub,
}: {
  image: string;
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <section className="relative flex h-[70vh] min-h-[480px] items-end overflow-hidden">
      <motion.img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: EASE }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/40 to-night/10" />
      <div className="relative z-10 w-full px-6 pb-16 lg:px-12">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="text-[11px] uppercase tracking-[0.3em] text-ivory/60"
        >
          {eyebrow}
        </motion.p>
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
            className="mt-4 font-serif text-5xl text-ivory md:text-7xl"
          >
            {title}
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
          className="mt-5 max-w-xl text-base leading-relaxed text-ivory/80"
        >
          {sub}
        </motion.p>
      </div>
    </section>
  );
}
