"use client";

import dynamic from "next/dynamic";
import type { PlannerChair } from "@/lib/room-planner/chairs";

const RoomPlanner = dynamic(() => import("./RoomPlanner"), {
  ssr: false,
  loading: () => <div className="premium-card min-h-[32rem] animate-pulse bg-premium-warm" aria-label="3D-Raumplaner wird geladen" />,
});

export default function RoomPlannerLoader({ chairs }: { chairs: PlannerChair[] }) {
  return <RoomPlanner chairs={chairs} />;
}
