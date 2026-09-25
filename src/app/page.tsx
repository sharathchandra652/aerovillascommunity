import Link from "next/link";
import HeroSlideshow from "@/components/HeroSlideshow";
import { project } from "@/data/project";

export default function Home() {
  return (
    <main className="relative isolate flex h-dvh flex-col justify-center overflow-hidden px-5 text-white sm:px-12">
      <HeroSlideshow shots={project.exterior} />

      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.35em] opacity-80 sm:text-sm">{project.location}</p>
        <h1 className="mt-4 text-5xl font-light uppercase tracking-[0.12em] sm:text-7xl">{project.name}</h1>
        <p className="mt-4 max-w-lg text-base opacity-90 sm:text-lg">{project.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/exterior"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-wider text-brand hover:bg-white/90"
          >
            Start virtual tour
          </Link>
          <Link
            href="/master-plan"
            className="rounded-full border border-white/60 px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-white/10"
          >
            Master plan
          </Link>
        </div>
      </div>

      <p className="absolute bottom-28 left-5 text-[11px] opacity-70 sm:left-12">{project.rera}</p>
    </main>
  );
}
