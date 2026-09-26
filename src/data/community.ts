// Community Tour: the sections ("verticals") of the tour hub and the amenities.

export type Vertical = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  icon: string; // SVG path, 24×24
};

export const verticals: Vertical[] = [
  {
    id: "visit",
    title: "Guided Visit",
    subtitle: "Walk through Aero Villas with a guide",
    href: "/visit",
    image: "/media/amenities/pergola-water-feature.jpg",
    icon: "M9 6l9 6-9 6z",
  },
  {
    id: "aerial",
    title: "Aerial Digi Tour",
    subtitle: "Fly over the whole community",
    href: "/3d#tour",
    image: "/media/master-plan.jpg",
    icon: "M2 12l20-8-8 20-3-9-9-3z",
  },
  {
    id: "streets",
    title: "Street Walkthrough",
    subtitle: "Walk the avenues and villa rows",
    href: "/exterior",
    image: "/media/exterior/main-avenue.jpg",
    icon: "M4 20L10 4M20 20L14 4M12 6v2M12 11v2M12 16v2",
  },
  {
    id: "amenities",
    title: "Amenities",
    subtitle: "Clubhouse, pool, sports and parks",
    href: "/tour/amenities",
    image: "/media/amenities/clubhouse-pool.jpg",
    icon: "M3 18c2 0 2-1.5 4.5-1.5S9.5 18 12 18s2.5-1.5 4.5-1.5S19 18 21 18M7 15V5a2 2 0 014 0M13 15V5a2 2 0 014 0M7 8h6M7 12h6",
  },
  {
    id: "villas",
    title: "Villas 360°",
    subtitle: "Step inside the 267, 567 and 600",
    href: "/tour/villas",
    image: "/media/villas/267/elevation-a.jpg",
    icon: "M4 21V8l8-5 8 5v13M9 21v-6h6v6",
  },
  {
    id: "master-plan",
    title: "Master Plan",
    subtitle: "Find your villa and availability",
    href: "/master-plan",
    image: "/media/exterior/street-view-2.jpg",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  },
  {
    id: "location",
    title: "Location",
    subtitle: "Neighbourhood and connectivity",
    href: "/tour/location",
    image: "/media/villas/600/front-evening.jpg",
    icon: "M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12zM12 11a2 2 0 100-4 2 2 0 000 4z",
  },
  {
    id: "gallery",
    title: "Gallery",
    subtitle: "Renders and videos",
    href: "/gallery",
    image: "/media/exterior/villa-row-day.jpg",
    icon: "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4",
  },
  {
    id: "enquire",
    title: "Book a Visit",
    subtitle: "Talk to our team",
    href: "/contact",
    image: "/media/villas/267/elevation-b.jpg",
    icon: "M4 6h16v12H4zM4 7l8 6 8-6",
  },
];

// Amenities located on the aerial layout (/media/master-plan.jpg, 2000×1125 px).
// `focus` is the area shown on the amenity's page; `stop` is the matching
// Digi Tour stop so "Fly there in 3D" opens /3d#stop-<n>.
export type Amenity = {
  id: string;
  title: string;
  text: string;
  focus: { x: number; y: number; w: number; h: number };
  image?: string; // real render; the aerial framing is used when there is none
  stop?: number;
  scene?: string; // exterior walkthrough scene
};

export const amenities: Amenity[] = [
  {
    id: "entrance",
    title: "Grand Entrance",
    text: "A gated, secured entrance opening onto the tree-lined main avenue, with 24/7 security.",
    focus: { x: 40, y: 460, w: 380, h: 214 },
    stop: 1,
  },
  {
    id: "clubhouse",
    title: "Club Infinite",
    text: "The clubhouse and social heart of the community: double-height glass lounges, a gym and banquet spaces opening onto the pool deck and lawn.",
    image: "/media/amenities/club-infinite.jpg",
    focus: { x: 700, y: 370, w: 300, h: 169 },
    stop: 3,
  },
  {
    id: "pool",
    title: "Swimming Pool",
    text: "A resort-style pool with a cascading kids' pool, sun loungers and amphitheatre steps down to the lawn.",
    image: "/media/amenities/clubhouse-pool.jpg",
    focus: { x: 800, y: 390, w: 220, h: 124 },
    stop: 3,
  },
  {
    id: "sports",
    title: "Sports Courts",
    text: "Tennis, basketball and volleyball courts beside a landscaped seating plaza and walking path.",
    image: "/media/amenities/sports-courts.jpg",
    focus: { x: 580, y: 520, w: 220, h: 124 },
    stop: 4,
  },
  {
    id: "kids",
    title: "Children's Park",
    text: "Slides, swings, see-saws and a trampoline in a shaded, landscaped play area away from traffic.",
    image: "/media/amenities/kids-play.jpg",
    focus: { x: 110, y: 510, w: 240, h: 135 },
  },
  {
    id: "park",
    title: "Landscaped Park",
    text: "Flower-lined walkways under timber pergolas, lamp-lit paths and lawns for evening strolls.",
    image: "/media/amenities/pergola-walkway.jpg",
    focus: { x: 950, y: 385, w: 260, h: 146 },
    stop: 11,
  },
  {
    id: "avenue",
    title: "Tree-lined Avenues",
    text: "Wide internal roads with avenue trees, walkways and street lighting throughout.",
    focus: { x: 600, y: 440, w: 700, h: 394 },
    stop: 2,
    scene: "main-avenue",
  },
  {
    id: "water-feature",
    title: "Pergola & Water Feature",
    text: "A sculpted timber pergola framing a stone water wall, reflecting pools and flower beds.",
    focus: { x: 950, y: 385, w: 260, h: 146 },
    image: "/media/amenities/pergola-water-feature.jpg",
  },
];

export const getAmenity = (id: string) => amenities.find((a) => a.id === id);
