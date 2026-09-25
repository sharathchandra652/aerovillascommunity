// Plots shown on the interactive master plan.
// PLACEHOLDER LAYOUT: these shapes are a sample grid. Once the real master plan
// arrives, each plot's `points` is traced from the layout drawing (same viewBox)
// and the details come from the sales spreadsheet.

export type PlotStatus = "available" | "booked" | "sold";
export type Facing = "East" | "West" | "North" | "South";

export type Plot = {
  id: string;
  type: string; // villaTypes slug
  facing: Facing;
  status: PlotStatus;
  price?: string;
  corner?: boolean;
  points: string; // SVG polygon points in the master plan viewBox
};

export const MASTER_PLAN_VIEWBOX = { width: 1000, height: 640 };

function rect(x: number, y: number, w: number, h: number) {
  return `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
}

const statuses: PlotStatus[] = ["available", "available", "booked", "available", "sold"];

function row(
  prefix: string,
  count: number,
  y: number,
  h: number,
  w: number,
  type: string,
  facing: Facing,
  offset: number,
): Plot[] {
  const gap = 6;
  const startX = 60;
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${String(i + 1).padStart(2, "0")}`,
    type,
    facing,
    status: statuses[(i + offset) % statuses.length],
    corner: i === 0 || i === count - 1,
    points: rect(startX + i * (w + gap), y, w, h),
  }));
}

export const plots: Plot[] = [
  ...row("A", 12, 40, 110, 68, "267", "South", 0),
  ...row("B", 12, 200, 110, 68, "267", "North", 1),
  ...row("C", 8, 360, 110, 104, "567", "South", 2),
  ...row("D", 7, 500, 110, 120, "600", "North", 3),
];
