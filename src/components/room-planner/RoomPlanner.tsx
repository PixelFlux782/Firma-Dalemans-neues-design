"use client";

import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
type PlacementMode = "door" | "obstacle" | null;

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

function RoomScene({ values, positions, placementMode, onPlaceObstacle, onPlaceDoor }: { values: PlannerValues; positions: [number, number, number][]; placementMode: PlacementMode; onPlaceObstacle: (x: number, z: number) => void; onPlaceDoor: (x: number, z: number) => void }) {
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
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} onPointerDown={(event: ThreeEvent<PointerEvent>) => { if (placementMode === "obstacle" && event.button === 0) { event.stopPropagation(); onPlaceObstacle(event.point.x, event.point.z); } }}><planeGeometry args={[values.roomWidth, values.roomLength]} /><meshStandardMaterial color="#ded9ca" roughness={0.95} /></mesh>
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
    {placementMode === "door" ? <DoorPlacementTarget values={values} onPlace={onPlaceDoor} /> : null}
    {values.obstacleEnabled ? <mesh position={[values.obstacleX, 0.5, values.obstacleY]} castShadow receiveShadow><boxGeometry args={[values.obstacleWidth, 1, values.obstacleDepth]} /><meshStandardMaterial color="#776f64" roughness={0.85} /></mesh> : null}
    {values.obstacleEnabled ? <mesh position={[values.obstacleX, 0.013, values.obstacleY]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[obstacleClearance.maxX - obstacleClearance.minX, obstacleClearance.maxZ - obstacleClearance.minZ]} /><meshBasicMaterial color="#776f64" transparent opacity={0.18} depthWrite={false} /></mesh> : null}
    <Suspense fallback={null}><ChairInstances positions={positions} width={values.chairWidth} depth={values.chairDepth} /></Suspense>
    <ContactShadows position={[0, 0.01, 0]} opacity={0.22} scale={Math.max(values.roomWidth, values.roomLength)} blur={2.2} far={4} />
    <OrbitControls makeDefault enabled={placementMode === null} target={[0, 0, 0]} minDistance={5} maxDistance={45} maxPolarAngle={Math.PI / 2.05} />
  </>;
}

