import Link from "next/link";
import { Placeholder } from "@/components/Media";
import { project, villaTypes } from "@/data/project";

export default function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand text-brand-contrast">
        {project.heroVideo ? (
          <video
            src={project.heroVideo}
            poster={project.heroImage || undefined}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
        ) : project.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.heroImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        ) : null}
        {(project.heroVideo || project.heroImage) && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        )}
        <div className="mx-auto max-w-6xl px-4 py-28 sm:py-40">
          <p className="text-sm uppercase tracking-widest opacity-80">{project.location}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{project.name}</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">{project.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/master-plan" className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-brand">
              Explore the master plan
            </Link>
            <Link href="/exterior" className="rounded-lg border border-white/60 px-5 py-3 text-sm font-medium">
              Walk the streets
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-10 sm:grid-cols-4">
        {project.stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4 text-center">
            <div className="text-2xl font-semibold text-brand">{s.value}</div>
            <div className="text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Street views</h2>
            <p className="mt-1 text-muted">A first look at the community.</p>
          </div>
          <Link href="/exterior" className="whitespace-nowrap text-sm font-medium text-brand">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {project.exterior.map((s) => (
            <Link key={s.src} href="/exterior" className="group relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.caption}
                loading="lazy"
                className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm text-white">
                {s.caption}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Villa types</h2>
        <p className="mt-1 text-muted">Walk through every villa type in 360°.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {villaTypes.map((v) => (
            <Link
              key={v.slug}
              href={`/villas/${v.slug}`}
              className="group overflow-hidden rounded-xl border border-border bg-surface"
            >
              {v.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.images[0]} alt={v.name} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <Placeholder label="Villa image" className="aspect-[4/3] rounded-none border-0" />
              )}
              <div className="p-4">
                <h3 className="font-semibold group-hover:text-brand">{v.name}</h3>
                <p className="text-sm text-muted">{v.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Amenities</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {project.amenities.map((a) => (
            <li key={a} className="rounded-xl border border-border bg-surface p-4 text-sm">
              {a}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
