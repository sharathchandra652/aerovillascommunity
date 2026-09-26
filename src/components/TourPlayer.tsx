"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { project, villaTypes } from "@/data/project";
import { getScene, tourScenes, type Hotspot, type TourScene } from "@/data/tour";

// Full-screen exterior walkthrough: scene viewer (flat render or 360° panorama)
// with in-scene hotspots, a layout mini-map, scene list, auto-play and compass.

const AUTOPLAY_MS = 7000;
const MAP_W = 2000;
const MAP_H = 1125;

type MapMode = "open" | "min" | "closed";

export default function TourPlayer() {
  const router = useRouter();
  const [sceneId, setSceneId] = useState(tourScenes[0].id);
  const [history, setHistory] = useState<string[]>([]);
  const [fading, setFading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("open");
  const [mapZoom, setMapZoom] = useState(1);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const compass = useRef<HTMLDivElement>(null);

  const scene = getScene(sceneId) ?? tourScenes[0];
  const index = tourScenes.findIndex((s) => s.id === scene.id);

  const goTo = useCallback(
    (id: string, record = true) => {
      if (id === sceneId || !getScene(id)) return;
      setFading(true);
      setTimeout(() => {
        if (record) setHistory((h) => [...h, sceneId]);
        setSceneId(id);
        setMenuOpen(false);
        setMapExpanded(false);
        window.history.replaceState(null, "", `#${id}`);
        setTimeout(() => setFading(false), 60);
      }, 320);
    },
    [sceneId],
  );

  const step = useCallback(
    (delta: number) => goTo(tourScenes[(index + delta + tourScenes.length) % tourScenes.length].id),
    [goTo, index],
  );

  function back() {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      goTo(prev, false);
    } else {
      router.push("/");
    }
  }

  // Deep link (#scene-id), small-screen defaults
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const fromHash = window.location.hash.slice(1);
      if (fromHash && getScene(fromHash)) setSceneId(fromHash);
      if (window.innerWidth < 640) setMapMode("min");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => step(1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [autoplay, sceneId, step]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMapExpanded(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const stopAutoplay = useCallback(() => setAutoplay(false), []);
  const setHeading = useCallback((deg: number) => {
    if (compass.current) compass.current.style.transform = `rotate(${-deg}deg)`;
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-black text-white">
      {/* Scene */}
      {scene.kind === "pano" ? (
        <PanoView key={scene.id} scene={scene} onHotspot={goTo} onInteract={stopAutoplay} onHeading={setHeading} />
      ) : (
        <FlatView key={scene.id} scene={scene} onHotspot={goTo} onInteract={stopAutoplay} />
      )}
      <div
        className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-300 ${
          fading ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />

      {/* Title */}
      <h1 className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap text-sm font-medium tracking-wide drop-shadow sm:text-base">
        {scene.title}
      </h1>

      {/* Brand panel */}
      <div className="absolute left-3 top-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/90 p-2.5 shadow-2xl sm:left-6 sm:top-12 sm:gap-4 sm:p-3">
        <Link href="/" className="flex items-center gap-2.5 pl-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#d4a843] text-[11px] font-semibold tracking-wider text-[#d4a843] sm:h-11 sm:w-11 sm:text-xs">
            AV
          </span>
          <span className="hidden font-serif text-lg tracking-[0.18em] sm:block">{project.name.toUpperCase()}</span>
        </Link>
        <span className="h-9 w-px bg-white/20" />
        <IconButton label="Home" onClick={() => router.push("/")}>
          <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" fill="currentColor" stroke="none" />
        </IconButton>
        <IconButton label="Back" onClick={back}>
          <path d="M15 5l-7 7 7 7" />
        </IconButton>
      </div>

      {/* Scene list tab + drawer */}
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Open scene list"
        className="absolute left-0 top-32 flex h-14 w-12 items-center justify-center rounded-r-xl bg-neutral-700/80 hover:bg-neutral-600/90 sm:top-40"
      >
        <Chevron dir="right" />
      </button>
      <aside
        className={`absolute inset-y-0 left-0 z-20 w-72 max-w-[85vw] overflow-y-auto bg-neutral-950/95 p-4 shadow-2xl backdrop-blur transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4a843]">Explore</p>
          <button onClick={() => setMenuOpen(false)} aria-label="Close scene list" className="text-2xl leading-none">
            ×
          </button>
        </div>
        <ul className="space-y-2">
          {tourScenes.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => goTo(s.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm ${
                  s.id === scene.id ? "bg-[#d4a843] text-neutral-950" : "hover:bg-white/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" loading="lazy" />
                {s.title}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
          <Link href="/tour" className="block rounded-lg px-2 py-2 hover:bg-white/10">
            Community Tour →
          </Link>
          <Link href="/3d" className="block rounded-lg px-2 py-2 hover:bg-white/10">
            3D Community View →
          </Link>
          <Link href="/master-plan" className="block rounded-lg px-2 py-2 hover:bg-white/10">
            Master Plan →
          </Link>
          <p className="px-2 pt-2 text-xs uppercase tracking-[0.3em] text-[#d4a843]">360° Villa Tours</p>
          {villaTypes.map((v) => (
            <Link key={v.slug} href={`/villas/${v.slug}`} className="block rounded-lg px-2 py-2 hover:bg-white/10">
              {v.name} →
            </Link>
          ))}
        </div>
      </aside>
      {menuOpen && <div className="absolute inset-0 z-10" onClick={() => setMenuOpen(false)} />}

      {/* Prev / next */}
      <RoundButton className="left-3 sm:left-4" label="Previous scene" onClick={() => step(-1)}>
        <Chevron dir="left" />
      </RoundButton>
      <RoundButton className="right-3 sm:right-4" label="Next scene" onClick={() => step(1)}>
        <Chevron dir="right" />
      </RoundButton>

      {/* Fullscreen */}
      <button
        onClick={toggleFullscreen}
        aria-label="Full screen"
        className="absolute right-3 top-2 p-2 opacity-90 hover:opacity-100 sm:right-5"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.4}>
          <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
        </svg>
      </button>

      {/* Layout mini-map */}
      {mapMode === "closed" ? (
        <button
          onClick={() => setMapMode("open")}
          className="absolute right-3 top-28 rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-900 shadow-lg sm:right-5 sm:top-14"
        >
          Show layout
        </button>
      ) : (
        <div className="absolute right-3 top-28 w-[62vw] overflow-hidden rounded-lg bg-white shadow-2xl sm:right-5 sm:top-14 sm:w-[440px]">
          {mapMode === "open" && (
            <MiniMap scene={scene} zoom={mapZoom} onPick={goTo} className="aspect-[16/9] w-full" />
          )}
          <div className="flex items-center gap-2 px-3 py-2 text-neutral-900 sm:gap-3">
            <span className="mr-auto truncate text-xs font-medium sm:text-sm">{project.name} Layout</span>
            <MapButton label={mapMode === "open" ? "Minimise" : "Restore"} onClick={() => setMapMode(mapMode === "open" ? "min" : "open")}>
              {mapMode === "open" ? <path d="M5 12h14" /> : <path d="M5 15l7-7 7 7" />}
            </MapButton>
            <MapButton label="Zoom" onClick={() => setMapZoom((z) => (z === 1 ? 2 : z === 2 ? 3 : 1))}>
              <path d="M12 5v14M5 12h14" />
            </MapButton>
            <MapButton label="Expand" onClick={() => setMapExpanded(true)}>
              <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
            </MapButton>
            <MapButton label="Close layout" onClick={() => setMapMode("closed")}>
              <path d="M7 7l10 10M17 7L7 17" />
            </MapButton>
          </div>
        </div>
      )}

      {/* Expanded layout */}
      {mapExpanded && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setMapExpanded(false)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-xl bg-white text-neutral-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <MiniMap scene={scene} zoom={1} onPick={goTo} className="aspect-[16/9] w-full" labels />
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm font-medium">Tap a point to jump there</span>
              <div className="flex gap-2">
                <Link href="/master-plan" className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white">
                  Open master plan
                </Link>
                <button onClick={() => setMapExpanded(false)} className="rounded-lg border px-3 py-2 text-xs font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compass */}
      <div className="absolute bottom-6 right-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/25 backdrop-blur sm:bottom-8 sm:right-6 sm:h-24 sm:w-24">
        <div ref={compass} className="transition-transform duration-100">
          <svg viewBox="0 0 24 32" className="h-9 w-7">
            <path d="M12 1l8 16H4z" fill="#1e2b4f" />
            <circle cx="12" cy="22" r="8" fill="#1e2b4f" />
            <text x="12" y="25.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
              N
            </text>
          </svg>
        </div>
      </div>

      {/* Bottom dock */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border-2 border-white/70 bg-[#1e2b4f]/90 px-4 py-2.5 shadow-2xl backdrop-blur sm:gap-5 sm:px-6">
        <DockButton label="Scene list" onClick={() => setMenuOpen(true)}>
          <path d="M5 7h14M5 12h14M5 17h14" strokeWidth={2.6} />
        </DockButton>
        <DockButton label="Layout plan" onClick={() => setMapExpanded(true)}>
          <path d="M4 5h16v14H4zM4 11h7v8M11 5v4M15 11h5M15 11v8" strokeWidth={2} />
        </DockButton>
        <DockButton label={autoplay ? "Pause tour" : "Play tour"} onClick={() => setAutoplay((a) => !a)}>
          {autoplay ? (
            <path d="M9 6v12M15 6v12" strokeWidth={3} />
          ) : (
            <path d="M9 6l9 6-9 6z" fill="currentColor" />
          )}
        </DockButton>
      </div>

      {autoplay && (
        <div key={sceneId} className="absolute bottom-0 left-0 h-1 bg-[#d4a843]" style={{ animation: `tourbar ${AUTOPLAY_MS}ms linear forwards` }} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- viewers */

function HotspotPill({ hotspot, onClick }: { hotspot: Hotspot; onClick: () => void }) {
  const label = (hotspot.label ?? getScene(hotspot.to)?.title ?? hotspot.to).toUpperCase();
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group flex items-center gap-2 whitespace-nowrap rounded-full bg-[#f1bf2c] py-1.5 pl-1.5 pr-4 text-sm font-medium text-neutral-950 shadow-xl ring-4 ring-[#f1bf2c]/30 transition-transform hover:scale-105"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-[#f1bf2c]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M6 15l6-6 6 6" />
        </svg>
      </span>
      {label}
    </button>
  );
}

// Flat render: the image covers the screen with extra room to drag around, scroll/pinch zooms,
// and it drifts slowly side to side until the viewer touches it.
function FlatView({
  scene,
  onHotspot,
  onInteract,
}: {
  scene: TourScene;
  onHotspot: (id: string) => void;
  onInteract: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current!;
    const st = stage.current!;
    let iw = 0;
    let ih = 0;
    let zoom = 1;
    let ox = 0;
    let oy = 0;
    let touched = false;
    let raf = 0;
    const t0 = performance.now();
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchStart = 0;
    let zoomStart = 1;

    const size = () => {
      const base = Math.max(el.clientWidth / iw, el.clientHeight / ih) * 1.18;
      return { w: iw * base * zoom, h: ih * base * zoom };
    };
    const clamp = () => {
      const { w, h } = size();
      ox = Math.min(0, Math.max(el.clientWidth - w, ox));
      oy = Math.min(0, Math.max(el.clientHeight - h, oy));
    };
    const apply = () => {
      const { w, h } = size();
      clamp();
      st.style.width = `${w}px`;
      st.style.height = `${h}px`;
      st.style.transform = `translate(${ox}px, ${oy}px)`;
    };
    const centre = () => {
      const { w, h } = size();
      ox = (el.clientWidth - w) / 2;
      oy = (el.clientHeight - h) / 2;
    };
    const zoomAt = (next: number, cx: number, cy: number) => {
      const before = size();
      const nx = (cx - ox) / before.w;
      const ny = (cy - oy) / before.h;
      zoom = Math.min(3, Math.max(1, next));
      const after = size();
      ox = cx - nx * after.w;
      oy = cy - ny * after.h;
      apply();
    };
    const interact = () => {
      if (!touched) {
        touched = true;
        onInteract();
      }
    };

    const img = new Image();
    img.onload = () => {
      iw = img.naturalWidth;
      ih = img.naturalHeight;
      centre();
      apply();
      setReady(true);
      const drift = (t: number) => {
        raf = requestAnimationFrame(drift);
        if (touched) return;
        const { w } = size();
        const range = w - el.clientWidth;
        ox = -range / 2 - Math.sin((t - t0) / 6000) * (range / 2) * 0.9;
        apply();
      };
      raf = requestAnimationFrame(drift);
    };
    img.src = scene.image;

    function down(e: PointerEvent) {
      if ((e.target as HTMLElement).closest("button")) return; // let hotspot taps through
      interact();
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
        zoomStart = zoom;
      }
    }
    function move(e: PointerEvent) {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const r = el.getBoundingClientRect();
        zoomAt(zoomStart * (Math.hypot(a.x - b.x, a.y - b.y) / pinchStart), (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      } else {
        ox += e.clientX - prev.x;
        oy += e.clientY - prev.y;
        apply();
      }
    }
    function up(e: PointerEvent) {
      pointers.delete(e.pointerId);
    }
    function wheel(e: WheelEvent) {
      e.preventDefault();
      interact();
      const r = el.getBoundingClientRect();
      zoomAt(zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX - r.left, e.clientY - r.top);
    }
    const ro = new ResizeObserver(() => iw && apply());

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [scene.image, onInteract]);

  return (
    <div ref={box} className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing">
      <div ref={stage} className={`absolute left-0 top-0 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scene.image} alt={scene.title} draggable={false} className="h-full w-full" />
        {scene.hotspots.map((h) => (
          <div
            key={h.to + h.x + h.y}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.x ?? 50}%`, top: `${h.y ?? 50}%` }}
          >
            <HotspotPill hotspot={h} onClick={() => onHotspot(h.to)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// 360° panorama: equirectangular image on the inside of a sphere.
function PanoView({
  scene,
  onHotspot,
  onInteract,
  onHeading,
}: {
  scene: TourScene;
  onHotspot: (id: string) => void;
  onInteract: () => void;
  onHeading: (deg: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const spots = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = box.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.prepend(renderer.domElement);
    const sceneGL = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 1, 1100);
    const geo = new THREE.SphereGeometry(500, 60, 40);
    geo.scale(-1, 1, 1);
    const mat = new THREE.MeshBasicMaterial();
    new THREE.TextureLoader().load(scene.image, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      mat.map = t;
      mat.needsUpdate = true;
    });
    sceneGL.add(new THREE.Mesh(geo, mat));

    let lon = 0;
    let lat = 0;
    let touched = false;
    let drag: { x: number; y: number; lon: number; lat: number } | null = null;
    const dir = (yaw: number, pitch: number) => {
      const phi = THREE.MathUtils.degToRad(90 - pitch);
      const theta = THREE.MathUtils.degToRad(yaw);
      return new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)).multiplyScalar(400);
    };
    const spotPos = scene.hotspots.map((h) => dir(h.yaw ?? 0, h.pitch ?? 0));

    function down(e: PointerEvent) {
      if ((e.target as HTMLElement).closest("button")) return; // let hotspot taps through
      if (!touched) {
        touched = true;
        onInteract();
      }
      drag = { x: e.clientX, y: e.clientY, lon, lat };
      el.setPointerCapture(e.pointerId);
    }
    function move(e: PointerEvent) {
      if (!drag) return;
      lon = drag.lon - (e.clientX - drag.x) * 0.12;
      lat = Math.max(-80, Math.min(80, drag.lat + (e.clientY - drag.y) * 0.12));
    }
    function up() {
      drag = null;
    }
    function wheel(e: WheelEvent) {
      e.preventDefault();
      camera.fov = Math.max(35, Math.min(90, camera.fov + e.deltaY * 0.05));
      camera.updateProjectionMatrix();
    }
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("wheel", wheel, { passive: false });
    const ro = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    const v = new THREE.Vector3();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!touched) lon += 0.03;
      camera.lookAt(dir(lon, lat));
      renderer.render(sceneGL, camera);
      onHeading(lon);
      spotPos.forEach((p, i) => {
        const node = spots.current[i];
        if (!node) return;
        v.copy(p).project(camera);
        const visible = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2;
        node.style.display = visible ? "block" : "none";
        node.style.transform = `translate(-50%, -50%) translate(${(v.x * 0.5 + 0.5) * el.clientWidth}px, ${(-v.y * 0.5 + 0.5) * el.clientHeight}px)`;
      });
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("wheel", wheel);
      geo.dispose();
      mat.map?.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [scene, onInteract, onHeading]);

  return (
    <div ref={box} className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing">
      {scene.hotspots.map((h, i) => (
        <div
          key={h.to + i}
          ref={(n) => {
            spots.current[i] = n;
          }}
          className="absolute left-0 top-0"
        >
          <HotspotPill hotspot={h} onClick={() => onHotspot(h.to)} />
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- chrome */

function MiniMap({
  scene,
  zoom,
  onPick,
  className = "",
  labels = false,
}: {
  scene: TourScene;
  zoom: number;
  onPick: (id: string) => void;
  className?: string;
  labels?: boolean;
}) {
  // When zoomed, centre the view on the current scene's spot
  const focus = scene.map ?? { x: MAP_W / 2, y: MAP_H / 2 };
  const vw = MAP_W / zoom;
  const vh = MAP_H / zoom;
  const vx = Math.min(MAP_W - vw, Math.max(0, focus.x - vw / 2));
  const vy = Math.min(MAP_H - vh, Math.max(0, focus.y - vh / 2));

  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className={`block bg-neutral-200 ${className}`}>
      <image href={project.layoutImage} width={MAP_W} height={MAP_H} />
      {tourScenes
        .filter((s) => s.map)
        .map((s) => {
          const current = s.id === scene.id;
          const r = (current ? 26 : 18) / zoom;
          return (
            <g key={s.id} onClick={() => onPick(s.id)} className="cursor-pointer">
              {current && (
                <circle cx={s.map!.x} cy={s.map!.y} r={r * 2} fill="#2f7cf6" opacity={0.3}>
                  <animate attributeName="r" values={`${r};${r * 2.4}`} dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={s.map!.x} cy={s.map!.y} r={r} fill="#2f7cf6" stroke="#fff" strokeWidth={5 / zoom} />
              {labels && (
                <text
                  x={s.map!.x}
                  y={s.map!.y - r - 10}
                  textAnchor="middle"
                  fontSize={30}
                  fontWeight={600}
                  fill="#fff"
                  style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.7)", strokeWidth: 6 }}
                >
                  {s.title}
                </text>
              )}
              <title>{s.title}</title>
            </g>
          );
        })}
    </svg>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4a843]/60 bg-neutral-900 text-[#e8b931] hover:bg-neutral-800 sm:h-11 sm:w-11"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}

function RoundButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-neutral-900/60 hover:bg-neutral-900/80 sm:h-14 sm:w-14 ${className}`}
    >
      {children}
    </button>
  );
}

function MapButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="text-neutral-700 hover:text-neutral-950">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        {children}
      </svg>
    </button>
  );
}

function DockButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1e2b4f] shadow hover:scale-105 sm:h-14 sm:w-14"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
