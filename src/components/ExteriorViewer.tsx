"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Shot = { src: string; caption: string };

// Full-screen exterior view: one render at a time, arrows / swipe / keyboard to move.
export default function ExteriorViewer({ shots }: { shots: Shot[] }) {
  const [index, setIndex] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + shots.length) % shots.length),
    [shots.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else stage.current?.requestFullscreen?.();
  }

  const shot = shots[index];

  return (
    <div
      ref={stage}
      className="relative h-full w-full overflow-hidden bg-black text-white"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {shots.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.src}
          src={s.src}
          alt={s.caption}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "kenburns opacity-100" : "opacity-0"
          }`}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      <div className="absolute left-5 top-20 sm:left-6">
        <p className="text-xs uppercase tracking-[0.3em] opacity-80">Exterior</p>
        <h1 className="mt-1 text-xl font-light sm:text-2xl">{shot.caption}</h1>
      </div>

      <ArrowButton side="left" onClick={() => go(-1)} />
      <ArrowButton side="right" onClick={() => go(1)} />

      <div className="absolute inset-x-0 bottom-28 flex items-end justify-between gap-3 px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {shots.map((s, i) => (
            <button
              key={s.src}
              onClick={() => setIndex(i)}
              aria-label={s.caption}
              className={`shrink-0 overflow-hidden rounded-lg border-2 ${
                i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" className="h-12 w-20 object-cover sm:h-16 sm:w-28" loading="lazy" />
            </button>
          ))}
        </div>
        <button
          onClick={toggleFullscreen}
          className="shrink-0 rounded-full border border-white/50 bg-black/40 px-4 py-2 text-xs hover:bg-black/60"
        >
          Full screen
        </button>
      </div>
    </div>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous view" : "Next view"}
      className={`absolute top-1/2 -translate-y-1/2 ${
        side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6"
      } flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/40 text-2xl hover:bg-black/60`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
