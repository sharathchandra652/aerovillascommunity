import type { Metadata } from "next";
import Link from "next/link";
import AerialFocus from "@/components/AerialFocus";
import TourShell from "@/components/TourShell";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Location — ${project.name}` };

export default function LocationPage() {
  return (
    <TourShell eyebrow="Community Tour" title="Location">
      {project.mapEmbedUrl ? (
        <iframe src={project.mapEmbedUrl} title={`${project.name} location`} className="absolute inset-0 h-full w-full border-0" loading="lazy" />
      ) : (
        <>
          <AerialFocus focus={{ x: 0, y: 0, w: 2000, h: 1125 }} className="kenburns absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-x-4 top-1/2 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-neutral-950/85 p-6 text-center shadow-2xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4a843]">Location</p>
            <h2 className="mt-2 text-2xl font-light">{project.location}</h2>
            <p className="mt-2 text-sm opacity-80">
              The neighbourhood map with nearby schools, hospitals, offices and travel times is coming soon.
            </p>
            <Link href="/contact" className="mt-4 inline-block rounded-full bg-[#d4a843] px-5 py-2 text-sm font-semibold text-neutral-950">
              Ask for directions
            </Link>
          </div>
        </>
      )}
    </TourShell>
  );
}
