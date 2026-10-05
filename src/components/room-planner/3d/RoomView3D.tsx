"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Component, Suspense, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { doorSegment, frontSegment, type DoorObject, type RoomPlan } from "@/lib/room-planner/objects";
import { chairDisplayAngle, planBounds } from "@/lib/room-planner/visualization3d";
import { TABLE_MODELS, type TableModel } from "@/lib/room-planner/tables";

const DEFAULT_WALL_HEIGHT = 2.9;
const CHAIR_MODEL = "/models/dalemans-chair-low.glb";
const chairGeometry = new THREE.BoxGeometry(1, 1, 1);
const seatMaterial = new THREE.MeshStandardMaterial({ color: "#64776c", roughness: 0.82 });
const frameMaterial = new THREE.MeshStandardMaterial({ color: "#514f49", roughness: 0.76 });

function CameraControls({ plan, reset }: { plan: RoomPlan; reset: number }) {
  const bounds = useMemo(() => planBounds(plan), [plan]);
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const fov = (camera as THREE.PerspectiveCamera).fov * Math.PI / 180;
    const fitFov = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * size.width / Math.max(size.height, 1)));
    const radius = Math.hypot(bounds.width, bounds.depth, DEFAULT_WALL_HEIGHT) / 2;
    const distance = Math.max(5, radius * 1.45 / Math.sin(fitFov / 2));
    camera.position.set(bounds.x + distance * 0.56, distance * 0.62, bounds.z + distance * 0.56);
    camera.lookAt(bounds.x, DEFAULT_WALL_HEIGHT * 0.35, bounds.z);
    controls.current?.target.set(bounds.x, DEFAULT_WALL_HEIGHT * 0.35, bounds.z);
    controls.current?.update();
  }, [bounds, camera, reset, size.width, size.height]);
  return <OrbitControls ref={controls} makeDefault target={[bounds.x, DEFAULT_WALL_HEIGHT * 0.35, bounds.z]} minDistance={Math.max(2, bounds.span * 0.3)} maxDistance={bounds.span * 6} maxPolarAngle={Math.PI / 2.08} />;
}

class ChairErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function ModelSeats({ plan }: { plan: RoomPlan }) {
  const { scene } = useGLTF(CHAIR_MODEL);
  const chair = useMemo(() => {
    let mesh: THREE.Mesh | null = null;
    scene.traverse(object => { if (!mesh && (object as THREE.Mesh).isMesh) mesh = object as THREE.Mesh; });
    if (!mesh) throw new Error("Chair GLB contains no mesh");
    const source: THREE.Mesh = mesh;
    source.geometry.computeBoundingBox();
    const box = source.geometry.boundingBox!;
    return { geometry: source.geometry, material: source.material, width: box.max.x - box.min.x, depth: box.max.z - box.min.z, floorOffset: -box.min.y };
  }, [scene]);
  const seats = useMemo(() => plan.seating?.seats ?? [], [plan.seating?.seats]);
  const width = plan.seating?.rules.chairWidth ?? plan.chairSelection?.width ?? 0.5;
  const depth = plan.seating?.rules.chairDepth ?? plan.chairSelection?.depth ?? 0.55;
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3(width / chair.width, Math.min(width / chair.width, depth / chair.depth), depth / chair.depth);
    const axis = new THREE.Vector3(0, 1, 0);
    seats.forEach((seat, index) => {
      rotation.setFromAxisAngle(axis, chairDisplayAngle(seat.rotation));
      position.set(seat.x, chair.floorOffset * scale.y, seat.y);
      mesh.setMatrixAt(index, matrix.compose(position, rotation, scale));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [seats, width, depth, chair]);
  return seats.length ? <instancedMesh ref={ref} args={[chair.geometry, chair.material, seats.length]} /> : null;
}

function FallbackSeats({ plan }: { plan: RoomPlan }) {
  const seats = useMemo(() => plan.seating?.seats ?? [], [plan.seating?.seats]);
  const width = plan.seating?.rules.chairWidth ?? plan.chairSelection?.width ?? 0.5;
  const depth = plan.seating?.rules.chairDepth ?? plan.chairSelection?.depth ?? 0.55;
  const seatRef = useRef<THREE.InstancedMesh>(null);
  const backRef = useRef<THREE.InstancedMesh>(null);
  const legsRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const seatMesh = seatRef.current, backMesh = backRef.current;
    const legsMesh = legsRef.current;
    if (!seatMesh || !backMesh || !legsMesh) return;
    const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), rotation = new THREE.Quaternion(), scale = new THREE.Vector3();
    for (let i = 0; i < seats.length; i++) {
      const item = seats[i], angle = chairDisplayAngle(item.rotation);
      rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      position.set(item.x, 0.43, item.y); scale.set(width, 0.12, depth);
      seatMesh.setMatrixAt(i, matrix.compose(position, rotation, scale));
      position.set(item.x + Math.sin(angle) * depth * 0.43, 0.75, item.y - Math.cos(angle) * depth * 0.43);
      scale.set(width, 0.62, 0.1);
      backMesh.setMatrixAt(i, matrix.compose(position, rotation, scale));
      for (let leg = 0; leg < 4; leg++) {
        const localX = (leg % 2 ? 1 : -1) * width * 0.39;
        const localZ = (leg < 2 ? 1 : -1) * depth * 0.36;
        position.set(item.x + localX * Math.cos(angle) + localZ * Math.sin(angle), 0.2, item.y - localX * Math.sin(angle) + localZ * Math.cos(angle));
        scale.set(0.035, 0.4, 0.035);
        legsMesh.setMatrixAt(i * 4 + leg, matrix.compose(position, rotation, scale));
      }
    }
    seatMesh.instanceMatrix.needsUpdate = true; backMesh.instanceMatrix.needsUpdate = true;
    legsMesh.instanceMatrix.needsUpdate = true;
    seatMesh.computeBoundingSphere(); backMesh.computeBoundingSphere(); legsMesh.computeBoundingSphere();
  }, [seats, width, depth]);
  if (!seats.length) return null;
  return <><instancedMesh ref={seatRef} args={[chairGeometry, seatMaterial, seats.length]} /><instancedMesh ref={backRef} args={[chairGeometry, seatMaterial, seats.length]} /><instancedMesh ref={legsRef} args={[chairGeometry, frameMaterial, seats.length * 4]} /></>;
}

function ModelFurnitureChairs({ plan }: { plan: RoomPlan }) {
  const { scene } = useGLTF(CHAIR_MODEL);
  const source = useMemo(() => {
    scene.updateMatrixWorld(true);
    let mesh: THREE.Mesh | null = null;
    scene.traverse(object => { if (!mesh && (object as THREE.Mesh).isMesh) mesh = object as THREE.Mesh; });
    if (!mesh) throw new Error("Chair GLB contains no mesh");
    const found: THREE.Mesh = mesh; found.geometry.computeBoundingBox(); const box = found.geometry.boundingBox!;
    return { geometry: found.geometry, material: found.material, width: box.max.x - box.min.x, depth: box.max.z - box.min.z, floorOffset: -box.min.y };
  }, [scene]);
  const chairs = useMemo(() => plan.chairs ?? [], [plan.chairs]), ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), rotation = new THREE.Quaternion(), axis = new THREE.Vector3(0, 1, 0), scale = new THREE.Vector3();
    chairs.forEach((chair, index) => { scale.set(chair.width / source.width, Math.min(chair.width / source.width, chair.depth / source.depth), chair.depth / source.depth); rotation.setFromAxisAngle(axis, chairDisplayAngle(chair.rotation)); position.set(chair.x, source.floorOffset * scale.y, chair.y); ref.current!.setMatrixAt(index, matrix.compose(position, rotation, scale)); });
    ref.current.instanceMatrix.needsUpdate = true; ref.current.computeBoundingSphere();
  }, [chairs, source]);
  return chairs.length ? <instancedMesh ref={ref} args={[source.geometry, source.material, chairs.length]} /> : null;
}

