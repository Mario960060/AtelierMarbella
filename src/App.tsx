import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import Lenis from 'lenis';
import { IntroContext } from './lib/intro';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import HardLandscaping from './pages/HardLandscaping';
import ElementPage from './pages/ElementPage';
import TypePage from './pages/TypePage';
import PropertyMaintenance from './pages/PropertyMaintenance';
import Contact from './pages/Contact';

export default function App() {
  const location = useLocation();
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [introDone, setIntroDone] = useState(reducedMotion);
  const [loaderGone, setLoaderGone] = useState(reducedMotion);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <IntroContext.Provider value={introDone}>
      <LayoutGroup>
        {!loaderGone && (
          <Preloader
            onMorph={() => setIntroDone(true)}
            onFinished={() => setLoaderGone(true)}
          />
        )}
        <Navbar />
        <main>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/hard-landscaping" element={<HardLandscaping />} />
              <Route path="/hard-landscaping/:slug" element={<ElementPage />} />
              <Route path="/hard-landscaping/:slug/:type" element={<TypePage />} />
              <Route path="/property-maintenance" element={<PropertyMaintenance />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </LayoutGroup>
    </IntroContext.Provider>
  );
}
