import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Dock, TopBar } from "@/components/Chrome";
import { project } from "@/data/project";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <TopBar />
        {children}
        <Dock />
      </body>
    </html>
  );
}
