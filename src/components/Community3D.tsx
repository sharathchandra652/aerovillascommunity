"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Sky } from "three/addons/objects/Sky.js";
import { getVillaType, project, whatsappLink } from "@/data/project";
import { MASTER_PLAN_VIEWBOX, plots, type Plot, type PlotStatus } from "@/data/plots";

// 3D community view and guided "Digi Tour".
//
// The aerial master layout is the ground. Every villa from the master plan is
// placed as a 3D villa (body with the real facade on its street side, roof
// overhang, roof garden) facing its street, with trees along the streets.
// Image pixels map 1:1 to world units (x → X, y → Z), centred on the origin.

const H = 27; // villa wall height
const FACADE_IMAGE = "/media/villas/facade-267.jpg";
const { width: MAP_W, height: MAP_H } = MASTER_PLAN_VIEWBOX;
const toWorld = (x: number, y: number) => ({ x: x - MAP_W / 2, z: y - MAP_H / 2 });
const DWELL_MS = 6500;

// Landmarks on the aerial render (image pixel coordinates)
const landmarks = [
  { label: "Clubhouse", x: 815, y: 440, h: 50 },
  { label: "Swimming pool", x: 885, y: 432, h: 16 },
  { label: "Sports courts", x: 670, y: 575, h: 16 },
  { label: "Children's park", x: 200, y: 565, h: 16 },
  { label: "Landscaped park", x: 1060, y: 448, h: 16 },
  { label: "Main entrance", x: 115, y: 528, h: 16 },
];

// Guided tour: camera and target in image pixels, plus height
type Stop = {
  title: string;
  text: string;
  camera: [number, number, number];
  target: [number, number, number];
  scene?: string; // exterior walkthrough scene with a render of this spot
  finale?: boolean;
};
const tourStops: Stop[] = [
  {
    title: `Welcome to ${project.name}`,
    text: "A gated villa community set among open green spaces. Let's take a look around.",
    camera: [620, 1500, 760],
    target: [1000, 560, 0],
  },
  {
    title: "Grand Entrance",
    text: "The gated entrance opens straight onto the tree-lined main avenue.",
    camera: [30, 610, 80],
    target: [330, 515, 5],
  },
  {
    title: "Main Avenue",
    text: "The central avenue connects every villa street, the clubhouse and the play areas.",
    camera: [520, 610, 85],
    target: [960, 512, 0],
    scene: "main-avenue",
  },
  {
    title: "Clubhouse & Pool",
    text: "The clubhouse with its swimming pool and landscaped deck, at the heart of the community.",
    camera: [690, 600, 140],
    target: [840, 445, 15],
  },
  {
    title: "Sports & Play",
    text: "Sports courts and a children's play area, a short walk from every home.",
    camera: [540, 700, 95],
    target: [670, 575, 0],
  },
  {
    title: "Villa Streets",
    text: "Tree-lined streets with villas on both sides, each with its own car porch and garden.",
    camera: [1148, 1030, 75],
    target: [1148, 660, 8],
    scene: "villa-avenue",
  },
  {
    title: "North-East Villas",
    text: "A quieter cluster of villas facing open greenery along the eastern edge.",
    camera: [1620, 250, 140],
    target: [1340, 380, 0],
  },
  {
    title: "Landscaped Park",
    text: "Lawns and walking trails beside the clubhouse for evening strolls.",
    camera: [960, 610, 95],
    target: [1060, 450, 0],
  },
  {
    title: "Find your villa",
    text: "Tap any villa to see its details, or explore the master plan and book a site visit.",
    camera: [1000, 1450, 900],
    target: [1000, 560, 0],
    finale: true,
  },
];

type Filter = { type: string; facing: string; status: string };
const NO_FILTER: Filter = { type: "all", facing: "all", status: "all" };
const matchesFilter = (p: Plot, f: Filter) =>
  (f.type === "all" || p.type === f.type) &&
  (f.facing === "all" || p.facing === f.facing) &&
  (f.status === "all" || p.status === f.status);

