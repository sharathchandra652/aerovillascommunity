import type { TourMedia } from "@/data/project";

export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-dashed border-border bg-gradient-to-br from-[#e9efe9] to-[#f3eadb] p-4 text-center text-sm text-muted ${className}`}
    >
      {label}
    </div>
  );
}

export function TourViewer({ tour, title }: { tour: TourMedia; title: string }) {
  const frame = "aspect-video w-full rounded-xl border border-border bg-black";
  switch (tour.kind) {
    case "embed":
      return (
        <iframe
          src={tour.url}
          title={title}
          className={frame}
          allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
          allowFullScreen
        />
      );
    case "youtube":
      return (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${tour.id}`}
          title={title}
          className={frame}
          allow="fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    case "video":
      return <video src={tour.src} poster={tour.poster} controls playsInline className={frame} />;
    default:
      return <Placeholder label={`${title} — villa tour coming soon`} className="aspect-video" />;
  }
}
