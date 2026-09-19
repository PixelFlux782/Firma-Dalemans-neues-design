"use client";

import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type PlannerValues = {
  roomWidth: number; roomLength: number; stageWidth: number; stageDepth: number;
  aisleWidth: number; leftSideAisle: number; rightSideAisle: number;
  chairWidth: number; chairDepth: number; rowSpacing: number;
  doorEnabled: boolean; doorWall: "front" | "back" | "left" | "right"; doorPosition: number; doorWidth: number; doorClearance: number;
  obstacleEnabled: boolean; obstacleX: number; obstacleY: number; obstacleWidth: number; obstacleDepth: number; obstacleClearance: number;
};

type NumericPlannerKey = "roomWidth" | "roomLength" | "stageWidth" | "stageDepth" | "aisleWidth" | "leftSideAisle" | "rightSideAisle" | "chairWidth" | "chairDepth" | "rowSpacing";

const fields: { key: NumericPlannerKey; label: string; min: number; max: number; step: number }[] = [
  { key: "roomWidth", label: "Raumbreite", min: 4, max: 30, step: 0.5 },
  { key: "roomLength", label: "Raumlänge", min: 5, max: 40, step: 0.5 },
  { key: "stageWidth", label: "Bühnenbreite", min: 1, max: 20, step: 0.5 },
  { key: "stageDepth", label: "Bühnentiefe", min: 1, max: 10, step: 0.5 },
  { key: "aisleWidth", label: "Mittelgangbreite", min: 0, max: 4, step: 0.1 },
  { key: "leftSideAisle", label: "Seitengang links", min: 0, max: 5, step: 0.1 },
  { key: "rightSideAisle", label: "Seitengang rechts", min: 0, max: 5, step: 0.1 },
  { key: "chairWidth", label: "Stuhlbreite", min: 0.3, max: 1, step: 0.05 },
  { key: "chairDepth", label: "Stuhltiefe", min: 0.3, max: 1.2, step: 0.05 },
  { key: "rowSpacing", label: "Reihenabstand", min: 0.6, max: 2, step: 0.1 },
];

const initialValues: PlannerValues = {
  roomWidth: 12, roomLength: 18, stageWidth: 6, stageDepth: 3, aisleWidth: 1.2,
  leftSideAisle: 0.8, rightSideAisle: 0.8, chairWidth: 0.5, chairDepth: 0.55, rowSpacing: 0.9,
  doorEnabled: false, doorWall: "back", doorPosition: 5.5, doorWidth: 1, doorClearance: 0.3,
  obstacleEnabled: false, obstacleX: 1, obstacleY: 8, obstacleWidth: 1, obstacleDepth: 1, obstacleClearance: 0.3,
};

type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

function getDoorGeometry(values: PlannerValues) {
  const horizontal = values.doorWall === "front" || values.doorWall === "back";
  const wallLength = horizontal ? values.roomWidth : values.roomLength;
  const along = -wallLength / 2 + values.doorPosition + values.doorWidth / 2;
  const x = horizontal ? along : values.doorWall === "left" ? -values.roomWidth / 2 : values.roomWidth / 2;
  const z = horizontal ? (values.doorWall === "front" ? -values.roomLength / 2 : values.roomLength / 2) : along;
  const clearanceCenterX = horizontal ? x : x + (values.doorWall === "left" ? 0.5 : -0.5);
  const clearanceCenterZ = horizontal ? z + (values.doorWall === "front" ? 0.5 : -0.5) : z;
  return { x, z, horizontal, wallLength, clearance: {
    minX: clearanceCenterX - (horizontal ? values.doorWidth : 1) / 2,
    maxX: clearanceCenterX + (horizontal ? values.doorWidth : 1) / 2,
    minZ: clearanceCenterZ - (horizontal ? 1 : values.doorWidth) / 2,
    maxZ: clearanceCenterZ + (horizontal ? 1 : values.doorWidth) / 2,
  } satisfies Rect };
}

function overlaps(a: Rect, b: Rect) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

function expandRect(rect: Rect, distance: number): Rect {
  return { minX: rect.minX - distance, maxX: rect.maxX + distance, minZ: rect.minZ - distance, maxZ: rect.maxZ + distance };
}

