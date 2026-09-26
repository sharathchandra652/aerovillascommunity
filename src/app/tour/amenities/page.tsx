import type { Metadata } from "next";
import Link from "next/link";
import AerialFocus from "@/components/AerialFocus";
import TourShell from "@/components/TourShell";
import { amenities } from "@/data/community";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Amenities — ${project.name}` };

export default function AmenitiesPage() {
  return (
    <TourShell eyebrow="Community Tour" title="Amenities">
      <AerialFocus focus={{ x: 0, y: 200, w: 2000, h: 1125 - 200 }} className="absolute inset-0 h-full w-full opacity-40 blur-sm" />
      <div className="absolute inset-0 overflow-y-auto px-4 pb-28 pt-28 sm:pb-10 sm:pl-36 sm:pr-10">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((a) => (
            <Link
              key={a.id}
              href={`/tour/amenities/${a.id}`}
              className="group overflow-hidden rounded-2xl border border-white/15 bg-neutral-950/70 shadow-2xl backdrop-blur hover:border-[#d4a843]"
            >
              <div className="relative aspect-video overflow-hidden">
                {a.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image} alt={a.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <AerialFocus focus={a.focus} marker className="h-full w-full transition-transform duration-700 group-hover:scale-110" />
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-medium">{a.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm opacity-75">{a.text}</p>
                <p className="mt-3 text-sm text-[#d4a843]">Explore →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </TourShell>
  );
}
