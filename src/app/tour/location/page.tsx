import type { Metadata } from "next";
import Link from "next/link";
import TourShell from "@/components/TourShell";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Location — ${project.name}` };

// Each opens a Google Maps search around the site, so results stay live and accurate
const nearby = [
  { label: "Airport", q: "Rajiv Gandhi International Airport" },
  { label: "Schools", q: "schools" },
  { label: "Hospitals", q: "hospitals" },
  { label: "Shopping", q: "shopping malls" },
  { label: "Restaurants", q: "restaurants" },
  { label: "Metro & transport", q: "bus and metro stations" },
];

const near = (q: string) => `https://www.google.com/maps/search/${encodeURIComponent(`${q} near ${project.mapQuery}`)}`;
const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(project.mapQuery)}`;

export default function LocationPage() {
  return (
    <TourShell eyebrow="Community Tour" title="Location">
      <iframe
        src={project.mapEmbedUrl}
        title={`${project.name} location`}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute inset-x-3 bottom-24 max-h-[55vh] overflow-y-auto rounded-2xl bg-neutral-950/90 p-5 shadow-2xl backdrop-blur sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-24 sm:w-80">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d4a843]">Location</p>
        <h2 className="mt-2 text-xl font-light">{project.name}</h2>
        <p className="mt-1 text-sm opacity-80">{project.address}</p>

        <ul className="mt-4 space-y-2 text-sm">
          {project.connectivity.map((c) => (
            <li key={c} className="flex gap-2">
              <span className="text-[#d4a843]">✓</span>
              {c}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-white/60">Explore nearby</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {nearby.map((n) => (
            <a
              key={n.label}
              href={near(n.q)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-white/10 px-3 py-2 text-center text-xs hover:bg-white/20"
            >
              {n.label}
            </a>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 text-sm">
          <a href={directions} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#d4a843] px-4 py-2 text-center font-semibold text-neutral-950">
            Get directions
          </a>
          <a href={project.mapLink} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/40 px-4 py-2 text-center hover:bg-white/10">
            Open in Google Maps ↗
          </a>
          <Link href="/contact" className="rounded-full border border-white/40 px-4 py-2 text-center hover:bg-white/10">
            Book a site visit
          </Link>
        </div>
      </div>
    </TourShell>
  );
}
