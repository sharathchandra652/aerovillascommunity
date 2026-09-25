import type { Metadata } from "next";
import Community3D from "@/components/Community3D";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `3D Community — ${project.name}` };

export default function Community3DPage() {
  return (
    <main className="h-dvh">
      <Community3D />
    </main>
  );
}
