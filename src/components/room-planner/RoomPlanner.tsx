"use client";

import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";

type PlannerValues = { roomWidth: number; roomLength: number; stageWidth: number; stageDepth: number; aisleWidth: number; rowSpacing: number };

const fields: { key: keyof PlannerValues; label: string; min: number; max: number; step: number }[] = [
  { key: "roomWidth", label: "Raumbreite", min: 4, max: 30, step: 0.5 },
  { key: "roomLength", label: "Raumlänge", min: 5, max: 40, step: 0.5 },
  { key: "stageWidth", label: "Bühnenbreite", min: 1, max: 20, step: 0.5 },
  { key: "stageDepth", label: "Bühnentiefe", min: 1, max: 10, step: 0.5 },
  { key: "aisleWidth", label: "Mittelgangbreite", min: 0.6, max: 4, step: 0.1 },
  { key: "rowSpacing", label: "Reihenabstand", min: 0.6, max: 2, step: 0.1 },
];

const initialValues: PlannerValues = { roomWidth: 12, roomLength: 18, stageWidth: 6, stageDepth: 3, aisleWidth: 1.2, rowSpacing: 0.9 };

function ChairModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF("/models/dalemans-chair.glb");
  const chair = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    clone.scale.setScalar(0.5 / Math.max(size.x, 0.001));
    const scaledBounds = new THREE.Box3().setFromObject(clone);
    const center = scaledBounds.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -scaledBounds.min.y, -center.z);
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; }
    });
    return clone;
  }, [scene]);
  return <primitive object={chair} position={position} rotation={[0, Math.PI, 0]} />;
}

function RoomScene({ values, positions }: { values: PlannerValues; positions: [number, number, number][] }) {
  const stageWidth = Math.min(values.stageWidth, values.roomWidth - 0.4);
  const stageDepth = Math.min(values.stageDepth, values.roomLength - 1);
  return <>
    <color attach="background" args={["#f4f1e8"]} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[5, 10, 7]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[values.roomWidth, values.roomLength]} /><meshStandardMaterial color="#ded9ca" roughness={0.95} /></mesh>
    <gridHelper args={[Math.max(values.roomWidth, values.roomLength), Math.ceil(Math.max(values.roomWidth, values.roomLength)), "#aaa28e", "#cbc4b3"]} position={[0, 0.006, 0]} />
    <mesh position={[0, 0.2, -values.roomLength / 2 + stageDepth / 2]} castShadow receiveShadow><boxGeometry args={[stageWidth, 0.4, stageDepth]} /><meshStandardMaterial color="#6e5a45" roughness={0.8} /></mesh>
    <Suspense fallback={null}>{positions.map((position, index) => <ChairModel key={index} position={position} />)}</Suspense>
    <ContactShadows position={[0, 0.01, 0]} opacity={0.22} scale={Math.max(values.roomWidth, values.roomLength)} blur={2.2} far={4} />
    <OrbitControls makeDefault target={[0, 0, 0]} minDistance={5} maxDistance={45} maxPolarAngle={Math.PI / 2.05} />
  </>;
}

function calculateLayout(values: PlannerValues) {
  const chairPitch = 0.62;
  const sideMargin = 0.55;
  const stageDepth = Math.min(values.stageDepth, values.roomLength - 1);
  const blockWidth = Math.max(0, (values.roomWidth - values.aisleWidth - sideMargin * 2) / 2);
  const chairsPerBlock = Math.max(0, Math.floor(blockWidth / chairPitch));
  const firstRowZ = -values.roomLength / 2 + stageDepth + 1;
  const lastRowZ = values.roomLength / 2 - 0.8;
  const possibleRows = Math.max(0, Math.floor((lastRowZ - firstRowZ) / values.rowSpacing) + 1);
  const positions: [number, number, number][] = [];
  for (let row = 0; row < possibleRows && positions.length < 300; row += 1) {
    const z = firstRowZ + row * values.rowSpacing;
    for (const side of [-1, 1]) for (let column = 0; column < chairsPerBlock && positions.length < 300; column += 1) {
      positions.push([side * (values.aisleWidth / 2 + chairPitch / 2 + column * chairPitch), 0.01, z]);
    }
  }
  return { positions, rows: chairsPerBlock ? Math.ceil(positions.length / (chairsPerBlock * 2)) : 0 };
}

export default function RoomPlanner() {
  const [values, setValues] = useState(initialValues);
  const layout = useMemo(() => calculateLayout(values), [values]);
  return <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
    <aside className="premium-card h-fit p-5 sm:p-6">
      <h2 className="font-display text-2xl font-medium text-premium-ink">Raummaße</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-1">{fields.map((field) => <label key={field.key} className="grid gap-1.5 text-sm font-medium text-premium-charcoal"><span>{field.label}</span><span className="relative"><input type="number" min={field.min} max={field.max} step={field.step} value={values[field.key]} onChange={(event) => { const parsed = Number(event.target.value); if (Number.isFinite(parsed)) setValues((current) => ({ ...current, [field.key]: Math.min(field.max, Math.max(field.min, parsed)) })); }} className="min-h-11 w-full rounded-xl border border-premium-beige bg-white/80 px-3 pr-9 text-premium-ink outline-none transition focus:border-premium-sand focus:ring-2 focus:ring-premium-sand/30" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-premium-muted">m</span></span></label>)}</div>
      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-premium-beige pt-5"><div className="rounded-xl bg-premium-warm p-3"><dt className="text-xs text-premium-muted">Reihen</dt><dd className="mt-1 text-2xl font-semibold text-premium-ink">{layout.rows}</dd></div><div className="rounded-xl bg-premium-warm p-3"><dt className="text-xs text-premium-muted">Stühle</dt><dd className="mt-1 text-2xl font-semibold text-premium-ink">{layout.positions.length}</dd></div></dl>
      {layout.positions.length === 300 ? <p className="mt-3 text-xs text-premium-muted">Darstellung auf 300 Stühle begrenzt.</p> : null}
    </aside>
    <section className="premium-card min-h-[32rem] overflow-hidden" aria-label="Interaktive 3D-Raumansicht"><div className="h-[32rem] sm:h-[38rem]"><Canvas shadows camera={{ position: [12, 13, 16], fov: 42, near: 0.1, far: 100 }} dpr={[1, 1.5]}><RoomScene values={values} positions={layout.positions} /></Canvas></div><p className="border-t border-premium-beige bg-white/70 px-5 py-3 text-xs text-premium-muted">Ziehen: drehen · Mausrad: zoomen · Rechtsklick: verschieben</p></section>
  </div>;
}

useGLTF.preload("/models/dalemans-chair.glb");
