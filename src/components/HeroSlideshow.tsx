"use client";

import { useEffect, useState } from "react";

type Shot = { src: string; caption: string };

// Full-screen background: slow zoom on each render, cross-fading to the next.
export default function HeroSlideshow({ shots, interval = 7000 }: { shots: Shot[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shots.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % shots.length), interval);
    return () => clearInterval(t);
  }, [shots.length, interval]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
      {shots.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.src}
          src={s.src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
            i === index ? "kenburns opacity-100" : "opacity-0"
          }`}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/50" />
      <div className="absolute bottom-28 right-4 flex gap-1.5 sm:right-6">
        {shots.map((s, i) => (
          <button
            key={s.src}
            aria-label={s.caption}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
