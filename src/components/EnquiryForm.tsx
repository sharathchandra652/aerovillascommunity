"use client";

import { useState } from "react";
import { project, villaTypes, whatsappLink } from "@/data/project";

// Sends the enquiry via WhatsApp for now. Later this posts to the backend
// (database + email alert / CRM) — see docs/PROJECT_PLAN.md, Phase 4.
export default function EnquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(villaTypes[0]?.name ?? "");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = [
      `Enquiry for ${project.name}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Interested in: ${interest}`,
      message && `Message: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  }

  const input = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm";

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-surface p-5">
      <input className={input} placeholder="Your name" required value={name} onChange={(e) => setName(e.target.value)} />
      <input
        className={input}
        placeholder="Phone number"
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <select className={input} value={interest} onChange={(e) => setInterest(e.target.value)}>
        {villaTypes.map((v) => (
          <option key={v.slug}>{v.name}</option>
        ))}
        <option>Site visit</option>
      </select>
      <textarea
        className={input}
        rows={3}
        placeholder="Message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-contrast">
        Send enquiry on WhatsApp
      </button>
    </form>
  );
}
