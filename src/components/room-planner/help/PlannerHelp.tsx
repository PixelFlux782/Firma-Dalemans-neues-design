"use client";

import { useEffect, useRef, useState } from "react";
import PlannerHelpAnimation from "./PlannerHelpAnimation";
import { PLANNER_HELP_CONTENT, PLANNER_HELP_STORAGE_KEY, PLANNER_ONBOARDING, readHelpPreferences, writeHelpPreferences, type PlannerHelpId, type PlannerHelpPreferences } from "./plannerHelpContent";

type Props = {
  tool: string;
  roomClosed: boolean;
  selectionType: string | null;
  areaMode: "tables" | "table";
  hasZones: boolean;
  hasSeating: boolean;
  view: "2d" | "3d";
  closeSignal: number;
  onActiveChange: (kind: "menu" | "help" | "onboarding" | null) => void;
  onRequestTool: (tool: string) => void;
};

export default function PlannerHelp({ tool, roomClosed, selectionType, areaMode, hasZones, hasSeating, view, closeSignal, onActiveChange, onRequestTool }: Props) {
  const [ready, setReady] = useState(false);
  const [openHelp, setOpenHelp] = useState<PlannerHelpId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [preferences, setPreferences] = useState<PlannerHelpPreferences>({});
  const previousTool = useRef(tool);
  const manualOpen = useRef(false);
  const onboardingStepRef = useRef(onboardingStep);
  const openHelpRef = useRef(openHelp);
  onboardingStepRef.current = onboardingStep;
  openHelpRef.current = openHelp;
  const active = menuOpen || openHelp !== null || onboardingStep !== null;

  useEffect(() => {
    const next = readHelpPreferences();
    setPreferences(next);
    if (!next.onboardingSeen && !next.onboardingSkipped) setOnboardingStep(0);
    setReady(true);
  }, []);
  useEffect(() => { onActiveChange(onboardingStep !== null ? "onboarding" : menuOpen ? "menu" : openHelp ? "help" : null); }, [menuOpen, onboardingStep, onActiveChange, openHelp]);
  useEffect(() => {
    if (!closeSignal) return;
    const contextualId = openHelpRef.current;
    if (contextualId && !manualOpen.current) setPreferences((current) => {
      const next = { ...current, dismissed: [...new Set([...(current.dismissed ?? []), contextualId])] };
      writeHelpPreferences(next);
      return next;
    });
    setMenuOpen(false); setOpenHelp(null); setOnboardingStep(null);
    if (onboardingStepRef.current !== null) setPreferences((current) => {
      const next = { ...current, onboardingSkipped: true };
      writeHelpPreferences(next);
      return next;
    });
  }, [closeSignal]);
  useEffect(() => {
    if (!ready || onboardingStep !== null || tool === previousTool.current) return;
    previousTool.current = tool;
    const id = contextualHelpId(tool, roomClosed, selectionType, areaMode, hasZones, hasSeating);
    if (!id || preferences.dismissed?.includes(id)) return;
    manualOpen.current = false;
    setMenuOpen(false);
    setOpenHelp(id);
  }, [areaMode, hasSeating, hasZones, onboardingStep, preferences.dismissed, ready, roomClosed, selectionType, tool]);
  useEffect(() => {
    if (!ready || onboardingStep !== null || menuOpen || openHelp || !selectionType) return;
    const id = contextualHelpId(tool, roomClosed, selectionType, areaMode, hasZones, hasSeating);
    if (id && !preferences.dismissed?.includes(id)) setOpenHelp(id);
  }, [areaMode, hasSeating, hasZones, menuOpen, onboardingStep, openHelp, preferences.dismissed, ready, roomClosed, selectionType, tool]);

  const persist = (next: PlannerHelpPreferences) => { setPreferences(next); writeHelpPreferences(next); };
  const closeHelp = () => {
    if (openHelp && !manualOpen.current) persist({ ...preferences, dismissed: [...new Set([...(preferences.dismissed ?? []), openHelp])] });
    setOpenHelp(null); setMenuOpen(false); manualOpen.current = false;
  };
  const startOnboarding = () => { setMenuOpen(false); setOpenHelp(null); setOnboardingStep(0); onRequestTool(PLANNER_ONBOARDING[0].tool); };
  const finishOnboarding = (skipped = false) => { persist({ ...preferences, onboardingSeen: !skipped, onboardingSkipped: skipped }); setOnboardingStep(null); };
  const showManual = (id: PlannerHelpId) => { manualOpen.current = true; setMenuOpen(false); setOpenHelp(id); };
  const onboarding = onboardingStep === null ? null : PLANNER_ONBOARDING[onboardingStep];
  const closeActiveLayer = () => { if (onboardingStep !== null) { finishOnboarding(true); return; } setMenuOpen(false); setOpenHelp(null); };

  return <div className="relative ml-1" data-help-ready={ready ? "true" : "false"} data-help-storage-key={PLANNER_HELP_STORAGE_KEY} onKeyDown={(event) => { if (event.key === "Escape" && active) { event.preventDefault(); event.stopPropagation(); closeActiveLayer(); } }}>
    <button type="button" aria-label="Hilfe zum Raumplaner" title="Hilfe" aria-expanded={menuOpen || openHelp !== null || onboardingStep !== null} onClick={() => { setOpenHelp(null); setMenuOpen(value => !value); }} className="flex h-9 w-9 items-center justify-center rounded-full border border-premium-beige bg-white text-sm font-bold text-premium-forest shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-premium-forest">?</button>
    {menuOpen && <div role="dialog" aria-label="Kurzanleitung" onPointerDown={event => event.stopPropagation()} className="planner-help-popover absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1rem))] rounded-xl border border-premium-beige bg-white p-3 text-sm shadow-xl">
      <div className="flex items-center justify-between"><strong>Hilfe zum Raumplaner</strong><button type="button" aria-label="Hilfe schließen" onClick={() => setMenuOpen(false)} className="rounded px-2 py-1 text-lg">×</button></div>
      <button type="button" onClick={() => showManual(contextualHelpId(tool, roomClosed, selectionType, areaMode, hasZones, hasSeating) ?? "start-room")} className="mt-2 w-full rounded-lg bg-[#f1f5ef] px-3 py-2 text-left font-semibold text-premium-forest">Hilfe zur aktuellen Funktion</button>
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs"><button type="button" onClick={() => showManual("draw-room")} className="rounded border border-premium-beige p-2 text-left">Raum zeichnen</button><button type="button" onClick={() => showManual("door-aisle")} className="rounded border border-premium-beige p-2 text-left">Tür & Gang</button><button type="button" onClick={() => showManual("table-zone")} className="rounded border border-premium-beige p-2 text-left">Tischbereiche</button><button type="button" onClick={() => showManual("zone-setup")} className="rounded border border-premium-beige p-2 text-left">Bereich einrichten</button><button type="button" onClick={() => showManual("free-seating")} className="rounded border border-premium-beige p-2 text-left">Freie Fläche</button><button type="button" onClick={() => showManual("table-snap")} className="rounded border border-premium-beige p-2 text-left">Tische verbinden</button></div>
      <button type="button" onClick={startOnboarding} className="mt-2 w-full rounded border border-premium-forest px-3 py-2 font-semibold text-premium-forest">Einführung erneut starten</button>
    </div>}
    {openHelp && <HelpCard id={openHelp} onClose={closeHelp} view={view} />}
    {onboarding && <div role="dialog" aria-label={`Einführung: ${onboarding.title}`} aria-live="polite" onPointerDown={event => event.stopPropagation()} className="planner-onboarding fixed bottom-4 left-1/2 z-50 w-[min(25rem,calc(100vw-1rem))] -translate-x-1/2 rounded-2xl border border-premium-beige bg-white p-4 shadow-2xl">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-premium-muted"><span>Schritt {onboardingStep! + 1} von {PLANNER_ONBOARDING.length}</span><button type="button" onClick={() => finishOnboarding(true)} className="rounded px-2 py-1 normal-case tracking-normal">Überspringen</button></div>
      <PlannerHelpAnimation variant={PLANNER_HELP_CONTENT[onboarding.helpId].animation} active />
      <h2 className="mt-2 font-semibold text-premium-forest">{onboarding.title}</h2><p className="mt-1 text-sm text-premium-charcoal">{onboarding.description}</p>
      <div className="mt-3 flex items-center justify-between"><button type="button" disabled={onboardingStep === 0} onClick={() => { const step = Math.max(0, onboardingStep! - 1); setOnboardingStep(step); onRequestTool(PLANNER_ONBOARDING[step].tool); }} className="rounded px-3 py-2 text-sm disabled:opacity-30">Zurück</button><button type="button" onClick={() => { if (onboardingStep === PLANNER_ONBOARDING.length - 1) { finishOnboarding(); return; } const step = onboardingStep! + 1; setOnboardingStep(step); onRequestTool(PLANNER_ONBOARDING[step].tool); }} className="rounded-lg bg-premium-forest px-4 py-2 text-sm font-semibold text-white">{onboardingStep === PLANNER_ONBOARDING.length - 1 ? "Loslegen" : "Weiter"}</button></div>
    </div>}
  </div>;
}

