// "Visit Aero Villas": a guided, first-person visit through the community.
// Each chapter is a render the camera slowly walks into; `focus` (% of the
// image) is where the camera walks towards, so the transition to the next
// chapter feels like moving forward along the path.

export type VisitLink = { label: string; href: string };

export type VisitChapter = {
  id: string;
  place: string; // short label for the chapter list
  title: string;
  narration: string;
  image: string;
  focus: { x: number; y: number };
  links?: VisitLink[];
  booking?: boolean;
};

export const visitChapters: VisitChapter[] = [
  {
    id: "arrive",
    place: "Arrival",
    title: "Welcome to Aero Villas",
    narration:
      "Welcome to Aero Villas, a gated community of over three hundred and sixty villas on forty-one acres in Shamshabad, minutes from the airport. Let's take a walk.",
    image: "/media/master-plan.jpg",
    focus: { x: 48, y: 48 },
  },
  {
    id: "entrance",
    place: "Entrance",
    title: "Through the pergola",
    narration:
      "You enter under a sculpted timber pergola, past a stone water wall and flower beds. The noise of the city is already behind you.",
    image: "/media/amenities/pergola-water-feature.jpg",
    focus: { x: 44, y: 62 },
  },
  {
    id: "avenue",
    place: "Main Avenue",
    title: "The main avenue",
    narration:
      "The main avenue is lined with trees and walkways on both sides. Every villa street, the clubhouse and the parks open off this road.",
    image: "/media/exterior/main-avenue.jpg",
    focus: { x: 50, y: 52 },
  },
  {
    id: "club",
    place: "Club Infinite",
    title: "Club Infinite",
    narration:
      "On your right is Club Infinite, the clubhouse. Double-height lounges, a gym and spaces for celebrations, all a short walk from home.",
    image: "/media/amenities/club-infinite.jpg",
    focus: { x: 60, y: 62 },
  },
  {
    id: "pool",
    place: "Pool & Lawn",
    title: "The pool and the lawn",
    narration:
      "Behind the club, the pool cascades into a children's pool, with sun loungers, amphitheatre steps and a wide lawn for weekend gatherings.",
    image: "/media/amenities/clubhouse-pool.jpg",
    focus: { x: 72, y: 58 },
  },
  {
    id: "sports",
    place: "Sports",
    title: "Courts and play",
    narration:
      "Tennis, basketball and volleyball courts sit beside a landscaped seating plaza, with the children's play area right next door.",
    image: "/media/amenities/sports-courts.jpg",
    focus: { x: 40, y: 45 },
  },
  {
    id: "kids",
    place: "Play Area",
    title: "Where children play",
    narration:
      "Slides, swings, see-saws and a trampoline, shaded by trees and away from traffic, so parents can relax nearby.",
    image: "/media/amenities/kids-play.jpg",
    focus: { x: 52, y: 55 },
  },
  {
    id: "walkway",
    place: "Pergola Walk",
    title: "The evening walk",
    narration:
      "Flower-lined walkways under timber pergolas and lamp-lit paths connect the parks. This is where evenings are spent.",
    image: "/media/amenities/pergola-walkway.jpg",
    focus: { x: 44, y: 55 },
  },
  {
    id: "streets",
    place: "Villa Streets",
    title: "Your street",
    narration:
      "Now into the villa streets. Contemporary homes with stone, timber and planted balconies, each with its own car porch and garden.",
    image: "/media/exterior/street-view-2.jpg",
    focus: { x: 50, y: 55 },
  },
  {
    id: "v267",
    place: "267 sq.yd",
    title: "The 267 sq.yd villa",
    narration: "The 267 square yard villa: compact luxury on three levels, with a planted balcony on every floor.",
    image: "/media/villas/267/elevation-a.jpg",
    focus: { x: 50, y: 60 },
    links: [{ label: "Step inside · 360°", href: "/tour/villas/267" }],
  },
  {
    id: "v567",
    place: "567 sq.yd",
    title: "The 567 sq.yd villa",
    narration: "The 567 square yard villa: a spacious five-bedroom family home with timber-lined overhangs and stone cladding.",
    image: "/media/villas/567/front-evening.jpg",
    focus: { x: 50, y: 62 },
    links: [{ label: "Step inside · 360°", href: "/tour/villas/567" }],
  },
  {
    id: "v600",
    place: "600 sq.yd",
    title: "The 600 sq.yd villa",
    narration: "The signature 600 square yard east-facing villa, with a timber screen, roof garden and its own private pool.",
    image: "/media/villas/600/private-pool.jpg",
    focus: { x: 50, y: 70 },
    links: [{ label: "Step inside · 360°", href: "/tour/villas/600" }],
  },
  {
    id: "choose",
    place: "Find your villa",
    title: "Find your villa",
    narration: "Every villa on the layout is available to explore. Choose by size, facing and availability, or fly over the whole community in 3D.",
    image: "/media/exterior/villa-row-day.jpg",
    focus: { x: 60, y: 55 },
    links: [
      { label: "Open the master plan", href: "/master-plan" },
      { label: "Fly over in 3D", href: "/3d#tour" },
    ],
  },
  {
    id: "location",
    place: "Location",
    title: "Minutes from everything",
    narration: "Aero Villas is near Rajiv Gandhi International Airport, with quick access to the Outer Ring Road and the city.",
    image: "/media/exterior/villa-row-evening.jpg",
    focus: { x: 50, y: 50 },
    links: [{ label: "See the location", href: "/tour/location" }],
  },
  {
    id: "book",
    place: "Book a visit",
    title: "Come and see it in person",
    narration: "Thank you for visiting Aero Villas. We would love to show you around in person. Book your site visit below.",
    image: "/media/villas/600/front-evening.jpg",
    focus: { x: 50, y: 55 },
    booking: true,
  },
];
