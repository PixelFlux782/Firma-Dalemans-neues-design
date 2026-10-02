"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { doorSegment, frontSegment, type DoorObject, type RoomPlan } from "@/lib/room-planner/objects";

const DEFAULT_WALL_HEIGHT = 3;
const chairGeometry = new THREE.BoxGeometry(1, 1, 1);
const seatMaterial = new THREE.MeshStandardMaterial({ color: "#64776c", roughness: 0.82 });
const frameMaterial = new THREE.MeshStandardMaterial({ color: "#514f49", roughness: 0.76 });

function planBounds(plan: RoomPlan) {
  const points = plan.contour.points;
  if (!points.length) return { x: 0, z: 0, span: 12 };
  const xs = points.map(p => p.x), zs = points.map(p => p.y);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2, span: Math.max(4, Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) };
}

function CameraControls({ plan, reset }: { plan: RoomPlan; reset: number }) {
  const bounds = useMemo(() => planBounds(plan), [plan]);
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const fov = (camera as THREE.PerspectiveCamera).fov * Math.PI / 180;
    const distance = bounds.span * 1.35 / Math.tan(fov / 2) * Math.max(1, size.height / Math.max(size.width, 1));
    camera.position.set(bounds.x + distance * 0.62, distance * 0.72, bounds.z + distance * 0.62);
    camera.lookAt(bounds.x, 0, bounds.z);
    controls.current?.target.set(bounds.x, 0, bounds.z);
    controls.current?.update();
  }, [bounds, camera, reset, size.width, size.height]);
  return <OrbitControls ref={controls} makeDefault target={[bounds.x, 0, bounds.z]} minDistance={2} maxDistance={bounds.span * 10} maxPolarAngle={Math.PI / 2.05} />;
}

function Seats({ plan }: { plan: RoomPlan }) {
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
      const item = seats[i], angle = -item.rotation * Math.PI / 180;
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
    <hemisphereLight args={["#ffffff", "#b8afa1", 2]} /><directionalLight position={[8, 15, 10]} intensity={2.2} />
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
    {plan.objects.map(object => {
      if (object.type === "door") {
        const segment = doorSegment(plan.contour, object); if (!segment) return null;
        const emergency = object.role === "emergency_exit", exit = emergency || object.role === "exit";
        const middle: [number, number, number] = [(segment.start.x + segment.end.x) / 2, 0, (segment.start.y + segment.end.y) / 2];
        const angle = -Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x);
        return <group key={object.id} position={middle} rotation={[0, angle, 0]}><mesh position={[0, 0.025, 0]}><boxGeometry args={[object.width, 0.05, 0.24]} /><meshStandardMaterial color={emergency ? "#c55343" : exit ? "#388e6a" : "#668897"} /></mesh><mesh position={[0, 1.05, 0]}><boxGeometry args={[object.width, 2.1, 0.025]} /><meshStandardMaterial color={emergency ? "#c55343" : exit ? "#388e6a" : "#668897"} transparent opacity={0.12} depthWrite={false} /></mesh></group>;
      }
      if (object.type === "aisle") {
        const dx = object.end.x - object.start.x, dz = object.end.y - object.start.y;
        return <mesh key={object.id} position={[(object.start.x + object.end.x) / 2, 0.015, (object.start.y + object.end.y) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}><boxGeometry args={[Math.hypot(dx, dz), 0.025, object.width]} /><meshStandardMaterial color={object.source === "generated" ? "#d6a964" : "#67a3a7"} transparent opacity={0.6} /></mesh>;
      }
      if (object.type === "front") {
        const segment = frontSegment(object);
        const angle = object.rotation * Math.PI / 180;
        return <group key={object.id}><mesh position={[(segment.start.x + segment.end.x) / 2, 0.055, (segment.start.y + segment.end.y) / 2]} rotation={[0, -angle, 0]}><boxGeometry args={[object.width, 0.11, 0.12]} /><meshStandardMaterial color="#235e89" /></mesh><mesh position={[object.x + Math.sin(angle) * 0.35, 0.07, object.y - Math.cos(angle) * 0.35]} rotation={[0, angle, 0]}><coneGeometry args={[0.16, 0.38, 3]} /><meshStandardMaterial color="#235e89" /></mesh></group>;
      }
      const stage = object.type === "stage" || object.type === "obstacle" && object.obstacleType === "stage";
      const reserved = object.type === "reservedArea" || object.type === "obstacle" && object.obstacleType === "restricted";
      const height = reserved ? 0.035 : stage ? 0.35 : 1.2;
      return <mesh key={object.id} position={[object.x, height / 2, object.y]} rotation={[0, -object.rotation * Math.PI / 180, 0]}><boxGeometry args={[object.width, height, object.depth]} /><meshStandardMaterial color={reserved ? "#947bb2" : stage ? "#a47752" : "#81776d"} transparent={reserved} opacity={reserved ? 0.65 : 1} /></mesh>;
    })}
    <Seats plan={plan} />
    <CameraControls plan={plan} reset={reset} />
  </>;
}

export default function RoomView3D({ plan }: { plan: RoomPlan }) {
  const [reset, setReset] = useState(0);
  const resetView = useCallback(() => setReset(value => value + 1), []);
  return <div className="relative h-full w-full"><Canvas camera={{ fov: 48, near: 0.1, far: 1000 }} dpr={[1, 1.5]}><Scene plan={plan} reset={reset} /></Canvas><button type="button" onClick={resetView} className="absolute bottom-4 right-4 rounded-md border border-stone-300 bg-white/90 px-3 py-1.5 text-sm text-stone-700 shadow-sm hover:bg-white">Ansicht zurücksetzen</button></div>;
}
