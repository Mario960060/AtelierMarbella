// Placeholder imagery (Pexels/Unsplash) — visually verified. Swap for real
// project photos when ready; nothing else needs to change.
const px = (id: string, w = 1400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const hardLandscaping = '/images/hard-landscaping.jpg';

export const IMAGES = {
  hard: hardLandscaping,
  maintenance: px('7174105', 1800),
  uk: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  mallorca: px('32208082', 1200),
  costa: px('29453302', 1200),
};

// Hard Landscaping page hero + before/after placeholders
export const HARD_SERVICE_IMAGES = [
  hardLandscaping, // hero
  px('15173129', 1600), // before/after — white steps in volcanic rock
];

// One image per Property Maintenance category (same order as maintenancePage.categories)
export const MAINTENANCE_CATEGORY_IMAGES = [
  px('7174105', 1400), // gardens & grounds — manicured estate garden
  px('14965464', 1400), // exterior cleaning — pressure washing stone steps
  px('15011349', 1400), // stone & sealing — polished marble interior
  px('11806477', 1400), // repairs & upkeep — craftsman's trowel on tiles
  px('8974468', 1400), // specialist services — crystal-clear pool water
];

// Full-screen scene per family — one photo showing all the elements of the
// group, annotated with hotspots (order matches hardPage.groups in i18n).
// Hotspot anchor positions live in HOTSPOTS in ServiceStage3D.tsx.
export const STAGE_SCENES = [
  '/images/scene-stone.jpg', // stone & structure — travertine terrace, lit steps, dry-stone walls
  '/images/scene-living.jpg', // living outdoors — louvred pergola, outdoor kitchen, lighting at dusk
  '/images/scene-water.jpg', // water & green — water wall, sprinkler, lawn
  '/images/scene-gates.png', // gates & fencing — timber driveway gate, slatted screens
];

// Every project photo we have — feeds the "Our standard" page-flip slideshow.
// Just the showcase photography (no logo, no locations map).
export const SHOWCASE_IMAGES: string[] = Array.from(
  new Set([
    '/images/scene-stone.jpg',
    '/images/scene-living.jpg',
    '/images/scene-water.jpg',
    '/images/scene-gates.png',
    hardLandscaping,
    '/images/contactusbackground.jpg',
    ...MAINTENANCE_CATEGORY_IMAGES,
    HARD_SERVICE_IMAGES[1],
    IMAGES.mallorca,
    IMAGES.costa,
  ])
);

// Type-gallery photos per element subpage (3 each), keyed by slug
export const ELEMENT_TYPES: Record<string, string[]> = {
  terraces: [px('1268871'), px('4186553'), px('16549111')],
  'retaining-walls': [px('35489078'), px('17838779'), px('16549111')],
  steps: [px('15173129'), px('14965464'), px('11806477')],
  pergolas: [px('31687640'), px('24807124'), px('13871249')],
  'outdoor-kitchens': [px('10855255'), px('12441653'), px('28542200')],
  lighting: [px('17102583'), px('35297031'), px('13721095')],
  'water-features': [px('12658018'), px('33154124'), px('8974468')],
  irrigation: [px('27443421'), px('35090073'), px('14823388')],
  'artificial-grass': [px('347138'), px('34989777'), px('13083599')],
  gates: [px('10935460'), px('13278911'), px('2102584')],
  fencing: [px('7031594'), px('9735388'), px('7031581')],
};

// ---------------------------------------------------------------------------
// Real per-subcategory project photos. Each subcategory (type) gets its own
// small gallery: index 0 is the hero/cover, the rest fill the detail grid.
// Drop generated files into public/images/elements/<category>/ with the names
// below. Any subcategory without an entry keeps the single ELEMENT_TYPES
// placeholder, and a missing file falls back to it at runtime (typeFallback).
// ---------------------------------------------------------------------------
const elem = (category: string, name: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/images/elements/${category}/${name}-${i + 1}.jpg`);

export const TYPE_GALLERIES: Record<string, string[]> = {
  // Terraces, paths & patios (4 photos each: [0] is the hero/cover)
  'porcelain-paving': elem('terraces', 'porcelain-paving', 4),
  'natural-stone': elem('terraces', 'natural-stone', 4),
  decking: elem('terraces', 'decking', 4),
  // Retaining walls
  'natural-stone-walls': elem('retaining-walls', 'natural-stone-walls', 4),
  'rendered-walls': elem('retaining-walls', 'rendered-walls', 4),
  'feature-walls': elem('retaining-walls', 'feature-walls', 4),
};

// Optional dedicated hero per category page; falls back to the first type cover.
export const ELEMENT_HEROES: Record<string, string> = {
  terraces: '/images/elements/terraces/hero.jpg',
  'retaining-walls': '/images/elements/retaining-walls/hero.jpg',
};

/** Gallery for a subcategory — real per-type photos when we have them, else the
 *  legacy single category placeholder. Index 0 is the hero/cover. */
export function typeGallery(category: string, typeSlug: string, typeIndex: number): string[] {
  const real = TYPE_GALLERIES[typeSlug];
  if (real && real.length) return real;
  const placeholder = ELEMENT_TYPES[category]?.[typeIndex];
  return placeholder ? [placeholder] : [];
}

/** The placeholder a real photo falls back to if its file is missing (404). */
export function typeFallback(category: string, typeIndex: number): string {
  return ELEMENT_TYPES[category]?.[typeIndex] ?? '';
}
