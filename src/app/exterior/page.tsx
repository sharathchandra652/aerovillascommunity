import type { Metadata } from "next";
import Link from "next/link";
import ExteriorViewer from "@/components/ExteriorViewer";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Exterior — ${project.name}` };

export default function ExteriorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Exterior</h1>
      <p className="mb-6 mt-1 text-muted">
        Walk the streets of {project.name}. Use the arrows, swipe, or your keyboard to move between views.
      </p>
      <ExteriorViewer shots={project.exterior} />
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/master-plan" className="rounded-lg bg-brand px-5 py-3 text-sm font-medium text-brand-contrast">
          Find your villa on the master plan
        </Link>
        <Link href="/villas/267" className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium">
          Take a villa tour
        </Link>
      </div>
    </div>
  );
}
