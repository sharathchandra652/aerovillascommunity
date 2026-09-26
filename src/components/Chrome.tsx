"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { usePathname } from "next/navigation";
import { project, whatsappLink } from "@/data/project";

// Pages that fill the whole screen with an image; the chrome floats over them in white.
const IMMERSIVE = ["/", "/3d"];
// Pages with their own full-screen controls (the walkthrough player)
const STANDALONE = ["/exterior", "/tour", "/visit"];
const isStandalone = (path: string) => STANDALONE.some((p) => path === p || path.startsWith(p + "/"));

const items = [
  { href: "/", label: "Home", icon: "M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
  { href: "/visit", label: "Visit", icon: "M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12zM12 11a2 2 0 100-4 2 2 0 000 4z" },
  { href: "/tour", label: "Tour", icon: "M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z" },
  { href: "/3d", label: "3D View", short: "3D", icon: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" },
  { href: "/exterior", label: "Exterior", icon: "M3 21h18M5 21V10l7-5 7 5v11M9 21v-5h6v5" },
  { href: "/master-plan", label: "Master Plan", short: "Plan", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { href: "/villas/267", match: "/villas", label: "Villas", icon: "M4 21V8l8-5 8 5v13M9 21v-6h6v6M4 12h16" },
  { href: "/gallery", label: "Gallery", icon: "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01" },
  { href: "/contact", label: "Enquire", icon: "M4 6h16v12H4zM4 7l8 6 8-6" },
];

export function TopBar() {
  const path = usePathname();
  if (isStandalone(path)) return null;
  const immersive = IMMERSIVE.includes(path);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6 ${
        immersive ? "text-white" : "border-b border-border bg-surface/90 text-foreground backdrop-blur"
      }`}
    >
      <Link href="/" aria-label={project.name} className={immersive ? "drop-shadow" : ""}>
        <Logo className="h-10 sm:h-12" />
      </Link>
      <div className="flex items-center gap-2">
        <a
          href={whatsappLink(`Hi, I'm interested in ${project.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden rounded-full border px-4 py-2 text-sm sm:block ${
            immersive ? "border-white/50 hover:bg-white/10" : "border-border hover:bg-background"
          }`}
        >
          WhatsApp
        </a>
        <Link
          href="/contact"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            immersive ? "bg-white text-brand" : "bg-brand text-brand-contrast"
          }`}
        >
          Enquire now
        </Link>
      </div>
    </header>
  );
}

export function Dock() {
  const path = usePathname();
  if (isStandalone(path)) return null;
  return (
    <nav className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
      <ul className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-white/15 bg-neutral-900/80 p-1.5 text-white shadow-2xl backdrop-blur-md">
        {items.map((item) => {
          const active = item.match ? path.startsWith(item.match) : path === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex w-[2.85rem] flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] sm:w-20 sm:text-xs ${
                  active ? "bg-white text-brand" : "hover:bg-white/10"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span className="whitespace-nowrap">
                  {item.short ? (
                    <>
                      <span className="sm:hidden">{item.short}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
