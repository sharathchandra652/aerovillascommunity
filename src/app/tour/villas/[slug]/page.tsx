import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TourShell from "@/components/TourShell";
import { getVillaType, project, villaTypes, whatsappLink } from "@/data/project";

export function generateStaticParams() {
  return villaTypes.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata(props: PageProps<"/tour/villas/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: `${getVillaType(slug)?.name ?? "Villa"} 360° — ${project.name}` };
}

export default async function Villa360Page(props: PageProps<"/tour/villas/[slug]">) {
  const { slug } = await props.params;
  const villa = getVillaType(slug);
  if (!villa) notFound();
  const url = villa.tour.kind === "embed" ? villa.tour.url : null;

  return (
    <TourShell eyebrow="Villas 360°" title={villa.name}>
      {url ? (
        <iframe
          src={url}
          title={`${villa.name} 360° tour`}
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm opacity-70">360° tour coming soon</div>
      )}

      {/* Villa switcher + details */}
      <div className="absolute right-3 top-20 w-60 rounded-2xl bg-neutral-950/85 p-4 shadow-2xl backdrop-blur sm:right-6 sm:top-24 sm:w-64">
        <div className="flex gap-1">
          {villaTypes.map((v) => (
            <Link
              key={v.slug}
              href={`/tour/villas/${v.slug}`}
              className={`flex-1 rounded-lg py-1.5 text-center text-xs font-medium ${
                v.slug === villa.slug ? "bg-[#d4a843] text-neutral-950" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {v.plotSize}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-sm opacity-85">{villa.tagline}</p>
        <ul className="mt-2 space-y-0.5 text-xs opacity-75">
          <li>Plot: {villa.plotSize} {villa.plotUnit}</li>
          {villa.bedrooms && <li>{villa.bedrooms} BHK</li>}
          {villa.builtUpSqft && <li>Built-up: {villa.builtUpSqft} sq.ft</li>}
        </ul>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/30 px-3 py-1.5 text-center hover:bg-white/10">
              Open in new tab ↗
            </a>
          )}
          <Link href={`/villas/${villa.slug}`} className="rounded-lg border border-white/30 px-3 py-1.5 text-center hover:bg-white/10">
            Floor plans & details
          </Link>
          <a
            href={whatsappLink(`Hi, I'm interested in the ${villa.name} at ${project.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#d4a843] px-3 py-1.5 text-center font-semibold text-neutral-950"
          >
            Enquire
          </a>
        </div>
      </div>
    </TourShell>
  );
}
