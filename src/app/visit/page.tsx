import type { Metadata } from "next";
import VisitExperience from "@/components/VisitExperience";
import { project } from "@/data/project";

export const metadata: Metadata = {
  title: `Visit ${project.name}`,
  description: `A guided walk through ${project.name}: the entrance, Club Infinite, the parks, villa streets and homes.`,
};

export default function VisitPage() {
  return <VisitExperience />;
}
