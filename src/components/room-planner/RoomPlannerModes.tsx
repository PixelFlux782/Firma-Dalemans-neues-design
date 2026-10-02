"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { PlannerChair } from "@/lib/room-planner/chairs";
import RoomEditor2D from "./2d/RoomEditor2D";

const LegacyRoomPlanner = dynamic(() => import("./RoomPlanner"), { ssr: false, loading: () => <div className="premium-card min-h-[32rem] animate-pulse bg-premium-warm" aria-label="3D-Raumplaner wird geladen" /> });

export default function RoomPlannerModes({ chairs }: { chairs: PlannerChair[] }) {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [opened3D, setOpened3D] = useState(false);
  const show3D = () => { setOpened3D(true); setMode("3d"); };
  return <div>
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="font-display text-2xl text-premium-ink">Raumplaner</h1><p className="text-xs text-premium-muted">Planen · Prüfen · Visualisieren · Angebot anfordern</p></div>
      <div className="inline-flex rounded-full border border-premium-beige bg-white p-1" aria-label="Ansichtsmodus">
        <button type="button" aria-pressed={mode === "2d"} onClick={() => setMode("2d")} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === "2d" ? "bg-premium-forest text-white" : "text-premium-charcoal hover:bg-premium-warm"}`}>2D planen</button>
        <button type="button" aria-pressed={mode === "3d"} onClick={show3D} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === "3d" ? "bg-premium-forest text-white" : "text-premium-charcoal hover:bg-premium-warm"}`}>3D ansehen</button>
      </div>
    </div>
    <div hidden={mode !== "2d"}><RoomEditor2D /></div>
    {opened3D ? <div hidden={mode !== "3d"}><LegacyRoomPlanner chairs={chairs} /></div> : null}
  </div>;
}
