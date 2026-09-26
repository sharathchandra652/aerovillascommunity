import { project } from "@/data/project";
import { MASTER_PLAN_VIEWBOX } from "@/data/plots";

// Shows one area of the aerial layout render filling its box (like a camera
// framed on that spot), with an optional pulsing marker at its centre.
export default function AerialFocus({
  focus,
  className = "",
  marker = false,
  zoomOut = 1,
}: {
  focus: { x: number; y: number; w: number; h: number };
  className?: string;
  marker?: boolean;
  zoomOut?: number; // widen the framed area around its centre (keeps tall phone screens from over-zooming)
}) {
  const { width, height } = MASTER_PLAN_VIEWBOX;
  const cx = focus.x + focus.w / 2;
  const cy = focus.y + focus.h / 2;
  const w = focus.w * zoomOut;
  const h = focus.h * zoomOut;
  const r = Math.min(focus.w, focus.h) / 22;
  return (
    <svg
      viewBox={`${cx - w / 2} ${cy - h / 2} ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-hidden
    >
      <image href={project.layoutImage} width={width} height={height} />
      {marker && (
        <circle cx={cx} cy={cy} r={r} fill="#d4a843" fillOpacity={0.85} stroke="#fff" strokeWidth={r / 5}>
          <animate attributeName="r" values={`${r};${r * 1.6};${r}`} dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}
