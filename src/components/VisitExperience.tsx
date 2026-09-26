"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import EnquiryForm from "@/components/EnquiryForm";
import Logo from "@/components/Logo";
import { visitChapters as chapters } from "@/data/visit";

// A guided, first-person visit. The camera slowly walks into each render
// towards its focus point; moving on zooms through that point into the next
// place, so the visit reads as one continuous walk. Optional voice guide uses
// the browser's speech synthesis (no audio files, works offline).

const MIN_DWELL = 7000;
const MS_PER_WORD = 380;
const LEAVE_MS = 1100;

const dwellFor = (i: number) => Math.max(MIN_DWELL, chapters[i].narration.split(/\s+/).length * MS_PER_WORD);

export default function VisitExperience() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [voice, setVoice] = useState(false);
  const [menu, setMenu] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const spokenDone = useRef(true);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const chapter = chapters[index];
  const dwell = dwellFor(index);
  const last = index === chapters.length - 1;

  const go = useCallback(
    (to: number) => {
      if (to < 0 || to >= chapters.length || to === index) return;
      setLeaving(index);
      setIndex(to);
      setElapsed(0);
      setMenu(false);
      setTimeout(() => setLeaving(null), LEAVE_MS);
    },
    [index],
  );

  // Pick an English voice (Indian English if the device has one)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => {
      const vs = window.speechSynthesis.getVoices();
      voiceRef.current = vs.find((v) => v.lang === "en-IN") ?? vs.find((v) => v.lang.startsWith("en")) ?? null;
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  // Narrate each chapter
  useEffect(() => {
    if (!started || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (!voice) {
      spokenDone.current = true;
      return;
    }
    spokenDone.current = false;
    const u = new SpeechSynthesisUtterance(chapter.narration);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 0.95;
    u.onend = () => (spokenDone.current = true);
    u.onerror = () => (spokenDone.current = true);
    window.speechSynthesis.speak(u);
  }, [started, voice, chapter]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    if (playing) window.speechSynthesis.resume();
    else window.speechSynthesis.pause();
  }, [playing]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  // Clock: advance when the dwell has passed and the narration has finished
  useEffect(() => {
    if (!started || !playing || last) return;
    const t = setInterval(() => {
      setElapsed((e) => {
        const next = e + 200;
        if (next >= dwell && spokenDone.current) {
          setTimeout(() => go(index + 1), 0);
          return dwell;
        }
        return Math.min(next, dwell);
      });
    }, 200);
    return () => clearInterval(t);
  }, [started, playing, last, dwell, go, index]);

  // Keyboard
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, go, index]);

  function begin(withVoice: boolean) {
    setVoice(withVoice);
    setStarted(true);
    setPlaying(true);
  }

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-black text-white">
      {/* Scenes */}
      {chapters.map((c, i) => {
        const active = i === index;
        const isLeaving = i === leaving;
        const style: React.CSSProperties = {
          transformOrigin: `${c.focus.x}% ${c.focus.y}%`,
          opacity: active ? 1 : isLeaving ? 0 : 0,
          transform: active && started ? "scale(1.18)" : isLeaving ? "scale(1.8)" : "scale(1)",
          transition: active
            ? `transform ${dwellFor(i) + 4000}ms linear, opacity 900ms ease-out`
            : isLeaving
              ? `transform ${LEAVE_MS}ms ease-in, opacity ${LEAVE_MS}ms ease-in`
              : "none",
          zIndex: isLeaving ? 2 : active ? 1 : 0,
        };
        const near = Math.abs(i - index) <= 1 || isLeaving;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c.id}
            src={near || started ? c.image : undefined}
            alt={active ? c.title : ""}
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={style}
            draggable={false}
          />
        );
      })}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-black/80 via-black/10 to-black/50" />

      {/* Intro */}
      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55 px-6 text-center backdrop-blur-[2px]">
          <Logo className="h-28 drop-shadow-lg sm:h-40" />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#d4a843]">Your visit begins</p>
          <h1 className="mt-3 max-w-xl text-2xl font-light sm:text-4xl">Walk through Aero Villas as if you were here</h1>
          <p className="mt-3 max-w-md text-sm opacity-80">
            A guided visit of about three minutes: the entrance, Club Infinite, the parks, the villa streets and the homes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => begin(true)}
              className="rounded-full bg-[#d4a843] px-7 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-950 hover:bg-[#e2b955]"
            >
              ▶ Begin visit with voice guide
            </button>
            <button onClick={() => begin(false)} className="rounded-full border border-white/50 px-7 py-3 text-sm uppercase tracking-wider hover:bg-white/10">
              Begin without sound
            </button>
          </div>
          <Link href="/" className="mt-6 text-xs opacity-60 hover:opacity-100">
            Back to home
          </Link>
        </div>
      )}

      {started && (
        <>
          {/* Top: logo, chapter progress, exit */}
          <div className="absolute inset-x-0 top-0 z-10 px-4 pt-3 sm:px-6 sm:pt-4">
            <div className="flex gap-1">
              {chapters.map((c, i) => (
                <button key={c.id} aria-label={c.place} onClick={() => go(i)} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                  <span
                    className="block h-full bg-[#d4a843]"
                    style={{ width: i < index ? "100%" : i > index ? "0%" : `${last ? 100 : (elapsed / dwell) * 100}%` }}
                  />
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Link href="/" aria-label="Aero Villas home">
                <Logo className="h-9 drop-shadow sm:h-11" />
              </Link>
              <Link href="/tour" className="rounded-full border border-white/40 bg-black/30 px-4 py-1.5 text-xs backdrop-blur hover:bg-black/50">
                Exit visit
              </Link>
            </div>
          </div>

          {/* Caption */}
          <div key={chapter.id} className="visit-caption absolute inset-x-4 bottom-24 z-10 max-w-xl sm:bottom-28 sm:left-10">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#d4a843]">
              {String(index + 1).padStart(2, "0")} / {chapters.length} · {chapter.place}
            </p>
            <h2 className="mt-2 text-3xl font-light drop-shadow-lg sm:text-5xl">{chapter.title}</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-90 drop-shadow sm:text-base">{chapter.narration}</p>
            {chapter.links && (
              <div className="mt-4 flex flex-wrap gap-2">
                {chapter.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => window.speechSynthesis?.cancel()}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-white/90"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
            {chapter.booking && (
              <div className="mt-4 max-w-md text-neutral-900">
                <EnquiryForm />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-2 backdrop-blur-md sm:gap-3">
            <Control label="Previous" onClick={() => go(index - 1)} disabled={index === 0}>
              <path d="M15 5l-7 7 7 7" />
            </Control>
            <Control label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)} primary>
              {playing ? <path d="M9 6v12M15 6v12" /> : <path d="M9 6l9 6-9 6z" fill="currentColor" />}
            </Control>
            <Control label="Next" onClick={() => go(index + 1)} disabled={last}>
              <path d="M9 5l7 7-7 7" />
            </Control>
            <span className="mx-1 h-6 w-px bg-white/25" />
            <Control label={voice ? "Mute voice guide" : "Turn on voice guide"} onClick={() => setVoice((v) => !v)}>
              {voice ? (
                <path d="M4 10v4h4l5 4V6L8 10H4zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" />
              ) : (
                <path d="M4 10v4h4l5 4V6L8 10H4zM17 9l5 6M22 9l-5 6" />
              )}
            </Control>
            <Control label="All places" onClick={() => setMenu((m) => !m)}>
              <path d="M5 7h14M5 12h14M5 17h14" />
            </Control>
          </div>

          {/* Chapter list */}
          {menu && (
            <div className="absolute bottom-24 right-4 z-20 max-h-[60vh] w-64 overflow-y-auto rounded-2xl border border-white/15 bg-neutral-950/90 p-2 shadow-2xl backdrop-blur sm:right-8">
              {chapters.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => go(i)}
                  className={`flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm ${
                    i === index ? "bg-[#d4a843] text-neutral-950" : "hover:bg-white/10"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" className="h-9 w-14 shrink-0 rounded-md object-cover" loading="lazy" />
                  <span>
                    <span className="block text-[10px] opacity-60">{String(i + 1).padStart(2, "0")}</span>
                    {c.place}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Control({
  label,
  onClick,
  disabled = false,
  primary = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center rounded-full disabled:opacity-30 ${
        primary ? "h-12 w-12 bg-[#d4a843] text-neutral-950" : "h-10 w-10 hover:bg-white/15"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