function DoorPlacementTarget({ values, onPlace }: { values: PlannerValues; onPlace: (x: number, z: number) => void }) {
  const horizontal = values.doorWall === "front" || values.doorWall === "back";
  const x = horizontal ? 0 : values.doorWall === "left" ? -values.roomWidth / 2 : values.roomWidth / 2;
  const z = horizontal ? (values.doorWall === "front" ? -values.roomLength / 2 : values.roomLength / 2) : 0;
  return <mesh position={[x, 1.2, z]} onPointerDown={(event: ThreeEvent<PointerEvent>) => { if (event.button === 0) { event.stopPropagation(); onPlace(event.point.x, event.point.z); } }}>
    <boxGeometry args={[horizontal ? values.roomWidth : 0.22, 2.4, horizontal ? 0.22 : values.roomLength]} />
    <meshBasicMaterial color="#c78b39" transparent opacity={0.26} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>;
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
  const [seatingOpen, setSeatingOpen] = useState(true);
  const [doorOpen, setDoorOpen] = useState(initialValues.doorEnabled);
  const [obstacleOpen, setObstacleOpen] = useState(initialValues.obstacleEnabled);
  const [placementMode, setPlacementMode] = useState<PlacementMode>(null);
  const layout = useMemo(() => calculateLayout(values), [values]);
  useEffect(() => {
    if (placementMode === null) return;
    const cancelPlacement = (event: KeyboardEvent) => { if (event.key === "Escape") setPlacementMode(null); };
    window.addEventListener("keydown", cancelPlacement);
    return () => window.removeEventListener("keydown", cancelPlacement);
  }, [placementMode]);
  const placeObstacle = (x: number, z: number) => {
    const halfWidth = Math.min(values.obstacleWidth, values.roomWidth) / 2;
    const halfDepth = Math.min(values.obstacleDepth, values.roomLength) / 2;
    const obstacleX = Math.max(-values.roomWidth / 2 + halfWidth, Math.min(values.roomWidth / 2 - halfWidth, x));
    const obstacleY = Math.max(-values.roomLength / 2 + halfDepth, Math.min(values.roomLength / 2 - halfDepth, z));
    setValues((current) => ({ ...current, obstacleX: Number(obstacleX.toFixed(2)), obstacleY: Number(obstacleY.toFixed(2)) }));
    setPlacementMode(null);
  };
  const placeDoor = (x: number, z: number) => {
    const horizontal = values.doorWall === "front" || values.doorWall === "back";
    const wallLength = horizontal ? values.roomWidth : values.roomLength;
    const along = horizontal ? x : z;
    const doorPosition = Math.max(0, Math.min(Math.max(0, wallLength - values.doorWidth), along + wallLength / 2 - values.doorWidth / 2));
    setValues((current) => ({ ...current, doorPosition: Number(doorPosition.toFixed(2)) }));
    setPlacementMode(null);
  };
  const renderFields = (keys: NumericPlannerKey[]) => fields.filter((field) => keys.includes(field.key)).map((field) => <NumberInput key={field.key} label={field.label} value={values[field.key]} min={field.min} max={field.max} step={field.step} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))} />);
  return <div className="grid items-start gap-4 lg:grid-cols-[12rem_minmax(0,1fr)_12rem] xl:grid-cols-[13.5rem_minmax(0,1fr)_13.5rem] xl:gap-5">
    <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1" aria-label="Raum- und Bestuhlungsmaße">
      <PlannerSection title="Raum">{renderFields(["roomWidth", "roomLength"])}</PlannerSection>
      <PlannerSection title="Bühne">{renderFields(["stageWidth", "stageDepth"])}</PlannerSection>
      <PlannerSection title="Bestuhlung" className="sm:col-span-2 lg:col-span-1" collapsible open={seatingOpen} onOpenChange={setSeatingOpen}>{renderFields(["chairWidth", "chairDepth", "rowSpacing", "aisleWidth", "leftSideAisle", "rightSideAisle"])}</PlannerSection>
    </aside>

    <div className="min-w-0 lg:sticky lg:top-24">
      <section className="premium-card overflow-hidden" aria-label="Interaktive 3D-Raumansicht">
        {placementMode ? <div className="border-b border-premium-beige bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900" role="status">{placementMode === "obstacle" ? "Position für Hindernis wählen – auf den Boden klicken" : "Türposition wählen – auf die markierte Wand klicken"} <span className="text-xs font-normal">(Esc zum Abbrechen)</span></div> : null}
        <div className={`h-[26rem] sm:h-[34rem] lg:h-[min(62vh,36rem)] lg:min-h-[29rem] ${placementMode ? "cursor-crosshair" : ""}`}><Canvas shadows camera={{ position: [12, 13, 16], fov: 42, near: 0.1, far: 100 }} dpr={[1, 1.5]}><RoomScene values={values} positions={layout.positions} placementMode={placementMode} onPlaceObstacle={placeObstacle} onPlaceDoor={placeDoor} /></Canvas></div>
        <p className="border-t border-premium-beige bg-white/70 px-4 py-2.5 text-xs text-premium-muted">{placementMode ? "Klicken: Position setzen · Esc: abbrechen" : "Ziehen: drehen · Mausrad: zoomen · Rechtsklick: verschieben"}</p>
      </section>
      <div className="premium-card mt-3 p-3 sm:p-4" aria-label="Planungsstatus">
        <dl className="grid grid-cols-3 gap-2"><StatusItem label="Reihen" value={layout.rows} /><StatusItem label="je Reihe" value={layout.chairsPerRow} /><StatusItem label="Stühle" value={layout.positions.length} testId="chair-count" /></dl>
        {layout.warnings.length ? <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="status"><p className="font-semibold">Planung prüfen</p><ul className="mt-1 list-disc space-y-0.5 pl-4">{layout.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}
        {layout.positions.length === 300 ? <p className="mt-2 text-xs text-premium-muted">Darstellung auf 300 Stühle begrenzt.</p> : null}
      </div>
    </div>

    <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1" aria-label="Tür und Hindernis">
      <PlannerSection title="Tür" status={values.doorEnabled ? "Aktiv" : "Inaktiv"} collapsible open={doorOpen} onOpenChange={setDoorOpen}>
        <ToggleInput label="Tür aktiv" checked={values.doorEnabled} onChange={(doorEnabled) => { setValues((current) => ({ ...current, doorEnabled })); if (doorEnabled) setDoorOpen(true); else if (placementMode === "door") setPlacementMode(null); }} />
        {values.doorEnabled ? <><label className="grid gap-1 text-xs font-medium text-premium-charcoal"><span>Wand</span><select aria-label="Wand" value={values.doorWall} onChange={(event) => setValues((current) => ({ ...current, doorWall: event.target.value as PlannerValues["doorWall"] }))} className="min-h-9 rounded-lg border border-premium-beige bg-white/80 px-2.5 text-sm"><option value="front">vorne</option><option value="back">hinten</option><option value="left">links</option><option value="right">rechts</option></select></label><NumberInput label="Türposition" value={values.doorPosition} step={0.1} onChange={(doorPosition) => setValues((current) => ({ ...current, doorPosition }))} /><NumberInput label="Türbreite" value={values.doorWidth} step={0.1} onChange={(doorWidth) => setValues((current) => ({ ...current, doorWidth }))} /><NumberInput label="Türabstand" value={values.doorClearance} step={0.05} min={0} onChange={(doorClearance) => setValues((current) => ({ ...current, doorClearance }))} /><PlacementButton active={placementMode === "door"} onClick={() => setPlacementMode((current) => current === "door" ? null : "door")} /></> : null}
      </PlannerSection>
      <PlannerSection title="Hindernis" status={values.obstacleEnabled ? "Aktiv" : "Inaktiv"} collapsible open={obstacleOpen} onOpenChange={setObstacleOpen}>
        <ToggleInput label="Hindernis aktiv" checked={values.obstacleEnabled} onChange={(obstacleEnabled) => { setValues((current) => ({ ...current, obstacleEnabled })); if (obstacleEnabled) setObstacleOpen(true); else if (placementMode === "obstacle") setPlacementMode(null); }} />
        {values.obstacleEnabled ? <><NumberInput label="Hindernis X-Position" value={values.obstacleX} step={0.1} onChange={(obstacleX) => setValues((current) => ({ ...current, obstacleX }))} /><NumberInput label="Hindernis Y-Position" value={values.obstacleY} step={0.1} onChange={(obstacleY) => setValues((current) => ({ ...current, obstacleY }))} /><NumberInput label="Hindernisbreite" value={values.obstacleWidth} step={0.1} onChange={(obstacleWidth) => setValues((current) => ({ ...current, obstacleWidth }))} /><NumberInput label="Hindernistiefe" value={values.obstacleDepth} step={0.1} onChange={(obstacleDepth) => setValues((current) => ({ ...current, obstacleDepth }))} /><NumberInput label="Hindernisabstand" value={values.obstacleClearance} step={0.05} min={0} onChange={(obstacleClearance) => setValues((current) => ({ ...current, obstacleClearance }))} /><PlacementButton active={placementMode === "obstacle"} onClick={() => setPlacementMode((current) => current === "obstacle" ? null : "obstacle")} /></> : null}
      </PlannerSection>
    </aside>
  </div>;
}

