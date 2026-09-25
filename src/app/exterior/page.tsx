import type { Metadata } from "next";
import TourPlayer from "@/components/TourPlayer";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Exterior Walkthrough — ${project.name}` };

export default function ExteriorPage() {
  return <TourPlayer />;
}
