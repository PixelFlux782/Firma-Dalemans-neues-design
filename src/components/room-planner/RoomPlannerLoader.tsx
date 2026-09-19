"use client";

import dynamic from "next/dynamic";

const RoomPlanner = dynamic(() => import("./RoomPlanner"), {
  ssr: false,
  loading: () => <div className="premium-card min-h-[32rem] animate-pulse bg-premium-warm" aria-label="3D-Raumplaner wird geladen" />,
});

export default function RoomPlannerLoader() {
  return <RoomPlanner />;
}
