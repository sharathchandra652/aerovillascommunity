import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Placeholder, TourViewer } from "@/components/Media";
import { getVillaType, project, villaTypes, whatsappLink } from "@/data/project";
import { plots } from "@/data/plots";

export function generateStaticParams() {
  return villaTypes.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata(props: PageProps<"/villas/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const villa = getVillaType(slug);
  return { title: villa ? `${villa.name} — ${project.name}` : project.name };
}

export default async function VillaPage(props: PageProps<"/villas/[slug]">) {
  const { slug } = await props.params;
  const villa = getVillaType(slug);
  if (!villa) notFound();

  const available = plots.filter((p) => p.type === villa.slug && p.status === "available").length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-24">
      <div className="mb-6 flex flex-wrap gap-2">
        {villaTypes.map((v) => (
          <Link
            key={v.slug}
            href={`/villas/${v.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              v.slug === villa.slug ? "border-brand bg-brand text-brand-contrast" : "border-border bg-surface"
            }`}
          >
            {v.name}
          </Link>
        ))}
      </div>

      <h1 className="text-3xl font-semibold">{villa.name}</h1>
      <p className="mt-1 text-muted">{villa.tagline}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="mb-3 text-xl font-semibold">Villa tour</h2>
            <TourViewer tour={villa.tour} title={villa.name} />
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Floor plans</h2>
            {villa.floorPlans.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {villa.floorPlans.map((f) => (
                  <figure key={f.src} className="rounded-xl border border-border bg-surface p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.src} alt={`${villa.name} ${f.label}`} className="w-full" />
                    <figcaption className="mt-2 text-sm text-muted">{f.label}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <Placeholder label="Floor plans coming soon" className="h-40" />
            )}
          </section>

          {villa.images.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">Gallery</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {villa.images.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt={villa.name} className="w-full rounded-xl" />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-24 lg:self-start">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">Plot size</dt>
              <dd className="font-medium">
                {villa.plotSize} {villa.plotUnit}
              </dd>
            </div>
            {villa.builtUpSqft && (
              <div>
                <dt className="text-muted">Built-up</dt>
                <dd className="font-medium">{villa.builtUpSqft} sq.ft</dd>
              </div>
            )}
            {villa.bedrooms && (
              <div>
                <dt className="text-muted">Bedrooms</dt>
                <dd className="font-medium">{villa.bedrooms}</dd>
              </div>
            )}
            {villa.floors && (
              <div>
                <dt className="text-muted">Floors</dt>
                <dd className="font-medium">{villa.floors}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Available</dt>
              <dd className="font-medium">{available} villas</dd>
            </div>
          </dl>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {villa.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <Link
            href="/master-plan"
            className="block rounded-lg border border-border px-4 py-2 text-center text-sm font-medium"
          >
            See available plots on master plan
          </Link>
          <a
            href={whatsappLink(`Hi, I'm interested in the ${villa.name} at ${project.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-brand-contrast"
          >
            Enquire about this villa
          </a>
        </aside>
      </div>
    </div>
  );
}
