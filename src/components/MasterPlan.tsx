"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getVillaType, project, villaTypes, whatsappLink } from "@/data/project";
import { MASTER_PLAN_VIEWBOX, plots, type Facing, type Plot, type PlotStatus } from "@/data/plots";

const statusFill: Record<PlotStatus, string> = {
  available: "var(--available)",
  booked: "var(--booked)",
  sold: "var(--sold)",
};

const statusLabel: Record<PlotStatus, string> = {
  available: "Available",
  booked: "Booked",
  sold: "Sold",
};

const facings: Facing[] = ["East", "West", "North", "South"];
const zoomLevels = [1, 1.5, 2, 3];
const TBC = "To be confirmed";

function centroid(points: string) {
  const pts = points.split(" ").map((p) => p.split(",").map(Number));
  const x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return { x, y };
}

export default function MasterPlan() {
  const [type, setType] = useState("all");
  const [facing, setFacing] = useState("all");
  const [status, setStatus] = useState("all");
  const [zoom, setZoom] = useState(0);
  const [selected, setSelected] = useState<Plot | null>(null);

  const filtering = type !== "all" || facing !== "all" || status !== "all";
  const matches = useMemo(
    () =>
      new Set(
        plots
          .filter(
            (p) =>
              (type === "all" || p.type === type) &&
              (facing === "all" || p.facing === facing) &&
              (status === "all" || p.status === status),
          )
          .map((p) => p.id),
      ),
    [type, facing, status],
  );

  const counts = useMemo(() => {
    const c = { available: 0, booked: 0, sold: 0 };
    plots.forEach((p) => c[p.status]++);
    return c;
  }, []);

  const selectedType = selected?.type ? getVillaType(selected.type) : undefined;
  const { width, height } = MASTER_PLAN_VIEWBOX;
  const scale = zoomLevels[zoom];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Select label="Villa type" value={type} onChange={setType}>
            <option value="all">All types</option>
            {villaTypes.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.name}
              </option>
            ))}
          </Select>
          <Select label="Facing" value={facing} onChange={setFacing}>
            <option value="all">Any facing</option>
            {facings.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select label="Status" value={status} onChange={setStatus}>
            <option value="all">Any status</option>
            {(Object.keys(statusLabel) as PlotStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </Select>
          <div className="ml-auto flex overflow-hidden rounded-lg border border-border bg-surface text-sm">
            <button
              onClick={() => setZoom((z) => Math.max(0, z - 1))}
              disabled={zoom === 0}
              className="px-3 py-2 disabled:opacity-40"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="border-x border-border px-3 py-2 tabular-nums">{scale}×</span>
            <button
              onClick={() => setZoom((z) => Math.min(zoomLevels.length - 1, z + 1))}
              disabled={zoom === zoomLevels.length - 1}
              className="px-3 py-2 disabled:opacity-40"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-auto rounded-xl border border-border bg-black">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: `${scale * 100}%` }}
            className="block h-auto min-w-[720px]"
            role="img"
            aria-label="Interactive master plan"
          >
            {project.layoutImage && <image href={project.layoutImage} width={width} height={height} />}
            {plots.map((p) => {
              const active = matches.has(p.id);
              const isSelected = selected?.id === p.id;
              const c = centroid(p.points);
              return (
                <g key={p.id} onClick={() => setSelected(p)} className="group cursor-pointer">
                  <polygon
                    points={p.points}
                    fill={statusFill[p.status]}
                    fillOpacity={isSelected ? 0.85 : filtering && active ? 0.6 : 0.3}
                    stroke={isSelected ? "#fff" : statusFill[p.status]}
                    strokeWidth={isSelected ? 3 : 1}
                    opacity={filtering && !active ? 0.15 : 1}
                    className="transition-[fill-opacity] group-hover:[fill-opacity:0.75]"
                  >
                    <title>{`Villa ${p.id} · ${statusLabel[p.status]}`}</title>
                  </polygon>
                  {scale >= 2 && (
                    <text
                      x={c.x}
                      y={c.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={9}
                      fontWeight={600}
                      fill="#fff"
                      pointerEvents="none"
                      style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.6)", strokeWidth: 2 }}
                    >
                      {p.id}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {(Object.keys(statusLabel) as PlotStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: statusFill[s] }} />
              {statusLabel[s]} ({counts[s]})
            </span>
          ))}
          <span>
            {filtering ? `Showing ${matches.size} of ${plots.length} villas` : `${plots.length} villas`}
          </span>
        </div>
      </div>

      <aside className="rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-24 lg:self-start">
        {selected ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted">{selected.block} block</p>
              <h2 className="text-2xl font-semibold">Villa {selected.id}</h2>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Type" value={selectedType?.name ?? TBC} />
              <Info label="Facing" value={selected.facing ?? TBC} />
              <Info label="Status" value={statusLabel[selected.status]} />
              <Info label="Price" value={selected.price ?? "On request"} />
            </dl>
            <div className="flex flex-col gap-2">
              {selectedType && (
                <Link
                  href={`/villas/${selectedType.slug}`}
                  className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-brand-contrast"
                >
                  View villa tour & floor plans
                </Link>
              )}
              {selected.status === "available" && (
                <a
                  href={whatsappLink(`Hi, I'm interested in villa ${selected.id} at ${project.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-4 py-2 text-center text-sm font-medium"
                >
                  Enquire about villa {selected.id}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted">
            <h2 className="mb-2 text-lg font-semibold text-foreground">Select a villa</h2>
            Tap any villa on the layout to see its details and availability. Use + to zoom in and see villa numbers.
          </div>
        )}
      </aside>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      >
        {children}
      </select>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
