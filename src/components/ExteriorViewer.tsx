"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Shot = { src: string; caption: string };

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
    <div>
      <div
        ref={stage}
        className="relative aspect-video w-full overflow-hidden rounded-xl bg-black"
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
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <p className="text-sm sm:text-base">{shot.caption}</p>
          <span className="shrink-0 text-xs opacity-80">
            {index + 1} / {shots.length}
          </span>
        </div>

        <ArrowButton side="left" onClick={() => go(-1)} />
        <ArrowButton side="right" onClick={() => go(1)} />
        <button
          onClick={toggleFullscreen}
          className="absolute right-3 top-3 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-black/70"
        >
          Full screen
        </button>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {shots.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setIndex(i)}
            aria-label={s.caption}
            className={`shrink-0 overflow-hidden rounded-lg border-2 ${
              i === index ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" className="h-16 w-28 object-cover sm:h-20 sm:w-36" loading="lazy" />
          </button>
        ))}
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
        side === "left" ? "left-3" : "right-3"
      } flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-xl text-white hover:bg-black/70`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
