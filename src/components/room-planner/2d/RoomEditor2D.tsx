"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { appendPoint, closeRoom, formatMeters, movePoint, orthogonalSnap, perimeter, pointById, polygonArea, snapPoint, validateRoom, wallLength, type Point2D } from "@/lib/room-planner/geometry";
import { commit, createHistory, redo, undo } from "@/lib/room-planner/history";
import { aislePolygon, doorSegment, emptyPlan, frontSegment, isBlockingObject, obstaclePolygon, validateObjects, wallEndpoints, wallOffset, type RoomObject, type RoomPlan, type ObstacleObject, type AisleObject } from "@/lib/room-planner/objects";
import { DEFAULT_SEATING_RULES, generateSeatingPlan, type SeatingGridOffset, type SeatingOrientation, type SeatingPlan, type SeatingRules } from "@/lib/room-planner/seating";
import { generatePlanVariants, PLANNING_PROFILES, type OrientationPreference, type PlanVariant, type VariantResult } from "@/lib/room-planner/variants";
import { analyzeEgress } from "@/lib/room-planner/egress/analyzeEgress";
import { evaluateRules } from "@/lib/room-planner/rules/evaluateRules";
import { RULE_PROFILES } from "@/lib/room-planner/rules/profiles";
import { applyAisleSuggestion, suggestAisles } from "@/lib/room-planner/suggestions/aisleSuggestions";
import { planFingerprint } from "@/lib/room-planner/variantSummary";
import { characteristic, compareVariants } from "@/lib/room-planner/variantComparison";
import { editRow, moveBlock, removeBlock, removeSeat, rotateBlock, rowsOf } from "@/lib/room-planner/seatingEditing";
import { analyzeCurrentPlan } from "@/lib/room-planner/currentPlanAnalysis";
import { createProject, parseProject, parseProjectStore, projectFileName, PROJECT_SCHEMA_VERSION, PROJECT_STORAGE_KEY, type PlannerSettings, type RoomPlannerProject } from "@/lib/room-planner/projects";
import ProjectControls from "./ProjectControls";
import PlanOutputView from "./PlanOutputView";
import { calculatePlanDemand, calculateRecommendedDemand, changeChairSelection, chairProducts, DEFAULT_CHAIR_SELECTION, resolveChairShopTarget } from "@/lib/room-planner/chairSelection";

const INITIAL_SCALE = 45;
const MIN_SCALE = 12;
const MAX_SCALE = 240;
const POINT_RADIUS = 5;
type Tool = "wall" | "select" | "door" | "obstacle" | "aisle" | "front" | "stage" | "reservedArea";
type Selection = { type: "point" | "wall" | "object" | "block" | "seat"; id: string } | null;
type Camera = { x: number; y: number; scale: number };
type Drag = { type: "pan"; startX: number; startY: number; camera: Camera } | { type: "point" | "object" | "start" | "end" | "block"; id: string; at: { x: number; y: number }; original: RoomPlan };

