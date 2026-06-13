// Placeholder imagery (Pexels/Unsplash) — visually verified. Swap for real
// project photos when ready; nothing else needs to change.
const px = (id: string, w = 1400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const hardLandscaping = '/images/hard-landscaping.jpg';

export const IMAGES = {
  hard: hardLandscaping,
  maintenance: px('7174105', 1800),
  uk: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  ibiza: px('32208082', 1200),
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

// Type-gallery photos per element subpage (3 each), keyed by slug
export const ELEMENT_TYPES: Record<string, string[]> = {
  terraces: [px('1268871'), px('4186553'), px('16549111')],
  'walls-steps': [px('35489078'), px('17838779'), px('15173129')],
  pergolas: [px('31687640'), px('24807124'), px('13871249')],
  'outdoor-kitchens': [px('10855255'), px('12441653'), px('28542200')],
  lighting: [px('17102583'), px('35297031'), px('13721095')],
  'water-features': [px('12658018'), px('33154124'), px('8974468')],
  irrigation: [px('27443421'), px('35090073'), px('14823388')],
  'artificial-grass': [px('347138'), px('34989777'), px('13083599')],
  gates: [px('10935460'), px('13278911'), px('2102584')],
  fencing: [px('7031594'), px('9735388'), px('7031581')],
};