function ChairInstances({ positions, width, depth }: { positions: [number, number, number][]; width: number; depth: number }) {
  const { scene } = useGLTF("/models/dalemans-chair.glb");
  const instancesRef = useRef<THREE.InstancedMesh>(null);
  const model = useMemo(() => {
    scene.updateMatrixWorld(true);
    let foundMesh: THREE.Mesh | null = null;
    scene.traverse((object) => { if (!foundMesh && object instanceof THREE.Mesh) foundMesh = object; });
    const sourceMesh = foundMesh as THREE.Mesh | null;
    if (!sourceMesh) return null;
    const size = new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    const widthScale = width / Math.max(size.x, 0.001);
    const scale = new THREE.Matrix4().makeScale(widthScale, widthScale, depth / Math.max(size.z, 0.001));
    const bounds = new THREE.Box3().setFromObject(scene).applyMatrix4(scale);
    const center = bounds.getCenter(new THREE.Vector3());
    const normalize = new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z);
    return { geometry: sourceMesh.geometry, material: sourceMesh.material, baseMatrix: normalize.multiply(scale).multiply(sourceMesh.matrixWorld) };
  }, [depth, scene, width]);

  useLayoutEffect(() => {
    const mesh = instancesRef.current;
    if (!mesh || !model) return;
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    const world = new THREE.Matrix4();
    const unitScale = new THREE.Vector3(1, 1, 1);
    positions.forEach(([x, y, z], index) => {
      position.set(x, y, z);
      world.compose(position, quaternion, unitScale).multiply(model.baseMatrix);
      mesh.setMatrixAt(index, world);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [model, positions]);

  if (!model || positions.length === 0) return null;
  return <instancedMesh ref={instancesRef} args={[model.geometry, model.material, positions.length]} castShadow receiveShadow />;
}

function AisleMarker({ x, z, width, length }: { x: number; z: number; width: number; length: number }) {
  if (width <= 0 || length <= 0) return null;
  return <mesh position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width, length]} /><meshBasicMaterial color="#b8aa8c" transparent opacity={0.28} depthWrite={false} /></mesh>;
}

