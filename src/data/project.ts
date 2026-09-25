// Single source of truth for project content.
// Replace the placeholder values below with the real details, images and tour links.
// Images and videos go in /public/media/... and are referenced as "/media/...".

export type TourMedia =
  | { kind: "embed"; url: string } // hosted 360 tour link (Matterport, Kuula, krpano, etc.)
  | { kind: "youtube"; id: string } // YouTube video id (unlisted is fine)
  | { kind: "video"; src: string; poster?: string } // self-hosted mp4 in /public/media
  | { kind: "none" };

export type VillaType = {
  slug: string;
  name: string;
  plotSize: number;
  plotUnit: string;
  builtUpSqft?: number;
  bedrooms?: number;
  floors?: string;
  tagline: string;
  highlights: string[];
  tour: TourMedia;
  images: string[];
  floorPlans: { label: string; src: string }[];
};

export const project = {
  name: "Aero Villas",
  tagline: "A gated villa community — explore every home from anywhere",
  location: "Hyderabad, Telangana", // TODO: exact locality
  rera: "RERA No. — to be added",
  phone: "+91 00000 00000", // TODO
  whatsapp: "910000000000", // TODO: country code + number, digits only
  email: "sales@example.com", // TODO
  address: "Site address — to be added",
  mapEmbedUrl: "", // TODO: Google Maps embed URL for the site pin
  heroVideo: "", // e.g. "/media/hero.mp4" (drone / walkthrough video)
  heroImage: "/media/exterior/main-avenue.jpg",
  layoutImage: "/media/master-plan.jpg", // aerial render shown behind the clickable villas
  stats: [
    { label: "Acres", value: "—" },
    { label: "Villas", value: "—" },
    { label: "Villa types", value: "3" },
    { label: "Amenities", value: "—" },
  ],
  amenities: [
    "Clubhouse",
    "Swimming pool",
    "Gym",
    "Children's play area",
    "Landscaped parks",
    "Jogging track",
    "24/7 security",
    "Gated entrance",
  ],
  // Exterior street-view renders, shown on the Exterior page and in the gallery
  exterior: [
    { src: "/media/exterior/main-avenue.jpg", caption: "Main avenue — tree-lined internal road" },
    { src: "/media/master-plan.jpg", caption: "Aerial view — master layout" },
    { src: "/media/exterior/street-view-2.jpg", caption: "Villa avenue — twin rows" },
    { src: "/media/exterior/villa-row-day.jpg", caption: "Villa row — street view" },
    { src: "/media/exterior/villa-row-evening.jpg", caption: "Villa row — evening" },
    { src: "/media/exterior/private-pool-garden.jpg", caption: "Private pool & garden deck" },
  ],
  gallery: [] as { src: string; caption: string }[],
  videos: [] as { title: string; youtubeId?: string; src?: string }[],
};

export const villaTypes: VillaType[] = [
  {
    slug: "267",
    name: "267 sq.yd Villa",
    plotSize: 267,
    plotUnit: "sq.yd",
    tagline: "Compact luxury villa",
    highlights: ["Details to be added"],
    tour: { kind: "embed", url: "https://digitour.housing.com/projects/Aasritha_Aero_Villas/sample_villa" },
    images: ["/media/villas/267/elevation-a.jpg", "/media/villas/267/elevation-b.jpg"],
    floorPlans: [],
  },
  {
    slug: "567",
    name: "567 sq.yd Villa",
    plotSize: 567,
    plotUnit: "sq.yd",
    bedrooms: 5,
    tagline: "Spacious 5 BHK family villa",
    highlights: ["5 BHK", "More details to be added"],
    tour: { kind: "embed", url: "https://digitour.housing.com/projects/Aasritha_Aero/5bhk_567" },
    images: [],
    floorPlans: [],
  },
  {
    slug: "600",
    name: "600 sq.yd Villa",
    plotSize: 600,
    plotUnit: "sq.yd",
    tagline: "Signature east-facing villa",
    highlights: ["East facing", "More details to be added"],
    tour: { kind: "embed", url: "https://digitour.housing.com/projects/Aasritha_Aero/600_East_Villa" },
    images: [],
    floorPlans: [],
  },
];

export function getVillaType(slug: string) {
  return villaTypes.find((v) => v.slug === slug);
}

export function whatsappLink(message: string) {
  return `https://wa.me/${project.whatsapp}?text=${encodeURIComponent(message)}`;
}
