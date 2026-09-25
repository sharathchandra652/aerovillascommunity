import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { project, whatsappLink } from "@/data/project";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${project.name} — Virtual Experience`,
  description: project.tagline,
};

const nav = [
  { href: "/master-plan", label: "Master Plan" },
  { href: "/villas/267", label: "Villas" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="whitespace-nowrap text-lg font-semibold tracking-tight text-brand">
              {project.name}
            </Link>
            <nav className="flex gap-4 overflow-x-auto text-sm sm:gap-6">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap text-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pb-20 pt-6 text-sm text-muted sm:flex-row sm:justify-between">
            <span>
              © {new Date().getFullYear()} {project.name} · {project.rera}
            </span>
            <span>
              {project.phone} · {project.email}
            </span>
          </div>
        </footer>
        <a
          href={whatsappLink(`Hi, I'm interested in ${project.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-40 rounded-full bg-available px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          WhatsApp
        </a>
      </body>
    </html>
  );
}
