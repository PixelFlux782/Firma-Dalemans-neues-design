"use client";

import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { PlannerChair } from "@/lib/room-planner/chairs";

type PlannerValues = {
  roomWidth: number; roomLength: number; stageWidth: number; stageDepth: number;
  aisleWidth: number; leftSideAisle: number; rightSideAisle: number;
  chairWidth: number; chairDepth: number; rowSpacing: number;
  doors: Door[];
  obstacles: Obstacle[];
};

type Door = { id: string; enabled: boolean; wall: "front" | "back" | "left" | "right"; position: number; width: number; clearance: number };
type Obstacle = { id: string; enabled: boolean; x: number; y: number; width: number; depth: number; clearance: number };

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
  doors: [], obstacles: [],
};

type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };
type PlacementMode = { type: "door" | "obstacle"; id: string } | null;

function getDoorGeometry(values: PlannerValues, door: Door) {
  const horizontal = door.wall === "front" || door.wall === "back";
  const wallLength = horizontal ? values.roomWidth : values.roomLength;
  const along = -wallLength / 2 + door.position + door.width / 2;
  const x = horizontal ? along : door.wall === "left" ? -values.roomWidth / 2 : values.roomWidth / 2;
  const z = horizontal ? (door.wall === "front" ? -values.roomLength / 2 : values.roomLength / 2) : along;
  const clearanceCenterX = horizontal ? x : x + (door.wall === "left" ? 0.5 : -0.5);
  const clearanceCenterZ = horizontal ? z + (door.wall === "front" ? 0.5 : -0.5) : z;
  return { x, z, horizontal, wallLength, clearance: {
    minX: clearanceCenterX - (horizontal ? door.width : 1) / 2,
    maxX: clearanceCenterX + (horizontal ? door.width : 1) / 2,
    minZ: clearanceCenterZ - (horizontal ? 1 : door.width) / 2,
    maxZ: clearanceCenterZ + (horizontal ? 1 : door.width) / 2,
  } satisfies Rect };
}

function overlaps(a: Rect, b: Rect) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

function expandRect(rect: Rect, distance: number): Rect {
  return { minX: rect.minX - distance, maxX: rect.maxX + distance, minZ: rect.minZ - distance, maxZ: rect.maxZ + distance };
}

