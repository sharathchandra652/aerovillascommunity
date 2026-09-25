import type { Metadata } from "next";
import ExteriorViewer from "@/components/ExteriorViewer";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Exterior — ${project.name}` };

export default function ExteriorPage() {
  return (
    <main className="h-dvh bg-black">
      <ExteriorViewer shots={project.exterior} />
    </main>
  );
}