function ModelTables({ plan, model }: { plan: RoomPlan; model: TableModel }) {
  const { scene } = useGLTF(model.modelPath);
  const source = useMemo(() => {
    let mesh: THREE.Mesh | null = null;
    scene.traverse(object => { if (!mesh && (object as THREE.Mesh).isMesh) mesh = object as THREE.Mesh; });
    if (!mesh) throw new Error("Table GLB contains no mesh");
    const found: THREE.Mesh = mesh;
    const geometry = found.geometry.clone().applyMatrix4(found.matrixWorld);
    geometry.computeBoundingBox();
    return { geometry, material: found.material };
  }, [scene]);
  const tables = (plan.tables ?? []).filter(table => table.modelId === model.id), ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const translate = new THREE.Matrix4(), rotate = new THREE.Matrix4(), scale = new THREE.Matrix4(), normalize = new THREE.Matrix4(), matrix = new THREE.Matrix4();
    tables.forEach((table, index) => {
      translate.makeTranslation(table.x, -model.modelBounds.floorY * (model.height / model.modelBounds.height), table.y);
      rotate.makeRotationY(Math.PI - table.rotation * Math.PI / 180);
      scale.makeScale(table.width / model.modelBounds.width, model.height / model.modelBounds.height, table.depth / model.modelBounds.depth);
      normalize.makeTranslation(-model.modelBounds.centerX, 0, -model.modelBounds.centerZ);
      matrix.copy(translate).multiply(rotate).multiply(scale).multiply(normalize);
      ref.current!.setMatrixAt(index, matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true; ref.current.computeBoundingSphere();
  }, [tables, model]);
  return tables.length ? <instancedMesh ref={ref} args={[source.geometry, source.material, tables.length]} castShadow receiveShadow /> : null;
}

function Scene({ plan, reset }: { plan: RoomPlan; reset: number }) {
  const points = plan.contour.points;
  const floor = useMemo(() => {
    if (!plan.contour.closed || points.length < 3) return null;
    const shape = new THREE.Shape();
    points.forEach((p, i) => i ? shape.lineTo(p.x, -p.y) : shape.moveTo(p.x, -p.y));
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [plan.contour.closed, points]);
  return <>
    <color attach="background" args={["#f5f3ee"]} />
    <hemisphereLight args={["#ffffff", "#b8afa1", 1.5]} /><directionalLight position={[8, 15, 10]} intensity={2.1} />
    {floor && <mesh geometry={floor} rotation={[-Math.PI / 2, 0, 0]}><meshStandardMaterial color="#dcd6c9" roughness={0.94} side={THREE.DoubleSide} /></mesh>}
    {plan.contour.walls.map(wall => {
      const a = points.find(p => p.id === wall.startPointId), b = points.find(p => p.id === wall.endPointId);
      if (!a || !b) return null;
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const doors = plan.objects.filter((o): o is DoorObject => o.type === "door" && o.wallId === wall.id).sort((a, b) => a.offset - b.offset);
      const parts: { start: number; end: number }[] = []; let cursor = 0;
      for (const door of doors) { if (door.offset > cursor) parts.push({ start: cursor, end: Math.min(door.offset, length) }); cursor = Math.max(cursor, door.offset + door.width); }
      if (cursor < length) parts.push({ start: cursor, end: length });
      return <group key={wall.id}>{parts.map((part, index) => {
        const t = (part.start + part.end) / (2 * length);
        return <mesh key={index} position={[a.x + (b.x - a.x) * t, DEFAULT_WALL_HEIGHT / 2, a.y + (b.y - a.y) * t]} rotation={[0, -Math.atan2(b.y - a.y, b.x - a.x), 0]}><boxGeometry args={[part.end - part.start, DEFAULT_WALL_HEIGHT, 0.1]} /><meshStandardMaterial color="#e8e4db" transparent opacity={0.72} roughness={0.95} /></mesh>;
      })}</group>;
    })}
    {plan.objects.map((object, index) => {
      if (object.type === "door") {
        const segment = doorSegment(plan.contour, object); if (!segment) return null;
        const emergency = object.role === "emergency_exit", exit = emergency || object.role === "exit";
        const middle: [number, number, number] = [(segment.start.x + segment.end.x) / 2, 0, (segment.start.y + segment.end.y) / 2];
        const angle = -Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x);
        return <group key={object.id} position={middle} rotation={[0, angle, 0]}><mesh position={[0, 0.025, 0]}><boxGeometry args={[object.width, 0.05, 0.24]} /><meshStandardMaterial color={emergency ? "#c55343" : exit ? "#388e6a" : "#668897"} /></mesh><mesh position={[0, 1.05, 0]}><boxGeometry args={[object.width, 2.1, 0.025]} /><meshStandardMaterial color={emergency ? "#c55343" : exit ? "#388e6a" : "#668897"} transparent opacity={0.12} depthWrite={false} /></mesh></group>;
      }
      if (object.type === "aisle") {
        const dx = object.end.x - object.start.x, dz = object.end.y - object.start.y;
        return <mesh key={object.id} renderOrder={2 + index} position={[(object.start.x + object.end.x) / 2, 0.016, (object.start.y + object.end.y) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}><boxGeometry args={[Math.hypot(dx, dz), 0.025, object.width]} /><meshStandardMaterial color={object.source === "generated" ? "#d6a964" : "#67a3a7"} transparent opacity={0.32} depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} /></mesh>;
      }
      if (object.type === "front") {
        const segment = frontSegment(object);
        const angle = object.rotation * Math.PI / 180;
        return <group key={object.id}><mesh position={[(segment.start.x + segment.end.x) / 2, 0.055, (segment.start.y + segment.end.y) / 2]} rotation={[0, -angle, 0]}><boxGeometry args={[object.width, 0.11, 0.12]} /><meshStandardMaterial color="#235e89" /></mesh><mesh position={[object.x + Math.sin(angle) * 0.35, 0.07, object.y - Math.cos(angle) * 0.35]} rotation={[0, angle, 0]}><coneGeometry args={[0.16, 0.38, 3]} /><meshStandardMaterial color="#235e89" /></mesh></group>;
      }
      const stage = object.type === "stage" || object.type === "obstacle" && object.obstacleType === "stage";
      const reserved = object.type === "reservedArea" || object.type === "obstacle" && object.obstacleType === "restricted";
      const height = reserved ? 0.035 : stage ? 0.35 : 1.2;
      return <mesh key={object.id} renderOrder={reserved ? 1 : 0} position={[object.x, height / 2, object.y]} rotation={[0, -object.rotation * Math.PI / 180, 0]}><boxGeometry args={[object.width, height, object.depth]} /><meshStandardMaterial color={reserved ? "#947bb2" : stage ? "#a47752" : "#81776d"} transparent={reserved} opacity={reserved ? 0.4 : 1} depthWrite={!reserved} /></mesh>;
    })}
    {TABLE_MODELS.filter(model => plan.tables?.some(table => table.modelId === model.id)).map(model => <Suspense key={model.id} fallback={null}><ModelTables plan={plan} model={model} /></Suspense>)}
    {!!plan.seating?.seats.length && <ChairErrorBoundary fallback={<FallbackSeats plan={plan} />}><Suspense fallback={<FallbackSeats plan={plan} />}><ModelSeats plan={plan} /></Suspense></ChairErrorBoundary>}
    {!!plan.chairs?.length && <ChairErrorBoundary fallback={null}><Suspense fallback={null}><ModelFurnitureChairs plan={plan} /></Suspense></ChairErrorBoundary>}
    <CameraControls plan={plan} reset={reset} />
  </>;
}

export default function RoomView3D({ plan }: { plan: RoomPlan }) {
  const [reset, setReset] = useState(0);
  const resetView = useCallback(() => setReset(value => value + 1), []);
  return <div className="relative h-full w-full"><Canvas camera={{ fov: 48, near: 0.1, far: 1000 }} dpr={[1, 1.5]}><Scene plan={plan} reset={reset} /></Canvas><button type="button" onClick={resetView} className="absolute bottom-4 right-4 rounded-md border border-stone-300 bg-white/90 px-3 py-1.5 text-sm text-stone-700 shadow-sm hover:bg-white">Ansicht zurücksetzen</button></div>;
}