const statusColor: Record<PlotStatus, string> = { available: "#2e8b57", booked: "#d99a2b", sold: "#b54a4a" };
const statusLabel: Record<PlotStatus, string> = { available: "Available", booked: "Booked", sold: "Sold" };
const HOME_CAMERA = new THREE.Vector3(-80, 620, 760);

type Pose = { plot: Plot; x: number; z: number; width: number; depth: number; rot: number; nx: number; nz: number };

// Work out each villa's footprint, which way its street is, and its rotation.
function computePoses(): Pose[] {
  const raw = plots.map((plot) => {
    const pts = plot.points.split(" ").map((s) => s.split(",").map(Number));
    const [p0, p1, , p3] = pts;
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const across = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const along = Math.hypot(p3[0] - p0[0], p3[1] - p0[1]);
    const dx = (p3[0] - p0[0]) / along;
    const dy = (p3[1] - p0[1]) / along;
    return { plot, cx, cy, across, along, dx, dy };
  });

  return raw.map((r) => {
    // nearest villa to the left / right in the same row
    let left = Infinity;
    let right = Infinity;
    for (const o of raw) {
      if (o === r || Math.abs(o.cy - r.cy) > r.along * 0.6) continue;
      const d = r.cx - o.cx;
      if (d > 0) left = Math.min(left, d);
      else right = Math.min(right, -d);
    }
    // Back-to-back partner on one side → street on the other. Otherwise face the
    // side with villas across the street.
    const pair = r.across * 1.5;
    const face = left < pair ? 1 : right < pair ? -1 : right <= left ? 1 : -1;
    const nx = face > 0 ? r.dy : -r.dy;
    const nz = face > 0 ? -r.dx : r.dx;
    const w = toWorld(r.cx, r.cy);
    return {
      plot: r.plot,
      x: w.x,
      z: w.z,
      width: r.along - 1.5,
      depth: r.across - 1,
      rot: Math.atan2(nx, nz),
      nx,
      nz,
    };
  });
}