function HelpCard({ id, onClose, view }: { id: PlannerHelpId; onClose: () => void; view: "2d" | "3d" }) {
  const help = PLANNER_HELP_CONTENT[id];
  return <div role="dialog" aria-label={help.title} onPointerDown={event => event.stopPropagation()} className="planner-help-popover absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1rem))] rounded-xl border border-premium-beige bg-white p-3 shadow-xl" data-view={view}>
    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wide text-premium-muted">Kurzhilfe</p><h2 className="font-semibold text-premium-forest">{help.title}</h2></div><button type="button" aria-label="Hilfe schließen" onClick={onClose} className="rounded px-2 py-1 text-lg">×</button></div>
    <PlannerHelpAnimation variant={help.animation} active />
    <p className="mt-2 text-sm leading-5 text-premium-charcoal">{help.description}</p>{help.note && <p className="mt-2 rounded bg-[#f7f6f1] p-2 text-xs font-semibold text-premium-forest">{help.note}</p>}
  </div>;
}

function contextualHelpId(tool: string, roomClosed: boolean, selectionType: string | null, areaMode: "tables" | "table", hasZones: boolean, hasSeating: boolean): PlannerHelpId | null {
  if (selectionType === "zone") return "zone-setup";
  if (selectionType && selectionType !== "point" && selectionType !== "wall") return selectionType === "table" ? "table-snap" : "edit-object";
  if (!roomClosed) return tool === "wall" ? "draw-room" : "start-room";
  if (tool === "door" || tool === "aisle") return "door-aisle";
  if (tool === "table") return areaMode === "tables" ? "table-zone" : "table-snap";
  if (tool === "chair") return hasZones || hasSeating ? "free-seating" : "free-seating";
  if (tool === "select") return "edit-object";
  return null;
}
