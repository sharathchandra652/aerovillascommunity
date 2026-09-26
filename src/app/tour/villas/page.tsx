import type { Metadata } from "next";
import Link from "next/link";
import AerialFocus from "@/components/AerialFocus";
import TourShell from "@/components/TourShell";
import { project, villaTypes } from "@/data/project";

export const metadata: Metadata = { title: `Villas 360° — ${project.name}` };

export default function VillasHub() {
  return (
    <TourShell eyebrow="Community Tour" title="Villas 360°">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/exterior/villa-row-evening.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 blur-sm" />
      <div className="absolute inset-0 overflow-y-auto px-4 pb-28 pt-28 sm:pb-10 sm:pl-36 sm:pr-10">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {villaTypes.map((v) => (
            <Link
              key={v.slug}
              href={`/tour/villas/${v.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/15 bg-neutral-950/75 shadow-2xl backdrop-blur hover:border-[#d4a843]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {v.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.images[0]} alt={v.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <AerialFocus focus={{ x: 1150, y: 560, w: 360, h: 270 }} className="h-full w-full transition-transform duration-700 group-hover:scale-110" />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-[#d4a843] px-3 py-1 text-xs font-semibold text-neutral-950">360°</span>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-light">{v.name}</h2>
                <p className="text-sm opacity-75">{v.tagline}</p>
                <p className="mt-3 text-sm text-[#d4a843]">Step inside →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </TourShell>
  );
}
