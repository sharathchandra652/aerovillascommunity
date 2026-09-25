"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getVillaType, project, whatsappLink } from "@/data/project";
import { MASTER_PLAN_VIEWBOX, plots, type Plot, type PlotStatus } from "@/data/plots";

// 3D community view: the aerial master layout as the ground, with every villa
// from the master plan raised as a building. Image pixels map 1:1 to world units
// (x → X, y → Z), centred on the origin.

const VILLA_HEIGHT = 30;
const { width: W, height: H } = MASTER_PLAN_VIEWBOX;
const toWorld = (x: number, y: number) => ({ x: x - W / 2, z: y - H / 2 });

// Landmarks on the aerial render (image pixel coordinates)
const landmarks = [
  { label: "Clubhouse", x: 815, y: 440 },
  { label: "Swimming pool", x: 885, y: 432 },
  { label: "Sports courts", x: 670, y: 575 },
  { label: "Children's park", x: 200, y: 565 },
  { label: "Landscaped park", x: 1060, y: 448 },
  { label: "Main entrance", x: 115, y: 528 },
];

// Non-villa buildings raised in 3D (image pixel footprint)
const buildings = [{ label: "Clubhouse", x0: 765, y0: 400, x1: 870, y1: 495, height: 44 }];

const statusColor: Record<PlotStatus, string> = {
  available: "#2e8b57",
  booked: "#d99a2b",
  sold: "#b54a4a",
};
const statusLabel: Record<PlotStatus, string> = { available: "Available", booked: "Booked", sold: "Sold" };

const HOME_CAMERA = new THREE.Vector3(-80, 620, 760);

// One villa bay (≈40 units wide × VILLA_HEIGHT tall) drawn on a canvas and tiled
// along the walls: three floors with glass, a grey stone panel and wood slats.
function makeFacadeTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 192;
  const g = c.getContext("2d")!;
  const floorH = c.height / 3;

  g.fillStyle = "#f2eee7";
  g.fillRect(0, 0, c.width, c.height);

  // grey stone panel and wood slats
  g.fillStyle = "#8e908c";
  g.fillRect(150, 0, 60, c.height);
  g.fillStyle = "#a9743f";
  for (let x = 214; x < 246; x += 6) g.fillRect(x, 8, 3, c.height - 8);

  for (let f = 0; f < 3; f++) {
    const top = f * floorH;
    // glass with a sky reflection
    const glass = g.createLinearGradient(0, top + 10, 0, top + floorH - 8);
    glass.addColorStop(0, "#6f8799");
    glass.addColorStop(1, "#2c3a44");
    g.fillStyle = glass;
    g.fillRect(14, top + 12, 118, floorH - 22);
    // mullions
    g.fillStyle = "#1f2529";
    for (const x of [14, 53, 92, 131]) g.fillRect(x, top + 12, 2, floorH - 22);
    // slab / balcony line
    g.fillStyle = "#d8d2c7";
    g.fillRect(0, top + floorH - 6, c.width, 6);
    // planter greenery on the upper floors
    if (f < 2) {
      g.fillStyle = "#5f7d3a";
      g.fillRect(14, top + floorH - 12, 118, 6);
    }
  }
  // parapet band
  g.fillStyle = "#e6e1d8";
  g.fillRect(0, 0, c.width, 6);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // ExtrudeGeometry side UVs are in world units: u along the wall, v up the height
  tex.repeat.set(1 / 40, 1 / VILLA_HEIGHT);
  tex.anisotropy = 8;
  return tex;
}

function parsePoints(points: string) {
  return points.split(" ").map((p) => {
    const [x, y] = p.split(",").map(Number);
    return toWorld(x, y);
  });
}

