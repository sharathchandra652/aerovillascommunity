import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";
import { Placeholder } from "@/components/Media";
import { project } from "@/data/project";

export const metadata: Metadata = { title: `Contact — ${project.name}` };

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-32 pt-24 lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Book a site visit</h1>
        <p className="text-muted">Share your details and our team will reach out.</p>
        <EnquiryForm />
        <div className="text-sm">
          <p>
            <a href={`tel:${project.phone.replace(/\s/g, "")}`} className="text-brand">
              {project.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${project.email}`} className="text-brand">
              {project.email}
            </a>
          </p>
          <p className="text-muted">{project.address}</p>
        </div>
      </div>
      <div>
        {project.mapEmbedUrl ? (
          <iframe
            src={project.mapEmbedUrl}
            title={`${project.name} location`}
            className="aspect-square w-full rounded-xl border border-border"
            loading="lazy"
          />
        ) : (
          <Placeholder label="Location map coming soon" className="aspect-square" />
        )}
      </div>
    </div>
  );
}
