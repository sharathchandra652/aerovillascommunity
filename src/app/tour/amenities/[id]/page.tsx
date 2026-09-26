import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AerialFocus from "@/components/AerialFocus";
import TourShell from "@/components/TourShell";
import { amenities, getAmenity } from "@/data/community";
import { project } from "@/data/project";

export function generateStaticParams() {
  return amenities.map((a) => ({ id: a.id }));
}

export async function generateMetadata(props: PageProps<"/tour/amenities/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: `${getAmenity(id)?.title ?? "Amenity"} — ${project.name}` };
}

export default async function AmenityPage(props: PageProps<"/tour/amenities/[id]">) {
  const { id } = await props.params;
  const amenity = getAmenity(id);
  if (!amenity) notFound();
  const i = amenities.indexOf(amenity);
  const prev = amenities[(i - 1 + amenities.length) % amenities.length];
  const next = amenities[(i + 1) % amenities.length];

  return (
    <TourShell eyebrow="Amenities" title={amenity.title}>
      <div className="absolute inset-0 overflow-hidden">
        <AerialFocus key={amenity.id} focus={amenity.focus} zoomOut={1.6} marker className="kenburns h-full w-full sm:hidden" />
        <AerialFocus key={`${amenity.id}-wide`} focus={amenity.focus} marker className="kenburns hidden h-full w-full sm:block" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <Link
        href={`/tour/amenities/${prev.id}`}
        aria-label={`Previous: ${prev.title}`}
        className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-neutral-900/60 text-2xl hover:bg-neutral-900/80 sm:left-32"
      >
        ‹
      </Link>
      <Link
        href={`/tour/amenities/${next.id}`}
        aria-label={`Next: ${next.title}`}
        className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-neutral-900/60 text-2xl hover:bg-neutral-900/80 sm:right-6"
      >
        ›
      </Link>

      <div className="absolute inset-x-4 bottom-28 mx-auto max-w-lg rounded-2xl bg-neutral-950/85 p-5 shadow-2xl backdrop-blur sm:bottom-8 sm:left-auto sm:right-8 sm:mx-0">
        <p className="text-xs uppercase tracking-[0.25em] text-[#d4a843]">
          Amenity {i + 1} / {amenities.length}
        </p>
        <h2 className="mt-2 text-2xl font-light">{amenity.title}</h2>
        <p className="mt-1 text-sm opacity-85">{amenity.text}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {amenity.stop !== undefined && (
            <Link href={`/3d#stop-${amenity.stop}`} className="rounded-full bg-[#d4a843] px-4 py-2 text-sm font-semibold text-neutral-950">
              Fly there in 3D
            </Link>
          )}
          {amenity.scene && (
            <Link href={`/exterior#${amenity.scene}`} className="rounded-full border border-white/40 px-4 py-2 text-sm hover:bg-white/10">
              Street view
            </Link>
          )}
          <Link href="/tour/amenities" className="rounded-full border border-white/40 px-4 py-2 text-sm hover:bg-white/10">
            All amenities
          </Link>
        </div>
        <div className="mt-4 flex gap-1.5">
          {amenities.map((a) => (
            <Link
              key={a.id}
              href={`/tour/amenities/${a.id}`}
              aria-label={a.title}
              className={`h-1.5 rounded-full ${a.id === amenity.id ? "w-5 bg-[#d4a843]" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </TourShell>
  );
}
