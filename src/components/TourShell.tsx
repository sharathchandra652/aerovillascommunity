"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { verticals } from "@/data/community";
import { project } from "@/data/project";

// Layout for the Community Tour pages: brand panel, a vertical rail of tour
// sections (a bottom strip on phones) and a full-screen stage.
export default function TourShell({
  title,
  eyebrow,
  children,
}: {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const activeId = verticals.find((v) => v.href !== "/" && path.startsWith(v.href.split("#")[0]))?.id;

  return (
    <div className="fixed inset-0 overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0">{children}</div>

      {/* Brand */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute left-3 top-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/85 p-2.5 shadow-2xl backdrop-blur sm:left-5 sm:top-5">
        <Link href="/tour" className="flex items-center gap-2.5 pl-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#d4a843] text-[11px] font-semibold tracking-wider text-[#d4a843]">
            AV
          </span>
          <span className="hidden font-serif text-base tracking-[0.18em] sm:block">{project.name.toUpperCase()}</span>
        </Link>
        <span className="h-8 w-px bg-white/20" />
        <Link
          href="/"
          aria-label="Home"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d4a843]/60 text-[#e8b931] hover:bg-neutral-800"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
          </svg>
        </Link>
        {path !== "/tour" && (
          <Link
            href="/tour"
            aria-label="Tour menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d4a843]/60 text-[#e8b931] hover:bg-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
              <path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z" />
            </svg>
          </Link>
        )}
      </div>

      {(title || eyebrow) && (
        <div className="pointer-events-none absolute left-1/2 top-[5.25rem] -translate-x-1/2 text-center drop-shadow sm:top-6">
          {eyebrow && <p className="text-[10px] uppercase tracking-[0.35em] text-[#d4a843]">{eyebrow}</p>}
          {title && <h1 className="mt-1 whitespace-nowrap text-sm font-medium tracking-wide sm:text-lg">{title}</h1>}
        </div>
      )}

      {/* Section rail: vertical on desktop, bottom strip on phones */}
      <nav
        aria-label="Tour sections"
        className="absolute inset-x-0 bottom-0 z-30 sm:inset-x-auto sm:bottom-auto sm:left-5 sm:top-1/2 sm:-translate-y-1/2"
      >
        <ul className="flex gap-1 overflow-x-auto border-t border-white/10 bg-neutral-950/85 p-2 backdrop-blur sm:flex-col sm:rounded-2xl sm:border">
          {verticals.map((v) => {
            const active = v.id === activeId;
            return (
              <li key={v.id}>
                <Link
                  href={v.href}
                  className={`group flex w-16 flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-[10px] leading-tight sm:w-20 ${
                    active ? "bg-[#d4a843] text-neutral-950" : "text-white/85 hover:bg-white/10"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    <path d={v.icon} />
                  </svg>
                  {v.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
