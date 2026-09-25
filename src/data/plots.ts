// Villas shown on the interactive master plan, drawn over /media/master-plan.jpg.
//
// Shapes are generated from the villa columns measured on the aerial render
// (2000×1125 px). Each column lists its top-left corner, where its left edge
// sits at the bottom (the render has slight perspective, so columns lean), the
// villa width, and how many villas it holds.
//
// Villa numbers are sequential for now. Type, facing, price and status come
// from the sales spreadsheet — until then every villa shows as "available"
// with type/facing "to be confirmed". Edit `details` below to fill them in.

export type PlotStatus = "available" | "booked" | "sold";
export type Facing = "East" | "West" | "North" | "South";

export type Plot = {
  id: string;
  block: string;
  type?: string; // villaTypes slug, e.g. "267"
  facing?: Facing;
  status: PlotStatus;
  price?: string;
  points: string; // SVG polygon points in the master plan viewBox
};

export const MASTER_PLAN_VIEWBOX = { width: 2000, height: 1125 };

type Column = {
  block: string;
  top: number; // y of the first villa's top edge
  bottom: number; // y of the last villa's bottom edge
  xTop: number; // left edge at `top`
  xBottom: number; // left edge at `bottom`
  width: number;
  count: number;
};

// Perspective lean in the south block, measured: ~0 at x≈800, ~0.15 px/px at x≈1650.
const lean = (x: number) => (x - 800) * 0.00018;

function southColumn(x0: number, x1: number, top: number, bottom: number): Column {
  // x0/x1 were measured at y≈650
  const s = lean(x0);
  return {
    block: "South",
    top,
    bottom,
    xTop: x0 + s * (top - 650),
    xBottom: x0 + s * (bottom - 650),
    width: x1 - x0,
    count: Math.round((bottom - top) / 25),
  };
}

const columns: Column[] = [
  // North-west row, along the northern road (left → right)
  { block: "North-West", top: 350, bottom: 507, xTop: 165, xBottom: 137, width: 40, count: 7 },
  { block: "North-West", top: 350, bottom: 507, xTop: 217, xBottom: 190, width: 42, count: 7 },
  { block: "North-West", top: 387, bottom: 507, xTop: 275, xBottom: 257, width: 41, count: 5 },
  { block: "North-West", top: 387, bottom: 507, xTop: 329, xBottom: 312, width: 42, count: 5 },
  { block: "North-West", top: 365, bottom: 505, xTop: 399, xBottom: 380, width: 40, count: 6 },
  { block: "North-West", top: 365, bottom: 505, xTop: 451, xBottom: 440, width: 40, count: 6 },
  { block: "North-West", top: 382, bottom: 500, xTop: 515, xBottom: 502, width: 38, count: 5 },
  { block: "North-West", top: 382, bottom: 500, xTop: 569, xBottom: 559, width: 39, count: 5 },
  { block: "North-West", top: 380, bottom: 497, xTop: 634, xBottom: 625, width: 38, count: 5 },
  { block: "North-West", top: 400, bottom: 497, xTop: 690, xBottom: 685, width: 38, count: 4 },

  // North-east cluster
  { block: "North-East", top: 227, bottom: 480, xTop: 1152, xBottom: 1167, width: 52, count: 8 },
  { block: "North-East", top: 187, bottom: 485, xTop: 1232, xBottom: 1255, width: 31, count: 7 },
  { block: "North-East", top: 225, bottom: 485, xTop: 1274, xBottom: 1296, width: 32, count: 6 },
  { block: "North-East", top: 270, bottom: 485, xTop: 1340, xBottom: 1362, width: 33, count: 5 },
  { block: "North-East", top: 309, bottom: 485, xTop: 1385, xBottom: 1402, width: 33, count: 4 },
  { block: "North-East", top: 350, bottom: 482, xTop: 1455, xBottom: 1470, width: 35, count: 3 },
  { block: "North-East", top: 370, bottom: 482, xTop: 1495, xBottom: 1505, width: 41, count: 4 },
  { block: "North-East", top: 419, bottom: 480, xTop: 1575, xBottom: 1578, width: 40, count: 2 },
  { block: "North-East", top: 447, bottom: 480, xTop: 1620, xBottom: 1621, width: 40, count: 1 },

  // South block (left → right), pairs of back-to-back columns
  southColumn(750, 793, 544, 770),
  southColumn(822, 864, 532, 935),
  southColumn(864, 906, 532, 945),
  southColumn(935, 977, 531, 895),
  southColumn(977, 1019, 531, 895),
  southColumn(1049, 1091, 529, 880),
  southColumn(1091, 1133, 529, 880),
  southColumn(1163, 1204, 527, 895),
  southColumn(1204, 1246, 527, 920),
  southColumn(1279, 1320, 525, 937),
  southColumn(1320, 1360, 525, 957),
  southColumn(1393, 1433, 523, 915),
  southColumn(1433, 1473, 523, 915),
  southColumn(1508, 1548, 520, 857),
  southColumn(1548, 1587, 520, 857),
  southColumn(1624, 1662, 520, 800),
  southColumn(1662, 1701, 520, 775),
  southColumn(1739, 1775, 520, 742),
  southColumn(1775, 1811, 545, 715),

  // East edge
  { block: "East", top: 595, bottom: 690, xTop: 1832, xBottom: 1840, width: 44, count: 3 },
];

// Per-villa details from the sales spreadsheet, keyed by villa id.
// Example: "12": { type: "267", facing: "East", status: "booked", price: "₹1.8 Cr" }
const details: Record<string, Partial<Omit<Plot, "id" | "block" | "points">>> = {};

function buildPlots(): Plot[] {
  const out: Plot[] = [];
  let n = 1;
  for (const c of columns) {
    const h = (c.bottom - c.top) / c.count;
    for (let i = 0; i < c.count; i++) {
      const y0 = c.top + i * h;
      const y1 = y0 + h - 1.5; // small gap between neighbours
      const xAt = (y: number) => c.xTop + ((c.xBottom - c.xTop) * (y - c.top)) / (c.bottom - c.top);
      const pts = [
        [xAt(y0), y0],
        [xAt(y0) + c.width, y0],
        [xAt(y1) + c.width, y1],
        [xAt(y1), y1],
      ]
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
      const id = String(n++);
      out.push({ id, block: c.block, status: "available", points: pts, ...details[id] });
    }
  }
  return out;
}

export const plots: Plot[] = buildPlots();