export default function Community3D() {
  const mount = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const api = useRef<{
    reset: () => void;
    setAutoRotate: (on: boolean) => void;
    setAvailability: (on: boolean) => void;
    select: (id: string | null) => void;
  } | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [availability, setAvailability] = useState(false);
  const [selected, setSelected] = useState<Plot | null>(null);

  useEffect(() => {
    const container = mount.current!;
    const labelLayer = labelsRef.current!;

    // Renderer / scene / camera
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const sky = document.createElement("canvas");
    sky.width = 2;
    sky.height = 256;
    const g = sky.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#3f6fb0");
    grad.addColorStop(0.6, "#9cc3e6");
    grad.addColorStop(1, "#dfe9ef");
    g.fillStyle = grad;
    g.fillRect(0, 0, 2, 256);
    const skyTex = new THREE.CanvasTexture(sky);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyTex;
    scene.fog = new THREE.Fog("#cfdde6", 900, 2600);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 5, 8000);
    camera.position.copy(HOME_CAMERA);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(80);
    controls.minDistance = 120;
    controls.maxDistance = 1800;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.target.set(0, 0, 0);
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      setAutoRotate(false);
    });

    // Lights
    scene.add(new THREE.HemisphereLight("#dcecff", "#4b5e34", 1.1));
    const sun = new THREE.DirectionalLight("#fff4e0", 2.2);
    sun.position.set(-700, 900, 500);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -1100, right: 1100, top: 700, bottom: -700, near: 100, far: 2500 });
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // Ground: surrounding grass + the aerial layout
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(12000, 12000),
      new THREE.MeshLambertMaterial({ color: "#5d7a3e" }),
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.6;
    grass.receiveShadow = true;
    scene.add(grass);

    const groundMat = new THREE.MeshLambertMaterial({ color: "#ffffff" });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    new THREE.TextureLoader().load(project.layoutImage, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      groundMat.map = tex;
      groundMat.needsUpdate = true;
      setLoaded(true);
    });

    // Villas — walls use a facade texture modelled on the renders
    const facade = makeFacadeTexture();
    const wallMat = new THREE.MeshStandardMaterial({ map: facade, roughness: 0.8 });
    const roofNeutral = new THREE.MeshStandardMaterial({ color: "#c9c6bf", roughness: 0.9 });
    const roofStatus = Object.fromEntries(
      (Object.keys(statusColor) as PlotStatus[]).map((s) => [
        s,
        new THREE.MeshStandardMaterial({ color: statusColor[s], roughness: 0.7 }),
      ]),
    ) as Record<PlotStatus, THREE.MeshStandardMaterial>;
    const selWall = new THREE.MeshStandardMaterial({
      map: facade,
      emissive: "#c8952e",
      emissiveIntensity: 0.35,
      roughness: 0.8,
    });
    const selRoof = new THREE.MeshStandardMaterial({ color: "#f2b53a", emissive: "#f2b53a", emissiveIntensity: 0.4 });

    let showAvailability = false;
    let selectedId: string | null = null;
    const villaMeshes = new Map<string, THREE.Mesh>();
    const byId = new Map(plots.map((p) => [p.id, p]));

    function materialsFor(p: Plot): THREE.Material[] {
      if (p.id === selectedId) return [selRoof, selWall];
      return [showAvailability ? roofStatus[p.status] : roofNeutral, wallMat];
    }

    function extrude(points: { x: number; z: number }[], height: number) {
      // Shape is drawn in X/Y then rotated so Y becomes -Z; negate z to keep orientation.
      const shape = new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, -p.z)));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
      geo.rotateX(-Math.PI / 2);
      return geo;
    }

    for (const p of plots) {
      const mesh = new THREE.Mesh(extrude(parsePoints(p.points), VILLA_HEIGHT), materialsFor(p));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.id = p.id;
      villaMeshes.set(p.id, mesh);
      scene.add(mesh);
    }

    const buildingMat = new THREE.MeshStandardMaterial({ color: "#e9e6e0", roughness: 0.8 });
    const buildingRoof = new THREE.MeshStandardMaterial({ color: "#9aa3a8", roughness: 0.6 });
    for (const b of buildings) {
      const pts = [toWorld(b.x0, b.y0), toWorld(b.x1, b.y0), toWorld(b.x1, b.y1), toWorld(b.x0, b.y1)];
      const mesh = new THREE.Mesh(extrude(pts, b.height), [buildingRoof, buildingMat]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }

    function refreshMaterials() {
      villaMeshes.forEach((mesh, id) => (mesh.material = materialsFor(byId.get(id)!)));
    }

    // Landmark labels (HTML, projected every frame)
    const labelEls = landmarks.map((l) => {
      const el = document.createElement("div");
      el.className =
        "pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white shadow backdrop-blur-sm";
      el.textContent = l.label;
      labelLayer.appendChild(el);
      const w = toWorld(l.x, l.y);
      return { el, pos: new THREE.Vector3(w.x, l.label === "Clubhouse" ? 60 : 20, w.z) };
    });

    // Picking: a click/tap that didn't drag selects a villa
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downAt: { x: number; y: number } | null = null;
    const meshList = [...villaMeshes.values()];

    function pick(clientX: number, clientY: number) {
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(meshList, false)[0]?.object as THREE.Mesh | undefined;
    }

    function onDown(e: PointerEvent) {
      downAt = { x: e.clientX, y: e.clientY };
    }
    function onUp(e: PointerEvent) {
      if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) return;
      const hit = pick(e.clientX, e.clientY);
      select(hit ? (hit.userData.id as string) : null);
    }
    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      renderer.domElement.style.cursor = pick(e.clientX, e.clientY) ? "pointer" : "grab";
    }
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onMove);

    // Camera fly-to animation
    let fly: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; t: number } | null =
      null;
    function flyTo(position: THREE.Vector3, target: THREE.Vector3) {
      fly = { from: camera.position.clone(), to: position, tFrom: controls.target.clone(), tTo: target, t: 0 };
    }

    function select(id: string | null) {
      selectedId = id;
      refreshMaterials();
      setSelected(id ? byId.get(id)! : null);
      if (id) {
        const box = new THREE.Box3().setFromObject(villaMeshes.get(id)!);
        const c = box.getCenter(new THREE.Vector3());
        const dir = camera.position.clone().sub(controls.target).setY(0).normalize();
        flyTo(c.clone().add(dir.multiplyScalar(160)).setY(170), c);
        controls.autoRotate = false;
        setAutoRotate(false);
      }
    }

    api.current = {
      reset: () => {
        select(null);
        flyTo(HOME_CAMERA.clone(), new THREE.Vector3());
      },
      setAutoRotate: (on) => (controls.autoRotate = on),
      setAvailability: (on) => {
        showAvailability = on;
        refreshMaterials();
      },
      select,
    };

    // Resize
    const ro = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    // Render loop
    const tmp = new THREE.Vector3();
    let raf = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    function tick() {
      raf = requestAnimationFrame(tick);
      if (fly) {
        fly.t = Math.min(1, fly.t + 0.025);
        const k = ease(fly.t);
        camera.position.lerpVectors(fly.from, fly.to, k);
        controls.target.lerpVectors(fly.tFrom, fly.tTo, k);
        if (fly.t === 1) fly = null;
      }
      controls.update();
      renderer.render(scene, camera);

      const { clientWidth: w, clientHeight: h } = container;
      for (const l of labelEls) {
        tmp.copy(l.pos).project(camera);
        const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
        l.el.style.display = visible ? "block" : "none";
        if (visible) {
          const x = (tmp.x * 0.5 + 0.5) * w;
          const y = (-tmp.y * 0.5 + 0.5) * h;
          l.el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
        }
      }
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointermove", onMove);
      labelEls.forEach((l) => l.el.remove());
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      facade.dispose();
      skyTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
  }, []);

  const selectedType = selected?.type ? getVillaType(selected.type) : undefined;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#9cc3e6]">
      <div ref={mount} className="absolute inset-0 touch-none" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0" />

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-sm uppercase tracking-[0.3em] text-white">
          Loading 3D community…
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-20 text-white drop-shadow sm:left-6">
        <p className="text-xs uppercase tracking-[0.3em] opacity-90">3D Community View</p>
        <p className="mt-1 hidden text-sm opacity-90 sm:block">
          Drag to rotate · Right-drag to move · Scroll to zoom · Click a villa
        </p>
        <p className="mt-1 text-xs opacity-90 sm:hidden">Drag to rotate · Pinch to zoom · Tap a villa</p>
      </div>

      <div className="absolute right-4 top-20 flex flex-col gap-2 sm:right-6">
        <ToggleButton
          active={availability}
          onClick={() => {
            const on = !availability;
            setAvailability(on);
            api.current?.setAvailability(on);
          }}
        >
          Availability
        </ToggleButton>
        <ToggleButton
          active={autoRotate}
          onClick={() => {
            const on = !autoRotate;
            setAutoRotate(on);
            api.current?.setAutoRotate(on);
          }}
        >
          Auto-rotate
        </ToggleButton>
        <ToggleButton active={false} onClick={() => api.current?.reset()}>
          Reset view
        </ToggleButton>
      </div>

      {availability && (
        <div className="absolute bottom-28 right-4 flex flex-col gap-1 rounded-xl bg-black/55 p-3 text-xs text-white backdrop-blur sm:right-6">
          {(Object.keys(statusColor) as PlotStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ background: statusColor[s] }} />
              {statusLabel[s]}
            </span>
          ))}
        </div>
      )}

      {selected && (
        <div className="absolute bottom-28 left-4 w-[calc(100%-2rem)] max-w-xs rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur sm:left-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted">{selected.block} block</p>
              <h2 className="text-xl font-semibold">Villa {selected.id}</h2>
            </div>
            <button onClick={() => api.current?.select(null)} aria-label="Close" className="text-xl leading-none text-muted">
              ×
            </button>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted">Type</dt>
              <dd className="font-medium">{selectedType?.name ?? "To be confirmed"}</dd>
            </div>
            <div>
              <dt className="text-muted">Facing</dt>
              <dd className="font-medium">{selected.facing ?? "To be confirmed"}</dd>
            </div>
            <div>
              <dt className="text-muted">Status</dt>
              <dd className="font-medium">{statusLabel[selected.status]}</dd>
            </div>
            <div>
              <dt className="text-muted">Price</dt>
              <dd className="font-medium">{selected.price ?? "On request"}</dd>
            </div>
          </dl>
          <div className="mt-3 flex flex-col gap-2">
            {selectedType && (
              <Link
                href={`/villas/${selectedType.slug}`}
                className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-brand-contrast"
              >
                Villa tour & floor plans
              </Link>
            )}
            <a
              href={whatsappLink(`Hi, I'm interested in villa ${selected.id} at ${project.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-4 py-2 text-center text-sm font-medium"
            >
              Enquire about villa {selected.id}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-medium backdrop-blur ${
        active ? "border-white bg-white text-brand" : "border-white/50 bg-black/45 text-white hover:bg-black/60"
      }`}
    >
      {children}
    </button>
  );
}
