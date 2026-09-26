import type { Metadata } from "next";
import Link from "next/link";
import HeroSlideshow from "@/components/HeroSlideshow";
import TourShell from "@/components/TourShell";
import { verticals } from "@/data/community";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Community Tour — ${project.name}` };

export default function TourHub() {
  return (
    <TourShell>
      <HeroSlideshow shots={project.exterior} />
      <div className="absolute inset-0 overflow-y-auto px-4 pb-28 pt-24 sm:pb-10 sm:pl-36 sm:pr-10 sm:pt-28">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#d4a843]">Community Tour</p>
          <h1 className="mt-2 text-4xl font-light uppercase tracking-[0.1em] sm:text-6xl">{project.name}</h1>
          <p className="mt-3 max-w-xl text-sm opacity-85 sm:text-base">
            Choose where to go: fly over the community, walk its streets, explore the amenities or step inside the villas.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {verticals.map((v, i) => (
              <Link
                key={v.id}
                href={v.href}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 shadow-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <p className="text-[10px] text-[#d4a843]">{String(i + 1).padStart(2, "0")}</p>
                  <p className="text-sm font-semibold sm:text-base">{v.title}</p>
                  <p className="hidden text-xs opacity-75 sm:block">{v.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </TourShell>
  );
}
