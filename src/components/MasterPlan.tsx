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
  const [selected, setSelected] = useState<Plot | null>(null);

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

  const selectedType = selected ? getVillaType(selected.type) : undefined;
  const { width, height } = MASTER_PLAN_VIEWBOX;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap gap-3">
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
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="block h-auto w-full min-w-[640px]"
            role="img"
            aria-label="Interactive master plan"
          >
            {project.layoutImage ? (
              <image href={project.layoutImage} width={width} height={height} />
            ) : (
              <>
                <rect width={width} height={height} fill="#eef2ea" />
                {/* placeholder internal roads */}
                <rect x={40} y={155} width={920} height={40} fill="#d9d6cc" />
                <rect x={40} y={475} width={920} height={20} fill="#d9d6cc" />
                <rect x={40} y={315} width={920} height={40} fill="#d9d6cc" />
              </>
            )}
            {plots.map((p) => {
              const c = centroid(p.points);
              const active = matches.has(p.id);
              const isSelected = selected?.id === p.id;
              return (
                <g
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="cursor-pointer"
                  opacity={active ? 1 : 0.2}
                >
                  <polygon
                    points={p.points}
                    fill={statusFill[p.status]}
                    fillOpacity={project.layoutImage ? 0.55 : 0.85}
                    stroke={isSelected ? "#111" : "#fff"}
                    strokeWidth={isSelected ? 3 : 1.5}
                  >
                    <title>{`${p.id} · ${getVillaType(p.type)?.name} · ${p.facing} · ${statusLabel[p.status]}`}</title>
                  </polygon>
                  <text
                    x={c.x}
                    y={c.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fill="#fff"
                    pointerEvents="none"
                  >
                    {p.id}
                  </text>
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
          <span>Showing {matches.size} of {plots.length} villas</span>
        </div>
      </div>

      <aside className="rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-20 lg:self-start">
        {selected && selectedType ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted">Villa</p>
              <h2 className="text-2xl font-semibold">{selected.id}</h2>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Type" value={selectedType.name} />
              <Info label="Facing" value={selected.facing} />
              <Info label="Status" value={statusLabel[selected.status]} />
              <Info label="Price" value={selected.price ?? "On request"} />
              {selected.corner && <Info label="Corner plot" value="Yes" />}
            </dl>
            <div className="flex flex-col gap-2">
              <Link
                href={`/villas/${selectedType.slug}`}
                className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-brand-contrast"
              >
                View villa tour & floor plans
              </Link>
              {selected.status === "available" && (
                <a
                  href={whatsappLink(`Hi, I'm interested in villa ${selected.id} (${selectedType.name}) at ${project.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-4 py-2 text-center text-sm font-medium"
                >
                  Enquire about {selected.id}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted">
            <h2 className="mb-2 text-lg font-semibold text-foreground">Select a villa</h2>
            Tap any plot on the layout to see its type, facing, status and price, then take the villa tour.
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
