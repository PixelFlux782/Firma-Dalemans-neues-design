"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { doorSegment, frontSegment, type DoorObject, type RoomPlan } from "@/lib/room-planner/objects";

function Seats({ plan }: { plan: RoomPlan }) {
  const seats = useMemo(() => plan.seating?.seats ?? [], [plan.seating?.seats]);
  const width = plan.seating?.rules.chairWidth ?? plan.chairSelection?.width ?? 0.5;
  const depth = plan.seating?.rules.chairDepth ?? plan.chairSelection?.depth ?? 0.55;
  const seatRef = useRef<THREE.InstancedMesh>(null);
  const backRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const seatMesh = seatRef.current, backMesh = backRef.current;
    if (!seatMesh || !backMesh) return;
    const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), rotation = new THREE.Quaternion(), scale = new THREE.Vector3();
    for (let i = 0; i < seats.length; i++) {
      const item = seats[i], angle = -item.rotation * Math.PI / 180;
      rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      position.set(item.x, 0.43, item.y); scale.set(width, 0.12, depth);
      seatMesh.setMatrixAt(i, matrix.compose(position, rotation, scale));
      position.set(item.x + Math.sin(angle) * depth * 0.43, 0.75, item.y - Math.cos(angle) * depth * 0.43);
      scale.set(width, 0.62, 0.1);
      backMesh.setMatrixAt(i, matrix.compose(position, rotation, scale));
    }
    seatMesh.instanceMatrix.needsUpdate = true; backMesh.instanceMatrix.needsUpdate = true;
    seatMesh.computeBoundingSphere(); backMesh.computeBoundingSphere();
  }, [seats, width, depth]);
  if (!seats.length) return null;
  return <><instancedMesh ref={seatRef} args={[undefined, undefined, seats.length]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#4e7166" /></instancedMesh><instancedMesh ref={backRef} args={[undefined, undefined, seats.length]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#3c5d53" /></instancedMesh></>;
}

function Scene({ plan }: { plan: RoomPlan }) {
  const points = plan.contour.points;
  const bounds = useMemo(() => {
    if (!points.length) return { x: 0, z: 0, span: 12 };
    const xs = points.map(p => p.x), ys = points.map(p => p.y);
    return { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...ys) + Math.max(...ys)) / 2, span: Math.max(4, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) };
  }, [points]);
  const floor = useMemo(() => {
    if (!plan.contour.closed || points.length < 3) return null;
    const shape = new THREE.Shape();
    points.forEach((p, i) => i ? shape.lineTo(p.x, -p.y) : shape.moveTo(p.x, -p.y));
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [plan.contour.closed, points]);
  return <>
    <color attach="background" args={["#f6f4ed"]} />
    <ambientLight intensity={1.8} /><directionalLight position={[8, 15, 10]} intensity={2} />
    {floor && <mesh geometry={floor} rotation={[-Math.PI / 2, 0, 0]}><meshStandardMaterial color="#ded9ca" side={THREE.DoubleSide} /></mesh>}
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
        return <mesh key={index} position={[a.x + (b.x - a.x) * t, 1.25, a.y + (b.y - a.y) * t]} rotation={[0, -Math.atan2(b.y - a.y, b.x - a.x), 0]}><boxGeometry args={[part.end - part.start, 2.5, 0.1]} /><meshStandardMaterial color="#b9b3a5" transparent opacity={0.68} /></mesh>;
      })}</group>;
    })}
    {plan.objects.map(object => {
      if (object.type === "door") {
        const segment = doorSegment(plan.contour, object); if (!segment) return null;
        const emergency = object.role === "emergency_exit", exit = emergency || object.role === "exit";
        return <mesh key={object.id} position={[(segment.start.x + segment.end.x) / 2, 0.04, (segment.start.y + segment.end.y) / 2]} rotation={[0, -Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x), 0]}><boxGeometry args={[object.width, 0.08, 0.18]} /><meshStandardMaterial color={emergency ? "#d95b43" : exit ? "#2e9a69" : "#357b9a"} /></mesh>;
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
    <OrbitControls makeDefault target={[bounds.x, 0, bounds.z]} minDistance={2} maxDistance={bounds.span * 8} maxPolarAngle={Math.PI / 2.05} />
  </>;
}

export default function RoomView3D({ plan }: { plan: RoomPlan }) {
  const points = plan.contour.points;
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const x = points.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
  const z = points.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : 0;
  const span = points.length ? Math.max(8, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) : 12;
  return <Canvas camera={{ position: [x + span * 0.8, span * 1.15, z + span * 0.8], fov: 48, near: 0.1, far: 1000 }} dpr={[1, 1.5]}><Scene plan={plan} /></Canvas>;
}