// Fallback facade drawn on a canvas, shown until the facade photo has loaded.
function makeFacadeTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  const floorH = c.height / 3;
  g.fillStyle = "#f2eee7";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#8e908c";
  g.fillRect(40, floorH, 90, floorH);
  g.fillStyle = "#a9743f";
  for (let x = 8; x < 36; x += 6) g.fillRect(x, 8, 3, c.height * 0.66);
  for (let f = 0; f < 3; f++) {
    g.fillStyle = "#3a4a55";
    g.fillRect(140, f * floorH + 14, 100, floorH - 26);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Villa side / back wall: plain render with a slim window per floor and a stone strip.
function makeSideTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  const floorH = c.height / 3;
  g.fillStyle = "#eeeae3";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#9a978f";
  g.fillRect(0, floorH, 46, floorH * 2);
  for (let f = 0; f < 3; f++) {
    const top = f * floorH;
    g.fillStyle = "#34424c";
    g.fillRect(150, top + 18, 56, floorH - 34);
    g.fillStyle = "#d9d3c8";
    g.fillRect(0, top + floorH - 5, c.width, 5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Clubhouse walls: two floors of glazing with white frames.
function makeClubTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f0efea";
  g.fillRect(0, 0, c.width, c.height);
  for (let f = 0; f < 2; f++) {
    const top = 30 + f * 110;
    const glass = g.createLinearGradient(0, top, 0, top + 80);
    glass.addColorStop(0, "#7f98a8");
    glass.addColorStop(1, "#2f3f4a");
    g.fillStyle = glass;
    g.fillRect(24, top, c.width - 48, 80);
    g.fillStyle = "#f0efea";
    for (let x = 24; x < c.width - 24; x += 58) g.fillRect(x, top, 4, 80);
  }
  g.fillStyle = "#a57649";
  g.fillRect(0, 0, c.width, 14);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function Community3D() {
  const mount = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const api = useRef<{
    reset: () => void;
    setAutoRotate: (on: boolean) => void;
    setAvailability: (on: boolean) => void;
    select: (id: string | null) => void;
    startTour: () => void;
    exitTour: () => void;
    goStop: (i: number) => void;
    setPlaying: (on: boolean) => void;
    setFilter: (f: Filter) => void;
    setNight: (on: boolean) => void;
  } | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [intro, setIntro] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [availability, setAvailability] = useState(false);
  const [selected, setSelected] = useState<Plot | null>(null);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [night, setNight] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilterState] = useState<Filter>(NO_FILTER);
  const filtering = filter.type !== "all" || filter.facing !== "all" || filter.status !== "all";
  const matchCount = plots.filter((p) => matchesFilter(p, filter)).length;
  function updateFilter(f: Filter) {
    setFilterState(f);
    api.current?.setFilter(f);
  }

  useEffect(() => {
    const container = mount.current!;
    const labelLayer = labelsRef.current!;
    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);

    // Renderer / scene / camera
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = track(new THREE.PMREMGenerator(renderer));
    scene.environment = track(pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
    scene.environmentIntensity = 0.45;
    scene.fog = new THREE.Fog("#c9d6df", 1000, 2600);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 2, 20000);
    camera.position.copy(HOME_CAMERA);

    // Physical sky with sun
    const sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(58), THREE.MathUtils.degToRad(-140));
    const sky = new Sky();
    sky.scale.setScalar(12000);
    const su = sky.material.uniforms;
    su.turbidity.value = 5;
    su.rayleigh.value = 1.4;
    su.mieCoefficient.value = 0.004;
    su.mieDirectionalG.value = 0.8;
    su.sunPosition.value.copy(sunDir);
    scene.add(sky);
    track(sky.geometry);
    track(sky.material);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(84);
    controls.minDistance = 40;
    controls.maxDistance = 1800;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    // Lights
    const hemi = new THREE.HemisphereLight("#dcecff", "#55663a", 0.9);
    scene.add(hemi);
    const sunLight = new THREE.DirectionalLight("#fff1dc", 2.6);
    sunLight.position.copy(sunDir).multiplyScalar(1400);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    Object.assign(sunLight.shadow.camera, { left: -1100, right: 1100, top: 800, bottom: -800, near: 100, far: 3200 });
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.6;
    scene.add(sunLight);

    // Ground: surrounding fields + the aerial layout
    const grassMat = track(new THREE.MeshLambertMaterial({ color: "#53592e" }));
    const grass = new THREE.Mesh(track(new THREE.PlaneGeometry(14000, 14000)), grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.6;
    grass.receiveShadow = true;
    scene.add(grass);

    const groundMat = track(new THREE.MeshLambertMaterial({ color: "#ffffff" }));
    const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(MAP_W, MAP_H)), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    new THREE.TextureLoader().load(project.layoutImage, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      groundMat.map = track(tex);
      groundMat.needsUpdate = true;
      setLoaded(true);
    });

    // ---- Villas (instanced: one draw call per part)
    const poses = computePoses();
    const N = poses.length;
    const unitBox = track(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
    const facadeMat = track(new THREE.MeshStandardMaterial({ map: track(makeFacadeTexture()), roughness: 0.75 }));
    const wallMat = track(new THREE.MeshStandardMaterial({ map: track(makeSideTexture()), roughness: 0.85 }));
    const roofMat = track(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9 }));
    const overhangMat = track(new THREE.MeshStandardMaterial({ color: "#6b4a30", roughness: 0.6 }));
    const gardenMat = track(new THREE.MeshStandardMaterial({ color: "#58743a", roughness: 1 }));

    // BoxGeometry face order: +x, -x, +y, -y, +z (street side), -z
    const body = new THREE.InstancedMesh(unitBox, [wallMat, wallMat, wallMat, wallMat, facadeMat, wallMat], N);
    const roofCap = new THREE.InstancedMesh(unitBox, roofMat, N);
    const overhang = new THREE.InstancedMesh(unitBox, overhangMat, N);
    const garden = new THREE.InstancedMesh(unitBox, gardenMat, N);
    for (const m of [body, roofCap, overhang, garden]) {
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
    }

    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const vPos = new THREE.Vector3();
    const vScale = new THREE.Vector3();
    const UP = new THREE.Vector3(0, 1, 0);
    function place(mesh: THREE.InstancedMesh, i: number, p: Pose, lx: number, ly: number, lz: number, sx: number, sy: number, sz: number) {
      q.setFromAxisAngle(UP, p.rot);
      vPos.set(lx, ly, lz).applyQuaternion(q);
      vPos.x += p.x;
      vPos.z += p.z;
      mesh.setMatrixAt(i, m4.compose(vPos, q, vScale.set(sx, sy, sz)));
    }
    const white = new THREE.Color("#ffffff");
    const roofNeutral = new THREE.Color("#bdb8ae");
    poses.forEach((p, i) => {
      const { width: w, depth: d } = p;
      place(body, i, p, 0, 0, 0, w, H, d);
      place(roofCap, i, p, 0, H, 0, w * 0.99, 0.8, d * 0.99);
      place(overhang, i, p, 0, H - 2.2, d * 0.2 + 2, w * 1.04, 1.3, d * 0.6);
      place(garden, i, p, 0, H + 0.8, -d * 0.28, w * 0.6, 1, d * 0.22);
      body.setColorAt(i, white);
      roofCap.setColorAt(i, roofNeutral);
    });

    // ---- Trees along the streets and in the parks
    const treeSpots: { x: number; z: number; s: number }[] = [];
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    poses.forEach((p) => {
      const off = p.depth / 2 + 5;
      treeSpots.push({ x: p.x + p.nx * off, z: p.z + p.nz * off, s: 0.8 + rand() * 0.45 });
    });
    const parks = [
      { x0: 140, y0: 545, x1: 285, y1: 592, n: 10 },
      { x0: 985, y0: 420, x1: 1150, y1: 482, n: 12 },
      { x0: 1120, y0: 300, x1: 1150, y1: 440, n: 6 },
    ];
    for (const pk of parks) {
      for (let k = 0; k < pk.n; k++) {
        const w = toWorld(pk.x0 + rand() * (pk.x1 - pk.x0), pk.y0 + rand() * (pk.y1 - pk.y0));
        treeSpots.push({ ...w, s: 0.9 + rand() * 0.6 });
      }
    }
    const trunkGeo = track(new THREE.CylinderGeometry(0.5, 0.8, 7, 6).translate(0, 3.5, 0));
    const canopyGeo = track(new THREE.IcosahedronGeometry(1, 1));
    const trunks = new THREE.InstancedMesh(trunkGeo, track(new THREE.MeshStandardMaterial({ color: "#6b5238" })), treeSpots.length);
    const canopies = new THREE.InstancedMesh(
      canopyGeo,
      track(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9, flatShading: true })),
      treeSpots.length,
    );
    const greens = ["#4f7a33", "#5d8a3a", "#6b9444", "#46702f", "#7a9a4a"].map((c) => new THREE.Color(c));
    treeSpots.forEach((t, i) => {
      q.identity();
      trunks.setMatrixAt(i, m4.compose(vPos.set(t.x, 0, t.z), q, vScale.set(t.s, t.s, t.s)));
      q.setFromAxisAngle(UP, rand() * Math.PI);
      canopies.setMatrixAt(i, m4.compose(vPos.set(t.x, 7 * t.s + 3.5 * t.s, t.z), q, vScale.set(5 * t.s, 5.8 * t.s, 5 * t.s)));
      canopies.setColorAt(i, greens[i % greens.length]);
    });
    for (const m of [trunks, canopies]) {
      m.castShadow = true;
      scene.add(m);
    }

    // ---- Clubhouse
    {
      const a = toWorld(765, 400);
      const b = toWorld(870, 495);
      const cw = b.x - a.x;
      const cd = b.z - a.z;
      const clubWall = track(new THREE.MeshStandardMaterial({ map: track(makeClubTexture()), roughness: 0.5, metalness: 0.1 }));
      const clubRoof = track(new THREE.MeshStandardMaterial({ color: "#b9b5ad", roughness: 0.9 }));
      const club = new THREE.Mesh(unitBox, [clubWall, clubWall, clubRoof, clubRoof, clubWall, clubWall]);
      club.scale.set(cw, 34, cd);
      club.position.set((a.x + b.x) / 2, 0, (a.z + b.z) / 2);
      // roof canopy overhang
      const canopy = new THREE.Mesh(unitBox, overhangMat);
      canopy.scale.set(cw + 8, 1.5, cd + 8);
      canopy.position.set(club.position.x, 34, club.position.z);
      for (const m of [club, canopy]) {
        m.castShadow = m.receiveShadow = true;
        scene.add(m);
      }
    }

    // Real facade photo replaces the drawn one once loaded
    new THREE.TextureLoader().load(FACADE_IMAGE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      facadeMat.map = track(tex);
      facadeMat.needsUpdate = true;
    });

    // ---- Selection / availability
    let showAvailability = false;
    let selectedIndex = -1;
    let filter: Filter = NO_FILTER;
    const dim = new THREE.Color("#8a8a86");
    const gold = new THREE.Color("#ffcf66");
    const statusCol = Object.fromEntries(
      (Object.keys(statusColor) as PlotStatus[]).map((s) => [s, new THREE.Color(statusColor[s])]),
    ) as Record<PlotStatus, THREE.Color>;
    const indexById = new Map(poses.map((p, i) => [p.plot.id, i]));

    function paint() {
      const filtering = filter.type !== "all" || filter.facing !== "all" || filter.status !== "all";
      poses.forEach((p, i) => {
        const match = matchesFilter(p.plot, filter);
        const sel = i === selectedIndex;
        body.setColorAt(i, sel ? gold : filtering && !match ? dim : white);
        roofCap.setColorAt(
          i,
          sel ? gold : filtering ? (match ? gold : dim) : showAvailability ? statusCol[p.plot.status] : roofNeutral,
        );
      });
      body.instanceColor!.needsUpdate = true;
      roofCap.instanceColor!.needsUpdate = true;
    }

    // Landmark labels (HTML, projected every frame)
    const labelEls = landmarks.map((l) => {
      const el = document.createElement("div");
      el.className =
        "pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white shadow backdrop-blur-sm";
      el.textContent = l.label;
      labelLayer.appendChild(el);
      const w = toWorld(l.x, l.y);
      return { el, pos: new THREE.Vector3(w.x, l.h, w.z) };
    });

    // ---- Camera flights
    type Flight = { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; start: number; dur: number; lift: number };
    let fly: Flight | null = null;
    function flyTo(position: THREE.Vector3, target: THREE.Vector3, dur = 1.6) {
      const dist = camera.position.distanceTo(position);
      fly = { from: camera.position.clone(), to: position, tFrom: controls.target.clone(), tTo: target, start: performance.now(), dur: dur * 1000, lift: Math.min(220, dist * 0.25) };
    }
    const stopVec = (s: [number, number, number]) => {
      const w = toWorld(s[0], s[1]);
      return new THREE.Vector3(w.x, s[2], w.z);
    };

    // ---- Guided tour
    let tour: { index: number; playing: boolean; arrivedAt: number | null } | null = null;
    function goStop(i: number) {
      const s = tourStops[i];
      tour = { index: i, playing: tour?.playing ?? true, arrivedAt: null };
      setTourIndex(i);
      setIntro(false);
      select(null, false);
      controls.autoRotate = false;
      setAutoRotate(false);
      flyTo(stopVec(s.camera), stopVec(s.target), i === 0 ? 2.6 : 3.4);
    }
    function setTourPlaying(on: boolean) {
      if (!tour) return;
      tour.playing = on;
      if (on) tour.arrivedAt = fly ? null : performance.now();
      setPlaying(on);
    }
    function startTour() {
      tour = { index: 0, playing: true, arrivedAt: null };
      setPlaying(true);
      goStop(0);
    }
    function exitTour() {
      tour = null;
      setTourIndex(null);
      setPlaying(false);
      flyTo(HOME_CAMERA.clone(), new THREE.Vector3(), 2.4);
    }

    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      setAutoRotate(false);
      setIntro(false);
      if (tour?.playing) setTourPlaying(false);
      fly = null;
    });

    // ---- Picking
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downAt: { x: number; y: number } | null = null;
    function pick(clientX: number, clientY: number) {
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects([body, roofCap], false)[0];
      return hit?.instanceId;
    }
    function select(id: string | null, flyThere = true) {
      selectedIndex = id ? (indexById.get(id) ?? -1) : -1;
      paint();
      setSelected(selectedIndex >= 0 ? poses[selectedIndex].plot : null);
      if (selectedIndex >= 0 && flyThere) {
        if (tour) {
          tour = null;
          setTourIndex(null);
          setPlaying(false);
        }
        const p = poses[selectedIndex];
        const target = new THREE.Vector3(p.x, H * 0.45, p.z);
        flyTo(new THREE.Vector3(p.x + p.nx * 150, 80, p.z + p.nz * 150), target);
        controls.autoRotate = false;
        setAutoRotate(false);
        setIntro(false);
      }
    }
    function onDown(e: PointerEvent) {
      downAt = { x: e.clientX, y: e.clientY };
    }
    function onUp(e: PointerEvent) {
      if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) return;
      const i = pick(e.clientX, e.clientY);
      select(i === undefined ? null : poses[i].plot.id);
    }
    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      renderer.domElement.style.cursor = pick(e.clientX, e.clientY) === undefined ? "grab" : "pointer";
    }
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onMove);

    // Day / night: moonlight, dark sky, glowing windows on the facades
    const nightBg = new THREE.Color("#0d1626");
    function applyNight(on: boolean) {
      sky.visible = !on;
      scene.background = on ? nightBg : null;
      (scene.fog as THREE.Fog).color.set(on ? "#0d1626" : "#c9d6df");
      hemi.intensity = on ? 0.25 : 0.9;
      hemi.color.set(on ? "#6f86b8" : "#dcecff");
      sunLight.intensity = on ? 0.35 : 2.6;
      sunLight.color.set(on ? "#9fb4ff" : "#fff1dc");
      scene.environmentIntensity = on ? 0.12 : 0.45;
      renderer.toneMappingExposure = on ? 1.1 : 0.9;
      facadeMat.emissive.set(on ? "#ffcf8a" : "#000000");
      facadeMat.emissiveMap = on ? facadeMat.map : null;
      facadeMat.emissiveIntensity = on ? 0.55 : 0;
      facadeMat.needsUpdate = true;
      groundMat.color.set(on ? "#8a98b8" : "#ffffff");
      grassMat.color.set(on ? "#1f2a22" : "#53592e");
    }

    api.current = {
      setFilter: (f) => {
        filter = f;
        paint();
      },
      setNight: applyNight,
      reset: () => {
        select(null);
        if (tour) exitTour();
        else flyTo(HOME_CAMERA.clone(), new THREE.Vector3());
      },
      setAutoRotate: (on) => (controls.autoRotate = on),
      setAvailability: (on) => {
        showAvailability = on;
        paint();
      },
      select: (id) => select(id),
      startTour,
      exitTour,
      goStop: (i) => goStop(Math.max(0, Math.min(tourStops.length - 1, i))),
      setPlaying: setTourPlaying,
    };

    // Resize
    const ro = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    // Start the tour straight away when linked with #tour
    const autoStart = window.location.hash === "#tour" ? setTimeout(startTour, 600) : undefined;

    // ---- Render loop
    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let raf = 0;
    function tick() {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.1);

      if (fly) {
        // time-based so flights finish on schedule even on slow devices
        const t = Math.min(1, (performance.now() - fly.start) / fly.dur);
        const k = ease(t);
        camera.position.lerpVectors(fly.from, fly.to, k);
        camera.position.y += Math.sin(Math.PI * k) * fly.lift;
        controls.target.lerpVectors(fly.tFrom, fly.tTo, k);
        if (t === 1) fly = null;
      } else if (tour) {
        if (tour.arrivedAt === null) tour.arrivedAt = performance.now();
        // slow cinematic orbit while a stop is shown
        tmp.copy(camera.position).sub(controls.target).applyAxisAngle(UP, dt * 0.05);
        camera.position.copy(controls.target).add(tmp);
        if (tour.playing && performance.now() - tour.arrivedAt > DWELL_MS) {
          if (tour.index < tourStops.length - 1) goStop(tour.index + 1);
          else setTourPlaying(false);
        }
      }

      controls.update();
      renderer.render(scene, camera);

      const { clientWidth: w, clientHeight: h } = container;
      for (const l of labelEls) {
        tmp.copy(l.pos).project(camera);
        const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
        l.el.style.display = visible ? "block" : "none";
        if (visible) l.el.style.transform = `translate(-50%, -100%) translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * h}px)`;
      }
    }
    tick();

    return () => {
      clearTimeout(autoStart);
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointermove", onMove);
      labelEls.forEach((l) => l.el.remove());
      [body, roofCap, overhang, garden, trunks, canopies].forEach((m) => m.dispose());
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
  }, []);

  const selectedType = selected?.type ? getVillaType(selected.type) : undefined;
  const stop = tourIndex !== null ? tourStops[tourIndex] : null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#9cc3e6]">
      <div ref={mount} className="absolute inset-0 touch-none" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

      {!loaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950 text-sm uppercase tracking-[0.3em] text-white">
          Loading 3D community…
        </div>
      )}

      {!stop && (
        <div className="pointer-events-none absolute left-4 top-20 text-white drop-shadow sm:left-6">
          <p className="text-xs uppercase tracking-[0.3em] opacity-90">3D Community View</p>
          <p className="mt-1 hidden text-sm opacity-90 sm:block">
            Drag to rotate · Right-drag to move · Scroll to zoom · Click a villa
          </p>
          <p className="mt-1 text-xs opacity-90 sm:hidden">Drag to rotate · Pinch to zoom · Tap a villa</p>
        </div>
      )}

      <div className="absolute right-4 top-20 flex flex-col items-end gap-2 sm:right-6">
        {!stop && (
          <button
            onClick={() => api.current?.startTour()}
            className="rounded-full bg-[#d4a843] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-950 shadow-lg hover:bg-[#e2b955]"
          >
            ▶ Digi Tour
          </button>
        )}
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
        {!stop && (
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
        )}
        <ToggleButton
          active={night}
          onClick={() => {
            const on = !night;
            setNight(on);
            api.current?.setNight(on);
          }}
        >
          {night ? "☾ Night" : "☀ Day"}
        </ToggleButton>
        <ToggleButton active={filterOpen || filtering} onClick={() => setFilterOpen((o) => !o)}>
          Find villa
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

      {/* Villa finder */}
      {filterOpen && (
        <div className="absolute right-4 top-[22rem] w-64 rounded-2xl bg-neutral-950/85 p-4 text-white shadow-2xl backdrop-blur sm:right-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.25em] text-[#d4a843]">Find your villa</p>
            <button onClick={() => setFilterOpen(false)} aria-label="Close finder" className="text-lg leading-none">
              ×
            </button>
          </div>
          <FinderSelect label="Villa type" value={filter.type} onChange={(v) => updateFilter({ ...filter, type: v })}>
            <option value="all">All types</option>
            <option value="267">267 sq.yd</option>
            <option value="567">567 sq.yd</option>
            <option value="600">600 sq.yd</option>
          </FinderSelect>
          <p className="mb-1 mt-3 text-xs text-white/70">Facing</p>
          <div className="grid grid-cols-5 gap-1">
            {["all", "East", "West", "North", "South"].map((f) => (
              <button
                key={f}
                onClick={() => updateFilter({ ...filter, facing: f })}
                className={`rounded-md py-1.5 text-xs ${filter.facing === f ? "bg-[#d4a843] text-neutral-950" : "bg-white/10 hover:bg-white/20"}`}
              >
                {f === "all" ? "Any" : f[0]}
              </button>
            ))}
          </div>
          <FinderSelect label="Status" value={filter.status} onChange={(v) => updateFilter({ ...filter, status: v })}>
            <option value="all">Any status</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="sold">Sold</option>
          </FinderSelect>
          <p className="mt-3 text-sm">
            <span className="font-semibold text-[#d4a843]">{matchCount}</span> of {plots.length} villas match
          </p>
          {filtering && matchCount === 0 && (
            <p className="mt-1 text-xs text-white/60">Villa types and facings are added once the sales list arrives.</p>
          )}
          {filtering && (
            <button onClick={() => updateFilter(NO_FILTER)} className="mt-2 text-xs text-white/70 underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Intro */}
      {loaded && intro && !stop && (
        <div className="absolute inset-x-4 bottom-28 mx-auto max-w-md rounded-2xl bg-neutral-950/80 p-5 text-center text-white shadow-2xl backdrop-blur sm:p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4a843]">Digi Tour</p>
          <h2 className="mt-2 text-xl font-light sm:text-2xl">Fly through {project.name}</h2>
          <p className="mt-2 text-sm opacity-80">A guided aerial tour of the entrance, clubhouse, parks and villa streets.</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => api.current?.startTour()}
              className="rounded-full bg-[#d4a843] px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-[#e2b955]"
            >
              ▶ Start Digi Tour
            </button>
            <button onClick={() => setIntro(false)} className="rounded-full border border-white/40 px-5 py-2.5 text-sm hover:bg-white/10">
              Explore myself
            </button>
          </div>
        </div>
      )}

      {/* Tour caption */}
      {stop && tourIndex !== null && (
        <div className="absolute inset-x-4 bottom-28 mx-auto max-w-lg rounded-2xl bg-neutral-950/80 p-5 text-white shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[#d4a843]">
            <span>
              Digi Tour · {tourIndex + 1} / {tourStops.length}
            </span>
            <button onClick={() => api.current?.exitTour()} className="text-white/70 hover:text-white" aria-label="Exit tour">
              Exit ✕
            </button>
          </div>
          <h2 className="mt-2 text-2xl font-light">{stop.title}</h2>
          <p className="mt-1 text-sm opacity-85">{stop.text}</p>
          {stop.finale ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/master-plan" className="rounded-full bg-[#d4a843] px-4 py-2 text-sm font-semibold text-neutral-950">
                Explore master plan
              </Link>
              <Link href="/contact" className="rounded-full border border-white/40 px-4 py-2 text-sm">
                Book a site visit
              </Link>
            </div>
          ) : (
            stop.scene && (
              <Link href={`/exterior#${stop.scene}`} className="mt-3 inline-block text-sm text-[#d4a843] underline-offset-4 hover:underline">
                See the street view →
              </Link>
            )
          )}
          <div className="mt-4 flex items-center gap-3">
            <TourButton label="Previous stop" onClick={() => api.current?.goStop(tourIndex - 1)} disabled={tourIndex === 0}>
              <path d="M15 5l-7 7 7 7" />
            </TourButton>
            <TourButton label={playing ? "Pause tour" : "Play tour"} onClick={() => api.current?.setPlaying(!playing)}>
              {playing ? <path d="M9 6v12M15 6v12" /> : <path d="M9 6l9 6-9 6z" fill="currentColor" />}
            </TourButton>
            <TourButton
              label="Next stop"
              onClick={() => api.current?.goStop(tourIndex + 1)}
              disabled={tourIndex === tourStops.length - 1}
            >
              <path d="M9 5l7 7-7 7" />
            </TourButton>
            <div className="ml-auto flex gap-1.5">
              {tourStops.map((s, i) => (
                <button
                  key={s.title}
                  aria-label={s.title}
                  onClick={() => api.current?.goStop(i)}
                  className={`h-1.5 rounded-full transition-all ${i === tourIndex ? "w-5 bg-[#d4a843]" : "w-1.5 bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected villa */}
      {selected && !stop && (
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

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function FinderSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-3 block text-xs text-white/70">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-white/20 bg-neutral-900 px-2 py-1.5 text-sm text-white"
      >
        {children}
      </select>
    </label>
  );
}

function TourButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-950 hover:bg-white/90 disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
