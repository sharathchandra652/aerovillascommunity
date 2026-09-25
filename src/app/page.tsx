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
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60"
          />
        ) : project.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.heroImage} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
        ) : null}
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="text-sm uppercase tracking-widest opacity-80">{project.location}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{project.name}</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">{project.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/master-plan" className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-brand">
              Explore the master plan
            </Link>
            <Link href="/villas/267" className="rounded-lg border border-white/60 px-5 py-3 text-sm font-medium">
              Take a villa tour
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