function RoomScene({ values, positions }: { values: PlannerValues; positions: [number, number, number][] }) {
  const stageWidth = Math.min(values.stageWidth, values.roomWidth);
  const stageDepth = Math.min(values.stageDepth, values.roomLength);
  const seatingStart = -values.roomLength / 2 + stageDepth;
  const seatingLength = Math.max(0, values.roomLength - stageDepth);
  const door = getDoorGeometry(values);
  const expandedDoorClearance = expandRect(door.clearance, values.doorClearance);
  const obstacleClearance = expandRect({ minX: values.obstacleX - values.obstacleWidth / 2, maxX: values.obstacleX + values.obstacleWidth / 2, minZ: values.obstacleY - values.obstacleDepth / 2, maxZ: values.obstacleY + values.obstacleDepth / 2 }, values.obstacleClearance);
  return <>
    <color attach="background" args={["#f4f1e8"]} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[5, 10, 7]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[values.roomWidth, values.roomLength]} /><meshStandardMaterial color="#ded9ca" roughness={0.95} /></mesh>
    <gridHelper args={[Math.max(values.roomWidth, values.roomLength), Math.ceil(Math.max(values.roomWidth, values.roomLength)), "#aaa28e", "#cbc4b3"]} position={[0, 0.006, 0]} />
    <AisleMarker x={-values.roomWidth / 2 + Math.min(values.leftSideAisle, values.roomWidth) / 2} z={seatingStart + seatingLength / 2} width={Math.min(values.leftSideAisle, values.roomWidth)} length={seatingLength} />
    <AisleMarker x={values.roomWidth / 2 - Math.min(values.rightSideAisle, values.roomWidth) / 2} z={seatingStart + seatingLength / 2} width={Math.min(values.rightSideAisle, values.roomWidth)} length={seatingLength} />
    <AisleMarker x={0} z={seatingStart + seatingLength / 2} width={Math.min(values.aisleWidth, values.roomWidth)} length={seatingLength} />
    <mesh position={[0, 0.2, -values.roomLength / 2 + stageDepth / 2]} castShadow receiveShadow><boxGeometry args={[stageWidth, 0.4, stageDepth]} /><meshStandardMaterial color="#6e5a45" roughness={0.8} /></mesh>
    {values.doorEnabled ? <>
      <mesh position={[door.x, 0.035, door.z]}><boxGeometry args={[door.horizontal ? values.doorWidth : 0.08, 0.07, door.horizontal ? 0.08 : values.doorWidth]} /><meshStandardMaterial color="#256b78" /></mesh>
      <mesh position={[(door.clearance.minX + door.clearance.maxX) / 2, 0.018, (door.clearance.minZ + door.clearance.maxZ) / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[door.clearance.maxX - door.clearance.minX, door.clearance.maxZ - door.clearance.minZ]} /><meshBasicMaterial color="#55a8b5" transparent opacity={0.38} depthWrite={false} /></mesh>
      <mesh position={[(expandedDoorClearance.minX + expandedDoorClearance.maxX) / 2, 0.014, (expandedDoorClearance.minZ + expandedDoorClearance.maxZ) / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[expandedDoorClearance.maxX - expandedDoorClearance.minX, expandedDoorClearance.maxZ - expandedDoorClearance.minZ]} /><meshBasicMaterial color="#55a8b5" transparent opacity={0.16} depthWrite={false} /></mesh>
    </> : null}
    {values.obstacleEnabled ? <mesh position={[values.obstacleX, 0.5, values.obstacleY]} castShadow receiveShadow><boxGeometry args={[values.obstacleWidth, 1, values.obstacleDepth]} /><meshStandardMaterial color="#776f64" roughness={0.85} /></mesh> : null}
    {values.obstacleEnabled ? <mesh position={[values.obstacleX, 0.013, values.obstacleY]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[obstacleClearance.maxX - obstacleClearance.minX, obstacleClearance.maxZ - obstacleClearance.minZ]} /><meshBasicMaterial color="#776f64" transparent opacity={0.18} depthWrite={false} /></mesh> : null}
    <Suspense fallback={null}><ChairInstances positions={positions} width={values.chairWidth} depth={values.chairDepth} /></Suspense>
    <ContactShadows position={[0, 0.01, 0]} opacity={0.22} scale={Math.max(values.roomWidth, values.roomLength)} blur={2.2} far={4} />
    <OrbitControls makeDefault target={[0, 0, 0]} minDistance={5} maxDistance={45} maxPolarAngle={Math.PI / 2.05} />
  </>;
}

function calculateLayout(values: PlannerValues) {
  const warnings: string[] = [];
  const combinedAisles = values.leftSideAisle + values.aisleWidth + values.rightSideAisle;
  const seatingWidth = values.roomWidth - combinedAisles;
  const seatingDepth = values.roomLength - values.stageDepth;

  if (combinedAisles >= values.roomWidth) warnings.push("Die Gangbreiten belegen die gesamte Raumbreite oder mehr.");
  if (seatingWidth <= 0 || seatingDepth <= 0) warnings.push("Es bleibt keine nutzbare Restfläche für die Bestuhlung.");
  if (values.stageWidth > values.roomWidth || values.stageDepth >= values.roomLength) warnings.push("Die Bühne ist für die eingegebenen Raummaße zu groß.");
  if (values.doorEnabled) {
    const door = getDoorGeometry(values);
    if (values.doorWidth <= 0) warnings.push("Die Türbreite muss größer als 0 sein.");
    if (values.doorPosition < 0 || values.doorPosition + values.doorWidth > door.wallLength) warnings.push("Die Tür liegt außerhalb der gewählten Wand.");
  }
  if (values.obstacleEnabled) {
    const obstacle = { minX: values.obstacleX - values.obstacleWidth / 2, maxX: values.obstacleX + values.obstacleWidth / 2, minZ: values.obstacleY - values.obstacleDepth / 2, maxZ: values.obstacleY + values.obstacleDepth / 2 };
    if (values.obstacleWidth <= 0 || values.obstacleDepth <= 0) warnings.push("Die Hindernismaße müssen größer als 0 sein.");
    if (obstacle.minX < -values.roomWidth / 2 || obstacle.maxX > values.roomWidth / 2 || obstacle.minZ < -values.roomLength / 2 || obstacle.maxZ > values.roomLength / 2) warnings.push("Das Hindernis liegt außerhalb des Raumes.");
    const stageWidth = Math.min(values.stageWidth, values.roomWidth);
    const stage = { minX: -stageWidth / 2, maxX: stageWidth / 2, minZ: -values.roomLength / 2, maxZ: -values.roomLength / 2 + Math.min(values.stageDepth, values.roomLength) };
    if (overlaps(obstacle, stage)) warnings.push("Das Hindernis überlappt die Bühne.");
  }

  const leftBlockWidth = Math.max(0, values.roomWidth / 2 - values.aisleWidth / 2 - values.leftSideAisle);
  const rightBlockWidth = Math.max(0, values.roomWidth / 2 - values.aisleWidth / 2 - values.rightSideAisle);
  const chairsLeft = Math.max(0, Math.floor(leftBlockWidth / values.chairWidth));
  const chairsRight = Math.max(0, Math.floor(rightBlockWidth / values.chairWidth));
  const chairsPerRow = chairsLeft + chairsRight;
  const firstRowZ = -values.roomLength / 2 + values.stageDepth + 1 + values.chairDepth / 2;
  const lastRowZ = values.roomLength / 2 - 0.8 - values.chairDepth / 2;
  const rowPitch = Math.max(values.rowSpacing, values.chairDepth);
  const possibleRows = firstRowZ <= lastRowZ ? Math.floor((lastRowZ - firstRowZ) / rowPitch) + 1 : 0;
  if (chairsPerRow === 0 || possibleRows === 0) warnings.push("Es ist kein Platz für eine vollständige Stuhlreihe vorhanden.");

  const positions: [number, number, number][] = [];
  for (let row = 0; row < possibleRows && positions.length < 300; row += 1) {
    const z = firstRowZ + row * rowPitch;
    for (let column = 0; column < chairsLeft && positions.length < 300; column += 1) {
      positions.push([-values.aisleWidth / 2 - values.chairWidth / 2 - column * values.chairWidth, 0.01, z]);
    }
    for (let column = 0; column < chairsRight && positions.length < 300; column += 1)
      positions.push([values.aisleWidth / 2 + values.chairWidth / 2 + column * values.chairWidth, 0.01, z]);
  }
  const doorClearance = values.doorEnabled ? expandRect(getDoorGeometry(values).clearance, values.doorClearance) : null;
  const obstacle = values.obstacleEnabled ? expandRect({ minX: values.obstacleX - values.obstacleWidth / 2, maxX: values.obstacleX + values.obstacleWidth / 2, minZ: values.obstacleY - values.obstacleDepth / 2, maxZ: values.obstacleY + values.obstacleDepth / 2 }, values.obstacleClearance) : null;
  const filteredPositions = positions.filter(([x, , z]) => {
    const chair = { minX: x - values.chairWidth / 2, maxX: x + values.chairWidth / 2, minZ: z - values.chairDepth / 2, maxZ: z + values.chairDepth / 2 };
    return !(doorClearance && overlaps(chair, doorClearance)) && !(obstacle && overlaps(chair, obstacle));
  });
  return {
    positions: filteredPositions,
    rows: chairsPerRow ? possibleRows : 0,
    chairsPerRow,
    warnings: [...new Set(warnings)],
  };
}

export default function RoomPlanner() {
  const [values, setValues] = useState(initialValues);
  const layout = useMemo(() => calculateLayout(values), [values]);
  return <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
    <aside className="premium-card h-fit p-5 sm:p-6">
      <h2 className="font-display text-2xl font-medium text-premium-ink">Raum- und Bestuhlungsmaße</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-1">{fields.map((field) => <label key={field.key} className="grid gap-1.5 text-sm font-medium text-premium-charcoal"><span>{field.label}</span><span className="relative"><input type="number" min={field.min} max={field.max} step={field.step} value={values[field.key]} onChange={(event) => { const parsed = Number(event.target.value); if (Number.isFinite(parsed)) setValues((current) => ({ ...current, [field.key]: Math.min(field.max, Math.max(field.min, parsed)) })); }} className="min-h-11 w-full rounded-xl border border-premium-beige bg-white/80 px-3 pr-9 text-premium-ink outline-none transition focus:border-premium-sand focus:ring-2 focus:ring-premium-sand/30" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-premium-muted">m</span></span></label>)}</div>
      <fieldset className="mt-6 border-t border-premium-beige pt-5"><legend className="font-semibold text-premium-ink">Tür</legend><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={values.doorEnabled} onChange={(event) => setValues((current) => ({ ...current, doorEnabled: event.target.checked }))} />Tür aktiv</label>{values.doorEnabled ? <div className="mt-4 grid gap-4"><label className="grid gap-1.5 text-sm font-medium"><span>Wand</span><select aria-label="Wand" value={values.doorWall} onChange={(event) => setValues((current) => ({ ...current, doorWall: event.target.value as PlannerValues["doorWall"] }))} className="min-h-11 rounded-xl border border-premium-beige bg-white/80 px-3"><option value="front">vorne</option><option value="back">hinten</option><option value="left">links</option><option value="right">rechts</option></select></label><NumberInput label="Türposition" value={values.doorPosition} step={0.1} onChange={(doorPosition) => setValues((current) => ({ ...current, doorPosition }))} /><NumberInput label="Türbreite" value={values.doorWidth} step={0.1} onChange={(doorWidth) => setValues((current) => ({ ...current, doorWidth }))} /><NumberInput label="Türabstand" value={values.doorClearance} step={0.05} min={0} onChange={(doorClearance) => setValues((current) => ({ ...current, doorClearance }))} /></div> : null}</fieldset>
      <fieldset className="mt-6 border-t border-premium-beige pt-5"><legend className="font-semibold text-premium-ink">Hindernis</legend><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={values.obstacleEnabled} onChange={(event) => setValues((current) => ({ ...current, obstacleEnabled: event.target.checked }))} />Hindernis aktiv</label>{values.obstacleEnabled ? <div className="mt-4 grid gap-4"><NumberInput label="Hindernis X-Position" value={values.obstacleX} step={0.1} onChange={(obstacleX) => setValues((current) => ({ ...current, obstacleX }))} /><NumberInput label="Hindernis Y-Position" value={values.obstacleY} step={0.1} onChange={(obstacleY) => setValues((current) => ({ ...current, obstacleY }))} /><NumberInput label="Hindernisbreite" value={values.obstacleWidth} step={0.1} onChange={(obstacleWidth) => setValues((current) => ({ ...current, obstacleWidth }))} /><NumberInput label="Hindernistiefe" value={values.obstacleDepth} step={0.1} onChange={(obstacleDepth) => setValues((current) => ({ ...current, obstacleDepth }))} /><NumberInput label="Hindernisabstand" value={values.obstacleClearance} step={0.05} min={0} onChange={(obstacleClearance) => setValues((current) => ({ ...current, obstacleClearance }))} /></div> : null}</fieldset>
      {layout.warnings.length ? <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status"><p className="font-semibold">Planung prüfen</p><ul className="mt-1 list-disc space-y-1 pl-4">{layout.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}
      <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-premium-beige pt-5"><div className="rounded-xl bg-premium-warm p-3"><dt className="text-xs text-premium-muted">Reihen</dt><dd className="mt-1 text-2xl font-semibold text-premium-ink">{layout.rows}</dd></div><div className="rounded-xl bg-premium-warm p-3"><dt className="text-xs text-premium-muted">je Reihe</dt><dd className="mt-1 text-2xl font-semibold text-premium-ink">{layout.chairsPerRow}</dd></div><div className="rounded-xl bg-premium-warm p-3"><dt className="text-xs text-premium-muted">Stühle</dt><dd data-testid="chair-count" className="mt-1 text-2xl font-semibold text-premium-ink">{layout.positions.length}</dd></div></dl>
      {layout.positions.length === 300 ? <p className="mt-3 text-xs text-premium-muted">Darstellung auf 300 Stühle begrenzt.</p> : null}
    </aside>
    <section className="premium-card min-h-[32rem] overflow-hidden" aria-label="Interaktive 3D-Raumansicht"><div className="h-[32rem] sm:h-[38rem]"><Canvas shadows camera={{ position: [12, 13, 16], fov: 42, near: 0.1, far: 100 }} dpr={[1, 1.5]}><RoomScene values={values} positions={layout.positions} /></Canvas></div><p className="border-t border-premium-beige bg-white/70 px-5 py-3 text-xs text-premium-muted">Ziehen: drehen · Mausrad: zoomen · Rechtsklick: verschieben</p></section>
  </div>;
}

function NumberInput({ label, value, step, min, onChange }: { label: string; value: number; step: number; min?: number; onChange: (value: number) => void }) {
  return <label className="grid gap-1.5 text-sm font-medium text-premium-charcoal"><span>{label}</span><span className="relative"><input type="number" min={min} step={step} value={value} onChange={(event) => { const parsed = Number(event.target.value); if (Number.isFinite(parsed)) onChange(min === undefined ? parsed : Math.max(min, parsed)); }} className="min-h-11 w-full rounded-xl border border-premium-beige bg-white/80 px-3 pr-9 text-premium-ink outline-none transition focus:border-premium-sand focus:ring-2 focus:ring-premium-sand/30" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-premium-muted">m</span></span></label>;
}

useGLTF.preload("/models/dalemans-chair.glb");
