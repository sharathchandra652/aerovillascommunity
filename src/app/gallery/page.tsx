import type { Metadata } from "next";
import { Placeholder, TourViewer } from "@/components/Media";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Gallery — ${project.name}` };

export default function GalleryPage() {
  const images = [...project.exterior, ...project.gallery];
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <h1 className="text-3xl font-semibold">Gallery</h1>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Videos</h2>
        {project.videos.length ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {project.videos.map((v) => (
              <div key={v.title}>
                <TourViewer
                  title={v.title}
                  tour={
                    v.youtubeId
                      ? { kind: "youtube", id: v.youtubeId }
                      : v.src
                        ? { kind: "video", src: v.src }
                        : { kind: "none" }
                  }
                />
                <p className="mt-2 text-sm text-muted">{v.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <Placeholder label="Walkthrough and drone videos coming soon" className="aspect-video" />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Images</h2>
        {images.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((g) => (
              <figure key={g.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.caption} className="aspect-[4/3] w-full rounded-xl object-cover" />
                <figcaption className="mt-2 text-sm text-muted">{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {["Exterior render", "Clubhouse", "Aerial view"].map((l) => (
              <Placeholder key={l} label={l} className="aspect-[4/3]" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