export default function RoomEditor2D() {
  const [history, setHistory] = useState(() => createHistory(emptyPlan()));
  const plan = history.present;
  const room = plan.contour;
  const chairSelection = plan.chairSelection ?? DEFAULT_CHAIR_SELECTION;
  const demand = calculatePlanDemand(plan);
  const [reservePercent, setReservePercent] = useState<PlannerSettings["reservePercent"]>(5);
  const recommended = calculateRecommendedDemand(plan, reservePercent);
  const shopTarget = resolveChairShopTarget(plan, recommended.recommendedQuantity);
  const [previewPlan, setPreviewPlan] = useState<RoomPlan | null>(null);
  const [tool, setTool] = useState<Tool>("wall");
  const [selection, setSelection] = useState<Selection>(null);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: INITIAL_SCALE });
  const [size, setSize] = useState({ width: 900, height: 580 });
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [aisleStart, setAisleStart] = useState<{ x: number; y: number } | null>(null);
  const [shiftDown, setShiftDown] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const [notice, setNotice] = useState("");
  const [rowEditCount, setRowEditCount] = useState(1);
  const [seatingRules, setSeatingRules] = useState<SeatingRules>({ ...DEFAULT_SEATING_RULES });
  const [orientation, setOrientation] = useState<SeatingOrientation>("horizontal");
  const [gridOffset, setGridOffset] = useState<SeatingGridOffset>({ along: 0, cross: 0 });
  const [orientationPreference, setOrientationPreference] = useState<OrientationPreference>("automatic");
  const [variantCalculation, setVariantCalculation] = useState<{ fingerprint: string; rules: SeatingRules; profileId: string; preference: OrientationPreference; result: VariantResult } | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [variantsBusy, setVariantsBusy] = useState(false);
  const [variantError, setVariantError] = useState("");
  const generatingRef = useRef(false);
  const [profileId, setProfileId] = useState(RULE_PROFILES[0].id);
  const [applicabilityConfirmed, setApplicabilityConfirmed] = useState(false);
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const [calculated, setCalculated] = useState<{ plan: RoomPlan; rules: SeatingRules; orientation: SeatingOrientation; offset: SeatingGridOffset; result: SeatingPlan } | null>(null);
  const [projects, setProjects] = useState<RoomPlannerProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const projectName = projects.find((project) => project.id === activeProjectId)?.name ?? "Unbenanntes Projekt";
  const inquiryHref = `/kontakt?${new URLSearchParams({ anliegen: "Raumplaner-Bedarf", produkt: demand.product?.title ?? "", variante: demand.variant?.title ?? "", nachricht: `Anfrage aus dem Raumplaner\nProjekt: ${projectName}\nStuhlmodell: ${demand.product?.title ?? ""}\nVariante: ${demand.variant?.title ?? ""}\nGeplante Sitzplätze / Grundbedarf: ${recommended.quantity}\nReserve: ${reservePercent} % (${recommended.reserveQuantity} Stück)\nEmpfohlene Gesamtmenge: ${recommended.recommendedQuantity} Stück\nSitzblöcke: ${demand.blocks}\nGänge: ${plan.objects.filter((object) => object.type === "aisle").length}\nAusgänge: ${plan.objects.filter((object) => object.type === "door" && (object.role === "exit" || object.role === "emergency_exit")).length}\nRaumfläche: ${plan.contour.closed ? formatMeters(polygonArea(plan.contour.points)) + " m²" : "nicht bestimmt"}\nStuhlmaße: ${formatMeters(chairSelection.width)} × ${formatMeters(chairSelection.depth)} m (Planungsannahme)\nRegel-/Referenzprofil: ${RULE_PROFILES.find((item) => item.id === profileId)?.name ?? "nicht gewählt"}; keine behördliche Freigabe.` })}#anfrage`;
  const [storageReady, setStorageReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "dirty" | "saving">("saved");
  const [projectError, setProjectError] = useState("");
  const [outputIssuedAt, setOutputIssuedAt] = useState<Date | null>(null);
  const projectsRef = useRef<RoomPlannerProject[]>([]);
  const skipNextAutosave = useRef(false);
  const currentFingerprint = useMemo(() => planFingerprint(plan), [plan]);
  const variantsCurrent = !!variantCalculation && variantCalculation.fingerprint === currentFingerprint && variantCalculation.rules === seatingRules && variantCalculation.profileId === profileId && variantCalculation.preference === orientationPreference;
  const variants = variantsCurrent ? variantCalculation!.result : null;
  const activeVariant = variants?.variants.find((item) => item.id === activeVariantId) ?? (variants?.fallback?.id === activeVariantId ? variants.fallback : null);
  const shownPlan = previewPlan ?? activeVariant?.plan ?? plan;
  const shownRoom = shownPlan.contour;
  const seating = activeVariant?.seatingPlan ?? shownPlan.seating ?? (!previewPlan && calculated?.plan === plan && calculated.rules === seatingRules && calculated.orientation === orientation ? calculated.result : null);
  const profile = RULE_PROFILES.find((item) => item.id === profileId) ?? RULE_PROFILES[0];
  const currentAnalysis = useMemo(() => !activeVariant && plan.seating ? analyzeCurrentPlan(plan, plan.seating, profile) : null, [activeVariant, plan, profile]);
  const analysis = activeVariant?.analysis ?? currentAnalysis?.egress ?? (seating ? analyzeEgress(plan, seating, profile) : null);
  const report = activeVariant?.report ?? currentAnalysis?.report ?? (seating && analysis ? evaluateRules(plan, seating, analysis, profile) : null);
  const suggestions = useMemo(() => !activeVariant && seating && analysis && report && (seating.rotation === undefined || seating.rotation === 0 || seating.rotation === 90) ? suggestAisles(plan, seating, profile, analysis, report) : [], [activeVariant, plan, seating, profile, analysis, report]);
  const activeCheck = report?.checks.find((check) => check.id === activeCheckId);
  const activeSuggestion = suggestions.find((suggestion) => suggestion.id === activeSuggestionId);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const nextId = useRef(1);
  const parameterHistory = useRef(new WeakMap<RoomPlan, { rules: SeatingRules; orientation: SeatingOrientation; offset: SeatingGridOffset; seating: SeatingPlan | null }>());
  const roomRef = useRef(plan);
  roomRef.current = plan;
  const snapshot = useMemo(() => ({ plan, settings: { seatingRules, orientation, gridOffset, orientationPreference, profileId, applicabilityConfirmed, reservePercent } satisfies PlannerSettings }), [plan, seatingRules, orientation, gridOffset, orientationPreference, profileId, applicabilityConfirmed, reservePercent]);
  const initialSnapshot = useRef(snapshot);
  const writeProjects = (next: RoomPlannerProject[], activeId: string | null, markSaved = true): boolean => {
    try {
      if (next.length > 100) throw new Error("project-limit");
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify({ schemaVersion: PROJECT_SCHEMA_VERSION, activeProjectId: activeId, projects: next }));
      projectsRef.current = next;
      setProjects(next);
      setActiveProjectId(activeId);
      setProjectError("");
      if (markSaved) setSaveStatus("saved");
      return true;
    } catch { setProjectError("Der lokale Speicher ist nicht verfügbar oder voll. Bitte exportieren Sie das Projekt als JSON."); setSaveStatus("dirty"); return false; }
  };
  const restoreProject = (project: RoomPlannerProject) => {
    skipNextAutosave.current = true;
    setHistory(createHistory(project.plan));
    setSeatingRules({ ...project.settings.seatingRules, chairWidth: (project.plan.chairSelection ?? DEFAULT_CHAIR_SELECTION).width, chairDepth: (project.plan.chairSelection ?? DEFAULT_CHAIR_SELECTION).depth });
    setOrientation(project.settings.orientation);
    setGridOffset(project.settings.gridOffset);
    setOrientationPreference(project.settings.orientationPreference);
    setProfileId(RULE_PROFILES.some((profile) => profile.id === project.settings.profileId) ? project.settings.profileId : RULE_PROFILES[0].id);
    setApplicabilityConfirmed(project.settings.applicabilityConfirmed);
    setReservePercent(project.settings.reservePercent);
    setCalculated(null); setVariantCalculation(null); setActiveVariantId(null); setPreviewPlan(null);
    setSelection(null); setAisleStart(null); setHover(null); setActiveCheckId(null); setActiveSuggestionId(null); setNotice("");
    parameterHistory.current = new WeakMap();
    nextId.current = Math.max(0, ...[...project.plan.contour.points, ...project.plan.objects].map((item) => Number(item.id.match(/^(?:point|object)-(\d+)$/)?.[1] ?? 0))) + 1;
    setSaveStatus("saved");
  };
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (raw) {
        const stored = parseProjectStore(raw);
        projectsRef.current = stored.projects;
        setProjects(stored.projects);
        setActiveProjectId(stored.activeProjectId);
        const active = stored.projects.find((project) => project.id === stored.activeProjectId);
        if (active) restoreProject(active);
      } else {
        const first = createProject("Unbenanntes Projekt", initialSnapshot.current.plan, initialSnapshot.current.settings);
        writeProjects([first], first.id);
      }
    } catch (error) { setProjectError(error instanceof Error ? error.message : "Gespeicherte Projekte konnten nicht geladen werden."); }
    skipNextAutosave.current = true;
    setStorageReady(true);
  }, []);
  useEffect(() => {
    if (!storageReady || !activeProjectId) return;
    if (skipNextAutosave.current) { skipNextAutosave.current = false; return; }
    setSaveStatus("dirty");
    const timer = window.setTimeout(() => {
      setSaveStatus("saving");
      const next = projectsRef.current.map((project) => project.id === activeProjectId ? { ...project, plan: snapshot.plan, settings: snapshot.settings, updatedAt: new Date().toISOString() } : project);
      writeProjects(next, activeProjectId);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [snapshot, activeProjectId, storageReady]);
  useEffect(() => {
    const flush = () => {
      if (!storageReady || !activeProjectId) return;
      try {
        const next = projectsRef.current.map((project) => project.id === activeProjectId ? { ...project, ...snapshot, updatedAt: new Date().toISOString() } : project);
        localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify({ schemaVersion: PROJECT_SCHEMA_VERSION, activeProjectId, projects: next }));
      } catch { /* The visible save/export error handles unavailable storage. */ }
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [snapshot, activeProjectId, storageReady]);
  const hasUnsavedChanges = () => {
    const active = projectsRef.current.find((project) => project.id === activeProjectId);
    return saveStatus !== "saved" || !!active && (JSON.stringify(active.plan) !== JSON.stringify(snapshot.plan) || JSON.stringify(active.settings) !== JSON.stringify(snapshot.settings));
  };
  const saveProject = () => {
    const active = projectsRef.current.find((project) => project.id === activeProjectId);
    const nextProject = active ? { ...active, plan: snapshot.plan, settings: snapshot.settings, updatedAt: new Date().toISOString() } : createProject("Unbenanntes Projekt", snapshot.plan, snapshot.settings);
    writeProjects(active ? projectsRef.current.map((project) => project.id === active.id ? nextProject : project) : [...projectsRef.current, nextProject], nextProject.id);
  };
  const newProject = () => {
    if (saveStatus !== "saved" && hasUnsavedChanges() && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const project = createProject("Unbenanntes Projekt");
    if (writeProjects([...projectsRef.current, project], project.id)) restoreProject(project);
  };
  const saveAsProject = (name: string) => {
    const project = createProject(name, snapshot.plan, snapshot.settings);
    if (writeProjects([...projectsRef.current, project], project.id)) skipNextAutosave.current = true;
  };
  const openProject = (id: string) => {
    const project = projectsRef.current.find((item) => item.id === id);
    if (!project || saveStatus !== "saved" && hasUnsavedChanges() && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
    if (writeProjects(projectsRef.current, id)) restoreProject(project);
  };
  const renameProject = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 120) { setProjectError("Der Projektname muss 1 bis 120 Zeichen enthalten."); return; }
    writeProjects(projectsRef.current.map((project) => project.id === id ? { ...project, name: trimmed, updatedAt: new Date().toISOString(), ...(id === activeProjectId ? snapshot : {}) } : project), activeProjectId);
  };
  const duplicateProject = (id: string) => {
    const source = projectsRef.current.find((project) => project.id === id);
    if (!source) return;
    const project = createProject(`${source.name} Kopie`, id === activeProjectId ? snapshot.plan : source.plan, id === activeProjectId ? snapshot.settings : source.settings);
    writeProjects([...projectsRef.current, project], activeProjectId, false);
  };
  const deleteProject = (id: string) => {
    const source = projectsRef.current.find((project) => project.id === id);
    if (!source || !window.confirm(`Projekt „${source.name}“ wirklich löschen?`)) return;
    const remaining = projectsRef.current.filter((project) => project.id !== id);
    if (id !== activeProjectId) { writeProjects(remaining, activeProjectId, false); return; }
    const next = remaining[0] ?? createProject("Unbenanntes Projekt");
    if (writeProjects(remaining.length ? remaining : [next], next.id)) restoreProject(next);
  };
  const exportProject = () => {
    const active = projectsRef.current.find((project) => project.id === activeProjectId);
    if (!active) return;
    const file = new Blob([JSON.stringify({ ...active, ...snapshot, updatedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = projectFileName(active.name); document.body.append(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importProject = (text: string) => {
    try {
      const parsed = parseProject(text);
      if (hasUnsavedChanges() && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
      const project = projectsRef.current.some((item) => item.id === parsed.id) ? createProject(parsed.name, parsed.plan, parsed.settings) : parsed;
      if (writeProjects([...projectsRef.current, project], project.id)) restoreProject(project);
    } catch (error) { setProjectError(error instanceof Error ? error.message : "Die Projektdatei konnte nicht importiert werden."); }
  };
  const add = (next: RoomPlan) => setHistory((current) => commit(current, next));
  const selectChair = (productId: string, variantId: string, width = chairSelection.width, depth = chairSelection.depth) => {
    const previous = { rules: seatingRules, orientation, offset: gridOffset, seating: calculated?.plan === plan ? calculated.result : null };
    const next = changeChairSelection(plan, { productId, variantId, width, depth });
    const rules = { ...seatingRules, chairWidth: width, chairDepth: depth };
    parameterHistory.current.set(plan, previous);
    parameterHistory.current.set(next, { rules, orientation, offset: gridOffset, seating: null });
    add(next);
    setSeatingRules(rules);
    setCalculated(null);
    setVariantCalculation(null);
    setActiveVariantId(null);
    setNotice("Stuhlmodell geändert. Bestehende Sitze bleiben erhalten; Geometrie und Regeln wurden neu geprüft. Maße sind bis zur Produktdatenpflege Planungsannahmen.");
  };
  const applySeating = (next: SeatingPlan) => {
    if (!plan.seating || next === plan.seating) return;
    add({ ...plan, seating: next });
    setNotice("");
  };
  const applySeatingEdit = (result: { seating: SeatingPlan; message?: string }) => { if (result.message) setNotice(result.message); else applySeating(result.seating); };
  const updateObject = (id: string, change: (object: RoomObject) => RoomObject) => {
    const next = { ...plan, objects: plan.objects.map((object) => object.id === id ? (() => { const changed = change(object); return changed.type === "aisle" ? { ...changed, edited: true } : changed; })() : object) };
    if (next.objects.some((object) => object.id === id && object.type === "aisle") && validateObjects(next).some((issue) => issue.objectId === id && issue.severity === "error")) { setNotice("Gang liegt außerhalb des Raums oder hat ungültige Maße."); return; }
    add(next);
    setNotice("");
  };
  const removeObject = useCallback((id: string) => { setHistory((current) => commit(current, { ...current.present, objects: current.present.objects.filter((object) => object.id !== id) })); setSelection(null); }, []);
  const deleteSelection = useCallback(() => {
    if (selection?.type === "object") removeObject(selection.id);
    if (selection?.type === "block" && plan.seating) { add({ ...plan, seating: removeBlock(plan.seating, selection.id) }); setSelection(null); }
    if (selection?.type === "seat" && plan.seating) { add({ ...plan, seating: removeSeat(plan.seating, selection.id) }); setSelection(null); }
  }, [selection, plan, removeObject]);

  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setSize({ width: element.clientWidth, height: element.clientHeight }));
    observer.observe(element);
    setSize({ width: element.clientWidth, height: element.clientHeight });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      const width = element.clientWidth, height = element.clientHeight;
      setCamera((current) => {
        const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, current.scale * Math.exp(-event.deltaY * 0.0015)));
        const wx = current.x + (x - width / 2) / current.scale;
        const wy = current.y + (y - height / 2) / current.scale;
        return { scale, x: wx - (x - width / 2) / scale, y: wy - (y - height / 2) / scale };
      });
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, []);

  const historyAction = useCallback((action: "undo" | "redo") => {
    setPreviewPlan(null);
    setAisleStart(null);
    setNotice("");
    setSelection(null);
    setActiveVariantId(null);
    const next = action === "undo" ? undo(history) : redo(history);
    const parameters = parameterHistory.current.get(next.present);
    setHistory(next);
    if (parameters) {
      setSeatingRules(parameters.rules); setOrientation(parameters.orientation); setGridOffset(parameters.offset);
      setCalculated(parameters.seating ? { plan: next.present, rules: parameters.rules, orientation: parameters.orientation, offset: parameters.offset, result: parameters.seating } : null);
    }
  }, [history]);
  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !(event.target instanceof HTMLInputElement)) { event.preventDefault(); setSpaceDown(true); }
      if (event.key === "Shift") setShiftDown(true);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); historyAction(event.shiftKey ? "redo" : "undo"); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); historyAction("redo"); }
      if (event.key === "Escape") { setHover(null); setSelection(null); setAisleStart(null); }
      if ((event.key === "Delete" || event.key === "Backspace") && selection && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLSelectElement)) { event.preventDefault(); deleteSelection(); }
    };
    const keyUp = (event: KeyboardEvent) => { if (event.code === "Space") setSpaceDown(false); if (event.key === "Shift") setShiftDown(false); };
    const blur = () => { setSpaceDown(false); setShiftDown(false); };
    window.addEventListener("keydown", keyDown); window.addEventListener("keyup", keyUp); window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); window.removeEventListener("blur", blur); };
  }, [historyAction, deleteSelection, selection]);

  const screen = (point: Pick<Point2D, "x" | "y">) => ({ x: size.width / 2 + (point.x - camera.x) * camera.scale, y: size.height / 2 + (point.y - camera.y) * camera.scale });
  const world = (x: number, y: number) => ({ x: camera.x + (x - size.width / 2) / camera.scale, y: camera.y + (y - size.height / 2) / camera.scale });
  const local = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const drawingPoint = (raw: { x: number; y: number }, shift: boolean) => {
    const snapped = snapPoint(raw);
    const last = room.points.at(-1);
    return last ? snapPoint(orthogonalSnap(last, snapped, shift)) : snapped;
  };
  const errors = useMemo(() => validateRoom(shownRoom), [shownRoom]);
  const issues = useMemo(() => validateObjects(shownPlan), [shownPlan]);
  const selectedObject = selection?.type === "object" ? shownPlan.objects.find((object) => object.id === selection.id) : undefined;
  const selectedBlock = selection?.type === "block" ? seating?.blocks.find((block) => block.id === selection.id) : undefined;
  const selectedSeat = selection?.type === "seat" ? seating?.seats.find((seat) => seat.id === selection.id) : undefined;
  const selectedSeatBlock = selectedSeat && seating?.blocks.find((block) => block.seats.some((seat) => seat.id === selectedSeat.id));
  const shapePoints = (points: { x: number; y: number }[]) => points.map((point) => { const p = screen(point); return `${p.x},${p.y}`; }).join(" ");
  const aisleEnd = (raw: { x: number; y: number }, shift: boolean) => {
    const p = snapPoint(raw);
    if (!aisleStart || !shift) return p;
    const angle = Math.round(Math.atan2(p.y - aisleStart.y, p.x - aisleStart.x) / (Math.PI / 4)) * Math.PI / 4;
    const length = wallLength(aisleStart, p);
    return snapPoint({ x: aisleStart.x + Math.cos(angle) * length, y: aisleStart.y + Math.sin(angle) * length });
  };
  const dragged = (drag: Exclude<Drag, { type: "pan" }>, at: { x: number; y: number }): RoomPlan => {
    if (drag.type === "block" && drag.original.seating) {
      const result = moveBlock(drag.original, drag.original.seating, drag.id, at.x - drag.at.x, at.y - drag.at.y);
      return result.seating === drag.original.seating ? drag.original : { ...drag.original, seating: result.seating };
    }
    if (drag.type === "point") return { ...drag.original, contour: movePoint(drag.original.contour, drag.id, snapPoint(at)) };
    const object = drag.original.objects.find((item) => item.id === drag.id);
    if (!object) return drag.original;
    const dx = at.x - drag.at.x, dy = at.y - drag.at.y;
    const changed: RoomObject = object.type === "door" ? (() => {
      const offset = wallOffset(drag.original.contour, object.wallId, at);
      const ends = wallEndpoints(drag.original.contour, object.wallId);
      return { ...object, offset: offset === null || !ends ? object.offset : Number(Math.max(0, Math.min(offset - object.width / 2, wallLength(ends.a, ends.b) - object.width)).toFixed(2)) };
    })() : object.type === "front" || isBlockingObject(object) ? { ...object, x: Number((object.x + dx).toFixed(2)), y: Number((object.y + dy).toFixed(2)) } : drag.type === "start" ? { ...object, start: snapPoint(at), edited: true } : drag.type === "end" ? { ...object, end: snapPoint(at), edited: true } : { ...object, start: snapPoint({ x: object.start.x + dx, y: object.start.y + dy }), end: snapPoint({ x: object.end.x + dx, y: object.end.y + dy }), edited: true };
    return { ...drag.original, objects: drag.original.objects.map((item) => item.id === object.id ? changed : item) };
  };
  const coords = new Map(shownRoom.points.map((point) => [point.id, screen(point)]));
  const firstScreen = room.points.length ? screen(room.points[0]) : null;
  const lastPoint = room.points.at(-1);
  const preview = hover && lastPoint && tool === "wall" && !room.closed ? drawingPoint(hover, shiftDown) : null;
  const previewScreen = preview ? screen(preview) : null;
  const nearestFirst = previewScreen && firstScreen && room.points.length >= 3 && Math.hypot(previewScreen.x - firstScreen.x, previewScreen.y - firstScreen.y) <= 14;
  const help = tool === "door" ? "Klicken Sie auf eine Wand, um eine Tür zu setzen." : tool === "obstacle" ? "Klicken Sie in den Raum, um ein Hindernis zu setzen." : tool === "aisle" ? "Klicken Sie Start und Ende des Gangs. Shift rastet auf 45° ein." : room.closed ? "Raum geschlossen. Mit „Auswahl“ können Sie Eckpunkte und Objekte verschieben." : room.points.length ? "Klicken Sie auf den ersten Punkt, um den Raum zu schließen. Shift hält Wände gerade." : "Wählen Sie „Raum / Kontur“ und klicken Sie die Ecken Ihres Raums nacheinander an.";

  const zoomAt = (factor: number, x: number, y: number) => setCamera((current) => {
    const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, current.scale * factor));
    const wx = current.x + (x - size.width / 2) / current.scale;
    const wy = current.y + (y - size.height / 2) / current.scale;
    return { scale, x: wx - (x - size.width / 2) / scale, y: wy - (y - size.height / 2) / scale };
  });
  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (activeVariant) return;
    const at = local(event);
    const target = event.target as SVGElement;
    if (event.button === 1 || (event.button === 0 && spaceDown)) {
      dragRef.current = { type: "pan", startX: at.x, startY: at.y, camera };
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }
    if (event.button !== 0) return;
    const pointId = target.getAttribute("data-point-id");
    const wallId = target.getAttribute("data-wall-id");
    const objectId = target.getAttribute("data-object-id");
    const blockId = target.getAttribute("data-block-id");
    const seatId = target.getAttribute("data-seat-id");
    const handle = target.getAttribute("data-handle") as "start" | "end" | null;
    if (tool === "select") {
      if (seatId && event.altKey) { setSelection({ type: "seat", id: seatId }); }
      else if (blockId && plan.seating) {
        setSelection({ type: "block", id: blockId });
        dragRef.current = { type: "block", id: blockId, at: world(at.x, at.y), original: roomRef.current };
        event.currentTarget.setPointerCapture(event.pointerId);
      } else if (objectId) {
        setSelection({ type: "object", id: objectId });
        dragRef.current = { type: handle ?? "object", id: objectId, at: world(at.x, at.y), original: roomRef.current };
        event.currentTarget.setPointerCapture(event.pointerId);
      } else if (pointId) {
        setSelection({ type: "point", id: pointId });
        dragRef.current = { type: "point", id: pointId, at: world(at.x, at.y), original: roomRef.current };
        event.currentTarget.setPointerCapture(event.pointerId);
      } else setSelection(wallId ? { type: "wall", id: wallId } : null);
      return;
    }
    if (tool === "door") {
      if (!wallId) return;
      const ends = wallEndpoints(room, wallId), offset = wallOffset(room, wallId, world(at.x, at.y));
      if (!ends || offset === null || wallLength(ends.a, ends.b) < 1) { setNotice("Diese Wand ist zu kurz für eine Tür mit 1,00 m Breite."); return; }
      const object: RoomObject = { id: `object-${nextId.current++}`, type: "door", wallId, offset: Number(Math.max(0, Math.min(offset - 0.5, wallLength(ends.a, ends.b) - 1)).toFixed(2)), width: 1 };
      add({ ...plan, objects: [...plan.objects, object] }); setSelection({ type: "object", id: object.id }); setNotice(""); return;
    }
    if (tool === "obstacle" || tool === "stage" || tool === "reservedArea" || tool === "front") {
      if (tool === "front" && plan.objects.some((object) => object.type === "front")) { setNotice("Es gibt bereits eine Front. Wählen Sie sie zum Bearbeiten aus."); return; }
      const position = snapPoint(world(at.x, at.y));
      const object: RoomObject = tool === "front" ? { id: `object-${nextId.current++}`, type: "front", ...position, width: 2, rotation: 0 }
        : tool === "stage" ? { id: `object-${nextId.current++}`, type: "stage", ...position, width: 3, depth: 2, rotation: 0 }
        : tool === "reservedArea" ? { id: `object-${nextId.current++}`, type: "reservedArea", ...position, width: 2, depth: 2, rotation: 0 }
        : { id: `object-${nextId.current++}`, type: "obstacle", obstacleType: "restricted", ...position, width: 1, depth: 1, rotation: 0 };
      add({ ...plan, objects: [...plan.objects, object] }); setSelection({ type: "object", id: object.id }); setNotice(""); return;
    }
    if (tool === "aisle") {
      const p = aisleEnd(world(at.x, at.y), event.shiftKey);
      if (!aisleStart) { setAisleStart(p); return; }
      if (wallLength(aisleStart, p) < 0.01) { setNotice("Der Gang braucht eine Länge größer als 0."); return; }
      const object: RoomObject = { id: `object-${nextId.current++}`, type: "aisle", start: aisleStart, end: p, width: 1.2 };
      add({ ...plan, objects: [...plan.objects, object] }); setSelection({ type: "object", id: object.id }); setAisleStart(null); setNotice(""); return;
    }
    if (room.closed) { setNotice("Setzen Sie die Planung zurück, um einen neuen Raum zu zeichnen."); return; }
    if (pointId === room.points[0]?.id && room.points.length >= 3 || firstScreen && room.points.length >= 3 && Math.hypot(at.x - firstScreen.x, at.y - firstScreen.y) <= 12) {
      add({ ...plan, contour: closeRoom(room) });
      setHover(null); setNotice(""); return;
    }
    const position = drawingPoint(world(at.x, at.y), event.shiftKey);
    if (room.points.some((point) => wallLength(point, position) < 1e-9)) { setNotice("Dieser Eckpunkt ist bereits vorhanden."); return; }
    const point: Point2D = { id: `point-${nextId.current++}`, ...position };
    add({ ...plan, contour: appendPoint(room, point) });
    setNotice("");
  };
  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const at = local(event);
    const drag = dragRef.current;
    if (drag?.type === "pan") {
      setCamera({ ...drag.camera, x: drag.camera.x - (at.x - drag.startX) / drag.camera.scale, y: drag.camera.y - (at.y - drag.startY) / drag.camera.scale });
    } else if (drag) {
      setPreviewPlan(dragged(drag, world(at.x, at.y)));
    } else setHover(world(at.x, at.y));
  };
  const onPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (drag && drag.type !== "pan") {
      const at = local(event);
      const next = dragged(drag, world(at.x, at.y));
      if (JSON.stringify(next) !== JSON.stringify(drag.original)) {
        if (drag.original.objects.some((object) => object.id === drag.id && object.type === "aisle") && validateObjects(next).some((issue) => issue.objectId === drag.id && issue.severity === "error")) setNotice("Gang liegt außerhalb des Raums oder hat ungültige Maße.");
        else { add(next); setNotice(""); }
      }
      else if (drag.type === "block" && drag.original.seating) {
        const result = moveBlock(drag.original, drag.original.seating, drag.id, world(at.x, at.y).x - drag.at.x, world(at.x, at.y).y - drag.at.y);
        if (result.message && Math.hypot(at.x - screen(drag.at).x, at.y - screen(drag.at).y) > 3) setNotice(result.message);
      }
      setPreviewPlan(null);
    }
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const reset = () => { add(emptyPlan()); setSelection(null); setPreviewPlan(null); setAisleStart(null); setHover(null); setNotice(""); setTool("wall"); setCamera({ x: 0, y: 0, scale: INITIAL_SCALE }); };
  const selectedPoint = selection?.type === "point" ? pointById(shownRoom, selection.id) : null;
  const selectedWall = selection?.type === "wall" ? shownRoom.walls.find((wall) => wall.id === selection.id) : null;
  const wallStart = selectedWall && pointById(shownRoom, selectedWall.startPointId);
  const wallEnd = selectedWall && pointById(shownRoom, selectedWall.endPointId);
  const field = (label: string, value: number, change: (value: number) => void, min?: number) => <label className="flex items-center justify-between gap-2 text-sm"><span>{label}</span><input aria-label={label} type="number" step="0.1" min={min} value={value} onChange={(event) => { const value = event.currentTarget.valueAsNumber; if (Number.isFinite(value) && (min === undefined || value >= min)) change(value); }} className="w-20 rounded border border-premium-beige px-1 py-1 text-right" /></label>;
  const seatingField = (label: string, key: "chairWidth" | "chairDepth" | "rowPitch" | "maximumChairsPerRow", min: number, step: string) => <label className="flex items-center justify-between gap-2 text-sm"><span>{label}</span><input aria-label={label.replace("(m)", "in Metern")} type="number" step={step} min={min} value={seatingRules[key]} onChange={(event) => { const value = event.currentTarget.valueAsNumber; if (Number.isFinite(value) && value >= min && (key !== "maximumChairsPerRow" || Number.isInteger(value))) { if (key === "chairWidth") selectChair(chairSelection.productId, chairSelection.variantId, value, chairSelection.depth); else if (key === "chairDepth") selectChair(chairSelection.productId, chairSelection.variantId, chairSelection.width, value); else setSeatingRules((current) => ({ ...current, [key]: value })); } }} className="w-24 rounded border border-premium-beige px-2 py-1 text-right" /></label>;
  const seatingPaths = useMemo(() => seating?.blocks.map((block) => {
    const rectangles: string[] = [], backs: string[] = [];
    const width = seating.rules.chairWidth * camera.scale;
    const depth = seating.rules.chairDepth * camera.scale;
    for (const seat of block.seats) {
      const x = size.width / 2 + (seat.x - camera.x) * camera.scale, y = size.height / 2 + (seat.y - camera.y) * camera.scale;
      const angle = seat.rotation * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
      const point = (dx: number, dy: number) => `${x + dx * c - dy * s} ${y + dx * s + dy * c}`;
      rectangles.push(`M${point(-width / 2, -depth / 2)}L${point(width / 2, -depth / 2)}L${point(width / 2, depth / 2)}L${point(-width / 2, depth / 2)}Z`);
      backs.push(`M${point(-width / 2 + 2, -depth / 2 + 3)}L${point(width / 2 - 2, -depth / 2 + 3)}`);
    }
    return { id: block.id, rectangles: rectangles.join(""), backs: backs.join("") };
  }) ?? [], [seating, camera, size]);
  const highlightedSeats = new Set(activeCheck?.affectedIds.filter((id) => id.startsWith("seat-")) ?? []);
  const highlightedBlocks = new Set(activeCheck?.affectedIds.filter((id) => id.startsWith("block-")) ?? []);
  const highlightedObjects = new Set(activeCheck?.affectedIds.filter((id) => shownPlan.objects.some((object) => object.id === id)) ?? []);
  const calculateVariants = () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setVariantError("");
    setVariantsBusy(true);
    setActiveVariantId(null);
    window.setTimeout(() => {
      try {
        const result = generatePlanVariants(plan, seatingRules, profile, orientationPreference);
        setVariantCalculation({ fingerprint: currentFingerprint, rules: seatingRules, profileId, preference: orientationPreference, result });
        setActiveVariantId(result.variants.find((item) => item.profileId === "balanced")?.id ?? result.variants[0]?.id ?? result.fallback?.id ?? null);
      } catch {
        setVariantError("Die Varianten konnten nicht berechnet werden. Bitte prüfen Sie Raum und Eingaben und versuchen Sie es erneut.");
      } finally {
        generatingRef.current = false;
        setVariantsBusy(false);
      }
    }, 0);
  };
  const adoptVariant = (variant: PlanVariant) => {
    if (!variant.feasible) return;
    const adoptedPlan = { ...variant.plan, objects: [...variant.plan.objects], seating: { ...variant.seatingPlan, blocks: variant.seatingPlan.blocks.map((block) => ({ ...block, source: "generated" as const })) } };
    parameterHistory.current.set(plan, { rules: seatingRules, orientation, offset: gridOffset, seating: calculated?.plan === plan ? calculated.result : null });
    parameterHistory.current.set(adoptedPlan, { rules: variant.seatingPlan.rules, orientation: variant.seatingPlan.orientation, offset: variant.gridOffset, seating: adoptedPlan.seating });
    add(adoptedPlan);
    setSeatingRules(variant.seatingPlan.rules);
    setOrientation(variant.seatingPlan.orientation);
    setGridOffset(variant.gridOffset);
    setCalculated({ plan: adoptedPlan, rules: variant.seatingPlan.rules, orientation: variant.seatingPlan.orientation, offset: variant.gridOffset, result: adoptedPlan.seating });
    setVariantCalculation(null);
    setActiveVariantId(null);
    setActiveCheckId(null);
    setSelection(null);
    setNotice("Variante übernommen. Der gesamte vorherige Plan ist mit einem Schritt rückgängig zu machen.");
  };

  if (outputIssuedAt) return <PlanOutputView plan={plan} name={projects.find((project) => project.id === activeProjectId)?.name ?? "Unbenanntes Projekt"} issuedAt={outputIssuedAt} profileName={profile.name} analysis={currentAnalysis} reservePercent={reservePercent} inquiryHref={inquiryHref} shopHref={shopTarget?.href} onClose={() => setOutputIssuedAt(null)} />;

  return <section aria-label="2D-Grundrisseditor" className="premium-card planner-workspace overflow-hidden">
    {storageReady && <ProjectControls projects={projects} activeId={activeProjectId} status={saveStatus} error={projectError} onNew={newProject} onSave={saveProject} onSaveAs={saveAsProject} onOpen={openProject} onRename={renameProject} onDuplicate={duplicateProject} onDelete={deleteProject} onExport={exportProject} onImport={importProject} onImportError={setProjectError} />}
    <div className="planner-toolbar flex flex-wrap items-center gap-1 border-b border-premium-beige bg-white/80 px-2 py-1">
      <div className="mr-auto flex flex-wrap gap-1" aria-label="Werkzeuge">
        <button type="button" aria-pressed={tool === "select"} onClick={() => setTool("select")} className={`rounded-md px-2 py-1 text-xs font-semibold ${tool === "select" ? "bg-premium-forest text-white" : "border border-premium-beige text-premium-charcoal"}`}>Auswahl</button>
        <button type="button" aria-pressed={tool === "wall"} onClick={() => { setTool("wall"); setAisleStart(null); }} className={`rounded-md px-2 py-1 text-xs font-semibold ${tool === "wall" ? "bg-premium-forest text-white" : "border border-premium-beige text-premium-charcoal"}`}>Raum / Kontur</button>
        {(["door", "obstacle", "aisle", "front", "stage", "reservedArea"] as const).map((name) => <button key={name} type="button" aria-pressed={tool === name} onClick={() => { setTool(name); setAisleStart(null); }} className={`rounded-md px-2 py-1 text-xs font-semibold ${tool === name ? "bg-premium-forest text-white" : "border border-premium-beige text-premium-charcoal"}`}>{{ door: "Tür", obstacle: "Hindernis", aisle: "Gang", front: "Front", stage: "Bühne", reservedArea: "Reservierte Fläche" }[name]}</button>)}
      </div>
      <button type="button" disabled={!history.past.length} onClick={() => historyAction("undo")} className="rounded-md border border-premium-beige px-2 py-1 text-xs font-semibold disabled:opacity-40">Rückgängig</button>
      <button type="button" onClick={() => setOutputIssuedAt(new Date())} className="rounded-md border border-premium-beige px-2 py-1 text-xs font-semibold">Plan ausgeben</button>
      <button type="button" disabled={!history.future.length} onClick={() => historyAction("redo")} className="rounded-md border border-premium-beige px-2 py-1 text-xs font-semibold disabled:opacity-40">Wiederholen</button>
      <button type="button" disabled={!room.points.length && !plan.objects.length} onClick={reset} className="rounded-md border border-premium-beige px-2 py-1 text-xs font-semibold disabled:opacity-40">Planung zurücksetzen</button>
    </div>
    <div className="planner-grid">
      <aside aria-label="Raum und Werkzeuge" className="planner-tools border-r border-premium-beige bg-white/90 p-3">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-premium-forest">Raum &amp; Werkzeuge</h3>
        <div className="grid gap-1">{([ ["select", "Auswahl"], ["wall", "Raum / Kontur"], ["door", "Tür"], ["obstacle", "Hindernis"], ["aisle", "Gang"], ["front", "Front"], ["stage", "Bühne"], ["reservedArea", "Reservierte Fläche"] ] as const).map(([name, label]) => <button key={name} type="button" aria-label={name === "select" ? "Selektieren in Seitenleiste" : `${label} in Seitenleiste`} aria-pressed={tool === name} onClick={() => { setTool(name); setAisleStart(null); }} className={`rounded-md px-2 py-1 text-left text-xs font-semibold ${tool === name ? "bg-premium-forest text-white" : "border border-premium-beige text-premium-charcoal"}`}>{label}</button>)}</div>
        <h3 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-premium-forest">Planung</h3>
        <button type="button" aria-label="Bestuhlung in der Werkzeugleiste berechnen" onClick={() => document.querySelector<HTMLButtonElement>('[data-planner-action="calculate-seating"]')?.click()} className="mb-1 w-full rounded-md border border-premium-beige px-2 py-1 text-left text-xs font-semibold">Bestuhlung berechnen</button>
        <button type="button" aria-label="Planvarianten in der Werkzeugleiste berechnen" onClick={() => document.querySelector<HTMLButtonElement>('[data-planner-action="calculate-variants"]')?.click()} className="w-full rounded-md border border-premium-beige px-2 py-1 text-left text-xs font-semibold">Planvarianten berechnen</button>
        <h3 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-premium-forest">Ansicht</h3>
        <div className="flex items-center justify-between gap-1 text-xs"><button type="button" aria-label="Ansicht verkleinern" onClick={() => zoomAt(1 / 1.25, size.width / 2, size.height / 2)} className="rounded border border-premium-beige px-2 py-1">−</button><span>{Math.round(camera.scale / INITIAL_SCALE * 100)} %</span><button type="button" aria-label="Ansicht vergrößern" onClick={() => zoomAt(1.25, size.width / 2, size.height / 2)} className="rounded border border-premium-beige px-2 py-1">+</button></div>
      </aside>
      <div className="planner-canvas relative min-w-0 bg-[#f6f4ed]">
      <svg ref={svgRef} role="img" aria-label="Grundriss Zeichenfläche" className={`block h-full min-h-[420px] w-full touch-none ${spaceDown ? "cursor-grab" : tool === "wall" ? "cursor-crosshair" : "cursor-default"}`} viewBox={`0 0 ${size.width} ${size.height}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={() => { if (!dragRef.current) setHover(null); }}>
        <rect width={size.width} height={size.height} fill="#f6f4ed" />
        <Grid camera={camera} size={size} />
        {shownRoom.closed && shownRoom.points.length >= 3 ? <polygon points={shownRoom.points.map((point) => { const p = coords.get(point.id)!; return `${p.x},${p.y}`; }).join(" ")} fill={errors.length ? "#c77c6c" : "#9ab393"} fillOpacity="0.24" /> : null}
        <g aria-label="Berechnete Sitzplätze">{seatingPaths.map((block, index) => <g key={block.id}><path data-block-id={plan.seating && !activeVariant ? block.id : undefined} d={block.rectangles} fill={highlightedBlocks.has(block.id) || selection?.type === "block" && selection.id === block.id ? "#bf6b30" : index % 2 ? "#477b70" : "#405b49"} stroke="#fff" strokeWidth="1" className={tool === "select" && plan.seating ? "cursor-move" : ""} /><path d={block.backs} fill="none" stroke="#d6ece0" strokeWidth="2" pointerEvents="none" /></g>)}{seating?.seats.filter((seat) => highlightedSeats.has(seat.id) || currentAnalysis?.collisionSeatIds.includes(seat.id) || selection?.type === "seat" && selection.id === seat.id).map((seat) => { const p = screen(seat); return <circle key={seat.id} cx={p.x} cy={p.y} r={Math.max(5, seatingRules.chairWidth * camera.scale / 2)} fill="#e58c39" fillOpacity="0.8" pointerEvents="none" />; })}{selectedBlock?.seats.map((seat) => { const p = screen(seat); return <circle key={seat.id} data-seat-id={seat.id} data-block-id={selectedBlock.id} cx={p.x} cy={p.y} r={Math.max(5, seatingRules.chairWidth * camera.scale / 2)} fill="transparent" className="cursor-move" />; })}</g>
        {activeSuggestion && <g pointerEvents="none" aria-label="Vorschau des Gangvorschlags"><polygon points={shapePoints(aislePolygon({ id: activeSuggestion.id, type: "aisle", start: activeSuggestion.start, end: activeSuggestion.end, width: activeSuggestion.width }))} fill="#df9a45" fillOpacity="0.42" stroke="#ac5b1d" strokeWidth="3" strokeDasharray="8 5" /></g>}
        {shownPlan.objects.filter((object): object is AisleObject => object.type === "aisle").map((object) => { const proposed = object.source === "generated"; return <g key={object.id}><polygon data-object-id={object.id} points={shapePoints(aislePolygon(object))} fill={proposed ? "#df9a45" : "#5596a0"} fillOpacity="0.38" stroke={proposed ? "#ac5b1d" : highlightedObjects.has(object.id) || selection?.id === object.id ? "#bd7647" : "#357682"} strokeWidth={highlightedObjects.has(object.id) || selection?.id === object.id ? 3 : 1.5} strokeDasharray={proposed ? "8 5" : undefined} className={tool === "select" && !activeVariant ? "cursor-move" : ""} /><line x1={screen(object.start).x} y1={screen(object.start).y} x2={screen(object.end).x} y2={screen(object.end).y} stroke="#357682" strokeDasharray="5 4" pointerEvents="none" /><Dimension a={screen(object.start)} b={screen(object.end)} label={`${formatMeters(wallLength(object.start, object.end))} · ${formatMeters(object.width)}`} />{!activeVariant && selection?.id === object.id && (["start", "end"] as const).map((end) => <circle key={end} data-object-id={object.id} data-handle={end} cx={screen(object[end]).x} cy={screen(object[end]).y} r="7" fill="white" stroke="#bd7647" strokeWidth="3" className="cursor-move" />)}</g>; })}
        {aisleStart && hover && <g pointerEvents="none"><polygon points={shapePoints(aislePolygon({ id: "preview", type: "aisle", start: aisleStart, end: aisleEnd(hover, shiftDown), width: 1.2 }))} fill="#5596a0" fillOpacity="0.3" stroke="#357682" strokeDasharray="6 4" /><Dimension a={screen(aisleStart)} b={screen(aisleEnd(hover, shiftDown))} label={`${formatMeters(wallLength(aisleStart, aisleEnd(hover, shiftDown)))} · 1,20 m`} /></g>}
        {shownPlan.objects.filter((object): object is ObstacleObject => object.type === "obstacle").map((object) => <g key={object.id}><polygon data-object-id={object.id} points={shapePoints(obstaclePolygon(object))} fill="#bb7558" fillOpacity="0.58" stroke={selection?.id === object.id ? "#81462e" : "#a75b42"} strokeWidth={selection?.id === object.id ? 3 : 1.5} className={tool === "select" ? "cursor-move" : ""} /><text x={screen(object).x} y={screen(object).y + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#442f26" pointerEvents="none">{object.obstacleType === "column" ? "Säule" : object.obstacleType === "stage" ? "Bühne" : object.obstacleType === "technical" ? "Technik" : object.obstacleType === "furniture" ? "Möbel" : "Sperrfläche"}</text></g>)}
        {shownPlan.objects.filter((object) => object.type === "stage" || object.type === "reservedArea").map((object) => { if (object.type !== "stage" && object.type !== "reservedArea") return null; return <g key={object.id}><polygon data-object-id={object.id} points={shapePoints(obstaclePolygon(object))} fill={object.type === "stage" ? "#aa7854" : "#957bb4"} fillOpacity="0.62" stroke={selection?.id === object.id ? "#263c32" : object.type === "stage" ? "#775138" : "#695187"} strokeWidth={selection?.id === object.id ? 3 : 1.5} className={tool === "select" ? "cursor-move" : ""} /><text x={screen(object).x} y={screen(object).y + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#231e29" pointerEvents="none">{object.type === "stage" ? "Bühne" : object.name || "Reserviert"}</text></g>; })}
        {shownPlan.objects.filter((object) => object.type === "front").map((object) => { if (object.type !== "front") return null; const segment = frontSegment(object), a = screen(segment.start), b = screen(segment.end), center = screen(object); const angle = object.rotation * Math.PI / 180; return <g key={object.id}><line data-object-id={object.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#235e89" strokeWidth={selection?.id === object.id ? 9 : 7} className={tool === "select" ? "cursor-move" : ""} /><line x1={center.x} y1={center.y} x2={center.x + Math.sin(angle) * 24} y2={center.y - Math.cos(angle) * 24} stroke="#235e89" strokeWidth="3" markerEnd="url(#front-arrow)" pointerEvents="none" /><text x={center.x} y={center.y + 17} textAnchor="middle" fontSize="12" fontWeight="700" fill="#17486a" pointerEvents="none">Front</text></g>; })}
        <defs><marker id="front-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#235e89" /></marker></defs>
        {shownRoom.walls.map((wall) => { const a = coords.get(wall.startPointId), b = coords.get(wall.endPointId); if (!a || !b) return null; const length = wallLength(pointById(shownRoom, wall.startPointId)!, pointById(shownRoom, wall.endPointId)!); return <g key={wall.id}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={selection?.id === wall.id ? "#bd7647" : errors.length ? "#b75d4b" : "#405b49"} strokeWidth={selection?.id === wall.id ? 5 : 3} />
          <line data-wall-id={wall.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="18" className={tool === "select" ? "cursor-pointer" : ""} />
          <Dimension a={a} b={b} label={formatMeters(length)} />
        </g>; })}
        {shownPlan.objects.filter((object) => object.type === "door").map((object) => { if (object.type !== "door") return null; const segment = doorSegment(shownRoom, object); if (!segment) return null; const a = screen(segment.start), b = screen(segment.end), length = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / length, ny = (b.x - a.x) / length; return <g key={object.id}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#f6f4ed" strokeWidth="9" pointerEvents="none" /><line x1={a.x} y1={a.y} x2={a.x + nx * Math.min(length, 30)} y2={a.y + ny * Math.min(length, 30)} stroke="#347b7a" strokeWidth="3" pointerEvents="none" /><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#347b7a" strokeWidth="2" strokeDasharray="5 4" pointerEvents="none" /><line data-object-id={object.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="22" className={tool === "select" ? "cursor-move" : ""} /><circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={selection?.id === object.id ? 5 : 3} fill="#347b7a" pointerEvents="none" /><Dimension a={a} b={b} label={formatMeters(object.width)} /></g>; })}
        {shownPlan.objects.filter((object) => object.type === "door" && highlightedObjects.has(object.id)).map((object) => { if (object.type !== "door") return null; const segment = doorSegment(shownRoom, object); if (!segment) return null; const midpoint = { x: (segment.start.x + segment.end.x) / 2, y: (segment.start.y + segment.end.y) / 2 }; const p = screen(midpoint); return <circle key={`highlight-${object.id}`} cx={p.x} cy={p.y} r="12" fill="none" stroke="#d97706" strokeWidth="3" pointerEvents="none" />; })}
        {previewScreen && lastPoint && !nearestFirst ? <g><line x1={screen(lastPoint).x} y1={screen(lastPoint).y} x2={previewScreen.x} y2={previewScreen.y} stroke="#bd7647" strokeWidth="2" strokeDasharray="7 5" /><Dimension a={screen(lastPoint)} b={previewScreen} label={formatMeters(wallLength(lastPoint, preview!))} /><circle cx={previewScreen.x} cy={previewScreen.y} r="5" fill="#bd7647" /></g> : null}
        {shownRoom.points.map((point) => { const p = coords.get(point.id)!; return <g key={point.id}><circle cx={p.x} cy={p.y} r={POINT_RADIUS + 8} fill="transparent" data-point-id={point.id} className={tool === "select" || point.id === room.points[0]?.id && tool === "wall" ? "cursor-pointer" : ""} /><circle cx={p.x} cy={p.y} r={selection?.id === point.id ? POINT_RADIUS + 2 : POINT_RADIUS} fill={selection?.id === point.id || nearestFirst && point.id === room.points[0]?.id ? "#bd7647" : "#fff"} stroke="#405b49" strokeWidth="2" pointerEvents="none" /></g>; })}
      </svg>
      {!room.points.length ? <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(85%,25rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-premium-beige bg-white/90 p-5 text-center shadow-sm"><p className="font-display text-xl text-premium-ink">Raumgrundriss zeichnen</p><p className="mt-2 text-sm text-premium-muted">{help}</p></div> : null}
    </div><aside aria-label="Eigenschaften" className="planner-properties flex min-h-0 flex-col gap-2 overflow-y-auto border-t border-premium-beige bg-white/90 p-3 lg:border-l lg:border-t-0"><details className="rounded border border-premium-beige p-2" open={!!selection}><summary className="cursor-pointer text-xs font-semibold">Eigenschaften {selection ? "· Auswahl" : "· keine Auswahl"}</summary><div className="mt-2 space-y-2">
      {selectedObject?.type === "door" && <><p className="text-sm font-semibold">Tür</p>{field("Breite (m)", selectedObject.width, (value) => updateObject(selectedObject.id, (object) => ({ ...object, width: value })), 0.01)}{field("Position auf Wand (m)", selectedObject.offset, (value) => updateObject(selectedObject.id, (object) => ({ ...object, offset: value })), 0)}<label className="flex items-center justify-between gap-2 text-sm">Rolle<select aria-label="Türrolle" value={selectedObject.role ?? "normal"} onChange={(event) => updateObject(selectedObject.id, (object) => object.type === "door" ? { ...object, role: event.target.value as "normal" | "exit" | "emergency_exit", clearWidth: event.target.value === "normal" ? undefined : object.clearWidth ?? object.width } : object)} className="rounded border border-premium-beige px-2 py-1"><option value="normal">Normale Tür</option><option value="exit">Ausgang</option><option value="emergency_exit">Notausgang</option></select></label>{selectedObject.role && selectedObject.role !== "normal" && field("Lichte Breite (m)", selectedObject.clearWidth ?? selectedObject.width, (value) => updateObject(selectedObject.id, (object) => ({ ...object, clearWidth: value })), 0.01)}</>}
      {selectedObject?.type === "obstacle" && <><label className="flex items-center justify-between gap-2 text-sm">Hindernistyp<select aria-label="Hindernistyp" value={selectedObject.obstacleType} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, obstacleType: event.target.value as ObstacleObject["obstacleType"] }))} className="max-w-32 rounded border border-premium-beige"><option value="column">Säule</option><option value="stage">Bühne</option><option value="technical">Technik / Mischpult</option><option value="furniture">Festes Möbel</option><option value="restricted">Sperrfläche</option></select></label>{field("X (m)", selectedObject.x, (v) => updateObject(selectedObject.id, (o) => ({ ...o, x: v })))}{field("Y (m)", selectedObject.y, (v) => updateObject(selectedObject.id, (o) => ({ ...o, y: v })))}{field("Breite (m)", selectedObject.width, (v) => updateObject(selectedObject.id, (o) => ({ ...o, width: v })), 0.01)}{field("Tiefe (m)", selectedObject.depth, (v) => updateObject(selectedObject.id, (o) => ({ ...o, depth: v })), 0.01)}{field("Rotation (°)", selectedObject.rotation, (v) => updateObject(selectedObject.id, (o) => ({ ...o, rotation: v })))}</>}
      {(selectedObject?.type === "stage" || selectedObject?.type === "reservedArea" || selectedObject?.type === "front") && <><p className="text-sm font-semibold">{selectedObject.type === "front" ? "Front" : selectedObject.type === "stage" ? "Bühne" : "Reservierte Fläche"}</p>{selectedObject.type === "reservedArea" && <label className="flex items-center justify-between gap-2 text-sm">Name<input aria-label="Name der reservierten Fläche" maxLength={40} value={selectedObject.name ?? ""} onChange={(event) => updateObject(selectedObject.id, (object) => object.type === "reservedArea" ? { ...object, name: event.target.value } : object)} className="w-32 rounded border border-premium-beige px-2 py-1" /></label>}{field("X (m)", selectedObject.x, (v) => updateObject(selectedObject.id, (o) => ({ ...o, x: v })))}{field("Y (m)", selectedObject.y, (v) => updateObject(selectedObject.id, (o) => ({ ...o, y: v })))}{field("Breite (m)", selectedObject.width, (v) => updateObject(selectedObject.id, (o) => ({ ...o, width: v })), 0.01)}{selectedObject.type !== "front" && field("Tiefe (m)", selectedObject.depth, (v) => updateObject(selectedObject.id, (o) => o.type === "stage" || o.type === "reservedArea" ? { ...o, depth: v } : o), 0.01)}{field("Rotation (°)", selectedObject.rotation, (v) => updateObject(selectedObject.id, (o) => ({ ...o, rotation: v })))}{selectedObject.type === "stage" && <button type="button" onClick={() => { const existing = plan.objects.find((object) => object.type === "front"); const front = { id: existing?.id ?? `object-${nextId.current++}`, type: "front" as const, x: selectedObject.x, y: selectedObject.y, width: selectedObject.width, rotation: selectedObject.rotation }; add({ ...plan, objects: [...plan.objects.filter((object) => object.type !== "front"), front] }); setSelection({ type: "object", id: front.id }); }} className="rounded-lg border border-premium-beige px-3 py-2 text-sm">Als Front verwenden</button>}</>}
      {selectedObject?.type === "aisle" && <><p className="text-sm font-semibold">Gang / Freihaltezone</p><CommitNumberField label="Breite (m)" value={selectedObject.width} min={0.01} onCommit={(v) => updateObject(selectedObject.id, (o) => ({ ...o, width: v }))} /><p className="text-sm">Länge: {formatMeters(wallLength(selectedObject.start, selectedObject.end))}</p><p className="text-xs">Quelle: {selectedObject.source === "generated" ? "automatisch" : "manuell"}{selectedObject.edited ? " · bearbeitet" : ""}</p>{report?.checks.filter((check) => check.affectedIds.includes(selectedObject.id) && check.status !== "pass").map((check) => <p key={check.id} className="text-xs text-amber-800">{check.message}</p>)}{(["start", "end"] as const).flatMap((end) => (["x", "y"] as const).map((axis) => field(`${end === "start" ? "Start" : "Ende"} ${axis.toUpperCase()} (m)`, selectedObject[end][axis], (v) => updateObject(selectedObject.id, (o) => o.type === "aisle" ? { ...o, [end]: { ...o[end], [axis]: v } } : o))))}</>}
      {selectedObject && <button type="button" onClick={() => removeObject(selectedObject.id)} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-800">Objekt löschen</button>}
      {selectedBlock && seating && <div className="space-y-2 text-sm"><p className="font-semibold">Sitzblock {selectedBlock.id}</p><p>{selectedBlock.seats.length} Plätze · {selectedBlock.rowCount} Reihen</p><p>Quelle: {selectedBlock.source === "generated" ? "automatisch" : "manuell"}{selectedBlock.edited ? " · bearbeitet" : ""}</p><p className="text-xs text-premium-muted">Alt + Klick auf einen Sitz wählt ihn einzeln aus.</p><CommitNumberField label="Blockwinkel (°)" value={selectedBlock.rotation ?? selectedBlock.seats[0]?.rotation ?? 0} onCommit={(value) => applySeatingEdit(rotateBlock(plan, seating, selectedBlock.id, value))} />{report?.checks.filter((check) => check.affectedIds.includes(selectedBlock.id) && check.status !== "pass").map((check) => <p key={check.id} className="text-xs text-amber-800">{check.message}</p>)}<label className="flex items-center justify-between gap-2">Sitze je Schritt<input aria-label="Sitze je Schritt" type="number" min="1" step="1" value={rowEditCount} onChange={(event) => { const value = event.currentTarget.valueAsNumber; if (Number.isInteger(value) && value > 0) setRowEditCount(value); }} className="w-20 rounded border border-premium-beige px-2 py-1 text-right" /></label><div className="max-h-48 space-y-2 overflow-auto">{rowsOf(selectedBlock).map((row, index) => <div key={row.id} className="rounded border border-premium-beige p-2"><p>Reihe {index + 1}: {row.seats.length} Plätze</p>{(["left", "right"] as const).map((end) => <div key={end} className="flex gap-1"><button type="button" aria-label={`Reihe ${index + 1} ${end === "left" ? "links" : "rechts"} kürzen`} onClick={() => applySeatingEdit(editRow(plan, seating, selectedBlock.id, row.id, end, -rowEditCount))} className="rounded border px-2">−</button><button type="button" aria-label={`Reihe ${index + 1} ${end === "left" ? "links" : "rechts"} verlängern`} onClick={() => applySeatingEdit(editRow(plan, seating, selectedBlock.id, row.id, end, rowEditCount))} className="rounded border px-2">+</button><span>{end === "left" ? "links" : "rechts"}</span></div>)}</div>)}</div><button type="button" onClick={deleteSelection} className="rounded-lg border border-red-300 px-3 py-2 text-red-800">Block löschen</button></div>}
      {selectedSeat && <div className="space-y-2 text-sm"><p className="font-semibold">Sitz {selectedSeat.id}</p><p>Reihe {selectedSeat.row} · Position {selectedSeat.index}</p><p>Block {selectedSeatBlock?.id}</p><button type="button" onClick={() => selectedSeatBlock && setSelection({ type: "block", id: selectedSeatBlock.id })} className="rounded border px-2 py-1">Block auswählen</button><button type="button" onClick={deleteSelection} className="rounded border border-red-300 px-2 py-1 text-red-800">Sitz entfernen</button></div>}
      {!selectedObject && !selectedBlock && !selectedSeat && <p className="text-sm text-premium-muted">Wählen Sie ein Objekt im Grundriss.</p>}
      </div></details>
      <div aria-label="Bestuhlung" className="space-y-2 rounded border border-premium-beige p-2"><h3 className="font-semibold">Bestuhlung</h3>
        <label className="block text-sm">Stuhlmodell<select aria-label="Stuhlmodell" value={chairSelection.productId} onChange={(event) => { const product = chairProducts.find((item) => item.id === event.target.value)!; selectChair(product.id, product.variants[0].id); }} className="mt-1 w-full rounded border border-premium-beige p-1">{chairProducts.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}</select></label>
        <label className="block text-sm">Variante<select aria-label="Stuhlvariante" value={chairSelection.variantId} onChange={(event) => selectChair(chairSelection.productId, event.target.value)} className="mt-1 w-full rounded border border-premium-beige p-1">{(demand.product?.variants ?? []).map((variant) => <option key={variant.id} value={variant.id}>{variant.title}</option>)}</select></label>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1">{seatingField("Stuhlbreite (m)", "chairWidth", 0.1, "0.05")}
        {seatingField("Stuhltiefe (m)", "chairDepth", 0.1, "0.05")}
        {seatingField("Reihenabstand (m)", "rowPitch", 0.1, "0.05")}
        {seatingField("Max. Stühle pro Reihe", "maximumChairsPerRow", 1, "1")}</div>
        <label className="flex items-center justify-between gap-2 text-sm">Ausrichtung<select aria-label="Ausrichtung" value={orientation} onChange={(event) => setOrientation(event.target.value as SeatingOrientation)} className="rounded border border-premium-beige px-2 py-1"><option value="horizontal">Horizontal</option><option value="vertical">Vertikal</option></select></label>
        <button data-planner-action="calculate-seating" type="button" disabled={!room.closed || errors.length > 0 || issues.some((issue) => issue.severity === "error") || seatingRules.rowPitch < seatingRules.chairDepth} onClick={() => { setActiveVariantId(null); setCalculated({ plan, rules: seatingRules, orientation, offset: gridOffset, result: generateSeatingPlan(plan, seatingRules, orientation, gridOffset) }); }} className="w-full rounded-lg bg-premium-forest px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Bestuhlung berechnen</button>
        {seatingRules.rowPitch < seatingRules.chairDepth && <p className="text-xs text-amber-800">Der Reihenabstand muss mindestens der Stuhltiefe entsprechen.</p>}
        {seating && <div aria-live="polite" className="space-y-1 rounded-lg bg-[#f1f5ef] p-3 text-sm"><p className="font-semibold">{seating.totalSeats} Sitzplätze · {seating.blocks.length} Sitzblöcke</p><p>{seating.totalRows} Reihen · längste Reihe: {seating.longestRow} Plätze</p><p>Stuhl: {formatMeters(seating.rules.chairWidth)} × {formatMeters(seating.rules.chairDepth)}</p><p>Reihenabstand: {formatMeters(seating.rules.rowPitch)}</p>{seating.hints.map((hint) => <p key={hint} className="text-amber-900">Hinweis: {hint}</p>)}</div>}
      </div>
      <div aria-label="Bedarf" aria-live="polite" className="rounded border border-premium-beige bg-[#f1f5ef] p-2 text-sm"><h3 className="font-display text-lg font-medium">Ihre Bestuhlung</h3><p className="text-xs text-premium-muted">{demand.product?.title} · {demand.variant?.title}</p><div className="flex items-baseline justify-between"><span>Geplante Sitzplätze</span><strong className="text-xl">{recommended.quantity} Stühle</strong></div><label className="flex items-center justify-between gap-2">Reserve für den Bedarf<select aria-label="Reserve in Prozent" value={reservePercent} onChange={(event) => setReservePercent(Number(event.target.value) as PlannerSettings["reservePercent"])} className="rounded border border-premium-beige bg-white p-1">{[0, 2, 5, 10].map((value) => <option key={value} value={value}>{value} %</option>)}</select></label><div className="flex items-baseline justify-between border-t border-premium-beige pt-1"><span className="font-semibold">Empfohlene Gesamtmenge</span><strong className="text-xl text-premium-forest">{recommended.recommendedQuantity}</strong></div><p className="text-xs text-premium-muted">Grundbedarf {recommended.quantity} · Reserve {recommended.reserveQuantity}. Die Reserve verändert den Raumplan nicht.</p><p className="mt-1 text-xs text-premium-muted">ⓘ Planungsmaße {formatMeters(chairSelection.width)} × {formatMeters(chairSelection.depth)} · keine verifizierten Produktmaße. Regelprüfung ist keine behördliche Freigabe.</p></div>
      {currentAnalysis && <div aria-label="Aktueller Plan" aria-live="polite" className="space-y-1 rounded-lg border border-premium-beige p-3 text-sm"><p className="font-semibold">Aktueller Plan</p><p>{currentAnalysis.summary.seatCount} Plätze · {currentAnalysis.summary.blockCount} Sitzblöcke · {currentAnalysis.summary.aisleCount} Gänge</p><p>{currentAnalysis.summary.usedExitCount} Ausgänge genutzt · {currentAnalysis.summary.unreachableSeatCount ? `${currentAnalysis.summary.unreachableSeatCount} Plätze ohne Weg` : "Alle Sitze erreichbar"}</p><p>Längster Weg: {currentAnalysis.summary.maxEgressDistance === undefined ? "nicht bestimmbar" : formatMeters(currentAnalysis.summary.maxEgressDistance)}</p><p>{currentAnalysis.summary.errors.length} Fehler · {currentAnalysis.summary.warnings.length} Warnungen</p>{currentAnalysis.summary.errors.filter((item) => item.id === "manual-seat-collisions").map((item) => <p key={item.id} className="text-red-800">{item.message}</p>)}</div>}
      <div aria-label="Regelprüfung" className="space-y-2 rounded border border-premium-beige p-2"><h3 className="font-semibold">Regelprüfung</h3>
        <label className="block space-y-1 text-sm"><span>Regelprofil</span><select aria-label="Regelprofil" value={profileId} onChange={(event) => { setProfileId(event.target.value); setActiveCheckId(null); setActiveSuggestionId(null); }} className="w-full rounded border border-premium-beige px-2 py-1">{RULE_PROFILES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={applicabilityConfirmed} onChange={(event) => setApplicabilityConfirmed(event.target.checked)} className="mt-0.5" /><span>Anwendung dieses Regelprofils wurde fachlich geprüft</span></label>
        <details className="text-xs"><summary className="cursor-pointer font-semibold text-premium-forest">Details und Quelle anzeigen</summary>        <p className="text-xs text-premium-muted">{profile.applicability.description} Das Planungstool ersetzt keine bauordnungsrechtliche oder brandschutztechnische Prüfung. Anforderungen hängen von Gebäude, Nutzung, Genehmigung und örtlichen Vorgaben ab.</p>
        {profile.source && <a href={profile.source.url} target="_blank" rel="noreferrer" className="text-xs text-premium-forest underline">Quelle: {profile.source.title}, {profile.source.section}</a>}
</details>
        {!seating && <p className="text-sm text-premium-muted">Bestuhlung berechnen, um das gewählte Profil technisch zu prüfen.</p>}
        {report && analysis && <div aria-live="polite" className="space-y-2 text-sm"><div className="grid grid-cols-2 gap-1 rounded-lg bg-[#f1f5ef] p-2"><span>Sitzplätze: <strong>{seating?.totalSeats}</strong></span><span>Bestanden: <strong>{report.counts.pass}</strong></span><span>Hinweise: <strong>{report.counts.warning}</strong></span><span>Probleme: <strong>{report.counts.fail}</strong></span><span>Nicht anwendbar: <strong>{report.counts.not_applicable}</strong></span></div>
          <div className="space-y-1 rounded-lg border border-premium-beige p-2"><p className="font-semibold">Rettungswege</p><p>Ausgänge: {analysis.exitLoads.length} · Breite gesamt: {formatMeters(analysis.exitLoads.reduce((sum, load) => sum + load.clearWidth, 0))}</p><p>Längste modellierte Lauflinie: {analysis.longestRouteSeatId ? formatMeters(analysis.longestValidRoute) : "nicht bestimmbar"}</p><p>Plätze ohne Route: {analysis.seatsWithoutRoute}</p><p>Stärkste Ausgangsbelastung: {Math.max(0, ...analysis.exitLoads.map((load) => load.persons))} Personen</p><p>Schmalster Gang: {analysis.narrowestAisle === undefined ? "kein Gang" : formatMeters(analysis.narrowestAisle)}</p>{analysis.exitLoads.map((load) => <p key={load.doorId}>{load.doorId}: {load.persons} Personen · {formatMeters(load.clearWidth)} lichte Breite{load.requiredWidth !== undefined ? ` · rechnerisch ${formatMeters(load.requiredWidth)}` : ""}</p>)}{analysis.aisleLoads.map((load) => <p key={load.aisleId}>Gang {load.aisleId}: bis {load.persons} Personen · {formatMeters(load.width)}{load.requiredWidth !== undefined ? ` · rechnerisch ${formatMeters(load.requiredWidth)}` : ""}</p>)}</div>
          <div className="max-h-64 space-y-1 overflow-auto" aria-label="Prüfergebnisse">{report.checks.map((check) => <button key={check.id} type="button" aria-pressed={activeCheckId === check.id} onClick={() => setActiveCheckId((current) => current === check.id ? null : check.id)} className={`block w-full rounded border px-2 py-1 text-left text-xs ${activeCheckId === check.id ? "border-premium-forest" : "border-premium-beige"} ${check.status === "fail" ? "bg-red-50 text-red-900" : check.status === "warning" ? "bg-amber-50 text-amber-900" : check.status === "pass" ? "bg-green-50 text-green-900" : "bg-gray-50 text-gray-600"}`}>{check.status === "fail" ? "✕" : check.status === "warning" ? "!" : check.status === "pass" ? "✓" : "–"} {check.message}</button>)}</div>
          {!!suggestions.length && <div className="space-y-2 border-t border-premium-beige pt-3"><p className="font-semibold">Gangvorschläge</p>{suggestions.map((suggestion) => <div key={suggestion.id} className="rounded-lg border border-premium-beige p-2 text-xs"><button type="button" aria-pressed={activeSuggestionId === suggestion.id} onClick={() => setActiveSuggestionId((current) => current === suggestion.id ? null : suggestion.id)} className="w-full text-left font-semibold text-premium-forest">{suggestion.reason} · {formatMeters(suggestion.width)}</button><p>{suggestion.removedSeatIds.length} Plätze entfallen · neue Sitzplatzzahl: {suggestion.newSeatCount}</p><p>Im Modell behobene Regeln: {suggestion.resolvesRuleIds.length ? suggestion.resolvesRuleIds.join(", ") : "verbesserter Ausgangszugang"}</p><button type="button" onClick={() => { const next = applyAisleSuggestion(plan, suggestion, `object-${nextId.current++}`); add(next); setCalculated(null); setActiveSuggestionId(null); setActiveCheckId(null); setNotice("Gang übernommen. Bestuhlung bitte neu berechnen."); }} className="mt-2 rounded bg-premium-forest px-2 py-1 font-semibold text-white">Gang übernehmen</button></div>)}</div>}
        </div>}
      </div>
      <div aria-label="Planvarianten" className="space-y-2 rounded border border-premium-beige p-2"><h3 className="font-semibold">Planvarianten</h3>
        <label className="block space-y-1 text-sm"><span>Ausrichtung der Varianten</span><select aria-label="Ausrichtung der Varianten" value={orientationPreference} onChange={(event) => setOrientationPreference(event.target.value as OrientationPreference)} className="w-full rounded border border-premium-beige px-2 py-1"><option value="automatic">Automatisch</option><option value="horizontal">Horizontal bevorzugen</option><option value="vertical">Vertikal bevorzugen</option></select></label>
        <button data-planner-action="calculate-variants" type="button" disabled={variantsBusy || !room.closed || errors.length > 0 || issues.some((issue) => issue.severity === "error") || seatingRules.rowPitch < seatingRules.chairDepth} onClick={calculateVariants} className="w-full rounded-lg bg-premium-forest px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">{variantsBusy ? "Varianten werden berechnet …" : "Planvarianten berechnen"}</button>
        {variantsBusy && <p role="status" className="text-xs text-premium-muted">Varianten werden geprüft. Dies kann einen Moment dauern.</p>}
        {variantError && <p role="alert" className="rounded bg-red-50 p-2 text-xs text-red-900">{variantError}</p>}
        {variantCalculation && !variantsCurrent && <p role="status" className="rounded bg-amber-50 p-2 text-xs text-amber-900">Die berechneten Varianten sind nach einer Plan- oder Einstellungsänderung veraltet. Bitte neu berechnen.</p>}
        {variants && <div aria-live="polite" className="space-y-2 text-xs">
          <p className="text-premium-muted">{variants.evaluatedCandidates} Kandidaten mit dem gewählten Regelprofil geprüft.</p>
          {!variants.variants.length && <p className="rounded bg-amber-50 p-2 text-amber-900">{variants.fallback ? "Keine Variante ohne technische Regelabweichung gefunden. Die beste berechnete Annäherung ist unten zur Prüfung sichtbar." : variants.evaluatedCandidates ? "Kein geeigneter Kandidat nach der Regelprüfung gefunden." : "Keine bestuhlbare Variante ermittelt. Prüfen Sie nutzbare Fläche, Sperrflächen und Raumkontur."}</p>}
          {(variants.variants.length ? variants.variants : variants.fallback ? [variants.fallback] : []).map((variant) => {
            const title = PLANNING_PROFILES.find((item) => item.id === variant.profileId)?.name ?? "Annäherung";
            const s = variant.summary;
            const difference = activeVariant && activeVariant.id !== variant.id ? compareVariants(activeVariant.summary, s) : [];
            return <div key={variant.id} className={`rounded-lg border p-2 ${activeVariantId === variant.id ? "border-premium-forest bg-[#f1f5ef]" : "border-premium-beige"}`}>
              <button type="button" aria-pressed={activeVariantId === variant.id} onClick={() => { setActiveVariantId(variant.id); setActiveCheckId(null); setSelection(null); }} className="w-full text-left"><strong>{variants.variants.length ? title : "Beste Annäherung"}{characteristic(s, variants.variants.map((item) => item.summary)) ? ` · ${characteristic(s, variants.variants.map((item) => item.summary))}` : ""}{!variant.feasible ? " · technische Annäherung" : ""}</strong><span className="block">{s.seatCount} Plätze · {s.blockCount} Blöcke · {s.aisleCount} Gänge ({s.manualAisleCount} manuell, {s.generatedAisleCount} automatisch)</span><span className="block">{s.unreachableSeatCount ? `${s.unreachableSeatCount} von ${s.seatCount} Sitzen ohne Weg` : "Alle Sitze erreichen einen Ausgang"} · {s.usedExitCount} von {s.exitCount} Ausgängen genutzt</span><span className="block">Längster Weg: {s.maxEgressDistance === undefined ? "nicht bestimmbar" : formatMeters(s.maxEgressDistance)} · {s.errors.length} Fehler · {s.warnings.length} Warnungen · {s.hints.length} Hinweise</span>{s.utilization !== undefined && <span className="block">Sitzplatzausbeute: {Math.round(s.utilization * 100)} % der nutzbaren Fläche</span>}</button>
              {!!difference.length && <p className="mt-1 text-premium-muted">Gegenüber der Vorschau: {difference.slice(0, 4).map((item) => `${item.value > 0 ? "+" : ""}${item.value.toLocaleString("de-DE")} ${item.unit === "metres" ? "m " : item.unit === "squareMetres" ? "m² " : ""}${item.label}`).join(" · ")}</p>}
              {activeVariantId === variant.id && <div className="mt-2 space-y-1 border-t border-premium-beige pt-2">{variant.reasons.map((reason) => <p key={reason}>{reason}</p>)}{s.unreachableBlockCount > 0 && <p>{s.unreachableBlockCount} ganze Sitzblöcke ohne Ausgangsweg.</p>}{s.exitCount > 1 && <p>Ausgangsnutzung: {s.exitLoads.map((load) => `${load.doorId}: ${load.seats} Plätze`).join(" · ")}</p>}{[...s.errors, ...s.warnings, ...s.hints].slice(0, 8).map((item) => <button key={item.id} type="button" onClick={() => { setActiveCheckId(item.id); const id = item.affectedIds.find((candidate) => variant.plan.objects.some((object) => object.id === candidate)) ?? item.affectedIds.find((candidate) => variant.seatingPlan.blocks.some((block) => block.id === candidate)); const object = variant.plan.objects.find((candidate) => candidate.id === id); const block = variant.seatingPlan.blocks.find((candidate) => candidate.id === id); const point = object && (object.type === "door" ? doorSegment(variant.plan.contour, object)?.start : object.type === "aisle" ? object.start : object) || block?.seats[0]; if (point) setCamera((current) => ({ ...current, x: point.x, y: point.y })); }} className={`block text-left ${item.category === "error" ? "text-red-800" : item.category === "warning" ? "text-amber-800" : "text-premium-muted"}`}>{item.category === "error" ? "Fehler" : item.category === "warning" ? "Warnung" : "Hinweis"}: {item.message}</button>)}{variant.feasible && <button type="button" onClick={() => adoptVariant(variant)} className="mt-1 rounded bg-premium-forest px-2 py-1 font-semibold text-white">Diese Variante übernehmen</button>}</div>}
            </div>;
          })}
          {!!variants.variants.length && <div className="overflow-x-auto"><table className="w-full border-collapse text-left"><caption className="mb-1 text-left font-semibold">Vergleich</caption><thead><tr><th className="pr-2">Kennzahl</th>{variants.variants.map((variant) => <th key={variant.id} className="pr-2">{PLANNING_PROFILES.find((item) => item.id === variant.profileId)?.name}</th>)}</tr></thead><tbody>{([
            ["Sitzplätze", (v: PlanVariant) => String(v.summary.seatCount)], ["Sitzblöcke", (v: PlanVariant) => String(v.summary.blockCount)], ["Gänge", (v: PlanVariant) => String(v.summary.aisleCount)], ["Erreichbare Plätze", (v: PlanVariant) => `${v.summary.reachableSeatCount}/${v.summary.seatCount}`], ["Genutzte Ausgänge", (v: PlanVariant) => `${v.summary.usedExitCount}/${v.summary.exitCount}`],
            ["Längster Weg", (v: PlanVariant) => v.summary.maxEgressDistance === undefined ? "–" : formatMeters(v.summary.maxEgressDistance)], ["Fehler", (v: PlanVariant) => String(v.summary.errors.length)], ["Warnungen", (v: PlanVariant) => String(v.summary.warnings.length)], ["Hinweise", (v: PlanVariant) => String(v.summary.hints.length)], ["Reihenabstand", (v: PlanVariant) => formatMeters(v.metrics.rowPitch)], ...(plan.objects.some((object) => object.type === "front") ? [["Abweichung zur Front", (v: PlanVariant) => `${v.metrics.frontDeviation ?? 0}°`] as [string, (v: PlanVariant) => string]] : []),
          ] as [string, (v: PlanVariant) => string][]).map(([label, get]) => <tr key={label} className="border-t border-premium-beige"><th className="py-1 pr-2 font-medium">{label}</th>{variants.variants.map((variant) => <td key={variant.id} className="pr-2">{get(variant)}</td>)}</tr>)}</tbody></table></div>}
        </div>}
        <p className="text-xs text-premium-muted">Die automatische Planung unterstützt die Raum- und Bestuhlungsplanung. Sie ersetzt keine erforderliche behördliche, brandschutztechnische oder fachplanerische Prüfung.</p>
      </div>
      <div className="planner-conversion sticky bottom-0 mt-auto grid gap-1 border-t border-premium-beige bg-white py-2"><a className="btn-primary text-center text-xs" href={inquiryHref}>Angebot für diese Bestuhlung anfordern</a>{shopTarget && <a className="btn-secondary text-center text-xs" href={shopTarget.href}>Stuhl konfigurieren / Produkt ansehen</a>}</div>
    </aside></div>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-premium-beige bg-white/80 px-4 py-3 text-sm text-premium-charcoal">
      <span>{help}</span>
      <span className="font-semibold">{room.closed ? `Raumfläche: ${polygonArea(shownRoom.points).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²` : `${room.points.length} Eckpunkte`}</span>
      {room.closed ? <span>Umfang: {formatMeters(perimeter(shownRoom))}</span> : null}
      {selectedPoint ? <span>Eckpunkt: X {formatMeters(selectedPoint.x)} · Y {formatMeters(selectedPoint.y)}</span> : null}
      {wallStart && wallEnd ? <span>Wand: {formatMeters(wallLength(wallStart, wallEnd))}</span> : null}
      <div className="ml-auto flex items-center gap-2"><button type="button" aria-label="Verkleinern" onClick={() => zoomAt(1 / 1.25, size.width / 2, size.height / 2)} className="rounded border border-premium-beige px-2 py-1">−</button><span>{Math.round(camera.scale / INITIAL_SCALE * 100)} %</span><button type="button" aria-label="Vergrößern" onClick={() => zoomAt(1.25, size.width / 2, size.height / 2)} className="rounded border border-premium-beige px-2 py-1">+</button></div>
    </div>
    <div className="border-t border-premium-beige px-4 py-2 text-xs text-premium-muted">Mausrad: zoomen · Mittlere Maustaste oder Leertaste + ziehen: verschieben · Shift: gerade Wand · Rasterfang: 0,10 m</div>
    {(errors.length > 0 || issues.length > 0 || notice) ? <div role="alert" className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">{errors.map((message) => <p key={message}>Fehler: {message}</p>)}{issues.map((issue, index) => <p key={`${issue.objectId}-${index}`}>{issue.severity === "error" ? "Fehler" : "Warnung"}: {issue.message}</p>)}{notice && <p>{notice}</p>}</div> : null}
  </section>;
}

function CommitNumberField({ label, value, min, onCommit }: { label: string; value: number; min?: number; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return <label className="flex items-center justify-between gap-2 text-sm"><span>{label}</span><input aria-label={label} type="number" step="0.1" min={min} value={draft} onChange={(event) => setDraft(event.currentTarget.value)} onBlur={() => { const number = Number(draft); if (draft !== "" && Number.isFinite(number) && (min === undefined || number >= min) && number !== value) onCommit(number); else setDraft(String(value)); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="w-24 rounded border border-premium-beige px-2 py-1 text-right" /></label>;
}

function Dimension({ a, b, label }: { a: { x: number; y: number }; b: { x: number; y: number }; label: string }) {
  if (Math.hypot(b.x - a.x, b.y - a.y) < 30) return null;
  const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
  return <g pointerEvents="none"><rect x={x - 30} y={y - 24} width="60" height="19" rx="5" fill="white" fillOpacity="0.92" /><text x={x} y={y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#405b49">{label}</text></g>;
}

function Grid({ camera, size }: { camera: Camera; size: { width: number; height: number } }) {
  const step = camera.scale >= 65 ? 0.1 : camera.scale >= 24 ? 0.5 : 1;
  const left = camera.x - size.width / 2 / camera.scale, right = camera.x + size.width / 2 / camera.scale;
  const top = camera.y - size.height / 2 / camera.scale, bottom = camera.y + size.height / 2 / camera.scale;
  const lines = [];
  for (let x = Math.ceil(left / step); x * step <= right; x++) {
    const meters = x * step, pixel = size.width / 2 + (meters - camera.x) * camera.scale;
    lines.push(<line key={`x-${x}`} x1={pixel} x2={pixel} y1="0" y2={size.height} stroke={Math.abs(meters - Math.round(meters)) < 1e-8 ? "#c7cbbd" : "#e4e5db"} strokeWidth="1" />);
  }
  for (let y = Math.ceil(top / step); y * step <= bottom; y++) {
    const meters = y * step, pixel = size.height / 2 + (meters - camera.y) * camera.scale;
    lines.push(<line key={`y-${y}`} x1="0" x2={size.width} y1={pixel} y2={pixel} stroke={Math.abs(meters - Math.round(meters)) < 1e-8 ? "#c7cbbd" : "#e4e5db"} strokeWidth="1" />);
  }
  return <g pointerEvents="none">{lines}</g>;
}
