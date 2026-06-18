# Atelier Marbella

Marketing site — hard landscaping & property maintenance (UK · Mallorca · Costa del Sol).

Stack: Vite + React + TypeScript + Tailwind CSS, Framer Motion (animations), Lenis (smooth scroll), react-i18next (EN/ES).

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

## Where things live

- `src/i18n/locales/en.json` / `es.json` — all site copy (both languages)
- `src/lib/images.ts` — image URLs (currently Unsplash placeholders; swap for the 3D villa render / real photos)
- `src/sections/` — homepage sections (Hero, Manifesto, ServicesChoice, Locations, CTA)
- `src/pages/ServicePage.tsx` — skeleton subpages for Hard Landscaping & Property Maintenance
