// Exterior walkthrough scenes.
//
// A scene is either a flat render ("image": drag to look around, scroll to zoom)
// or a 360° equirectangular panorama ("pano": full look-around). When the 360°
// renders arrive, change a scene's kind to "pano", point `image` at the
// panorama and give its hotspots `yaw`/`pitch` (degrees) instead of x/y.
//
// Hotspots jump to another scene. On flat renders x/y are percentages of the image.
// `map` is the scene's spot on the aerial layout (/media/master-plan.jpg pixels);
// these are approximate until the render studio confirms each camera position.

export type Hotspot = {
  to: string;
  label?: string; // defaults to the target scene's title
  x?: number; // % across the image (flat renders)
  y?: number; // % down the image (flat renders)
  yaw?: number; // degrees (panoramas)
  pitch?: number; // degrees (panoramas)
};

export type TourScene = {
  id: string;
  title: string;
  kind: "image" | "pano";
  image: string;
  map?: { x: number; y: number };
  hotspots: Hotspot[];
};

export const tourScenes: TourScene[] = [
  {
    id: "main-avenue",
    title: "Main Avenue",
    kind: "image",
    image: "/media/exterior/main-avenue.jpg",
    map: { x: 980, y: 512 },
    hotspots: [
      { to: "villa-avenue", x: 50, y: 56 },
      { to: "villa-row-evening", x: 22, y: 44 },
    ],
  },
  {
    id: "villa-avenue",
    title: "Villa Avenue",
    kind: "image",
    image: "/media/exterior/street-view-2.jpg",
    map: { x: 1255, y: 700 },
    hotspots: [
      { to: "villa-row-day", x: 50, y: 57 },
      { to: "villa-267", label: "267 Villa", x: 20, y: 40 },
    ],
  },
  {
    id: "villa-row-day",
    title: "Villa Row",
    kind: "image",
    image: "/media/exterior/villa-row-day.jpg",
    map: { x: 1375, y: 760 },
    hotspots: [
      { to: "villa-267", label: "267 Villa", x: 72, y: 52 },
      { to: "main-avenue", x: 12, y: 86 },
    ],
  },
  {
    id: "villa-row-evening",
    title: "Villa Row — Evening",
    kind: "image",
    image: "/media/exterior/villa-row-evening.jpg",
    map: { x: 1490, y: 650 },
    hotspots: [
      { to: "pool-garden", label: "Private Garden", x: 30, y: 62 },
      { to: "villa-avenue", x: 80, y: 88 },
    ],
  },
  {
    id: "pool-garden",
    title: "Private Pool & Garden",
    kind: "image",
    image: "/media/exterior/private-pool-garden.jpg",
    map: { x: 1520, y: 690 },
    hotspots: [{ to: "villa-row-evening", label: "Back to Street", x: 62, y: 70 }],
  },
  {
    id: "villa-267",
    title: "267 Villa — Front",
    kind: "image",
    image: "/media/villas/267/elevation-a.jpg",
    map: { x: 885, y: 600 },
    hotspots: [
      { to: "villa-267-b", label: "Next Villas", x: 76, y: 60 },
      { to: "villa-avenue", x: 50, y: 92 },
    ],
  },
  {
    id: "villa-267-b",
    title: "267 Villa — Elevation",
    kind: "image",
    image: "/media/villas/267/elevation-b.jpg",
    map: { x: 885, y: 640 },
    hotspots: [
      { to: "villa-267", label: "Previous Villas", x: 22, y: 60 },
      { to: "villa-567-avenue", label: "567 Villas", x: 80, y: 88 },
    ],
  },
  {
    id: "villa-567-avenue",
    title: "567 Villa Avenue",
    kind: "image",
    image: "/media/villas/567/avenue.jpg",
    map: { x: 1300, y: 600 },
    hotspots: [
      { to: "villa-567-row", label: "567 Villa Row", x: 72, y: 50 },
      { to: "villa-567-corner", label: "Corner Villa", x: 20, y: 45 },
    ],
  },
  {
    id: "villa-567-row",
    title: "567 Villa Row",
    kind: "image",
    image: "/media/villas/567/villa-row.jpg",
    map: { x: 1330, y: 640 },
    hotspots: [
      { to: "villa-567-front", label: "567 Villa Front", x: 60, y: 55 },
      { to: "villa-567-avenue", label: "Back to Avenue", x: 22, y: 84 },
    ],
  },
  {
    id: "villa-567-corner",
    title: "567 Villa — Corner",
    kind: "image",
    image: "/media/villas/567/corner.jpg",
    map: { x: 1270, y: 560 },
    hotspots: [
      { to: "villa-567-front", label: "567 Villa Front", x: 45, y: 58 },
      { to: "villa-567-avenue", label: "Back to Avenue", x: 85, y: 88 },
    ],
  },
  {
    id: "villa-567-front",
    title: "567 Villa — Front (Evening)",
    kind: "image",
    image: "/media/villas/567/front-evening.jpg",
    map: { x: 1300, y: 620 },
    hotspots: [
      { to: "villa-567-row", label: "567 Villa Row", x: 15, y: 60 },
      { to: "villa-600-row", label: "600 Villas", x: 85, y: 60 },
    ],
  },
  {
    id: "villa-600-row",
    title: "600 Villa Row",
    kind: "image",
    image: "/media/villas/600/villa-row.jpg",
    map: { x: 1480, y: 640 },
    hotspots: [
      { to: "villa-600-elevation", label: "600 Villa Pair", x: 45, y: 55 },
      { to: "villa-567-front", label: "567 Villas", x: 88, y: 84 },
    ],
  },
  {
    id: "villa-600-elevation",
    title: "600 Villa — Elevation",
    kind: "image",
    image: "/media/villas/600/elevation.jpg",
    map: { x: 1500, y: 680 },
    hotspots: [
      { to: "villa-600-front", label: "600 Villa Front", x: 55, y: 60 },
      { to: "villa-600-row", label: "Back to Street", x: 20, y: 84 },
    ],
  },
  {
    id: "villa-600-front",
    title: "600 Villa — Front (Evening)",
    kind: "image",
    image: "/media/villas/600/front-evening.jpg",
    map: { x: 1520, y: 700 },
    hotspots: [
      { to: "villa-600-pool", label: "Private Pool", x: 70, y: 55 },
      { to: "villa-600-elevation", label: "Back", x: 22, y: 84 },
    ],
  },
  {
    id: "villa-600-pool",
    title: "600 Villa — Private Pool",
    kind: "image",
    image: "/media/villas/600/private-pool.jpg",
    map: { x: 1530, y: 715 },
    hotspots: [
      { to: "villa-600-front", label: "Villa Front", x: 30, y: 84 },
      { to: "villa-267", label: "267 Villas", x: 70, y: 84 },
    ],
  },
  {
    id: "aerial",
    title: "Aerial View",
    kind: "image",
    image: "/media/master-plan.jpg",
    hotspots: [
      { to: "main-avenue", x: 49, y: 45 },
      { to: "villa-avenue", x: 63, y: 62 },
      { to: "villa-267", label: "267 Villas", x: 44, y: 55 },
    ],
  },
];

export const getScene = (id: string) => tourScenes.find((s) => s.id === id);