function ChairInstances({ positions, width, depth, modelPath }: { positions: [number, number, number][]; width: number; depth: number; modelPath: string }) {
  const { scene } = useGLTF(modelPath);
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

function RoomScene({ values, positions, modelPath, placementMode, onPlaceObstacle, onPlaceDoor }: { values: PlannerValues; positions: [number, number, number][]; modelPath: string; placementMode: PlacementMode; onPlaceObstacle: (id: string, x: number, z: number) => void; onPlaceDoor: (id: string, x: number, z: number) => void }) {
  const stageWidth = Math.min(values.stageWidth, values.roomWidth);
  const stageDepth = Math.min(values.stageDepth, values.roomLength);
  const seatingStart = -values.roomLength / 2 + stageDepth;
  const seatingLength = Math.max(0, values.roomLength - stageDepth);
  const placementDoor = placementMode?.type === "door" ? values.doors.find((door) => door.id === placementMode.id) : undefined;
  return <>
    <color attach="background" args={["#f4f1e8"]} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[5, 10, 7]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} onPointerDown={(event: ThreeEvent<PointerEvent>) => { if (placementMode?.type === "obstacle" && event.button === 0) { event.stopPropagation(); onPlaceObstacle(placementMode.id, event.point.x, event.point.z); } }}><planeGeometry args={[values.roomWidth, values.roomLength]} /><meshStandardMaterial color="#ded9ca" roughness={0.95} /></mesh>
    <gridHelper args={[Math.max(values.roomWidth, values.roomLength), Math.ceil(Math.max(values.roomWidth, values.roomLength)), "#aaa28e", "#cbc4b3"]} position={[0, 0.006, 0]} />
    <AisleMarker x={-values.roomWidth / 2 + Math.min(values.leftSideAisle, values.roomWidth) / 2} z={seatingStart + seatingLength / 2} width={Math.min(values.leftSideAisle, values.roomWidth)} length={seatingLength} />
    <AisleMarker x={values.roomWidth / 2 - Math.min(values.rightSideAisle, values.roomWidth) / 2} z={seatingStart + seatingLength / 2} width={Math.min(values.rightSideAisle, values.roomWidth)} length={seatingLength} />
    <AisleMarker x={0} z={seatingStart + seatingLength / 2} width={Math.min(values.aisleWidth, values.roomWidth)} length={seatingLength} />
    <mesh position={[0, 0.2, -values.roomLength / 2 + stageDepth / 2]} castShadow receiveShadow><boxGeometry args={[stageWidth, 0.4, stageDepth]} /><meshStandardMaterial color="#6e5a45" roughness={0.8} /></mesh>
    {values.doors.filter((door) => door.enabled).map((door) => {
      const geometry = getDoorGeometry(values, door);
      const expanded = expandRect(geometry.clearance, door.clearance);
      return <group key={door.id}>
        <mesh position={[geometry.x, 0.035, geometry.z]}><boxGeometry args={[geometry.horizontal ? door.width : 0.08, 0.07, geometry.horizontal ? 0.08 : door.width]} /><meshStandardMaterial color="#256b78" /></mesh>
        <mesh position={[(geometry.clearance.minX + geometry.clearance.maxX) / 2, 0.018, (geometry.clearance.minZ + geometry.clearance.maxZ) / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[geometry.clearance.maxX - geometry.clearance.minX, geometry.clearance.maxZ - geometry.clearance.minZ]} /><meshBasicMaterial color="#55a8b5" transparent opacity={0.38} depthWrite={false} /></mesh>
        <mesh position={[(expanded.minX + expanded.maxX) / 2, 0.014, (expanded.minZ + expanded.maxZ) / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[expanded.maxX - expanded.minX, expanded.maxZ - expanded.minZ]} /><meshBasicMaterial color="#55a8b5" transparent opacity={0.16} depthWrite={false} /></mesh>
      </group>;
    })}
    {placementDoor ? <DoorPlacementTarget values={values} door={placementDoor} onPlace={(x, z) => onPlaceDoor(placementDoor.id, x, z)} /> : null}
    {values.obstacles.filter((obstacle) => obstacle.enabled).map((obstacle) => {
      const clearance = expandRect({ minX: obstacle.x - obstacle.width / 2, maxX: obstacle.x + obstacle.width / 2, minZ: obstacle.y - obstacle.depth / 2, maxZ: obstacle.y + obstacle.depth / 2 }, obstacle.clearance);
      return <group key={obstacle.id}>
        <mesh position={[obstacle.x, 0.5, obstacle.y]} castShadow receiveShadow><boxGeometry args={[obstacle.width, 1, obstacle.depth]} /><meshStandardMaterial color="#776f64" roughness={0.85} /></mesh>
        <mesh position={[obstacle.x, 0.013, obstacle.y]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[clearance.maxX - clearance.minX, clearance.maxZ - clearance.minZ]} /><meshBasicMaterial color="#776f64" transparent opacity={0.18} depthWrite={false} /></mesh>
      </group>;
    })}
    <Suspense fallback={null}><ChairInstances key={modelPath} positions={positions} width={values.chairWidth} depth={values.chairDepth} modelPath={modelPath} /></Suspense>
    <ContactShadows position={[0, 0.01, 0]} opacity={0.22} scale={Math.max(values.roomWidth, values.roomLength)} blur={2.2} far={4} />
    <OrbitControls makeDefault enabled={placementMode === null} target={[0, 0, 0]} minDistance={5} maxDistance={45} maxPolarAngle={Math.PI / 2.05} />
  </>;
}

function DoorPlacementTarget({ values, door, onPlace }: { values: PlannerValues; door: Door; onPlace: (x: number, z: number) => void }) {
  const horizontal = door.wall === "front" || door.wall === "back";
  const x = horizontal ? 0 : door.wall === "left" ? -values.roomWidth / 2 : values.roomWidth / 2;
  const z = horizontal ? (door.wall === "front" ? -values.roomLength / 2 : values.roomLength / 2) : 0;
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
  values.doors.filter((door) => door.enabled).forEach((door) => {
    const geometry = getDoorGeometry(values, door);
    if (door.width <= 0) warnings.push("Die Türbreite muss größer als 0 sein.");
    if (door.position < 0 || door.position + door.width > geometry.wallLength) warnings.push("Eine Tür liegt außerhalb der gewählten Wand.");
  });
  values.obstacles.filter((obstacle) => obstacle.enabled).forEach((item) => {
    const obstacle = { minX: item.x - item.width / 2, maxX: item.x + item.width / 2, minZ: item.y - item.depth / 2, maxZ: item.y + item.depth / 2 };
    if (item.width <= 0 || item.depth <= 0) warnings.push("Die Hindernismaße müssen größer als 0 sein.");
    if (obstacle.minX < -values.roomWidth / 2 || obstacle.maxX > values.roomWidth / 2 || obstacle.minZ < -values.roomLength / 2 || obstacle.maxZ > values.roomLength / 2) warnings.push("Ein Hindernis liegt außerhalb des Raumes.");
    const stageWidth = Math.min(values.stageWidth, values.roomWidth);
    const stage = { minX: -stageWidth / 2, maxX: stageWidth / 2, minZ: -values.roomLength / 2, maxZ: -values.roomLength / 2 + Math.min(values.stageDepth, values.roomLength) };
    if (overlaps(obstacle, stage)) warnings.push("Ein Hindernis überlappt die Bühne.");
  });

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
  const exclusionZones = [
    ...values.doors.filter((door) => door.enabled).map((door) => expandRect(getDoorGeometry(values, door).clearance, door.clearance)),
    ...values.obstacles.filter((obstacle) => obstacle.enabled).map((obstacle) => expandRect({ minX: obstacle.x - obstacle.width / 2, maxX: obstacle.x + obstacle.width / 2, minZ: obstacle.y - obstacle.depth / 2, maxZ: obstacle.y + obstacle.depth / 2 }, obstacle.clearance)),
  ];
  const filteredPositions = positions.filter(([x, , z]) => {
    const chair = { minX: x - values.chairWidth / 2, maxX: x + values.chairWidth / 2, minZ: z - values.chairDepth / 2, maxZ: z + values.chairDepth / 2 };
    return !exclusionZones.some((zone) => overlaps(chair, zone));
  });
  return {
    positions: filteredPositions,
    rows: chairsPerRow ? possibleRows : 0,
    chairsPerRow,
    warnings: [...new Set(warnings)],
  };
}

export default function RoomPlanner({ chairs }: { chairs: PlannerChair[] }) {
  const initialChair = chairs[0];
  const [selectedChairId, setSelectedChairId] = useState(initialChair.id);
  const selectedChair = chairs.find((chair) => chair.id === selectedChairId) ?? initialChair;
  const [values, setValues] = useState({ ...initialValues, chairWidth: initialChair.width, chairDepth: initialChair.depth });
  const [seatingOpen, setSeatingOpen] = useState(true);
  const [doorOpen, setDoorOpen] = useState(false);
  const [obstacleOpen, setObstacleOpen] = useState(false);
  const [openDoors, setOpenDoors] = useState<string[]>([]);
  const [openObstacles, setOpenObstacles] = useState<string[]>([]);
  const [placementMode, setPlacementMode] = useState<PlacementMode>(null);
  const nextDoorId = useRef(1);
  const nextObstacleId = useRef(1);
  const layout = useMemo(() => calculateLayout(values), [values]);
  const selectChair = (id: string) => {
    const chair = chairs.find((entry) => entry.id === id);
    if (!chair) return;
    setSelectedChairId(chair.id);
    setValues((current) => ({ ...current, chairWidth: chair.width, chairDepth: chair.depth }));
  };
  useEffect(() => {
    if (placementMode === null) return;
    const cancelPlacement = (event: KeyboardEvent) => { if (event.key === "Escape") setPlacementMode(null); };
    window.addEventListener("keydown", cancelPlacement);
    return () => window.removeEventListener("keydown", cancelPlacement);
  }, [placementMode]);
  const addDoor = () => {
    const id = `door-${nextDoorId.current++}`;
    const door: Door = { id, enabled: true, wall: "back", position: Math.max(0, (values.roomWidth - 1) / 2), width: 1, clearance: 0.3 };
    setValues((current) => ({ ...current, doors: [...current.doors, door] }));
    setOpenDoors((current) => [...current, id]);
    setDoorOpen(true);
  };
  const addObstacle = () => {
    const id = `obstacle-${nextObstacleId.current++}`;
    const offset = values.obstacles.length * 1.25;
    const obstacle: Obstacle = { id, enabled: true, x: Math.min(values.roomWidth / 2 - 0.5, offset), y: Math.min(values.roomLength / 2 - 0.5, 2 + offset), width: 1, depth: 1, clearance: 0.3 };
    setValues((current) => ({ ...current, obstacles: [...current.obstacles, obstacle] }));
    setOpenObstacles((current) => [...current, id]);
    setObstacleOpen(true);
  };
  const updateDoor = (id: string, update: Partial<Door>) => setValues((current) => ({ ...current, doors: current.doors.map((door) => door.id === id ? { ...door, ...update } : door) }));
  const updateObstacle = (id: string, update: Partial<Obstacle>) => setValues((current) => ({ ...current, obstacles: current.obstacles.map((obstacle) => obstacle.id === id ? { ...obstacle, ...update } : obstacle) }));
  const removeDoor = (id: string) => { setValues((current) => ({ ...current, doors: current.doors.filter((door) => door.id !== id) })); setOpenDoors((current) => current.filter((openId) => openId !== id)); if (placementMode?.type === "door" && placementMode.id === id) setPlacementMode(null); };
  const removeObstacle = (id: string) => { setValues((current) => ({ ...current, obstacles: current.obstacles.filter((obstacle) => obstacle.id !== id) })); setOpenObstacles((current) => current.filter((openId) => openId !== id)); if (placementMode?.type === "obstacle" && placementMode.id === id) setPlacementMode(null); };
  const placeObstacle = (id: string, x: number, z: number) => {
    const obstacle = values.obstacles.find((item) => item.id === id);
    if (!obstacle) return;
    const halfWidth = Math.min(obstacle.width, values.roomWidth) / 2;
    const halfDepth = Math.min(obstacle.depth, values.roomLength) / 2;
    const obstacleX = Math.max(-values.roomWidth / 2 + halfWidth, Math.min(values.roomWidth / 2 - halfWidth, x));
    const obstacleY = Math.max(-values.roomLength / 2 + halfDepth, Math.min(values.roomLength / 2 - halfDepth, z));
    updateObstacle(id, { x: Number(obstacleX.toFixed(2)), y: Number(obstacleY.toFixed(2)) });
    setPlacementMode(null);
  };
  const placeDoor = (id: string, x: number, z: number) => {
    const door = values.doors.find((item) => item.id === id);
    if (!door) return;
    const horizontal = door.wall === "front" || door.wall === "back";
    const wallLength = horizontal ? values.roomWidth : values.roomLength;
    const along = horizontal ? x : z;
    const doorPosition = Math.max(0, Math.min(Math.max(0, wallLength - door.width), along + wallLength / 2 - door.width / 2));
    updateDoor(id, { position: Number(doorPosition.toFixed(2)) });
    setPlacementMode(null);
  };
  const renderFields = (keys: NumericPlannerKey[]) => fields.filter((field) => keys.includes(field.key)).map((field) => <NumberInput key={field.key} label={field.label} value={values[field.key]} min={field.min} max={field.max} step={field.step} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))} />);
  return <div className="grid items-start gap-4 lg:grid-cols-[12rem_minmax(0,1fr)_12rem] xl:grid-cols-[13.5rem_minmax(0,1fr)_13.5rem] xl:gap-5">
    <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1" aria-label="Raum- und Bestuhlungsmaße">
      <PlannerSection title="Raum">{renderFields(["roomWidth", "roomLength"])}</PlannerSection>
      <PlannerSection title="Bühne">{renderFields(["stageWidth", "stageDepth"])}</PlannerSection>
      <PlannerSection title="Bestuhlung" className="sm:col-span-2 lg:col-span-1" collapsible open={seatingOpen} onOpenChange={setSeatingOpen}>
        <label className="grid gap-1 text-xs font-medium text-premium-charcoal"><span>Stuhlmodell</span><select aria-label="Stuhlmodell" value={selectedChair.id} onChange={(event) => selectChair(event.target.value)} className="min-h-9 rounded-lg border border-premium-beige bg-white/80 px-2.5 text-sm text-premium-ink">{chairs.map((chair) => <option key={chair.id} value={chair.id}>{chair.productName}</option>)}</select></label>
        {renderFields(["chairWidth", "chairDepth", "rowSpacing", "aisleWidth", "leftSideAisle", "rightSideAisle"])}
      </PlannerSection>
    </aside>

    <div className="min-w-0 lg:sticky lg:top-24">
      <section className="premium-card overflow-hidden" aria-label="Interaktive 3D-Raumansicht">
        {placementMode ? <div className="border-b border-premium-beige bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900" role="status">{placementMode.type === "obstacle" ? "Position für Hindernis wählen – auf den Boden klicken" : "Türposition wählen – auf die markierte Wand klicken"} <span className="text-xs font-normal">(Esc zum Abbrechen)</span></div> : null}
        <div className={`h-[26rem] sm:h-[34rem] lg:h-[min(62vh,36rem)] lg:min-h-[29rem] ${placementMode ? "cursor-crosshair" : ""}`}><Canvas shadows camera={{ position: [12, 13, 16], fov: 42, near: 0.1, far: 100 }} dpr={[1, 1.5]}><RoomScene values={values} positions={layout.positions} modelPath={selectedChair.modelPath} placementMode={placementMode} onPlaceObstacle={placeObstacle} onPlaceDoor={placeDoor} /></Canvas></div>
        <p className="border-t border-premium-beige bg-white/70 px-4 py-2.5 text-xs text-premium-muted">{placementMode ? "Klicken: Position setzen · Esc: abbrechen" : "Ziehen: drehen · Mausrad: zoomen · Rechtsklick: verschieben"}</p>
      </section>
      <div className="premium-card mt-3 p-3 sm:p-4" aria-label="Planungsstatus">
        <dl className="grid grid-cols-3 gap-2"><StatusItem label="Reihen" value={layout.rows} /><StatusItem label="je Reihe" value={layout.chairsPerRow} /><StatusItem label="Stühle" value={layout.positions.length} testId="chair-count" /></dl>
        {layout.warnings.length ? <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="status"><p className="font-semibold">Planung prüfen</p><ul className="mt-1 list-disc space-y-0.5 pl-4">{layout.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}
        {layout.positions.length === 300 ? <p className="mt-2 text-xs text-premium-muted">Darstellung auf 300 Stühle begrenzt.</p> : null}
      </div>
      <section className="premium-card mt-3 p-4" aria-label="Für Ihre Planung">
        <p className="section-eyebrow">Für Ihre Planung</p>
        <h2 className="mt-2 font-display text-xl font-medium text-premium-ink">{selectedChair.productName}</h2>
        <p className="mt-3 text-sm text-premium-muted">Benötigte Menge: <strong data-testid="required-quantity" className="text-premium-ink">{layout.positions.length} Stühle</strong></p>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedChair.productUrl ? <a href={selectedChair.productUrl} className="btn-primary text-center">Produkt ansehen</a> : <span className="inline-flex min-h-10 items-center rounded-full border border-premium-beige px-4 text-xs text-premium-muted">Produktzuordnung ausstehend</span>}
          <a href={`/kontakt?source=raumplaner&product=${encodeURIComponent(selectedChair.productHandle ?? selectedChair.id)}&quantity=${layout.positions.length}`} className="btn-secondary text-center">Angebot für diese Planung anfragen</a>
        </div>
      </section>
    </div>

    <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1" aria-label="Tür und Hindernis">
      <PlannerSection title="Tür" status={values.doors.some((door) => door.enabled) ? "Aktiv" : "Inaktiv"} collapsible open={doorOpen} onOpenChange={setDoorOpen}>
        {values.doors.map((door, index) => <ObjectCard key={door.id} title={`Tür ${index + 1}`} open={openDoors.includes(door.id)} onOpenChange={(open) => setOpenDoors((current) => open ? [...current, door.id] : current.filter((id) => id !== door.id))} onRemove={() => removeDoor(door.id)}>
          <ToggleInput label={`Tür ${index + 1} aktiv`} checked={door.enabled} onChange={(enabled) => { updateDoor(door.id, { enabled }); if (!enabled && placementMode?.type === "door" && placementMode.id === door.id) setPlacementMode(null); }} />
          {door.enabled ? <><label className="grid gap-1 text-xs font-medium text-premium-charcoal"><span>Wand</span><select aria-label={`Tür ${index + 1} Wand`} value={door.wall} onChange={(event) => updateDoor(door.id, { wall: event.target.value as Door["wall"] })} className="min-h-9 rounded-lg border border-premium-beige bg-white/80 px-2.5 text-sm"><option value="front">vorne</option><option value="back">hinten</option><option value="left">links</option><option value="right">rechts</option></select></label><NumberInput label="Türposition" ariaLabel={`Tür ${index + 1} Position`} value={door.position} step={0.1} onChange={(position) => updateDoor(door.id, { position })} /><NumberInput label="Türbreite" ariaLabel={`Tür ${index + 1} Breite`} value={door.width} step={0.1} onChange={(width) => updateDoor(door.id, { width })} /><NumberInput label="Abstand" ariaLabel={`Tür ${index + 1} Abstand`} value={door.clearance} step={0.05} min={0} onChange={(clearance) => updateDoor(door.id, { clearance })} /><PlacementButton active={placementMode?.type === "door" && placementMode.id === door.id} onClick={() => setPlacementMode((current) => current?.type === "door" && current.id === door.id ? null : { type: "door", id: door.id })} /></> : null}
        </ObjectCard>)}
        <button type="button" onClick={addDoor} className="min-h-9 rounded-lg border border-dashed border-premium-sand bg-white/50 px-3 text-xs font-semibold text-premium-charcoal hover:bg-white">+ Tür{values.doors.length ? "" : " hinzufügen"}</button>
      </PlannerSection>
      <PlannerSection title="Hindernis" status={values.obstacles.some((obstacle) => obstacle.enabled) ? "Aktiv" : "Inaktiv"} collapsible open={obstacleOpen} onOpenChange={setObstacleOpen}>
        {values.obstacles.map((obstacle, index) => <ObjectCard key={obstacle.id} title={`Hindernis ${index + 1}`} open={openObstacles.includes(obstacle.id)} onOpenChange={(open) => setOpenObstacles((current) => open ? [...current, obstacle.id] : current.filter((id) => id !== obstacle.id))} onRemove={() => removeObstacle(obstacle.id)}>
          <ToggleInput label={`Hindernis ${index + 1} aktiv`} checked={obstacle.enabled} onChange={(enabled) => { updateObstacle(obstacle.id, { enabled }); if (!enabled && placementMode?.type === "obstacle" && placementMode.id === obstacle.id) setPlacementMode(null); }} />
          {obstacle.enabled ? <><NumberInput label="X" ariaLabel={`Hindernis ${index + 1} X-Position`} value={obstacle.x} step={0.1} onChange={(x) => updateObstacle(obstacle.id, { x })} /><NumberInput label="Y" ariaLabel={`Hindernis ${index + 1} Y-Position`} value={obstacle.y} step={0.1} onChange={(y) => updateObstacle(obstacle.id, { y })} /><NumberInput label="Breite" ariaLabel={`Hindernis ${index + 1} Breite`} value={obstacle.width} step={0.1} onChange={(width) => updateObstacle(obstacle.id, { width })} /><NumberInput label="Tiefe" ariaLabel={`Hindernis ${index + 1} Tiefe`} value={obstacle.depth} step={0.1} onChange={(depth) => updateObstacle(obstacle.id, { depth })} /><NumberInput label="Abstand" ariaLabel={`Hindernis ${index + 1} Abstand`} value={obstacle.clearance} step={0.05} min={0} onChange={(clearance) => updateObstacle(obstacle.id, { clearance })} /><PlacementButton active={placementMode?.type === "obstacle" && placementMode.id === obstacle.id} onClick={() => setPlacementMode((current) => current?.type === "obstacle" && current.id === obstacle.id ? null : { type: "obstacle", id: obstacle.id })} /></> : null}
        </ObjectCard>)}
        <button type="button" onClick={addObstacle} className="min-h-9 rounded-lg border border-dashed border-premium-sand bg-white/50 px-3 text-xs font-semibold text-premium-charcoal hover:bg-white">+ Hindernis{values.obstacles.length ? "" : " hinzufügen"}</button>
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

