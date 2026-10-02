"use client";

import type { ChangeEvent } from "react";
import type { RoomPlannerProject } from "@/lib/room-planner/projects";

type Props = {
  projects: RoomPlannerProject[];
  activeId: string | null;
  status: "saved" | "dirty" | "saving";
  error: string;
  onNew: () => void;
  onSave: () => void;
  onSaveAs: (name: string) => void;
  onOpen: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (text: string) => void;
  onImportError: (message: string) => void;
};

export default function ProjectControls({ projects, activeId, status, error, onNew, onSave, onSaveAs, onOpen, onRename, onDuplicate, onDelete, onExport, onImport, onImportError }: Props) {
  const active = projects.find((project) => project.id === activeId);
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (file.size > 4_000_000) { onImportError("Die Projektdatei ist zu groß."); return; }
    try { onImport(await file.text()); } catch { onImportError("Die Projektdatei konnte nicht gelesen werden."); }
  };
  return <div aria-label="Projektverwaltung" className="border-b border-premium-beige bg-[#f1f5ef] px-2 py-1 text-xs sm:px-3">
    <div className="flex flex-wrap items-center gap-2">
      <strong className="mr-2">{active?.name ?? "Kein Projekt"}</strong>
      <span role="status" className="mr-auto text-xs text-premium-muted">{{ saved: "Gespeichert", dirty: "Ungespeicherte Änderungen", saving: "Wird gespeichert …" }[status]}</span>
      <button type="button" onClick={onNew} className="rounded border border-premium-beige bg-white px-2 py-1">Neues Projekt</button>
      <button type="button" onClick={onSave} className="rounded border border-premium-beige bg-white px-2 py-1">Speichern</button>
      <button type="button" onClick={() => { const name = window.prompt("Name für die Kopie", active ? `${active.name} Kopie` : "Neue Raumplanung"); if (name?.trim()) onSaveAs(name); }} className="rounded border border-premium-beige bg-white px-2 py-1">Speichern unter</button>
      <button type="button" disabled={!active} onClick={onExport} className="rounded border border-premium-beige bg-white px-2 py-1 disabled:opacity-40">JSON exportieren</button><label className="cursor-pointer rounded border border-premium-beige bg-white px-2 py-1">JSON importieren<input aria-label="Projektdatei importieren" type="file" accept=".json,application/json" onChange={importFile} className="sr-only" /></label>
    </div>
    {error && <p role="alert" className="mt-2 text-red-800">{error}</p>}
    <details><summary className="cursor-pointer font-semibold">Gespeicherte Projekte ({projects.length})</summary>
      <div className="mt-2 max-h-56 space-y-2 overflow-auto">{projects.map((project) => <div key={project.id} className="flex flex-wrap items-center gap-2 rounded border border-premium-beige bg-white p-2 text-xs">
        <span className="min-w-40 flex-1"><strong>{project.name}</strong>{project.id === activeId ? " · geöffnet" : ""}<br />Geändert: {new Date(project.updatedAt).toLocaleString("de-DE")} · {project.plan.seating?.totalSeats ?? 0} Plätze</span>
        <button type="button" disabled={project.id === activeId} onClick={() => onOpen(project.id)} className="rounded border px-2 py-1 disabled:opacity-40">Öffnen</button>
        <button type="button" onClick={() => { const name = window.prompt("Projekt umbenennen", project.name); if (name?.trim()) onRename(project.id, name); }} className="rounded border px-2 py-1">Umbenennen</button>
        <button type="button" onClick={() => onDuplicate(project.id)} className="rounded border px-2 py-1">Duplizieren</button>
        <button type="button" onClick={() => onDelete(project.id)} className="rounded border border-red-300 px-2 py-1 text-red-800">Löschen</button>
      </div>)}</div>
    </details>
  </div>;
}
