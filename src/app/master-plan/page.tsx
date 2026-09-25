import type { Metadata } from "next";
import MasterPlan from "@/components/MasterPlan";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Master Plan — ${project.name}` };

export default function MasterPlanPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Master plan</h1>
      <p className="mb-6 mt-1 text-muted">Tap a villa to see its details and availability.</p>
      <MasterPlan />
    </div>
  );
}