function ObjectCard({ title, open, onOpenChange, onRemove, children }: { title: string; open: boolean; onOpenChange: (open: boolean) => void; onRemove: () => void; children: React.ReactNode }) {
  return <section className="rounded-xl border border-premium-beige bg-premium-warm/45 p-2.5">
    <div className="flex items-center gap-2">
      <button type="button" aria-expanded={open} onClick={() => onOpenChange(!open)} className="flex min-h-8 flex-1 items-center gap-2 text-left text-sm font-semibold text-premium-ink"><span>{title}</span><span aria-hidden="true" className={`ml-auto text-premium-muted transition-transform ${open ? "rotate-180" : ""}`}>⌄</span></button>
      <button type="button" aria-label={`${title} entfernen`} onClick={onRemove} className="min-h-8 rounded-md px-2 text-xs font-medium text-premium-muted hover:bg-white hover:text-red-700">Entfernen</button>
    </div>
    {open ? <div className="mt-2 grid gap-2.5 border-t border-premium-beige pt-2.5">{children}</div> : null}
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

function NumberInput({ label, ariaLabel, value, step, min, max, onChange }: { label: string; ariaLabel?: string; value: number; step: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return <label className="grid gap-1 text-xs font-medium text-premium-charcoal"><span>{label}</span><span className="relative"><input aria-label={ariaLabel} type="number" min={min} max={max} step={step} value={value} onChange={(event) => { const parsed = Number(event.target.value); if (Number.isFinite(parsed)) onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed))); }} className="min-h-9 w-full rounded-lg border border-premium-beige bg-white/80 px-2.5 pr-8 text-sm text-premium-ink outline-none transition focus:border-premium-sand focus:ring-2 focus:ring-premium-sand/30" /><span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.65rem] text-premium-muted">m</span></span></label>;
}