function PlannerSection({ title, status, className = "", collapsible = false, open = true, onOpenChange, children }: { title: string; status?: string; className?: string; collapsible?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  const heading = <><span className="font-display text-lg font-medium text-premium-ink">{title}</span>{status ? <span className={`ml-auto rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${status === "Aktiv" ? "bg-emerald-100 text-emerald-800" : "bg-premium-warm text-premium-muted"}`}>{status}</span> : null}</>;
  return <section className={`premium-card p-4 ${className}`}>
    {collapsible ? <button type="button" aria-expanded={open} onClick={() => onOpenChange?.(!open)} className="flex w-full items-center gap-2 text-left">{heading}<span aria-hidden="true" className={`text-premium-muted transition-transform ${open ? "rotate-180" : ""}`}>⌄</span></button> : <h2 className="flex items-center gap-2">{heading}</h2>}
    {open ? <div className="mt-3 grid gap-3">{children}</div> : null}
  </section>;
}

function PlacementButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition ${active ? "border-amber-500 bg-amber-50 text-amber-900" : "border-premium-beige bg-white/70 text-premium-charcoal hover:border-premium-sand"}`}>{active ? "Positionierung abbrechen" : "Position in 3D setzen"}</button>;
}

function ToggleInput({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex min-h-9 items-center gap-2 text-sm font-medium text-premium-charcoal"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-premium-forest" />{label}</label>;
}

function StatusItem({ label, value, testId }: { label: string; value: number; testId?: string }) {
  return <div className="rounded-xl bg-premium-warm px-3 py-2"><dt className="text-[0.68rem] text-premium-muted">{label}</dt><dd data-testid={testId} className="mt-0.5 text-lg font-semibold leading-none text-premium-ink">{value}</dd></div>;
}

function NumberInput({ label, value, step, min, max, onChange }: { label: string; value: number; step: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return <label className="grid gap-1 text-xs font-medium text-premium-charcoal"><span>{label}</span><span className="relative"><input type="number" min={min} max={max} step={step} value={value} onChange={(event) => { const parsed = Number(event.target.value); if (Number.isFinite(parsed)) onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed))); }} className="min-h-9 w-full rounded-lg border border-premium-beige bg-white/80 px-2.5 pr-8 text-sm text-premium-ink outline-none transition focus:border-premium-sand focus:ring-2 focus:ring-premium-sand/30" /><span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.65rem] text-premium-muted">m</span></span></label>;
}

useGLTF.preload("/models/dalemans-chair.glb");
