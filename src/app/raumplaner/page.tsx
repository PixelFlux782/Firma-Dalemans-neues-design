import type { Metadata } from "next";
import RoomPlanner from "@/components/room-planner/RoomPlannerLoader";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "3D-Raumplaner", description: "Einfacher 3D-Prototyp zur Planung einer Reihenbestuhlung mit Bühne, Mittelgang und Seitengängen.", path: "/raumplaner" });

export default function RaumplanerPage() {
  return <div className="page-stack"><header className="max-w-3xl py-6 sm:py-10"><p className="section-eyebrow">3D-Raumplaner · V0.3</p><h1 className="mt-4 font-display text-4xl font-medium leading-tight text-premium-ink sm:text-5xl">Bestuhlung direkt im Raum ausprobieren.</h1><p className="section-lead mt-5">Maße anpassen und eine einfache Reihenbestuhlung mit Bühne, Mittelgang und Seitengängen live betrachten.</p><p className="mt-4 inline-flex rounded-full border border-premium-beige bg-premium-warm px-4 py-2 text-xs font-medium text-premium-muted">Prototyp – Bestuhlung ohne baurechtliche Prüfung</p></header><RoomPlanner /></div>;
}
