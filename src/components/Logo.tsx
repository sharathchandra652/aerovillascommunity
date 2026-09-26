import { useId } from "react";

// Aero Villas wordmark: serif "AERO" over spaced "VILLAS" in the brand's gold
// gradient. Recreated from the logo artwork; swap for the original SVG/PNG
// (public/media/logo.*) when available.
export default function Logo({ className = "h-10" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 360 170" className={className} role="img" aria-label="Aero Villas">
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#f0a52a" />
          <stop offset="0.18" stopColor="#fde89a" />
          <stop offset="0.36" stopColor="#f0a52a" />
          <stop offset="0.55" stopColor="#fde89a" />
          <stop offset="0.75" stopColor="#f2b24a" />
          <stop offset="0.9" stopColor="#fde89a" />
          <stop offset="1" stopColor="#f0a52a" />
        </linearGradient>
      </defs>
      <text
        x="180"
        y="108"
        textAnchor="middle"
        fontFamily="'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Times New Roman', serif"
        fontSize="128"
        fill={`url(#g${id})`}
      >
        AERO
      </text>
      {"VILLAS".split("").map((ch, i) => (
        <text
          key={i}
          x={34 + i * 58.4}
          y="162"
          textAnchor="middle"
          fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
          fontSize="40"
          fontWeight="600"
          fill={`url(#g${id})`}
        >
          {ch}
        </text>
      ))}
    </svg>
  );
}
