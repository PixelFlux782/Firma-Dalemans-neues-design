"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { appendPoint, closeRoom, formatMeters, movePoint, orthogonalSnap, perimeter, pointById, polygonArea, resizeWall, snapPoint, validateRoom, wallLength, type Point2D } from "@/lib/room-planner/geometry";
import { commit, createHistory, redo, undo } from "@/lib/room-planner/history";
import { aislePolygon, doorSegment, emptyPlan, frontSegment, isBlockingObject, obstaclePolygon, polygonInsideRoom, setDoorRole, validateObjects, wallEndpoints, wallOffset, type Position, type RoomObject, type RoomPlan, type DoorObject, type ObstacleObject, type AisleObject } from "@/lib/room-planner/objects";
import { DEFAULT_SEATING_RULES, generateSeatingPlan, type SeatingGridOffset, type SeatingOrientation, type SeatingPlan, type SeatingRules } from "@/lib/room-planner/seating";
import { generatePlanVariants, materializeVariant, PLANNING_PROFILES, type OrientationPreference, type PlanVariant, type VariantResult } from "@/lib/room-planner/variants";
import { analyzeEgress } from "@/lib/room-planner/egress/analyzeEgress";
import { evaluateRules } from "@/lib/room-planner/rules/evaluateRules";
import { RULE_PROFILES } from "@/lib/room-planner/rules/profiles";
import { applyAisleSuggestion, suggestAisles } from "@/lib/room-planner/suggestions/aisleSuggestions";
import { planFingerprint } from "@/lib/room-planner/variantSummary";
import { characteristic, compareVariants } from "@/lib/room-planner/variantComparison";
import { editRow, moveBlock, moveSeat, removeBlock, removeSeat, rotateBlock, rowsOf } from "@/lib/room-planner/seatingEditing";
import { analyzeCurrentPlan } from "@/lib/room-planner/currentPlanAnalysis";
import { createProject, parseProject, parseProjectStore, projectFileName, PROJECT_SCHEMA_VERSION, PROJECT_STORAGE_KEY, type PlannerSettings, type RoomPlannerProject } from "@/lib/room-planner/projects";
import ProjectControls from "./ProjectControls";
import dynamic from "next/dynamic";
const RoomView3D = dynamic(() => import("../3d/RoomView3D"), { ssr: false });
import PlanOutputView from "./PlanOutputView";
import MeasurementLayer from "./MeasurementLayer";
import type { Measurement } from "@/lib/room-planner/measurements";
import PlannerBrand from "../PlannerBrand";
import PlannerHelp from "../help/PlannerHelp";
import { calculatePlanDemand, calculateRecommendedDemand, changeChairSelection, chairProducts, DEFAULT_CHAIR_SELECTION, resolveChairShopTarget } from "@/lib/room-planner/chairSelection";
import { calculateTableDemand, DEFAULT_TABLE_MODEL_ID, TABLE_MODELS, TABLE_PRESETS, fillTableZone, findTableSnap, fitTableLayout, generateTableLayout, moveTableGroup, moveZone, moveZonePoint, placeTable, planCapacity, rotatedRectangle, seatTable, tableLayoutConflicts, tableModel, tablePlacementConflict, tablePolygon, transformTableLayout, validateTables, validateZonePolygon, zoneCenter, zonePolygon, type GeneratedTableLayout, type LayoutTransform, type PlanningZone, type TableLayoutMode, type TablePlanningGoal, type TablePresetId, type TableSnapCandidate } from "@/lib/room-planner/tables";
import { planTableZone, type TableZonePlanningResult } from "@/lib/room-planner/tableZonePlanning";
import { generateFreeAreaSeating, replanningImpact } from "@/lib/room-planner/planning";
import { deleteFurnitureSelection, duplicateFurnitureSelection, furnitureSelectionBounds, furnitureSelectionConflicts, normalizeFurnitureSelection, selectFurnitureInMarquee, transformFurnitureSelection } from "@/lib/room-planner/furnitureSelection";

const INITIAL_SCALE = 45;
const MIN_SCALE = 12;
const MAX_SCALE = 240;
const POINT_RADIUS = 5;
type Tool = "select" | "wall" | "door" | "aisle" | "chair" | "table" | "restricted" | "obstacle";
type Selection = { type: "point" | "wall" | "object" | "block" | "seat" | "table" | "chair" | "zone"; id: string } | null;
type Camera = { x: number; y: number; scale: number };
type HydratedRoomPlan = RoomPlan & { tables: NonNullable<RoomPlan["tables"]>; chairs: NonNullable<RoomPlan["chairs"]>; zones: NonNullable<RoomPlan["zones"]>; tableGroups: NonNullable<RoomPlan["tableGroups"]> };
type ResizeCorner = "nw" | "ne" | "se" | "sw";
type WorkflowStep = "room" | "furnishing" | "result";
type Drag = { type: "pan"; startX: number; startY: number; camera: Camera }
  | { type: "point" | "object" | "start" | "end" | "block" | "seat" | "table" | "chair" | "zone"; id: string; at: { x: number; y: number }; original: RoomPlan }
  | { type: "furniture"; ids: string[]; at: Position; original: RoomPlan }
  | { type: "furnitureRotate"; ids: string[]; center: Position; startAngle: number; original: RoomPlan }
  | { type: "marquee"; at: Position; current: Position; additive: boolean; initialIds: string[]; clickSelection: Selection }
  | { type: "zonePoint"; id: string; pointIndex: number; at: { x: number; y: number }; original: RoomPlan }
  | { type: "resize"; kind: "table" | "object" | "zone"; id: string; corner: ResizeCorner; original: RoomPlan }
  | { type: "rotate"; kind: "table" | "object" | "zone"; id: string; original: RoomPlan }
  | { type: "layoutMove" | "layoutRotate" | "layoutScale"; at: { x: number; y: number }; original: LayoutTransform };

const TOOL_INFO: { name: Tool; label: string; help: string }[] = [
  { name: "select", label: "Auswahl", help: "Objekte oder Eckpunkte anklicken und ziehen, um sie zu bearbeiten." },
  { name: "wall", label: "Raum", help: "Eckpunkte nacheinander setzen. Den ersten Punkt anklicken, um den Raum zu schließen." },
  { name: "door", label: "Türen", help: "Typ und Breite wählen, dann an einer Wand klicken." },
  { name: "aisle", label: "Gänge", help: "Breite wählen, dann Start und Ende anklicken. Shift rastet auf 45° ein." },
  { name: "chair", label: "Stühle", help: "Einzelnen Stuhl setzen oder die automatische Bestuhlung starten." },
  { name: "table", label: "Tische", help: "Einzelnen Tisch setzen oder einen freien polygonalen Tischbereich zeichnen." },
  { name: "restricted", label: "Sperrflächen", help: "Eine rechteckige Freihaltefläche im Raum setzen." },
  { name: "obstacle", label: "Hindernisse", help: "Hindernis, Bühne oder Front wählen und im Raum platzieren." },
];
const TOOL_PATHS: Record<Tool, string> = {
  select: "M4 3l5 16 2-6 6-2z", wall: "M3 18V5h18v13M3 18h18", door: "M4 20V4h14v16M8 20V8h10v12M14 14h1", obstacle: "M4 4h16v16H4zM4 4l16 16M20 4L4 20", aisle: "M4 3v18M9 3v18M15 3v18M20 3v18", table: "M3 8h18v8H3zM7 16v5m10-5v5", chair: "M7 4v8h10V4M6 12h12v5H6zm2 5v4m8-4v4", restricted: "M4 4h16v16H4zM4 9h16M9 4v16",
};
const TOOLS_WITH_OPTIONS: Tool[] = ["door", "aisle", "chair", "table", "restricted", "obstacle"];
function ToolIcon({ name }: { name: Tool }) { return <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={TOOL_PATHS[name]} /></svg>; }

export default function RoomEditor2D() {
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>("room");
  const [rulePanelOpen, setRulePanelOpen] = useState(false);
  const [advancedPanelOpen, setAdvancedPanelOpen] = useState(false);
  const [history, setHistory] = useState(() => createHistory(emptyPlan()));
  const plan = history.present as HydratedRoomPlan;
  const room = plan.contour;
  const chairSelection = plan.chairSelection ?? DEFAULT_CHAIR_SELECTION;
  const demand = calculatePlanDemand(plan);
  const tableDemand = calculateTableDemand(plan);
  const [reservePercent, setReservePercent] = useState<PlannerSettings["reservePercent"]>(5);
  const recommended = calculateRecommendedDemand(plan, reservePercent);
  const shopTarget = resolveChairShopTarget(plan, recommended.recommendedQuantity);
  const [previewPlan, setPreviewPlan] = useState<RoomPlan | null>(null);
  const [snapPreview, setSnapPreview] = useState<TableSnapCandidate | null>(null);
  const [tool, setTool] = useState<Tool>("wall");
  const [toolOptions, setToolOptions] = useState<Tool | null>(null);
  const [doorRole, setDoorRoleChoice] = useState<"normal" | "entrance" | "exit" | "emergency_exit">("normal");
  const [doorWidth, setDoorWidth] = useState(1);
  const [obstacleType, setObstacleType] = useState<ObstacleObject["obstacleType"]>("restricted");
  const [obstacleElement, setObstacleElement] = useState<"obstacle" | "stage" | "reservedArea" | "front">("obstacle");
  const [obstacleWidth, setObstacleWidth] = useState(1);
  const [obstacleDepth, setObstacleDepth] = useState(1);
  const [aisleWidth, setAisleWidth] = useState(1.2);
  const [areaMode, setAreaMode] = useState<"tables" | "table">("tables");
  const [zoneDraft, setZoneDraft] = useState<Position[]>([]);
  const [selectedTableModelId, setSelectedTableModelId] = useState(DEFAULT_TABLE_MODEL_ID);
  const [tableRotation, setTableRotation] = useState(0);
  const [zoneFillRotation, setZoneFillRotation] = useState(0);
  const [zoneFillMode, setZoneFillMode] = useState<TableLayoutMode>("individual");
  const [zoneFillGoal, setZoneFillGoal] = useState<TablePlanningGoal>("balanced");
  const [zoneFillWithChairs, setZoneFillWithChairs] = useState(true);
  const [zoneFillConfirm, setZoneFillConfirm] = useState<TableZonePlanningResult | null>(null);
  const [zoneSetupOpen, setZoneSetupOpen] = useState(false);
  const [zoneFillBusy, setZoneFillBusy] = useState(false);
  const [tableWithChairs, setTableWithChairs] = useState(false);
  const [tablePreset, setTablePreset] = useState<TablePresetId>("single");
  const [tableCount, setTableCount] = useState(6);
  const [tableSpacing, setTableSpacing] = useState(1.2);
  const [layoutDraft, setLayoutDraft] = useState<GeneratedTableLayout | null>(null);
  const [layoutTransform, setLayoutTransform] = useState<LayoutTransform>({ center: { x: 0, y: 0 }, rotation: 0, spread: 1 });
  const [measurementEdit, setMeasurementEdit] = useState<{ measurement: Measurement; value: string; x: number; y: number; error?: string } | null>(null);
  const [measurementsVisible, setMeasurementsVisible] = useState(true);
  const [showDistances, setShowDistances] = useState(false);
  const [selection, setSelection] = useState<Selection>(null);
  const [furnitureSelection, setFurnitureSelection] = useState<string[]>([]);
  const [marquee, setMarquee] = useState<{ at: Position; current: Position } | null>(null);
  const [previewConflicts, setPreviewConflicts] = useState<Set<string>>(() => new Set());
  const [lastAutoFurnitureIds, setLastAutoFurnitureIds] = useState<string[]>([]);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: INITIAL_SCALE });
  const [size, setSize] = useState({ width: 900, height: 580 });
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [aisleStart, setAisleStart] = useState<{ x: number; y: number } | null>(null);
  const [shiftDown, setShiftDown] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const [notice, setNotice] = useState("");
  const [helpLayerKind, setHelpLayerKind] = useState<"menu" | "help" | "onboarding" | null>(null);
  const [helpCloseSignal, setHelpCloseSignal] = useState(0);
  const [replanDialogOpen, setReplanDialogOpen] = useState(false);
  const [rowEditCount, setRowEditCount] = useState(1);
  const [seatingRules, setSeatingRules] = useState<SeatingRules>({ ...DEFAULT_SEATING_RULES });
  const [orientation, setOrientation] = useState<SeatingOrientation>("horizontal");
  const [gridOffset, setGridOffset] = useState<SeatingGridOffset>({ along: 0, cross: 0 });
  const [orientationPreference, setOrientationPreference] = useState<OrientationPreference>("automatic");
  const [optimizationGoal, setOptimizationGoal] = useState<"capacity" | "balanced" | "comfort">("balanced");
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
  const tableDemandText = tableDemand.length ? tableDemand.map(({ model, quantity }) => `${quantity} × ${model.name}`).join("\n") : "Keine Tische geplant";
  const inquiryHref = `/kontakt?${new URLSearchParams({ anliegen: "Raumplaner-Bedarf", produkt: demand.product?.title ?? "", variante: demand.variant?.title ?? "", nachricht: `Anfrage aus dem Raumplaner\nProjekt: ${projectName}\nStuhlmodell: ${demand.product?.title ?? ""}\nVariante: ${demand.variant?.title ?? ""}\nStuhlbedarf: ${demand.quantity} Stück (${demand.rowQuantity} Reihenbestuhlung, ${demand.tableQuantity} an Tischen)\nReserve: ${reservePercent} % (${recommended.reserveQuantity} Stück)\nEmpfohlene Gesamtmenge Stühle: ${recommended.recommendedQuantity} Stück\nTischbedarf:\n${tableDemandText}\nSitzblöcke: ${demand.blocks}\nGänge: ${plan.objects.filter((object) => object.type === "aisle").length}\nAusgänge: ${plan.objects.filter((object) => object.type === "door" && (object.role === "exit" || object.role === "emergency_exit")).length}\nRaumfläche: ${plan.contour.closed ? formatMeters(polygonArea(plan.contour.points)) + " m²" : "nicht bestimmt"}\nStuhlmaße: ${formatMeters(chairSelection.width)} × ${formatMeters(chairSelection.depth)} m (Planungsannahme)\nRegel-/Referenzprofil: ${RULE_PROFILES.find((item) => item.id === profileId)?.name ?? "nicht gewählt"}; keine behördliche Freigabe.` })}#anfrage`;
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
  const shownPlan = (previewPlan ?? activeVariant?.plan ?? plan) as HydratedRoomPlan;
  const shownRoom = shownPlan.contour;
  const transformedDraft = useMemo(() => layoutDraft ? transformTableLayout(layoutDraft, layoutTransform) : null, [layoutDraft, layoutTransform]);
  const draftConflicts = useMemo(() => transformedDraft ? tableLayoutConflicts(plan, transformedDraft) : new Set<string>(), [plan, transformedDraft]);
  const seating = activeVariant?.seatingPlan ?? shownPlan.seating ?? (!previewPlan && calculated?.plan === plan && calculated.rules === seatingRules && calculated.orientation === orientation ? calculated.result : null);
  const profile = RULE_PROFILES.find((item) => item.id === profileId) ?? RULE_PROFILES[0];
  const currentAnalysis = useMemo(() => !activeVariant && plan.seating ? analyzeCurrentPlan(plan, plan.seating, profile) : null, [activeVariant, plan, profile]);
  const analysis = activeVariant?.analysis ?? currentAnalysis?.egress ?? (seating ? analyzeEgress(plan, seating, profile) : null);
  const report = activeVariant?.report ?? currentAnalysis?.report ?? (seating && analysis ? evaluateRules(plan, seating, analysis, profile) : null);
  const blockers = [...new Set([...validateRoom(plan.contour), ...validateObjects(plan).filter((issue) => issue.severity === "error").map((issue) => issue.message), ...validateTables(plan).filter((issue) => issue.severity === "error").map((issue) => issue.message), ...(report?.checks.filter((check) => check.status === "fail").map((check) => check.message) ?? []), ...(currentAnalysis?.summary.errors.map((item) => item.message) ?? [])])];
  const ruleProblemCount = report?.counts.fail ?? (room.points.length ? blockers.length : 0);
  const ruleWarningCount = report?.counts.warning ?? 0;
  const ruleStatus = ruleProblemCount > 0 ? "fail" : !seating ? "pending" : "pass";
  useEffect(() => {
    if (ruleProblemCount > 0) setRulePanelOpen(true);
  }, [ruleProblemCount]);
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
    setCalculated(null); setVariantCalculation(null); setActiveVariantId(null); setPreviewPlan(null); setLayoutDraft(null);
    setSelection(null); setFurnitureSelection([]); setMarquee(null); setPreviewConflicts(new Set()); setLastAutoFurnitureIds([]); setAisleStart(null); setZoneDraft([]); setHover(null); setActiveCheckId(null); setActiveSuggestionId(null); setNotice("");
    parameterHistory.current = new WeakMap();
    nextId.current = Math.max(0, ...[...project.plan.contour.points, ...project.plan.objects, ...(project.plan.tables ?? []), ...(project.plan.chairs ?? []), ...(project.plan.zones ?? [])].map((item) => Number(item.id.match(/(\d+)$/)?.[1] ?? 0))) + 1;
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
  const setFurnitureIds = (ids: Iterable<string>, sourcePlan: RoomPlan = plan) => {
    const normalized = normalizeFurnitureSelection(sourcePlan, ids);
    setFurnitureSelection(normalized);
    if (normalized.length !== 1) { setSelection(null); return; }
    const id = normalized[0];
    setSelection(sourcePlan.tables?.some((item) => item.id === id) ? { type: "table", id }
      : sourcePlan.chairs?.some((item) => item.id === id) ? { type: "chair", id }
      : sourcePlan.seating?.seats.some((item) => item.id === id) ? { type: "seat", id }
      : null);
  };
  const clearFurnitureSelection = () => { setFurnitureSelection([]); setPreviewConflicts(new Set()); };
  useEffect(() => {
    setFurnitureSelection((current) => {
      const normalized = normalizeFurnitureSelection(plan, current);
      return normalized.length === current.length && normalized.every((id, index) => id === current[index]) ? current : normalized;
    });
  }, [plan]);
  const applyMeasurement = () => {
    if (!measurementEdit) return;
    const value = Number(measurementEdit.value.replace(",", "."));
    if (!Number.isFinite(value)) { setMeasurementEdit({ ...measurementEdit, error: "Bitte geben Sie ein gültiges Maß ein." }); return; }
    const { measurement } = measurementEdit;
    if (measurement.kind === "wall") {
      const result = resizeWall(room, measurement.id, value);
      if (!result.room) { setMeasurementEdit({ ...measurementEdit, error: result.error ?? "Ungültige Raumkontur." }); return; }
      const next = { ...plan, contour: result.room };
      const objectError = validateObjects(next).find((issue) => issue.severity === "error" && !validateObjects(plan).some((old) => old.objectId === issue.objectId && old.severity === "error"));
      if (objectError) { setMeasurementEdit({ ...measurementEdit, error: objectError.message }); return; }
      if (JSON.stringify(result.room) !== JSON.stringify(room)) add(next);
      setMeasurementEdit(null); setNotice(""); return;
    }
    if (value <= 0) { setMeasurementEdit({ ...measurementEdit, error: "Bitte geben Sie ein Maß größer als 0 ein." }); return; }
    const object = plan.objects.find((item) => measurement.id === item.id || measurement.id === `${item.id}-length` || measurement.id === `${item.id}-width` || measurement.id === `${item.id}-depth`);
    if (object) {
      const changed: RoomObject = object.type === "door" ? { ...object, width: value }
        : object.type === "aisle" && measurement.id.endsWith("-length") ? (() => { const length = wallLength(object.start, object.end); return { ...object, end: { x: Number((object.start.x + (object.end.x - object.start.x) * value / length).toFixed(4)), y: Number((object.start.y + (object.end.y - object.start.y) * value / length).toFixed(4)) }, edited: true }; })()
        : object.type === "aisle" && measurement.id.endsWith("-width") ? { ...object, width: value, edited: true }
        : isBlockingObject(object) && measurement.id.endsWith("-width") ? { ...object, width: value }
        : isBlockingObject(object) && measurement.id.endsWith("-depth") ? { ...object, depth: value }
        : object;
      const next = { ...plan, objects: plan.objects.map((item) => item.id === object.id ? changed : item) };
      const issue = validateObjects(next).find((candidate) => candidate.objectId === object.id && candidate.severity === "error");
      if (issue) { setMeasurementEdit({ ...measurementEdit, error: issue.message }); return; }
      if (JSON.stringify(changed) !== JSON.stringify(object)) add(next);
      setSelection({ type: "object", id: object.id }); setMeasurementEdit(null); setNotice(""); return;
    }
    const table = plan.tables.find((item) => measurement.id === `${item.id}-width` || measurement.id === `${item.id}-depth`);
    if (table) {
      const changed = { ...table, [measurement.id.endsWith("-depth") ? "depth" : "width"]: value, edited: true };
      const next = { ...plan, tables: plan.tables.map((item) => item.id === table.id ? changed : item) };
      const issue = validateTables(next).find((candidate) => candidate.objectId === table.id && candidate.severity === "error");
      if (issue) { setMeasurementEdit({ ...measurementEdit, error: issue.message }); return; }
      add(next); setSelection({ type: "table", id: table.id }); setMeasurementEdit(null); setNotice("");
    }
  };
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
  const updateTable = (id: string, change: (table: NonNullable<RoomPlan["tables"]>[number]) => NonNullable<RoomPlan["tables"]>[number]) => add({ ...plan, tables: plan.tables.map(table => table.id === id ? { ...change(table), edited: true } : table) });
  const removeZone = (id: string) => { add({ ...plan, zones: plan.zones.filter(zone => zone.id !== id), tables: plan.tables.map((table) => table.zoneId === id ? { ...table, zoneId: undefined, edited: true } : table) }); setSelection(null); };
  const removeTable = (id: string) => {
    const table = plan.tables.find(item => item.id === id), group = table?.groupId && plan.tableGroups.find(item => item.id === table.groupId);
    add({ ...plan, tables: plan.tables.filter(item => item.id !== id), chairs: group ? plan.chairs.filter(item => !group.chairIds.includes(item.id)) : plan.chairs, tableGroups: group ? plan.tableGroups.filter(item => item.id !== group.id) : plan.tableGroups });
    setSelection(null);
  };
  const duplicateTable = (id: string) => {
    const source = plan.tables.find(item => item.id === id); if (!source) return;
    const copy = { ...source, id: `table-${nextId.current++}`, x: Number((source.x + .35).toFixed(2)), y: Number((source.y + .35).toFixed(2)), groupId: undefined, source: "manual" as const };
    add({ ...plan, tables: [...plan.tables, copy] }); setSelection({ type: "table", id: copy.id });
  };
  const duplicateSelectedFurniture = () => {
    if (!furnitureSelection.length) return;
    const result = duplicateFurnitureSelection(plan, furnitureSelection, (kind) => `${kind}-${nextId.current++}`);
    if (!result.selectedIds.length) return;
    add(result.plan);
    setFurnitureIds(result.selectedIds, result.plan);
    setLastAutoFurnitureIds([]);
    setNotice(`${result.selectedIds.length} Möbel dupliziert. Die Kopie ist ausgewählt und leicht versetzt.`);
  };
  const deleteSelectedFurniture = () => {
    if (!furnitureSelection.length) return;
    const next = deleteFurnitureSelection(plan, furnitureSelection);
    if (next === plan) return;
    add(next);
    setFurnitureSelection([]);
    setSelection(null);
    setLastAutoFurnitureIds((current) => current.filter((id) => !furnitureSelection.includes(id)));
    setNotice(`${furnitureSelection.length} Möbel gelöscht.`);
  };
  const rotateSelectedFurniture = (rotation = 90) => {
    if (furnitureSelection.length < 2) return;
    const next = transformFurnitureSelection(plan, furnitureSelection, { rotation });
    const conflicts = furnitureSelectionConflicts(next, furnitureSelection);
    if (conflicts.size) { setPreviewConflicts(conflicts); setNotice("Die Drehung würde mit Raumgrenze, Gang, Tür, Hindernis oder anderen Möbeln kollidieren."); return; }
    add(next);
    setPreviewConflicts(new Set());
    setNotice(`${furnitureSelection.length} Möbel gemeinsam um ${rotation}° gedreht.`);
  };
  const deleteSelection = () => {
    if (furnitureSelection.length > 1) { deleteSelectedFurniture(); return; }
    if (selection?.type === "object") removeObject(selection.id);
    if (selection?.type === "table") removeTable(selection.id);
    if (selection?.type === "chair") { add({ ...plan, chairs: plan.chairs.filter(chair => chair.id !== selection.id), tableGroups: plan.tableGroups.map(group => ({ ...group, chairIds: group.chairIds.filter(id => id !== selection.id) })) }); setSelection(null); }
    if (selection?.type === "zone") removeZone(selection.id);
    if (selection?.type === "block" && plan.seating) { add({ ...plan, seating: removeBlock(plan.seating, selection.id) }); setSelection(null); }
    if (selection?.type === "seat" && plan.seating) { add({ ...plan, seating: removeSeat(plan.seating, selection.id) }); setSelection(null); }
    if (selection?.type === "table" || selection?.type === "chair" || selection?.type === "seat") setFurnitureSelection([]);
  };

  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setSize({ width: element.clientWidth, height: element.clientHeight }));
    observer.observe(element);
    setSize({ width: element.clientWidth, height: element.clientHeight });
    return () => observer.disconnect();
  }, [outputIssuedAt]);

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
  }, [outputIssuedAt]);

  const historyAction = useCallback((action: "undo" | "redo") => {
    setPreviewPlan(null);
    setAisleStart(null);
    setZoneDraft([]);
    setNotice("");
    setSelection(null);
    setFurnitureSelection([]);
    setMarquee(null);
    setPreviewConflicts(new Set());
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
      const editing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLElement && event.target.isContentEditable;
      if (event.code === "Space" && !editing) { event.preventDefault(); setSpaceDown(true); }
      if (event.key === "Shift") setShiftDown(true);
      if (editing && event.key !== "Escape") return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); historyAction(event.shiftKey ? "redo" : "undo"); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); historyAction("redo"); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d" && furnitureSelection.length) { event.preventDefault(); duplicateSelectedFurniture(); }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d" && selection?.type === "table") { event.preventDefault(); duplicateTable(selection.id); }
      if (event.key === "Escape" && helpLayerKind) {
        event.preventDefault();
        setHelpCloseSignal((value) => value + 1);
        event.stopImmediatePropagation();
      }
      if (event.key === "Escape") { dragRef.current = null; setPreviewPlan(null); setSnapPreview(null); setPreviewConflicts(new Set()); setMarquee(null); setHover(null); setSelection(null); setFurnitureSelection([]); setAisleStart(null); setZoneDraft([]); setMeasurementEdit(null); setToolOptions(null); setLayoutDraft(null); setReplanDialogOpen(false); setZoneFillConfirm(null); }
      if ((event.key === "Delete" || event.key === "Backspace") && (selection || furnitureSelection.length)) { event.preventDefault(); deleteSelection(); }
    };
    const keyUp = (event: KeyboardEvent) => { if (event.code === "Space") setSpaceDown(false); if (event.key === "Shift") setShiftDown(false); };
    const blur = () => { setSpaceDown(false); setShiftDown(false); };
    window.addEventListener("keydown", keyDown); window.addEventListener("keyup", keyUp); window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); window.removeEventListener("blur", blur); };
  // The handler intentionally tracks the current plan and selection for editor shortcuts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyAction, selection, furnitureSelection, plan, helpLayerKind]);

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
  const issues = useMemo(() => [...validateObjects(shownPlan), ...validateTables(shownPlan)], [shownPlan]);
  const selectedObject = selection?.type === "object" ? shownPlan.objects.find((object) => object.id === selection.id) : undefined;
  const selectedBlock = selection?.type === "block" ? seating?.blocks.find((block) => block.id === selection.id) : undefined;
  const selectedSeat = selection?.type === "seat" ? seating?.seats.find((seat) => seat.id === selection.id) : undefined;
  const selectedSeatBlock = selectedSeat && seating?.blocks.find((block) => block.seats.some((seat) => seat.id === selectedSeat.id));
  const selectedTable = selection?.type === "table" ? shownPlan.tables.find(table => table.id === selection.id) : undefined;
  const selectedFurnitureChair = selection?.type === "chair" ? shownPlan.chairs.find(chair => chair.id === selection.id) : undefined;
  const selectedZone = selection?.type === "zone" ? shownPlan.zones.find(zone => zone.id === selection.id) : undefined;
  const shapePoints = (points: { x: number; y: number }[]) => points.map((point) => { const p = screen(point); return `${p.x},${p.y}`; }).join(" ");
  const aisleEnd = (raw: { x: number; y: number }, shift: boolean) => {
    const p = snapPoint(raw);
    if (!aisleStart || !shift) return p;
    const angle = Math.round(Math.atan2(p.y - aisleStart.y, p.x - aisleStart.x) / (Math.PI / 4)) * Math.PI / 4;
    const length = wallLength(aisleStart, p);
    return snapPoint({ x: aisleStart.x + Math.cos(angle) * length, y: aisleStart.y + Math.sin(angle) * length });
  };
  const resizeItem = <T extends { x: number; y: number; width: number; depth: number; rotation: number }>(item: T, corner: ResizeCorner, at: { x: number; y: number }): T => {
    const signs = { nw: [-1, -1], ne: [1, -1], se: [1, 1], sw: [-1, 1] } as const;
    const [sx, sy] = signs[corner], angle = item.rotation * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
    const oppositeLocal = { x: -sx * item.width / 2, y: -sy * item.depth / 2 };
    const opposite = { x: item.x + oppositeLocal.x * c - oppositeLocal.y * s, y: item.y + oppositeLocal.x * s + oppositeLocal.y * c };
    const dx = at.x - opposite.x, dy = at.y - opposite.y;
    const localX = dx * c + dy * s, localY = -dx * s + dy * c;
    const width = Math.max(.1, Math.abs(localX)), depth = Math.max(.1, Math.abs(localY));
    const centerLocal = { x: sx * width / 2, y: sy * depth / 2 };
    return { ...item, x: Number((opposite.x + centerLocal.x * c - centerLocal.y * s).toFixed(3)), y: Number((opposite.y + centerLocal.x * s + centerLocal.y * c).toFixed(3)), width: Number(width.toFixed(3)), depth: Number(depth.toFixed(3)) };
  };
  const dragged = (drag: Extract<Drag, { id: string; original: RoomPlan }>, at: { x: number; y: number }): RoomPlan => {
    if (drag.type === "resize") {
      if (drag.kind === "table") return { ...drag.original, tables: (drag.original.tables ?? []).map(item => item.id === drag.id ? { ...resizeItem(item, drag.corner, at), edited: true } : item) };
      if (drag.kind === "zone") return { ...drag.original, zones: (drag.original.zones ?? []).map(item => item.id === drag.id && item.geometry.kind === "rectangle" ? (() => { const resized = resizeItem({ ...item.geometry, rotation: item.rotation }, drag.corner, at); return { ...item, geometry: { ...item.geometry, x: resized.x, y: resized.y, width: resized.width, depth: resized.depth } }; })() : item) };
      return { ...drag.original, objects: drag.original.objects.map(item => item.id === drag.id && isBlockingObject(item) ? resizeItem(item, drag.corner, at) : item) };
    }
    if (drag.type === "rotate") {
      const item = drag.kind === "table" ? (drag.original.tables ?? []).find(entry => entry.id === drag.id) : drag.kind === "zone" ? (drag.original.zones ?? []).find(entry => entry.id === drag.id)?.geometry : drag.original.objects.find(entry => entry.id === drag.id && isBlockingObject(entry));
      if (!item || !("x" in item)) return drag.original;
      const rotation = Math.round(Math.atan2(at.y - item.y, at.x - item.x) * 180 / Math.PI + 90);
      if (drag.kind === "table") return { ...drag.original, tables: (drag.original.tables ?? []).map(entry => entry.id === drag.id ? { ...entry, rotation, edited: true } : entry) };
      if (drag.kind === "zone") return { ...drag.original, zones: (drag.original.zones ?? []).map(entry => entry.id === drag.id ? { ...entry, rotation } : entry) };
      return { ...drag.original, objects: drag.original.objects.map(entry => entry.id === drag.id && isBlockingObject(entry) ? { ...entry, rotation } : entry) };
    }
    if (drag.type === "seat" && drag.original.seating) {
      const result = moveSeat(drag.original, drag.original.seating, drag.id, at.x - drag.at.x, at.y - drag.at.y);
      return result.seating === drag.original.seating ? drag.original : { ...drag.original, seating: result.seating };
    }
    if (drag.type === "block" && drag.original.seating) {
      const result = moveBlock(drag.original, drag.original.seating, drag.id, at.x - drag.at.x, at.y - drag.at.y);
      return result.seating === drag.original.seating ? drag.original : { ...drag.original, seating: result.seating };
    }
    if (drag.type === "point") return { ...drag.original, contour: movePoint(drag.original.contour, drag.id, snapPoint(at)) };
    if (drag.type === "zonePoint") return { ...drag.original, zones: (drag.original.zones ?? []).map((zone) => zone.id === drag.id ? moveZonePoint(zone, drag.pointIndex, snapPoint(at)) : zone) };
    const dx = at.x - drag.at.x, dy = at.y - drag.at.y;
    if (drag.type === "table") {
      const table = (drag.original.tables ?? []).find(item => item.id === drag.id); if (!table) return drag.original;
      return table.groupId ? moveTableGroup(drag.original, table.groupId, dx, dy) : { ...drag.original, tables: (drag.original.tables ?? []).map(item => item.id === drag.id ? { ...item, x: Number((item.x + dx).toFixed(2)), y: Number((item.y + dy).toFixed(2)), edited: true } : item) };
    }
    if (drag.type === "chair") return { ...drag.original, chairs: (drag.original.chairs ?? []).map(chair => chair.id === drag.id ? { ...chair, x: Number((chair.x + dx).toFixed(2)), y: Number((chair.y + dy).toFixed(2)), edited: true } : chair) };
    if (drag.type === "zone") return { ...drag.original, zones: (drag.original.zones ?? []).map(zone => zone.id === drag.id ? moveZone(zone, dx, dy) : zone) };
    const object = drag.original.objects.find((item) => item.id === drag.id);
    if (!object) return drag.original;
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
  const areaPreviewZone: PlanningZone | null = zoneDraft.length && hover && areaMode === "tables" ? { id: "zone-preview", type: "tables", geometry: { kind: "polygon", points: [...zoneDraft, snapPoint(hover)] }, rotation: 0 } : null;
  const help = tool === "door" ? "Klicken Sie auf eine Wand, um eine Tür zu setzen." : tool === "obstacle" || tool === "restricted" ? "Klicken Sie in den Raum, um das gewählte Element zu setzen." : tool === "aisle" ? "Klicken Sie Start und Ende des Gangs. Shift rastet auf 45° ein." : tool === "chair" ? "Klicken Sie in den Raum, um einen einzelnen Stuhl zu setzen." : tool === "table" ? areaMode === "tables" ? "Eckpunkte setzen; über den ersten Punkt oder die Abschlussaktion schließen." : "Klicken Sie in den Raum, um den gewählten Tisch zu setzen." : room.closed ? "Raum geschlossen. Mit „Auswahl“ können Sie Eckpunkte und Objekte verschieben." : room.points.length ? "Klicken Sie auf den ersten Punkt, um den Raum zu schließen. Shift hält Wände gerade." : "Wählen Sie „Raum“ und klicken Sie die Ecken Ihres Raums nacheinander an.";

  const completeZoneDraft = () => {
    const points = zoneDraft.map((point) => ({ x: Number(point.x.toFixed(2)), y: Number(point.y.toFixed(2)) }));
    const geometryErrors = validateZonePolygon(points);
    if (geometryErrors.length) { setNotice(geometryErrors[0]); return; }
    if (!polygonInsideRoom(points, room)) { setNotice("Der Tischbereich muss vollständig innerhalb der Raumkontur liegen."); return; }
    const zone: PlanningZone = { id: `zone-${nextId.current++}`, type: "tables", geometry: { kind: "polygon", points }, rotation: 0, source: "manual" };
    const next = { ...plan, zones: [...plan.zones, zone] };
    const zoneIssue = validateTables(next).find((issue) => issue.objectId === zone.id && issue.severity === "error");
    if (zoneIssue) { setNotice(zoneIssue.message); return; }
    add(next); setSelection({ type: "zone", id: zone.id }); setZoneDraft([]); setTool("select"); setToolOptions(null); setNotice("Polygonaler Tischbereich angelegt. Die Reihenbestuhlung hält diese Fläche frei.");
  };

  const zoomAt = (factor: number, x: number, y: number) => setCamera((current) => {
    const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, current.scale * factor));
    const wx = current.x + (x - size.width / 2) / current.scale;
    const wy = current.y + (y - size.height / 2) / current.scale;
    return { scale, x: wx - (x - size.width / 2) / scale, y: wy - (y - size.height / 2) / scale };
  });
  const adoptCalculatedSeating = () => {
    if (!calculated || calculated.plan !== plan) return;
    const adopted = { ...plan, seating: { ...calculated.result, blocks: calculated.result.blocks.map((block) => ({ ...block, source: "generated" as const })) } };
    add(adopted);
    setCalculated(null);
    setNotice("Bestuhlung übernommen. Blöcke, Reihen und Sitze sind jetzt bearbeitbar.");
  };
  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (activeVariant) {
      const target = event.target as SVGElement;
      const objectId = target.getAttribute("data-object-id"), blockId = target.getAttribute("data-block-id");
      if (event.button === 0 && tool === "select" && (objectId || blockId)) {
        const adopted = adoptVariant(activeVariant);
        if (adopted) setSelection(objectId ? { type: "object", id: objectId! } : { type: "block", id: blockId! });
      }
      return;
    }
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
    const tableId = target.getAttribute("data-table-id");
    const chairId = target.getAttribute("data-chair-id");
    const zoneId = target.getAttribute("data-zone-id") ?? target.getAttribute("data-zone-vertex-id");
    const zonePointIndex = target.getAttribute("data-zone-point-index");
    const handle = target.getAttribute("data-handle") as "start" | "end" | null;
    const resizeId = target.getAttribute("data-resize-id"), resizeKind = target.getAttribute("data-resize-kind") as "table" | "object" | "zone" | null;
    const corner = target.getAttribute("data-corner") as ResizeCorner | null;
    const rotateId = target.getAttribute("data-rotate-id"), rotateKind = target.getAttribute("data-rotate-kind") as "table" | "object" | "zone" | null;
    const furnitureRotate = target.getAttribute("data-furniture-rotate");
    const draftHandle = target.getAttribute("data-draft-handle") as "move" | "rotate" | "scale" | null;
    if (layoutDraft && draftHandle) {
      dragRef.current = { type: draftHandle === "move" ? "layoutMove" : draftHandle === "rotate" ? "layoutRotate" : "layoutScale", at: world(at.x, at.y), original: layoutTransform };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (tool === "select" && blockId && !plan.seating && calculated?.plan === plan) {
      adoptCalculatedSeating();
      setSelection({ type: "block", id: blockId });
      return;
    }
    if (tool === "select") {
      const pointer = world(at.x, at.y);
      if (furnitureRotate && furnitureSelection.length > 1) {
        const bounds = furnitureSelectionBounds(plan, furnitureSelection);
        if (!bounds) return;
        dragRef.current = { type: "furnitureRotate", ids: furnitureSelection, center: bounds.center, startAngle: Math.atan2(pointer.y - bounds.center.y, pointer.x - bounds.center.x), original: roomRef.current };
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }
      const furnitureId = tableId ?? chairId ?? seatId;
      if (furnitureId) {
        if (seatId && event.altKey) { setFurnitureIds([seatId]); return; }
        if (seatId && selectedBlock && !event.altKey && !event.shiftKey && plan.seating) {
          clearFurnitureSelection();
          setSelection({ type: "block", id: selectedBlock.id });
          dragRef.current = { type: "block", id: selectedBlock.id, at: pointer, original: roomRef.current };
          event.currentTarget.setPointerCapture(event.pointerId);
          return;
        }
        if (event.shiftKey) {
          const next = furnitureSelection.includes(furnitureId) ? furnitureSelection.filter((id) => id !== furnitureId) : [...furnitureSelection, furnitureId];
          setFurnitureIds(next);
          return;
        }
        const ids = furnitureSelection.includes(furnitureId) ? furnitureSelection : [furnitureId];
        setFurnitureIds(ids);
        if (ids.length > 1) dragRef.current = { type: "furniture", ids, at: pointer, original: roomRef.current };
        else if (tableId) dragRef.current = { type: "table", id: tableId, at: pointer, original: roomRef.current };
        else if (chairId) dragRef.current = { type: "chair", id: chairId, at: pointer, original: roomRef.current };
        else if (seatId && plan.seating) dragRef.current = { type: "seat", id: seatId, at: pointer, original: roomRef.current };
        if (dragRef.current) event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }
      clearFurnitureSelection();
      if (zoneId && zonePointIndex !== null) { setSelection({ type: "zone", id: zoneId }); dragRef.current = { type: "zonePoint", id: zoneId, pointIndex: Number(zonePointIndex), at: pointer, original: roomRef.current }; event.currentTarget.setPointerCapture(event.pointerId); }
      else if (resizeId && resizeKind && corner) { dragRef.current = { type: "resize", kind: resizeKind, id: resizeId, corner, original: roomRef.current }; event.currentTarget.setPointerCapture(event.pointerId); }
      else if (rotateId && rotateKind) { dragRef.current = { type: "rotate", kind: rotateKind, id: rotateId, original: roomRef.current }; event.currentTarget.setPointerCapture(event.pointerId); }
      else if (zoneId && event.altKey) { setSelection({ type: "zone", id: zoneId }); dragRef.current = { type: "zone", id: zoneId, at: pointer, original: roomRef.current }; event.currentTarget.setPointerCapture(event.pointerId); }
      else if (zoneId) {
        dragRef.current = { type: "marquee", at: pointer, current: pointer, additive: event.shiftKey, initialIds: furnitureSelection, clickSelection: { type: "zone", id: zoneId } };
        setMarquee({ at: pointer, current: pointer });
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      else if (blockId && plan.seating) {
        setSelection({ type: "block", id: blockId });
        dragRef.current = { type: "block", id: blockId, at: pointer, original: roomRef.current };
        event.currentTarget.setPointerCapture(event.pointerId);
      } else if (objectId) {
        setSelection({ type: "object", id: objectId });
        dragRef.current = { type: handle ?? "object", id: objectId, at: pointer, original: roomRef.current };
        event.currentTarget.setPointerCapture(event.pointerId);
      } else if (pointId) {
        setSelection({ type: "point", id: pointId });
        dragRef.current = { type: "point", id: pointId, at: pointer, original: roomRef.current };
        event.currentTarget.setPointerCapture(event.pointerId);
      } else if (wallId) setSelection({ type: "wall", id: wallId });
      else {
        dragRef.current = { type: "marquee", at: pointer, current: pointer, additive: event.shiftKey, initialIds: furnitureSelection, clickSelection: null };
        setMarquee({ at: pointer, current: pointer });
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (tool === "table" && areaMode === "table") {
      const p = snapPoint(world(at.x, at.y)), model = tableModel(selectedTableModelId), prefix = `table-${nextId.current++}`;
      const generated = generateTableLayout({ preset: "single", modelId: model.id, count: 1, spacing: tableSpacing, rotation: tableRotation, withChairs: tableWithChairs }, prefix);
      const placedTables = generated.tables.map(table => ({ ...table, x: p.x, y: p.y, source: "manual" as const }));
      const origin = generated.tables[0] ?? { x: 0, y: 0 }, placedChairs = generated.chairs.map(chair => ({ ...chair, x: chair.x - origin.x + p.x, y: chair.y - origin.y + p.y, source: "manual" as const }));
      add({ ...plan, tables: [...plan.tables, ...placedTables], chairs: [...plan.chairs, ...placedChairs], tableGroups: [...plan.tableGroups, ...generated.groups] }); setSelection({ type: "table", id: placedTables[0].id }); setToolOptions(null); setNotice(""); return;
    }
    if (tool === "door") {
      if (!wallId) return;
      const ends = wallEndpoints(room, wallId), offset = wallOffset(room, wallId, world(at.x, at.y));
      if (!ends || offset === null || wallLength(ends.a, ends.b) < doorWidth) { setNotice(`Diese Wand ist zu kurz für eine Tür mit ${formatMeters(doorWidth)} Breite.`); return; }
      const base: DoorObject = { id: `object-${nextId.current++}`, type: "door", wallId, offset: Number(Math.max(0, Math.min(offset - doorWidth / 2, wallLength(ends.a, ends.b) - doorWidth)).toFixed(2)), width: doorWidth };
      const object: RoomObject = doorRole === "normal" || doorRole === "entrance" ? base : setDoorRole(base, doorRole);
      add({ ...plan, objects: [...plan.objects, object] }); setSelection({ type: "object", id: object.id }); setToolOptions(null); setNotice(""); return;
    }
    if (tool === "chair") {
      const p = snapPoint(world(at.x, at.y));
      const chair = { id: `chair-${nextId.current++}`, ...p, rotation: 0, width: chairSelection.width, depth: chairSelection.depth, source: "manual" as const };
      add({ ...plan, chairs: [...plan.chairs, chair] }); setSelection({ type: "chair", id: chair.id }); setTool("select"); setToolOptions(null); setNotice(""); return;
    }
    if (tool === "table" && areaMode === "tables") {
      const p = snapPoint(world(at.x, at.y));
      const first = zoneDraft[0], closeToFirst = first && zoneDraft.length >= 3 && Math.hypot(screen(first).x - at.x, screen(first).y - at.y) <= 14;
      if (closeToFirst) { completeZoneDraft(); return; }
      if (zoneDraft.some((point) => wallLength(point, p) < 1e-9)) { setNotice("Dieser Eckpunkt ist bereits vorhanden. Zum Schließen den ersten Punkt anklicken."); return; }
      setZoneDraft((current) => [...current, p]); setNotice(""); return;
    }
    if (tool === "obstacle" || tool === "restricted") {
      if (tool === "obstacle" && obstacleElement === "front" && plan.objects.some((object) => object.type === "front")) { setNotice("Es gibt bereits eine Front. Wählen Sie sie zum Bearbeiten aus."); return; }
      const position = snapPoint(world(at.x, at.y));
      const effectiveElement = tool === "restricted" ? "reservedArea" : obstacleElement;
      const object: RoomObject = effectiveElement === "front" ? { id: `object-${nextId.current++}`, type: "front", ...position, width: 2, rotation: 0 }
        : effectiveElement === "stage" ? { id: `object-${nextId.current++}`, type: "stage", ...position, width: obstacleWidth, depth: obstacleDepth, rotation: 0 }
        : effectiveElement === "reservedArea" ? { id: `object-${nextId.current++}`, type: "reservedArea", ...position, width: obstacleWidth, depth: obstacleDepth, rotation: 0 }
        : { id: `object-${nextId.current++}`, type: "obstacle", obstacleType, ...position, width: obstacleWidth, depth: obstacleDepth, rotation: 0 };
      add({ ...plan, objects: [...plan.objects, object] }); setSelection({ type: "object", id: object.id }); setToolOptions(null); setNotice(""); return;
    }
    if (tool === "aisle") {
      const p = aisleEnd(world(at.x, at.y), event.shiftKey);
      if (!aisleStart) { setAisleStart(p); return; }
      if (wallLength(aisleStart, p) < 0.01) { setNotice("Der Gang braucht eine Länge größer als 0."); return; }
      const object: RoomObject = { id: `object-${nextId.current++}`, type: "aisle", start: aisleStart, end: p, width: aisleWidth };
      add({ ...plan, objects: [...plan.objects, object] }); setSelection({ type: "object", id: object.id }); setAisleStart(null); setToolOptions(null); setNotice(""); return;
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
    } else if (drag?.type === "layoutMove") {
      const point = world(at.x, at.y); setLayoutTransform({ ...drag.original, center: { x: drag.original.center.x + point.x - drag.at.x, y: drag.original.center.y + point.y - drag.at.y } });
    } else if (drag?.type === "layoutRotate") {
      const point = world(at.x, at.y); setLayoutTransform({ ...drag.original, rotation: Math.round(Math.atan2(point.y - drag.original.center.y, point.x - drag.original.center.x) * 180 / Math.PI + 90) });
    } else if (drag?.type === "layoutScale") {
      const point = world(at.x, at.y), before = Math.max(.01, Math.hypot(drag.at.x - drag.original.center.x, drag.at.y - drag.original.center.y));
      setLayoutTransform({ ...drag.original, spread: Math.max(.45, Math.min(1.8, drag.original.spread * Math.hypot(point.x - drag.original.center.x, point.y - drag.original.center.y) / before)) });
    } else if (drag?.type === "furniture") {
      const point = world(at.x, at.y);
      const moved = transformFurnitureSelection(drag.original, drag.ids, { dx: point.x - drag.at.x, dy: point.y - drag.at.y });
      setPreviewPlan(moved);
      setPreviewConflicts(furnitureSelectionConflicts(moved, drag.ids));
    } else if (drag?.type === "furnitureRotate") {
      const point = world(at.x, at.y);
      let rotation = (Math.atan2(point.y - drag.center.y, point.x - drag.center.x) - drag.startAngle) * 180 / Math.PI;
      rotation = event.shiftKey ? Math.round(rotation / 15) * 15 : Math.round(rotation);
      const moved = transformFurnitureSelection(drag.original, drag.ids, { rotation, center: drag.center });
      setPreviewPlan(moved);
      setPreviewConflicts(furnitureSelectionConflicts(moved, drag.ids));
    } else if (drag?.type === "marquee") {
      const current = world(at.x, at.y);
      drag.current = current;
      setMarquee({ at: drag.at, current });
    } else if (drag && "id" in drag) {
      const point = world(at.x, at.y);
      const moved = dragged(drag, point);
      if (drag.type === "table") {
        const proposed = (moved.tables ?? []).find((table) => table.id === drag.id);
        const candidate = proposed ? findTableSnap(moved, drag.id, proposed, .22, event.altKey) : null;
        setSnapPreview(candidate);
        setPreviewPlan(candidate?.valid ? placeTable(moved, drag.id, candidate.table) : moved);
      } else {
        setSnapPreview(null);
        setPreviewPlan(moved);
      }
    } else setHover(world(at.x, at.y));
  };
  const onPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (drag?.type === "furniture" || drag?.type === "furnitureRotate") {
      const at = local(event), point = world(at.x, at.y);
      const next = drag.type === "furniture"
        ? transformFurnitureSelection(drag.original, drag.ids, { dx: point.x - drag.at.x, dy: point.y - drag.at.y })
        : transformFurnitureSelection(drag.original, drag.ids, { rotation: (() => { const raw = (Math.atan2(point.y - drag.center.y, point.x - drag.center.x) - drag.startAngle) * 180 / Math.PI; return event.shiftKey ? Math.round(raw / 15) * 15 : Math.round(raw); })(), center: drag.center });
      const conflicts = furnitureSelectionConflicts(next, drag.ids);
      if (JSON.stringify(next) !== JSON.stringify(drag.original)) {
        if (conflicts.size) setNotice("Die Auswahl kollidiert mit Raumgrenze, Tür, Gang, Hindernis oder nicht ausgewählten Möbeln. Die Änderung wurde nicht übernommen.");
        else { add(next); setNotice(""); }
      }
      setPreviewPlan(null);
      setPreviewConflicts(new Set());
    } else if (drag?.type === "marquee") {
      const at = local(event), current = world(at.x, at.y);
      const movedPixels = Math.hypot((current.x - drag.at.x) * camera.scale, (current.y - drag.at.y) * camera.scale);
      if (movedPixels < 3) {
        if (!drag.additive) { setFurnitureSelection([]); setSelection(drag.clickSelection); }
      } else {
        const found = selectFurnitureInMarquee(plan, drag.at, current);
        setFurnitureIds(drag.additive ? [...drag.initialIds, ...found] : found);
      }
      setMarquee(null);
      setPreviewConflicts(new Set());
    } else if (drag && "id" in drag) {
      const at = local(event);
      const moved = dragged(drag, world(at.x, at.y));
      const proposed = drag.type === "table" ? (moved.tables ?? []).find((table) => table.id === drag.id) : undefined;
      const candidate = proposed ? findTableSnap(moved, drag.id, proposed, .22, event.altKey) : null;
      const next = candidate?.valid ? placeTable(moved, drag.id, candidate.table) : moved;
      if (JSON.stringify(next) !== JSON.stringify(drag.original)) {
        const movedTable = drag.type === "table" ? (next.tables ?? []).find((table) => table.id === drag.id) : undefined;
        const tableConflict = movedTable ? tablePlacementConflict(next, movedTable) : undefined;
        if (tableConflict) setNotice(tableConflict === "room" ? "Tisch liegt außerhalb des Raums." : tableConflict === "table" ? "Tische dürfen sich nicht überlappen." : tableConflict === "aisle" ? "Tisch darf keinen Gang überlagern." : "Tisch kollidiert mit einem Hindernis oder einer Sperrfläche.");
        else if (drag.original.objects.some((object) => object.id === drag.id && object.type === "aisle") && validateObjects(next).some((issue) => issue.objectId === drag.id && issue.severity === "error")) setNotice("Gang liegt außerhalb des Raums oder hat ungültige Maße.");
        else if ((drag.type === "zone" || drag.type === "zonePoint" || drag.type === "resize" && drag.kind === "zone") && validateTables(next).some((issue) => issue.objectId === drag.id && issue.severity === "error")) setNotice(validateTables(next).find((issue) => issue.objectId === drag.id && issue.severity === "error")!.message);
        else { add(next); setNotice(""); }
      }
      else if (drag.type === "block" && drag.original.seating) {
        const result = moveBlock(drag.original, drag.original.seating, drag.id, world(at.x, at.y).x - drag.at.x, world(at.x, at.y).y - drag.at.y);
        if (result.message && Math.hypot(at.x - screen(drag.at).x, at.y - screen(drag.at).y) > 3) setNotice(result.message);
      }
      else if (drag.type === "seat" && drag.original.seating) {
        const result = moveSeat(drag.original, drag.original.seating, drag.id, world(at.x, at.y).x - drag.at.x, world(at.x, at.y).y - drag.at.y);
        if (result.message && Math.hypot(at.x - screen(drag.at).x, at.y - screen(drag.at).y) > 3) setNotice(result.message);
      }
      setPreviewPlan(null);
      setSnapPreview(null);
    }
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const reset = () => { add(emptyPlan()); setSelection(null); setFurnitureSelection([]); setMarquee(null); setPreviewConflicts(new Set()); setLastAutoFurnitureIds([]); setPreviewPlan(null); setSnapPreview(null); setLayoutDraft(null); setAisleStart(null); setZoneDraft([]); setHover(null); setNotice(""); setTool("wall"); setCamera({ x: 0, y: 0, scale: INITIAL_SCALE }); };
  const selectedPoint = selection?.type === "point" ? pointById(shownRoom, selection.id) : null;
  const selectedWall = selection?.type === "wall" ? shownRoom.walls.find((wall) => wall.id === selection.id) : null;
  const wallStart = selectedWall && pointById(shownRoom, selectedWall.startPointId);
  const wallEnd = selectedWall && pointById(shownRoom, selectedWall.endPointId);
  const field = (label: string, value: number, change: (value: number) => void, min?: number) => <LiveNumberField label={label} value={value} min={min} onChange={change} />;
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
  const conflictedTables = new Set(issues.filter(issue => issue.objectId.startsWith("table-")).map(issue => issue.objectId));
  const capacity = planCapacity(shownPlan);
  const selectedFurnitureIds = new Set(furnitureSelection);
  const selectedFurnitureBounds = furnitureSelectionBounds(shownPlan, furnitureSelection);
  const selectedResizable = selectedTable ? { kind: "table" as const, id: selectedTable.id, points: tablePolygon(selectedTable), center: selectedTable }
    : selectedObject && isBlockingObject(selectedObject) ? { kind: "object" as const, id: selectedObject.id, points: obstaclePolygon(selectedObject), center: selectedObject }
    : selectedZone?.geometry.kind === "rectangle" ? { kind: "zone" as const, id: selectedZone.id, points: zonePolygon(selectedZone), center: selectedZone.geometry } : null;
  const draftPoints = transformedDraft?.tables.flatMap(tablePolygon) ?? [];
  const draftBounds = draftPoints.length ? { minX: Math.min(...draftPoints.map(p => p.x)), maxX: Math.max(...draftPoints.map(p => p.x)), minY: Math.min(...draftPoints.map(p => p.y)), maxY: Math.max(...draftPoints.map(p => p.y)) } : null;
  const prepareTableDraft = (automatic = true) => {
    if (!room.closed) return;
    const prefix = `preset-${nextId.current++}`;
    const center = { x: room.points.reduce((sum, point) => sum + point.x, 0) / room.points.length, y: room.points.reduce((sum, point) => sum + point.y, 0) / room.points.length };
    const options = { preset: tablePreset, modelId: selectedTableModelId, count: tableCount, spacing: tableSpacing, rotation: tableRotation, withChairs: tableWithChairs, center, plan };
    if (automatic) {
      const fitted = fitTableLayout(options, prefix); setLayoutDraft(fitted.layout); setLayoutTransform(fitted.transform);
      setNotice(fitted.conflicts.size ? `Die vollständige Anordnung ist sichtbar. ${fitted.conflicts.size} Tische sind noch rot markiert – ziehen, drehen oder verdichten Sie die Gruppe.` : "Die vollständige Anordnung wurde automatisch eingepasst. Sie können sie vor dem Übernehmen noch verändern.");
    } else {
      setLayoutDraft(generateTableLayout({ ...options, plan: undefined, center: { x: 0, y: 0 } }, prefix)); setLayoutTransform({ center, rotation: 0, spread: 1 });
      setNotice("Entwurf aktiv: Gruppe direkt im Raum ziehen, am Kreis drehen und am Eckpunkt verdichten.");
    }
    setTool("select"); setSelection(null);
  };
  const applyTableDraft = () => {
    if (!transformedDraft || draftConflicts.size) return;
    const next = { ...plan, tables: [...plan.tables, ...transformedDraft.tables], chairs: [...plan.chairs, ...transformedDraft.chairs], tableGroups: [...plan.tableGroups, ...transformedDraft.groups] };
    const createdIds = [...transformedDraft.tables.map((item) => item.id), ...transformedDraft.chairs.map((item) => item.id)];
    add(next);
    setLayoutDraft(null); setFurnitureSelection([]); setSelection(transformedDraft.tables[0] ? { type: "table", id: transformedDraft.tables[0].id } : null); setLastAutoFurnitureIds(createdIds); setNotice(`${transformedDraft.tables.length} Tische vollständig übernommen.`);
  };
  const applyZoneFill = (result: TableZonePlanningResult) => {
    if (!selectedZone || !result.tables.length) { setNotice(result.message); setZoneFillConfirm(null); return; }
    const removed = new Set(result.replaceableTableIds);
    const removedGroups = new Set(plan.tables.filter((table) => removed.has(table.id) && table.groupId).map((table) => table.groupId!));
    const next = {
      ...plan,
      tables: [...plan.tables.filter((table) => !removed.has(table.id)), ...result.tables],
      chairs: [...plan.chairs.filter((chair) => !chair.groupId || !removedGroups.has(chair.groupId)), ...result.chairs],
      tableGroups: [...plan.tableGroups.filter((group) => !removedGroups.has(group.id)), ...result.groups],
    };
    add(next);
    setFurnitureSelection([]);
    setLastAutoFurnitureIds([...result.tables.map((item) => item.id), ...result.chairs.map((item) => item.id)]);
    setZoneFillConfirm(null);
    setZoneSetupOpen(false);
    setNotice(`${result.message}${result.protectedTableIds.length ? ` ${result.protectedTableIds.length} manuell bearbeitete oder geschützte Tische blieben unverändert.` : ""} Laufzeit: ${result.durationMs.toLocaleString("de-DE")} ms.`);
  };
  const requestZoneFill = () => {
    if (!selectedZone || zoneFillBusy) return;
    setZoneFillBusy(true);
    window.setTimeout(() => {
      const result = planTableZone(plan, { zoneId: selectedZone.id, modelId: selectedTableModelId, rotation: zoneFillRotation, mode: zoneFillMode, goal: zoneFillGoal, withChairs: zoneFillWithChairs });
      setZoneFillBusy(false);
      if (result.unchanged || !result.tables.length) { setNotice(result.message); return; }
      if (result.replaceableTableIds.length) { setZoneFillConfirm(result); return; }
      applyZoneFill(result);
    }, 0);
  };
  const requestCompatibleZoneFill = () => {
    if (!selectedZone) return;
    const result = fillTableZone(plan, { zoneId: selectedZone.id, modelId: selectedTableModelId, rotation: zoneFillRotation, clearance: .8, withChairs: false });
    const compatible: TableZonePlanningResult = { ...result, layoutMode: "individual", planningGoal: "balanced", evaluatedVariants: 1, durationMs: 0, usableSeats: result.chairs.length, problematicSeats: 0, uncheckedSeats: result.chairs.length };
    if (compatible.unchanged || !compatible.tables.length) { setNotice(compatible.message); return; }
    if (compatible.replaceableTableIds.length) { setZoneFillConfirm(compatible); return; }
    applyZoneFill(compatible);
  };
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
        setActiveVariantId(result.variants.find((item) => item.profileId === optimizationGoal)?.id ?? result.variants[0]?.id ?? result.fallback?.id ?? null);
      } catch {
        setVariantError("Die Varianten konnten nicht berechnet werden. Bitte prüfen Sie Raum und Eingaben und versuchen Sie es erneut.");
      } finally {
        generatingRef.current = false;
        setVariantsBusy(false);
      }
    }, 0);
  };
  const adoptVariant = (variant: PlanVariant) => {
    const adoptedPlan = materializeVariant(variant);
    parameterHistory.current.set(plan, { rules: seatingRules, orientation, offset: gridOffset, seating: calculated?.plan === plan ? calculated.result : null });
    parameterHistory.current.set(adoptedPlan, { rules: variant.seatingPlan.rules, orientation: variant.seatingPlan.orientation, offset: variant.gridOffset, seating: adoptedPlan.seating });
    add(adoptedPlan);
    setSeatingRules(variant.seatingPlan.rules);
    setOrientation(variant.seatingPlan.orientation);
    setGridOffset(variant.gridOffset);
    setCalculated(null);
    setVariantCalculation(null);
    setActiveVariantId(null);
    setActiveCheckId(null);
    setSelection(null);
    setNotice(variant.feasible ? "Variante übernommen. Der gesamte vorherige Plan ist mit einem Schritt rückgängig zu machen." : "Technische Annäherung übernommen. Regelabweichungen sind im aktuellen Plan sichtbar und bearbeitbar.");
    return adoptedPlan;
  };
  const runAutomaticSeating = () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setVariantsBusy(true);
    setVariantError("");
    window.setTimeout(() => {
      try {
        const input = { ...plan, seating: undefined };
        const seating = generateFreeAreaSeating(input, seatingRules, gridOffset);
        const adopted: RoomPlan = { ...input, seating };
        add(adopted);
        setCalculated(null); setVariantCalculation(null); setActiveVariantId(null); setSelection(null);
        setNotice(`Bestuhlung erstellt: ${adopted.seating?.totalSeats ?? 0} Plätze. Alle erzeugten Elemente sind frei bearbeitbar.`);
      } catch {
        setVariantError("Die Bestuhlung konnte nicht berechnet werden. Bitte prüfen Sie Raum und Eingaben.");
      } finally {
        generatingRef.current = false;
        setVariantsBusy(false);
      }
    }, 0);
  };
  const requestAutomaticSeating = () => {
    if (!plan.seating) { runAutomaticSeating(); return; }
    const impact = replanningImpact(plan);
    if (impact.protectedBlocks > 0) { setReplanDialogOpen(true); return; }
    runAutomaticSeating();
  };
  const applyTableSeating = (count?: number) => {
    if (!selectedTable) return;
    const result = seatTable(plan, selectedTable.id, count);
    const groupId = selectedTable.groupId ?? `${selectedTable.id}-group`;
    const oldChairIds = new Set(plan.chairs.filter((chair) => chair.tableId === selectedTable.id || chair.groupId === groupId).map((chair) => chair.id));
    const nextTables = plan.tables.map((table) => table.id === selectedTable.id ? { ...table, groupId } : table);
    const nextGroups = [...plan.tableGroups.filter((group) => group.id !== groupId), { id: groupId, tableIds: [selectedTable.id], chairIds: result.chairs.map((chair) => chair.id) }];
    add({ ...plan, tables: nextTables, chairs: [...plan.chairs.filter((chair) => !oldChairIds.has(chair.id)), ...result.chairs], tableGroups: nextGroups });
    setNotice(result.message);
  };
  const replanSummary = replanningImpact(plan);

  if (outputIssuedAt) return <PlanOutputView plan={plan} name={projects.find((project) => project.id === activeProjectId)?.name ?? "Unbenanntes Projekt"} issuedAt={outputIssuedAt} profileName={profile.name} analysis={currentAnalysis} reservePercent={reservePercent} inquiryHref={inquiryHref} shopHref={shopTarget?.href} onClose={() => setOutputIssuedAt(null)} />;

  return <section aria-label="2D-Grundrisseditor" className="premium-card planner-workspace overflow-hidden">
    {storageReady && <ProjectControls projects={projects} activeId={activeProjectId} status={saveStatus} error={projectError} onNew={newProject} onSave={saveProject} onSaveAs={saveAsProject} onOpen={openProject} onRename={renameProject} onDuplicate={duplicateProject} onDelete={deleteProject} onExport={exportProject} onImport={importProject} onImportError={setProjectError} />}
    <div className="planner-flow border-b border-premium-beige bg-[#f7f6f1] px-3 py-2">
      <div className="flex min-w-0 items-center gap-2" aria-label="Planungsschritte">
        {([
          ["room", "1", "Raum"],
          ["furnishing", "2", "Einrichtung"],
          ["result", "3", "Ergebnis"],
        ] as const).map(([step, number, label]) => <button key={step} type="button" aria-current={workflowStep === step ? "step" : undefined} onClick={() => setWorkflowStep(step)} className={`planner-step ${workflowStep === step ? "planner-step-active" : ""}`}><span>{number}</span>{label}</button>)}
        <p className="ml-2 hidden truncate text-xs text-premium-muted xl:block">Wie viele Stühle und Tische passen in Ihren Raum?</p>
      </div>
      <div className="flex items-center gap-2">{plan.seating && <button type="button" onClick={() => setReplanDialogOpen(true)} className="rounded-lg border border-premium-beige bg-white px-3 py-2 text-xs font-semibold text-premium-charcoal">Planung neu erstellen</button>}<button type="button" disabled={!room.closed} onClick={() => setOutputIssuedAt(new Date())} className="rounded-lg border border-premium-beige bg-white px-3 py-2 text-xs font-semibold text-premium-charcoal disabled:opacity-40">Plan ausgeben</button></div>
    </div>
    <div className="planner-toolbar relative z-20 flex flex-wrap items-center gap-1 border-b border-premium-beige bg-white/90 px-2 py-1">
      <div className="mr-auto flex flex-wrap gap-1" aria-label="Werkzeuge">
        {TOOL_INFO.map(({ name, label, help }) => <div key={name} className="group relative">
          <button type="button" aria-label={label} title={label} aria-pressed={tool === name} aria-expanded={TOOLS_WITH_OPTIONS.includes(name) ? toolOptions === name : undefined} aria-describedby={`tool-help-${name}`} onClick={() => { setTool(name); setAisleStart(null); setZoneDraft([]); if (name !== "select") { setSelection(null); clearFurnitureSelection(); } setToolOptions(TOOLS_WITH_OPTIONS.includes(name) ? toolOptions === name ? null : name : null); if (name === "restricted") setObstacleElement("reservedArea"); }} className={`relative flex h-9 w-10 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-premium-forest ${tool === name ? "bg-premium-forest text-white" : "border border-premium-beige text-premium-charcoal"}`}><ToolIcon name={name} />{TOOLS_WITH_OPTIONS.includes(name) ? <span aria-hidden="true" className="absolute bottom-0 right-0.5 text-[9px]">▾</span> : null}{name === "door" && doorRole !== "normal" ? <span aria-hidden="true" className="absolute -right-1 -top-1 rounded bg-amber-500 px-0.5 text-[8px] font-bold text-white">{{ entrance: "E", exit: "A", emergency_exit: "N" }[doorRole]}</span> : null}</button>
          <div id={`tool-help-${name}`} role="tooltip" className={`pointer-events-none absolute left-0 top-full z-40 mt-1 hidden w-52 rounded-lg border border-premium-beige bg-white p-2 text-xs text-premium-charcoal shadow-lg ${toolOptions === name ? "" : "group-hover:block group-focus-within:block"}`}><strong>{label}</strong><p>{help}</p></div>
        </div>)}
      </div>
      {toolOptions && <div role="group" aria-label={`${TOOL_INFO.find((item) => item.name === toolOptions)?.label} Optionen`} className="absolute left-2 top-full z-30 mt-1 w-64 space-y-2 rounded-lg border border-premium-beige bg-white p-3 text-sm shadow-xl">
        <div className="flex items-center justify-between"><strong>{TOOL_INFO.find((item) => item.name === toolOptions)?.label}</strong><button type="button" aria-label="Werkzeugoptionen schließen" onClick={() => setToolOptions(null)}>×</button></div>
        {toolOptions === "door" && <><label className="block">Typ<select aria-label="Türtyp am Werkzeug" value={doorRole} onChange={(event) => setDoorRoleChoice(event.target.value as typeof doorRole)} className="mt-1 w-full rounded border border-premium-beige p-1"><option value="normal">Normale Tür</option><option value="entrance">Eingang (normale Tür)</option><option value="exit">Ausgang</option><option value="emergency_exit">Notausgang</option></select></label><label className="block">Breite (m)<input aria-label="Türbreite am Werkzeug" type="number" min="0.01" step="0.1" value={doorWidth} onChange={(event) => { if (event.currentTarget.valueAsNumber > 0) setDoorWidth(event.currentTarget.valueAsNumber); }} className="mt-1 w-full rounded border border-premium-beige p-1" /></label></>}
        {toolOptions === "obstacle" && <><label className="block">Element<select aria-label="Hindernistyp" value={obstacleElement} onChange={(event) => setObstacleElement(event.target.value as typeof obstacleElement)} className="mt-1 w-full rounded border border-premium-beige p-1"><option value="obstacle">Hindernis</option><option value="stage">Bühne</option><option value="front">Front / Ausrichtung</option></select></label>{obstacleElement === "obstacle" && <label className="block">Typ<select aria-label="Hindernistyp am Werkzeug" value={obstacleType} onChange={(event) => setObstacleType(event.target.value as ObstacleObject["obstacleType"])} className="mt-1 w-full rounded border border-premium-beige p-1"><option value="column">Säule</option><option value="technical">Technik / Mischpult</option><option value="furniture">Festes Möbel</option></select></label>}{obstacleElement !== "front" && <><label className="block">Breite (m)<input aria-label="Hindernisbreite am Werkzeug" type="number" min="0.01" step="0.1" value={obstacleWidth} onChange={(event) => { if (event.currentTarget.valueAsNumber > 0) setObstacleWidth(event.currentTarget.valueAsNumber); }} className="mt-1 w-full rounded border border-premium-beige p-1" /></label><label className="block">Tiefe (m)<input aria-label="Hindernistiefe am Werkzeug" type="number" min="0.01" step="0.1" value={obstacleDepth} onChange={(event) => { if (event.currentTarget.valueAsNumber > 0) setObstacleDepth(event.currentTarget.valueAsNumber); }} className="mt-1 w-full rounded border border-premium-beige p-1" /></label></>}</>}
        {toolOptions === "restricted" && <><label className="block">Breite (m)<input aria-label="Sperrflächenbreite am Werkzeug" type="number" min="0.01" step="0.1" value={obstacleWidth} onChange={(event) => { if (event.currentTarget.valueAsNumber > 0) setObstacleWidth(event.currentTarget.valueAsNumber); }} className="mt-1 w-full rounded border border-premium-beige p-1" /></label><label className="block">Tiefe (m)<input aria-label="Sperrflächentiefe am Werkzeug" type="number" min="0.01" step="0.1" value={obstacleDepth} onChange={(event) => { if (event.currentTarget.valueAsNumber > 0) setObstacleDepth(event.currentTarget.valueAsNumber); }} className="mt-1 w-full rounded border border-premium-beige p-1" /></label></>}
        {toolOptions === "aisle" && <label className="block">Gangbreite (m)<input aria-label="Gangbreite am Werkzeug" type="number" min="0.01" step="0.1" value={aisleWidth} onChange={(event) => { if (event.currentTarget.valueAsNumber > 0) setAisleWidth(event.currentTarget.valueAsNumber); }} className="mt-1 w-full rounded border border-premium-beige p-1" /></label>}
        {toolOptions === "table" && <><label className="block">Aktion<select aria-label="Tischwerkzeug" value={areaMode} onChange={event => { setAreaMode(event.target.value as typeof areaMode); setZoneDraft([]); }} className="mt-1 w-full rounded border border-premium-beige p-1"><option value="table">Einzelnen Tisch platzieren</option><option value="tables">Tischbereich zeichnen</option></select></label>{areaMode === "table" && <><label className="block">Modell<select aria-label="Tischmodell am Werkzeug" value={selectedTableModelId} onChange={event => setSelectedTableModelId(event.target.value)} className="mt-1 w-full rounded border border-premium-beige p-1">{TABLE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label><label className="block">Rotation<select aria-label="Tischrotation am Werkzeug" value={tableRotation} onChange={event => setTableRotation(Number(event.target.value))} className="mt-1 w-full rounded border border-premium-beige p-1">{[0,45,90,135,180,225,270,315].map(value => <option key={value} value={value}>{value}°</option>)}</select></label></>}{areaMode === "tables" && <><p className="text-xs text-premium-muted">{zoneDraft.length ? `${zoneDraft.length} Eckpunkte gesetzt` : "Mindestens drei Eckpunkte setzen."}</p>{zoneDraft.length >= 3 && <button type="button" onClick={completeZoneDraft} className="w-full rounded bg-premium-forest px-3 py-2 font-semibold text-white">Tischbereich abschließen</button>}</>}</>}
        {toolOptions === "chair" && <><label className="block">Stuhlmodell<select aria-label="Stuhlmodell am Werkzeug" value={chairSelection.productId} onChange={(event) => { const product = chairProducts.find((item) => item.id === event.target.value)!; selectChair(product.id, product.variants[0].id); }} className="mt-1 w-full rounded border border-premium-beige p-1">{chairProducts.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}</select></label><button type="button" disabled={!room.closed || variantsBusy} onClick={() => { setToolOptions(null); requestAutomaticSeating(); }} className="w-full rounded bg-premium-forest px-3 py-2 font-semibold text-white disabled:opacity-40">{plan.seating ? "Bestuhlung neu berechnen" : "Freie Raumfläche bestuhlen"}</button></>}
      </div>}
      <button type="button" aria-label="Bemaßungen ein-/ausblenden" title="Bemaßungen ein-/ausblenden" aria-pressed={measurementsVisible} onClick={() => setMeasurementsVisible((value) => !value)} className={`flex h-9 w-10 items-center justify-center rounded-md border border-premium-beige ${measurementsVisible ? "bg-premium-forest text-white" : "text-premium-charcoal"}`}><svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5v14m18-14v14M3 12h18M6 9l-3 3 3 3m12-6 3 3-3 3" /></svg></button>
      <button type="button" aria-label="Abstandsmaße ein-/ausblenden" title="Abstandsmaße bei Auswahl" aria-pressed={showDistances} onClick={() => setShowDistances((value) => !value)} className={`rounded-md border border-premium-beige px-2 py-1 text-xs ${showDistances ? "bg-premium-forest text-white" : "text-premium-charcoal"}`}>Abstände</button>
      <button type="button" disabled={!history.past.length} onClick={() => historyAction("undo")} className="rounded-md border border-premium-beige px-2 py-1 text-xs font-semibold disabled:opacity-40">Rückgängig</button>
      <button type="button" disabled={!history.future.length} onClick={() => historyAction("redo")} className="rounded-md border border-premium-beige px-2 py-1 text-xs font-semibold disabled:opacity-40">Wiederholen</button>
      <button type="button" disabled={!room.points.length && !plan.objects.length && !plan.tables.length} onClick={reset} className="rounded-md border border-premium-beige px-2 py-1 text-xs font-semibold disabled:opacity-40">Planung zurücksetzen</button>
      <PlannerHelp tool={tool} roomClosed={room.closed} selectionType={selection?.type ?? null} areaMode={areaMode} hasZones={plan.zones.length > 0} hasSeating={!!plan.seating} view={view} closeSignal={helpCloseSignal} onActiveChange={setHelpLayerKind} onRequestTool={(requestedTool) => { setTool(requestedTool as Tool); setToolOptions(null); setAisleStart(null); setZoneDraft([]); }} />
    </div>
    <div className="planner-grid">
      <aside aria-label="Raum und Werkzeuge" className="planner-tools border-r border-premium-beige bg-white/90 p-2">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-premium-forest">{workflowStep === "room" ? "Raum" : workflowStep === "furnishing" ? "Einrichten" : "Ergebnis"}</h3>
        <p className="mb-3 text-[11px] leading-4 text-premium-muted">{workflowStep === "room" ? room.closed ? "Raum steht. Türen, Ausgänge und Hindernisse ergänzen." : "Kontur zeichnen und durch Klick auf den ersten Punkt schließen." : workflowStep === "furnishing" ? "Stühle und Tische kompakt planen oder manuell anpassen." : "Kapazität und Prüfstatus rechts kontrollieren."}</p>
        <p className="rounded-lg bg-[#f7f6f1] p-2 text-[10px] leading-4 text-premium-muted">Werkzeug wählen, dann direkt im Plan arbeiten. <kbd>Esc</kbd> bricht ab, <kbd>Entf</kbd> löscht die Auswahl.</p>
        <h3 className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wide text-premium-forest">Ansicht</h3>
        <div className="flex items-center justify-between gap-1 text-xs"><button type="button" aria-label="Ansicht verkleinern" onClick={() => zoomAt(1 / 1.25, size.width / 2, size.height / 2)} className="rounded border border-premium-beige px-2 py-1">−</button><span>{Math.round(camera.scale / INITIAL_SCALE * 100)} %</span><button type="button" aria-label="Ansicht vergrößern" onClick={() => zoomAt(1.25, size.width / 2, size.height / 2)} className="rounded border border-premium-beige px-2 py-1">+</button></div>
      </aside>
      <div className="planner-canvas relative min-w-0 bg-[#f6f4ed]">
      {view === "2d" && <PlannerBrand className="absolute left-3 top-3 z-10" />}
      <div className="absolute right-3 top-3 z-10 flex rounded-full border border-premium-beige bg-white p-1 shadow-sm" aria-label="Ansichtsmodus">
        <button type="button" aria-pressed={view === "2d"} onClick={() => setView("2d")} className={`rounded-full px-4 py-1 text-xs font-semibold ${view === "2d" ? "bg-premium-forest text-white" : "text-premium-charcoal"}`}>2D</button>
        <button type="button" aria-pressed={view === "3d"} onClick={() => setView("3d")} className={`rounded-full px-4 py-1 text-xs font-semibold ${view === "3d" ? "bg-premium-forest text-white" : "text-premium-charcoal"}`}>3D</button>
      </div>
      {view === "3d" && <div className="absolute inset-0" aria-label="3D-Raumansicht"><RoomView3D plan={seating && !shownPlan.seating ? { ...shownPlan, seating } : shownPlan} selectedZoneId={selection?.type === "zone" ? selection.id : undefined} selectedObjectId={selection?.type === "object" ? selection.id : undefined} /></div>}
      <div hidden={view !== "2d"} className="h-full">
      <svg ref={svgRef} role="img" aria-label="Grundriss Zeichenfläche" className={`block h-full min-h-[420px] w-full touch-none ${spaceDown ? "cursor-grab" : tool === "wall" ? "cursor-crosshair" : "cursor-default"}`} viewBox={`0 0 ${size.width} ${size.height}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={() => { if (!dragRef.current) setHover(null); }}>
        <rect width={size.width} height={size.height} fill="#f6f4ed" />
        <Grid camera={camera} size={size} />
        {shownRoom.closed && shownRoom.points.length >= 3 ? <polygon points={shownRoom.points.map((point) => { const p = coords.get(point.id)!; return `${p.x},${p.y}`; }).join(" ")} fill={errors.length ? "#c77c6c" : "#9ab393"} fillOpacity="0.24" /> : null}
        <g aria-label="Bereiche">{shownPlan.zones.map(zone => { const selected = selection?.type === "zone" && selection.id === zone.id, conflict = issues.some(issue => issue.objectId === zone.id && issue.severity === "error"), center = zoneCenter(zone), points = zonePolygon(zone); return <g key={zone.id}><polygon data-zone-id={zone.id} points={shapePoints(points)} fill={zone.type === "tables" ? "#d7b56d" : "#91a99a"} fillOpacity="0.25" stroke={conflict ? "#b53b32" : selected ? "#bd7647" : "#8a6a2f"} strokeWidth={selected || conflict ? 3 : 2} strokeDasharray="8 5" className={tool === "select" ? "cursor-crosshair" : ""} /><text x={screen(center).x} y={screen(center).y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#684d20" pointerEvents="none">{zone.type === "tables" ? "Tischbereich" : "Bereich"}</text>{selected && zone.geometry.kind === "polygon" && points.map((point, index) => <circle key={index} data-zone-vertex-id={zone.id} data-zone-point-index={index} cx={screen(point).x} cy={screen(point).y} r="7" fill="white" stroke="#bd7647" strokeWidth="3" className="cursor-move" />)}</g>; })}</g>
        {areaPreviewZone && <g pointerEvents="none"><polygon points={shapePoints(zonePolygon(areaPreviewZone))} fill="#d7b56d" fillOpacity="0.2" stroke="#8a6a2f" strokeWidth="2" strokeDasharray="8 5" /><polyline points={shapePoints(zonePolygon(areaPreviewZone))} fill="none" stroke="#8a6a2f" strokeWidth="2" />{zoneDraft.map((point, index) => <circle key={index} cx={screen(point).x} cy={screen(point).y} r={index === 0 && zoneDraft.length >= 3 ? 8 : 5} fill={index === 0 ? "#bd7647" : "white"} stroke="#684d20" strokeWidth="2" />)}</g>}
        {snapPreview && <g aria-label={snapPreview.valid ? "Gültige Snapping-Vorschau" : "Ungültige Snapping-Vorschau"} pointerEvents="none"><line x1={screen(snapPreview.targetEdge.start).x} y1={screen(snapPreview.targetEdge.start).y} x2={screen(snapPreview.targetEdge.end).x} y2={screen(snapPreview.targetEdge.end).y} stroke={snapPreview.valid ? "#2f7d5b" : "#b53b32"} strokeWidth="5" strokeLinecap="round" /><polygon points={shapePoints(tablePolygon(snapPreview.table))} fill={snapPreview.valid ? "#75a98d" : "#d56b60"} fillOpacity=".18" stroke={snapPreview.valid ? "#2f7d5b" : "#b53b32"} strokeWidth="2" strokeDasharray="6 4" /></g>}
        <g aria-label="Tische">{shownPlan.tables.map(table => { const p = screen(table), width = table.width * camera.scale, depth = table.depth * camera.scale, selected = selectedFurnitureIds.has(table.id) || selection?.type === "table" && selection.id === table.id, conflict = conflictedTables.has(table.id) || previewConflicts.has(table.id); return <g key={table.id} className={tool === "select" ? "cursor-move" : ""}><polygon data-table-id={table.id} points={shapePoints(tablePolygon(table))} fill={conflict ? "#f1b4aa" : "#d9c49a"} stroke={conflict ? "#b53b32" : selected ? "#bd7647" : "#725b36"} strokeWidth={selected || conflict ? 3 : 1.5} /><path d={`M${p.x-width*.28} ${p.y}H${p.x+width*.28}M${p.x} ${p.y-depth*.22}V${p.y+depth*.22}`} transform={`rotate(${table.rotation} ${p.x} ${p.y})`} stroke="#816b43" strokeWidth="1" pointerEvents="none" /></g>; })}</g>
        <g aria-label="Tischstühle">{shownPlan.chairs.map(chair => { const p = screen(chair), w = chair.width * camera.scale, d = chair.depth * camera.scale, selected = selectedFurnitureIds.has(chair.id) || selection?.type === "chair" && selection.id === chair.id, conflict = previewConflicts.has(chair.id); return <rect key={chair.id} data-chair-id={chair.id} x={p.x-w/2} y={p.y-d/2} width={w} height={d} rx="3" transform={`rotate(${chair.rotation} ${p.x} ${p.y})`} fill={conflict ? "#d56b60" : selected ? "#bd7647" : "#557a69"} stroke={conflict ? "#8f251f" : "#fff"} strokeWidth={selected || conflict ? 2.5 : 1} className={tool === "select" ? "cursor-move" : ""} />; })}</g>
        {transformedDraft && <g aria-label="Vorschau der Tischanordnung">
          {transformedDraft.tables.map(table => <polygon key={table.id} data-draft-table-id={table.id} data-draft-handle="move" points={shapePoints(tablePolygon(table))} fill={draftConflicts.has(table.id) ? "#f4b4aa" : "#d9c49a"} fillOpacity="0.38" stroke={draftConflicts.has(table.id) ? "#b53b32" : "#725b36"} strokeWidth="2" strokeDasharray="7 5" className="cursor-move" />)}
          {transformedDraft.chairs.map(chair => { const p = screen(chair), w = chair.width * camera.scale, d = chair.depth * camera.scale; return <rect key={chair.id} x={p.x-w/2} y={p.y-d/2} width={w} height={d} transform={`rotate(${chair.rotation} ${p.x} ${p.y})`} fill="#557a69" fillOpacity=".28" stroke="#405b49" strokeDasharray="4 3" pointerEvents="none" />; })}
        </g>}
        <g aria-label="Berechnete Sitzplätze">{seatingPaths.map((block, index) => <g key={block.id}><path data-block-id={block.id} d={block.rectangles} fill={highlightedBlocks.has(block.id) || selection?.type === "block" && selection.id === block.id ? "#bf6b30" : index % 2 ? "#477b70" : "#405b49"} stroke="#fff" strokeWidth="1" className={tool === "select" && plan.seating ? "cursor-move" : ""} /><path d={block.backs} fill="none" stroke="#d6ece0" strokeWidth="2" pointerEvents="none" /></g>)}{seating?.seats.filter((seat) => selectedFurnitureIds.has(seat.id) || selectedBlock?.seats.some((item) => item.id === seat.id) || highlightedSeats.has(seat.id) || currentAnalysis?.collisionSeatIds.includes(seat.id)).map((seat) => { const selected = selectedFurnitureIds.has(seat.id) || selection?.type === "seat" && selection.id === seat.id, conflict = previewConflicts.has(seat.id), highlighted = highlightedSeats.has(seat.id) || currentAnalysis?.collisionSeatIds.includes(seat.id); return <polygon key={`seat-hit-${seat.id}`} data-seat-id={seat.id} points={shapePoints(rotatedRectangle({ ...seat, width: seating.rules.chairWidth, depth: seating.rules.chairDepth }))} fill={conflict ? "#d56b60" : selected || highlighted ? "#e58c39" : "transparent"} fillOpacity={selected || highlighted || conflict ? .78 : 0} stroke={conflict ? "#8f251f" : selected ? "#f8d2b4" : "transparent"} strokeWidth={selected || conflict ? 2 : 0} className={tool === "select" ? "cursor-move" : ""} />; })}</g>
        {selectedSeat && !activeVariant && <circle data-seat-id={selectedSeat.id} cx={screen(selectedSeat).x} cy={screen(selectedSeat).y} r={Math.max(8, seatingRules.chairWidth * camera.scale / 2)} fill="transparent" className="cursor-move" />}
        {activeSuggestion && <g pointerEvents="none" aria-label="Vorschau des Gangvorschlags"><polygon points={shapePoints(aislePolygon({ id: activeSuggestion.id, type: "aisle", start: activeSuggestion.start, end: activeSuggestion.end, width: activeSuggestion.width }))} fill="#df9a45" fillOpacity="0.42" stroke="#ac5b1d" strokeWidth="3" strokeDasharray="8 5" /></g>}
        {shownPlan.objects.filter((object): object is AisleObject => object.type === "aisle").map((object) => { const proposed = object.source === "generated"; return <g key={object.id}><polygon data-object-id={object.id} points={shapePoints(aislePolygon(object))} fill={proposed ? "#df9a45" : "#5596a0"} fillOpacity="0.38" stroke={proposed ? "#ac5b1d" : highlightedObjects.has(object.id) || selection?.id === object.id ? "#bd7647" : "#357682"} strokeWidth={highlightedObjects.has(object.id) || selection?.id === object.id ? 3 : 1.5} strokeDasharray={proposed ? "8 5" : undefined} className={tool === "select" && !activeVariant ? "cursor-move" : ""} /><line x1={screen(object.start).x} y1={screen(object.start).y} x2={screen(object.end).x} y2={screen(object.end).y} stroke="#357682" strokeDasharray="5 4" pointerEvents="none" />{!activeVariant && selection?.id === object.id && (["start", "end"] as const).map((end) => <circle key={end} data-object-id={object.id} data-handle={end} cx={screen(object[end]).x} cy={screen(object[end]).y} r="7" fill="white" stroke="#bd7647" strokeWidth="3" className="cursor-move" />)}</g>; })}
         {aisleStart && hover && <g pointerEvents="none"><polygon points={shapePoints(aislePolygon({ id: "preview", type: "aisle", start: aisleStart, end: aisleEnd(hover, shiftDown), width: aisleWidth }))} fill="#5596a0" fillOpacity="0.3" stroke="#357682" strokeDasharray="6 4" /><Dimension a={screen(aisleStart)} b={screen(aisleEnd(hover, shiftDown))} label={`${formatMeters(wallLength(aisleStart, aisleEnd(hover, shiftDown)))} · ${formatMeters(aisleWidth)}`} /></g>}
        {shownPlan.objects.filter((object): object is ObstacleObject => object.type === "obstacle").map((object) => <g key={object.id}><polygon data-object-id={object.id} points={shapePoints(obstaclePolygon(object))} fill="#bb7558" fillOpacity="0.58" stroke={selection?.id === object.id ? "#81462e" : "#a75b42"} strokeWidth={selection?.id === object.id ? 3 : 1.5} className={tool === "select" ? "cursor-move" : ""} /><text x={screen(object).x} y={screen(object).y + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#442f26" pointerEvents="none">{object.obstacleType === "column" ? "Säule" : object.obstacleType === "stage" ? "Bühne" : object.obstacleType === "technical" ? "Technik" : object.obstacleType === "furniture" ? "Möbel" : "Sperrfläche"}</text></g>)}
        {shownPlan.objects.filter((object) => object.type === "stage" || object.type === "reservedArea").map((object) => { if (object.type !== "stage" && object.type !== "reservedArea") return null; return <g key={object.id}><polygon data-object-id={object.id} points={shapePoints(obstaclePolygon(object))} fill={object.type === "stage" ? "#aa7854" : "#957bb4"} fillOpacity="0.62" stroke={selection?.id === object.id ? "#263c32" : object.type === "stage" ? "#775138" : "#695187"} strokeWidth={selection?.id === object.id ? 3 : 1.5} className={tool === "select" ? "cursor-move" : ""} /><text x={screen(object).x} y={screen(object).y + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#231e29" pointerEvents="none">{object.type === "stage" ? "Bühne" : object.name || "Reserviert"}</text></g>; })}
        {shownPlan.objects.filter((object) => object.type === "front").map((object) => { if (object.type !== "front") return null; const segment = frontSegment(object), a = screen(segment.start), b = screen(segment.end), center = screen(object); const angle = object.rotation * Math.PI / 180; return <g key={object.id}><line data-object-id={object.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#235e89" strokeWidth={selection?.id === object.id ? 9 : 7} className={tool === "select" ? "cursor-move" : ""} /><line x1={center.x} y1={center.y} x2={center.x + Math.sin(angle) * 24} y2={center.y - Math.cos(angle) * 24} stroke="#235e89" strokeWidth="3" markerEnd="url(#front-arrow)" pointerEvents="none" /><text x={center.x} y={center.y + 17} textAnchor="middle" fontSize="12" fontWeight="700" fill="#17486a" pointerEvents="none">Front</text></g>; })}
        <defs><marker id="front-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#235e89" /></marker></defs>
        {shownRoom.walls.map((wall) => { const a = coords.get(wall.startPointId), b = coords.get(wall.endPointId); if (!a || !b) return null; return <g key={wall.id}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={selection?.id === wall.id ? "#bd7647" : errors.length ? "#b75d4b" : "#405b49"} strokeWidth={selection?.id === wall.id ? 5 : 3} />
          <line data-wall-id={wall.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="18" className={tool === "select" ? "cursor-pointer" : ""} />

        </g>; })}
        {shownPlan.objects.filter((object) => object.type === "door").map((object) => { if (object.type !== "door") return null; const segment = doorSegment(shownRoom, object); if (!segment) return null; const a = screen(segment.start), b = screen(segment.end), length = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / length, ny = (b.x - a.x) / length; return <g key={object.id}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#f6f4ed" strokeWidth="9" pointerEvents="none" /><line x1={a.x} y1={a.y} x2={a.x + nx * Math.min(length, 30)} y2={a.y + ny * Math.min(length, 30)} stroke="#347b7a" strokeWidth="3" pointerEvents="none" /><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#347b7a" strokeWidth="2" strokeDasharray="5 4" pointerEvents="none" /><line data-object-id={object.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="22" className={tool === "select" ? "cursor-move" : ""} /><circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={selection?.id === object.id ? 5 : 3} fill="#347b7a" pointerEvents="none" /></g>; })}
        {shownPlan.objects.filter((object) => object.type === "door" && highlightedObjects.has(object.id)).map((object) => { if (object.type !== "door") return null; const segment = doorSegment(shownRoom, object); if (!segment) return null; const midpoint = { x: (segment.start.x + segment.end.x) / 2, y: (segment.start.y + segment.end.y) / 2 }; const p = screen(midpoint); return <circle key={`highlight-${object.id}`} cx={p.x} cy={p.y} r="12" fill="none" stroke="#d97706" strokeWidth="3" pointerEvents="none" />; })}
        {selectedFurnitureBounds && furnitureSelection.length > 1 && <g aria-label="Mehrfachauswahl">
          <rect x={screen({ x: selectedFurnitureBounds.minX, y: selectedFurnitureBounds.minY }).x - 5} y={screen({ x: selectedFurnitureBounds.minX, y: selectedFurnitureBounds.minY }).y - 5} width={(selectedFurnitureBounds.maxX - selectedFurnitureBounds.minX) * camera.scale + 10} height={(selectedFurnitureBounds.maxY - selectedFurnitureBounds.minY) * camera.scale + 10} rx="4" fill="none" stroke="#bd7647" strokeWidth="2" strokeDasharray="7 5" pointerEvents="none" />
          <line x1={screen({ x: selectedFurnitureBounds.center.x, y: selectedFurnitureBounds.minY }).x} y1={screen({ x: selectedFurnitureBounds.center.x, y: selectedFurnitureBounds.minY }).y - 5} x2={screen({ x: selectedFurnitureBounds.center.x, y: selectedFurnitureBounds.minY }).x} y2={screen({ x: selectedFurnitureBounds.center.x, y: selectedFurnitureBounds.minY }).y - 34} stroke="#bd7647" strokeWidth="2" pointerEvents="none" />
          <circle data-furniture-rotate="true" cx={screen({ x: selectedFurnitureBounds.center.x, y: selectedFurnitureBounds.minY }).x} cy={screen({ x: selectedFurnitureBounds.center.x, y: selectedFurnitureBounds.minY }).y - 40} r="8" fill="white" stroke="#bd7647" strokeWidth="3" className="cursor-grab" />
        </g>}
        {marquee && <rect aria-label="Auswahlrahmen" x={Math.min(screen(marquee.at).x, screen(marquee.current).x)} y={Math.min(screen(marquee.at).y, screen(marquee.current).y)} width={Math.abs(screen(marquee.current).x - screen(marquee.at).x)} height={Math.abs(screen(marquee.current).y - screen(marquee.at).y)} fill="#4f7e70" fillOpacity=".12" stroke="#35695b" strokeWidth="1.5" strokeDasharray="6 4" pointerEvents="none" />}
        {selectedResizable && !previewPlan && <g aria-label="Größe und Drehung direkt bearbeiten">
          {selectedResizable.points.map((point, index) => <rect key={index} data-resize-id={selectedResizable.id} data-resize-kind={selectedResizable.kind} data-corner={(["nw","ne","se","sw"] as const)[index]} x={screen(point).x-6} y={screen(point).y-6} width="12" height="12" rx="2" fill="white" stroke="#bd7647" strokeWidth="2" className="cursor-nwse-resize" />)}
          {(() => { const top = { x: (selectedResizable.points[0].x + selectedResizable.points[1].x) / 2, y: (selectedResizable.points[0].y + selectedResizable.points[1].y) / 2 }; const center = selectedResizable.center; const length = Math.hypot(top.x-center.x, top.y-center.y) || 1; const handlePoint = { x: top.x + (top.x-center.x)/length*.45, y: top.y + (top.y-center.y)/length*.45 }; return <><line x1={screen(top).x} y1={screen(top).y} x2={screen(handlePoint).x} y2={screen(handlePoint).y} stroke="#bd7647" strokeWidth="2" /><circle data-rotate-id={selectedResizable.id} data-rotate-kind={selectedResizable.kind} cx={screen(handlePoint).x} cy={screen(handlePoint).y} r="7" fill="white" stroke="#bd7647" strokeWidth="2" className="cursor-grab" /></>; })()}
        </g>}
        {draftBounds && <g aria-label="Anordnung transformieren">
          <rect data-draft-handle="move" x={screen({x:draftBounds.minX,y:draftBounds.minY}).x} y={screen({x:draftBounds.minX,y:draftBounds.minY}).y} width={(draftBounds.maxX-draftBounds.minX)*camera.scale} height={(draftBounds.maxY-draftBounds.minY)*camera.scale} fill="none" stroke="#bd7647" strokeWidth="2" strokeDasharray="10 6" className="cursor-move" />
          <circle data-draft-handle="rotate" cx={screen({x:(draftBounds.minX+draftBounds.maxX)/2,y:draftBounds.minY-.6}).x} cy={screen({x:0,y:draftBounds.minY-.6}).y} r="8" fill="white" stroke="#bd7647" strokeWidth="3" className="cursor-grab" />
          <rect data-draft-handle="scale" x={screen({x:draftBounds.maxX,y:draftBounds.maxY}).x-7} y={screen({x:draftBounds.maxX,y:draftBounds.maxY}).y-7} width="14" height="14" fill="white" stroke="#bd7647" strokeWidth="3" className="cursor-nwse-resize" />
        </g>}
        {measurementsVisible && <MeasurementLayer plan={shownPlan} seating={seating} selectedId={selection?.id} project={screen} pixelsPerMeter={camera.scale} showDistances={showDistances} onMeasurementClick={(measurement, at) => { setMeasurementEdit({ measurement, value: measurement.label.replace(/[^0-9,.-]/g, ""), x: at.x, y: at.y }); }} />}
        {previewScreen && lastPoint && !nearestFirst ? <g><line x1={screen(lastPoint).x} y1={screen(lastPoint).y} x2={previewScreen.x} y2={previewScreen.y} stroke="#bd7647" strokeWidth="2" strokeDasharray="7 5" /><Dimension a={screen(lastPoint)} b={previewScreen} label={formatMeters(wallLength(lastPoint, preview!))} /><circle cx={previewScreen.x} cy={previewScreen.y} r="5" fill="#bd7647" /></g> : null}
        {shownRoom.points.map((point) => { const p = coords.get(point.id)!; return <g key={point.id}><circle cx={p.x} cy={p.y} r={POINT_RADIUS + 8} fill="transparent" data-point-id={point.id} className={tool === "select" || point.id === room.points[0]?.id && tool === "wall" ? "cursor-pointer" : ""} /><circle cx={p.x} cy={p.y} r={selection?.id === point.id ? POINT_RADIUS + 2 : POINT_RADIUS} fill={selection?.id === point.id || nearestFirst && point.id === room.points[0]?.id ? "#bd7647" : "#fff"} stroke="#405b49" strokeWidth="2" pointerEvents="none" /></g>; })}
       </svg>
       {furnitureSelection.length > 1 && selectedFurnitureBounds && <div role="toolbar" aria-label="Aktionen für Mehrfachauswahl" className="absolute z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-premium-beige bg-white/95 p-1.5 text-xs shadow-xl" style={{ left: Math.max(170, Math.min(size.width - 170, screen({ x: selectedFurnitureBounds.center.x, y: selectedFurnitureBounds.minY }).x)), top: Math.max(54, Math.min(size.height - 44, screen({ x: selectedFurnitureBounds.center.x, y: selectedFurnitureBounds.minY }).y - 88)) }}>
         <span className="px-2 font-bold text-premium-forest">{furnitureSelection.length} Möbel</span><span className="hidden text-premium-muted xl:inline">Ziehen zum Verschieben</span><button type="button" onClick={() => rotateSelectedFurniture(90)} className="rounded-full px-2 py-1 font-semibold hover:bg-[#f3eee4]">90° drehen</button><button type="button" onClick={duplicateSelectedFurniture} className="rounded-full px-2 py-1 font-semibold hover:bg-[#f3eee4]">Duplizieren</button><button type="button" onClick={deleteSelectedFurniture} className="rounded-full px-2 py-1 font-semibold text-red-800 hover:bg-red-50">Löschen</button><button type="button" aria-label="Mehrfachauswahl aufheben" onClick={() => { setFurnitureSelection([]); setSelection(null); setPreviewConflicts(new Set()); }} className="rounded-full px-2 py-1 font-semibold">×</button>
       </div>}
       {!!lastAutoFurnitureIds.length && <div role="status" className="absolute left-1/2 top-14 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-premium-beige bg-white/95 px-3 py-2 text-xs shadow-lg"><span>{lastAutoFurnitureIds.length} Möbel erzeugt</span><button type="button" onClick={() => { setTool("select"); setFurnitureIds(lastAutoFurnitureIds); setLastAutoFurnitureIds([]); }} className="font-bold text-premium-forest underline underline-offset-2">Alle erzeugten Möbel auswählen</button><button type="button" aria-label="Hinweis schließen" onClick={() => setLastAutoFurnitureIds([])}>×</button></div>}
       {selectedZone && !zoneSetupOpen && <button type="button" onClick={() => setZoneSetupOpen(true)} className="absolute z-10 -translate-x-1/2 rounded-full border border-premium-beige bg-white px-3 py-1.5 text-xs font-bold text-premium-forest shadow-lg" style={{ left: Math.max(90, Math.min(size.width - 90, screen(zoneCenter(selectedZone)).x)), top: Math.max(8, Math.min(size.height - 42, screen(zoneCenter(selectedZone)).y + 28)) }}>Bereich einrichten</button>}
       {selectedZone && zoneSetupOpen && <div role="dialog" aria-label="Tischbereich einrichten" className="absolute z-20 w-72 -translate-x-1/2 space-y-2 rounded-xl border border-premium-beige bg-white p-3 text-sm shadow-2xl" style={{ left: Math.max(150, Math.min(size.width - 150, screen(zoneCenter(selectedZone)).x)), top: Math.max(8, Math.min(size.height - 330, screen(zoneCenter(selectedZone)).y + 28)) }}>
         <div className="flex items-center justify-between"><strong>Bereich einrichten</strong><button type="button" aria-label="Einrichtung schließen" onClick={() => setZoneSetupOpen(false)} className="rounded px-2 py-1">×</button></div>
         <label className="block">Anordnung<select aria-label="Anordnung im Tischbereich" value={zoneFillMode} onChange={(event) => setZoneFillMode(event.target.value as TableLayoutMode)} className="mt-1 w-full rounded border border-premium-beige p-1">{tableModel(selectedTableModelId).shape === "trapezoid" ? <><option value="trapezoid-auto">Automatisch / passende Stellform</option><option value="trapezoid-groups">Einzelgruppen</option><option value="trapezoid-islands">Große Tischinseln</option><option value="trapezoid-long">Längliche Anordnung</option></> : <><option value="individual">Einzeltische</option><option value="long-tables">Lange Tafeln</option><option value="u-shape">U-Form</option><option value="l-shape">L-Form</option></>}</select></label>
         <label className="block">Planungsziel<select aria-label="Planungsziel im Tischbereich" value={zoneFillGoal} onChange={(event) => setZoneFillGoal(event.target.value as TablePlanningGoal)} className="mt-1 w-full rounded border border-premium-beige p-1"><option value="balanced">Ausgewogen</option><option value="capacity">Mehr Sitzplätze</option><option value="comfort">Mehr Bewegungsfreiheit</option></select></label>
         <label className="block">Tischmodell<select aria-label="Tischmodell für Tischbereich" value={selectedTableModelId} onChange={(event) => { const next = tableModel(event.target.value); setSelectedTableModelId(next.id); setZoneFillMode((current) => next.shape === "trapezoid" ? current.startsWith("trapezoid-") ? current : "trapezoid-auto" : current.startsWith("trapezoid-") ? "individual" : current); }} className="mt-1 w-full rounded border border-premium-beige p-1">{TABLE_MODELS.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
         <label className="flex items-center gap-2"><input aria-label="Mit Stühlen bestuhlen" type="checkbox" checked={zoneFillWithChairs} onChange={(event) => setZoneFillWithChairs(event.target.checked)} />Mit Stühlen bestuhlen</label>
         <details className="rounded border border-premium-beige p-2"><summary className="cursor-pointer text-xs">Ausrichtung</summary><select aria-label="Ausrichtung im Tischbereich" value={zoneFillRotation} onChange={(event) => setZoneFillRotation(Number(event.target.value))} className="mt-2 w-full rounded border border-premium-beige p-1">{[0,45,90,135].map((value) => <option key={value} value={value}>{value}°</option>)}</select></details>
         <button type="button" onClick={requestZoneFill} disabled={zoneFillBusy} className="w-full rounded-lg bg-premium-forest px-3 py-2 font-semibold text-white disabled:opacity-50">{zoneFillBusy ? "Vorschlag wird berechnet …" : "Vorschlag erstellen"}</button>
         <p className="text-[11px] text-premium-muted">Begrenzte temporäre Variantensuche; Ergebnis bleibt vollständig editierbar. Keine behördliche Freigabe.</p>
       </div>}
       {measurementEdit && <form onSubmit={(event) => { event.preventDefault(); applyMeasurement(); }} className="absolute z-10 rounded-lg border border-premium-beige bg-white p-2 shadow-lg" style={{ left: Math.max(4, Math.min(size.width - 190, measurementEdit.x - 80)), top: Math.max(4, measurementEdit.y - 58) }}><label className="flex items-center gap-1 text-sm"><input autoFocus aria-label={`${measurementEdit.measurement.kind === "wall" ? "Wandlänge" : measurementEdit.measurement.kind === "door" ? "Türbreite" : measurementEdit.measurement.kind === "aisle" && measurementEdit.measurement.id.endsWith("-width") ? "Gangbreite" : measurementEdit.measurement.kind === "aisle" ? "Ganglänge" : measurementEdit.measurement.id.endsWith("-depth") ? "Tiefe" : "Breite"} in Metern`} inputMode="decimal" value={measurementEdit.value} onChange={(event) => setMeasurementEdit({ ...measurementEdit, value: event.target.value, error: undefined })} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setMeasurementEdit(null); } }} className="w-24 rounded border border-premium-beige px-1 py-0.5" /> m</label><div className="mt-1 flex gap-1"><button type="submit" className="rounded bg-premium-forest px-2 py-0.5 text-xs text-white">Übernehmen</button><button type="button" onClick={() => setMeasurementEdit(null)} className="rounded border px-2 py-0.5 text-xs">Abbrechen</button></div>{measurementEdit.error && <p role="alert" className="mt-1 max-w-48 text-xs text-red-800">{measurementEdit.error}</p>}</form>}
      {!room.points.length ? <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(85%,25rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-premium-beige bg-white/90 p-5 text-center shadow-sm"><p className="font-display text-xl text-premium-ink">Raumgrundriss zeichnen</p><p className="mt-2 text-sm text-premium-muted">{help}</p></div> : null}
      </div>
    </div><aside aria-label="Eigenschaften" className="planner-properties flex min-h-0 flex-col gap-2 overflow-y-auto border-t border-premium-beige bg-white/90 p-3 lg:border-l lg:border-t-0">
      {!selection && <section aria-label="Planungsergebnis" className="planner-result-card rounded-xl border border-premium-beige bg-[#f7f6f1] p-3">
        <div className="mb-2 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-premium-muted">Aktueller Plan</p><h2 className="font-display text-lg text-premium-ink">Kapazität</h2></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${ruleStatus === "pass" ? "bg-green-100 text-green-900" : ruleStatus === "fail" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"}`}>{ruleStatus === "pass" ? "GEPRÜFT" : ruleStatus === "fail" ? `${ruleProblemCount} PROBLEME` : "PRÜFUNG OFFEN"}</span></div>
        <div className="grid grid-cols-3 divide-x divide-premium-beige rounded-lg bg-white py-2 text-center">
          <div><strong className="block text-2xl text-premium-forest">{capacity.total}</strong><span className="text-[10px] font-bold uppercase text-premium-muted">Sitzplätze</span></div>
          <div><strong className="block text-2xl text-premium-forest">{shownPlan.tables.length}</strong><span className="text-[10px] font-bold uppercase text-premium-muted">Tische</span></div>
          <button type="button" onClick={() => setRulePanelOpen((open) => !open)} aria-expanded={rulePanelOpen} className="px-1"><strong className={`block text-2xl ${ruleStatus === "fail" ? "text-red-700" : ruleStatus === "pass" ? "text-green-700" : "text-amber-700"}`}>{ruleStatus === "pass" ? "✓" : ruleStatus === "fail" ? ruleProblemCount : "–"}</strong><span className="text-[10px] font-bold uppercase text-premium-muted">Prüfstatus</span></button>
        </div>
        <p className="mt-2 text-[11px] text-premium-muted">Reihenplätze: {capacity.rowSeats} · Tischplätze: {capacity.tableSeats} · Gesamtplätze: {capacity.total} · Tische: {shownPlan.tables.length}</p>
        <p className="mt-1 text-[11px] text-premium-muted">{ruleStatus === "pass" ? "Durch das gewählte Profil ohne Blocker geprüft." : ruleStatus === "fail" ? "Regelgeprüfte Kapazität erst nach Behebung der Konflikte." : "Noch keine regelgeprüfte Kapazität."}</p>
        <div className="mt-2 grid grid-cols-2 gap-1"><button aria-label="Bestuhlen" type="button" disabled={!room.closed || variantsBusy} onClick={() => { setWorkflowStep("furnishing"); requestAutomaticSeating(); }} className="rounded bg-premium-forest px-2 py-1 text-xs font-semibold text-white disabled:opacity-40">{plan.seating ? "Neu berechnen" : "Freie Raumfläche bestuhlen"}</button><button type="button" onClick={() => setRulePanelOpen((open) => !open)} className="rounded border border-premium-beige bg-white px-2 py-1 text-xs font-semibold">Details</button></div>
      </section>}
      {!selection && (blockers.length ? <details aria-label="Probleme" className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-900"><summary className="cursor-pointer font-semibold">{blockers.length} {blockers.length === 1 ? "Problem" : "Probleme"}</summary><div className="mt-2 space-y-1">{blockers.map((message) => <p key={message}>{message}</p>)}</div></details> : seating ? <p role="status" className="rounded border border-green-200 bg-green-50 p-2 text-sm font-semibold text-green-900">✓ Regelprüfung ohne Blocker</p> : null)}
      <section aria-label="Kontextbezogene Eigenschaften" className="min-h-52 rounded border border-premium-beige p-3"><h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-premium-forest">{selectedZone ? "Tischbereich" : selectedTable ? "Tisch" : selectedFurnitureChair ? "Stuhl" : selectedObject?.type === "door" ? "Tür" : selectedObject?.type === "aisle" ? "Gang" : selectedObject ? "Objekt" : selectedPoint || selectedWall ? "Raum" : "Auswahl"}</h2><div className="space-y-2">
      {selectedTable && <><label className="block text-sm">Modell<select aria-label="Tischmodell" value={selectedTable.modelId} onChange={(event) => { const model = tableModel(event.target.value); updateTable(selectedTable.id, table => ({ ...table, modelId: model.id, width: model.width, depth: model.depth })); }} className="mt-1 w-full rounded border border-premium-beige p-1">{TABLE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label><p className="text-xs text-premium-muted">{formatMeters(selectedTable.width)} × {formatMeters(selectedTable.depth)} · per Drag verschieben</p><label className="flex items-center justify-between gap-2 text-sm">Rotation<select aria-label="Tischrotation" value={selectedTable.rotation} onChange={event => updateTable(selectedTable.id, table => ({ ...table, rotation: Number(event.target.value) }))} className="rounded border border-premium-beige px-2 py-1">{[0,45,90,135,180,225,270,315].map(value => <option key={value} value={value}>{value}°</option>)}</select></label><div className="rounded border border-premium-beige p-2 text-sm"><p className="mb-2 font-semibold">Stühle an diesem Tisch</p><p className="mb-2 text-xs text-premium-muted">Aktuell: {plan.chairs.filter((chair) => chair.tableId === selectedTable.id || !!selectedTable.groupId && chair.groupId === selectedTable.groupId).length} Plätze</p><div className="grid grid-cols-5 gap-1">{[0,2,4,6,8].map((count) => <button key={count} type="button" aria-label={`${count} Stühle an Tisch`} onClick={() => applyTableSeating(count)} className="rounded border border-premium-beige px-1 py-1">{count}</button>)}</div><button type="button" onClick={() => applyTableSeating()} className="mt-2 w-full rounded bg-premium-forest px-2 py-1 font-semibold text-white">Stühle hinzufügen</button></div><details className="rounded border border-premium-beige p-2 text-sm"><summary className="cursor-pointer">Maße anpassen</summary><div className="mt-2 space-y-2">{field("Breite (m)", selectedTable.width, value => updateTable(selectedTable.id, table => ({ ...table, width: value })), .1)}{field("Tiefe (m)", selectedTable.depth, value => updateTable(selectedTable.id, table => ({ ...table, depth: value })), .1)}</div></details><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => duplicateTable(selectedTable.id)} className="rounded-lg border border-premium-beige px-2 py-2 text-sm">Duplizieren</button><button type="button" onClick={() => removeTable(selectedTable.id)} className="rounded-lg border border-red-300 px-2 py-2 text-sm text-red-800">Löschen</button></div></>}
      {selectedFurnitureChair && <><p className="text-sm font-semibold">{demand.product?.title ?? "Stuhl"}</p><p className="text-xs text-premium-muted">Direkt im Plan verschieben · {selectedFurnitureChair.edited ? "bearbeitet" : selectedFurnitureChair.source}</p><label className="flex items-center justify-between gap-2 text-sm">Rotation<select aria-label="Stuhlrotation" value={selectedFurnitureChair.rotation} onChange={event => add({ ...plan, chairs: plan.chairs.map(chair => chair.id === selectedFurnitureChair.id ? { ...chair, rotation: Number(event.target.value), edited: true } : chair) })} className="rounded border border-premium-beige px-2 py-1">{[0,45,90,135,180,225,270,315].map(value => <option key={value} value={value}>{value}°</option>)}</select></label><div className="flex gap-2"><button type="button" onClick={() => { const id = `chair-${nextId.current++}`; add({ ...plan, chairs: [...plan.chairs, { ...selectedFurnitureChair, id, x: selectedFurnitureChair.x + .35, y: selectedFurnitureChair.y + .35, groupId: undefined, source: "manual", edited: false }] }); setSelection({ type: "chair", id }); }} className="rounded border border-premium-beige px-2 py-1">Stuhl duplizieren</button><button type="button" onClick={deleteSelection} className="rounded border border-red-300 px-2 py-1 text-red-800">Stuhl löschen</button></div></>}
      {selectedZone && <><p className="text-xs text-premium-muted">{selectedZone.geometry.kind === "polygon" ? `${selectedZone.geometry.points.length} Eckpunkte` : "Rechteckiger Bereich"} · bleibt für Reihenbestuhlung frei</p><button aria-label="Mit Tischen befüllen" type="button" onClick={requestCompatibleZoneFill} className="w-full rounded-lg border border-premium-forest px-3 py-2 text-sm font-semibold text-premium-forest">Schnell mit Einzeltischen befüllen</button><button type="button" onClick={() => setZoneSetupOpen(true)} className="w-full rounded-lg bg-premium-forest px-3 py-2 text-sm font-semibold text-white">Bereich einrichten</button><button type="button" onClick={() => { setTool("select"); setNotice("Eckpunkte können direkt am Tischbereich verschoben werden."); }} className="w-full rounded border border-premium-beige px-2 py-1 text-sm">Kontur bearbeiten</button><button type="button" onClick={() => removeZone(selectedZone.id)} className="rounded border border-red-300 px-2 py-1 text-red-800">Tischbereich löschen</button></>}
      {selectedObject?.type === "door" && <><p className="text-sm font-semibold">Tür</p>{field("Breite (m)", selectedObject.width, (value) => updateObject(selectedObject.id, (object) => ({ ...object, width: value })), 0.01)}{field("Position auf Wand (m)", selectedObject.offset, (value) => updateObject(selectedObject.id, (object) => ({ ...object, offset: value })), 0)}<label className="flex items-center justify-between gap-2 text-sm">Rolle<select aria-label="Türrolle" value={selectedObject.role ?? "normal"} onChange={(event) => updateObject(selectedObject.id, (object) => object.type === "door" ? setDoorRole(object, event.target.value as "normal" | "exit" | "emergency_exit") : object)} className="rounded border border-premium-beige px-2 py-1"><option value="normal">Normale Tür</option><option value="exit">Ausgang</option><option value="emergency_exit">Notausgang</option></select></label>{selectedObject.role && selectedObject.role !== "normal" && field("Lichte Breite (m)", selectedObject.clearWidth ?? selectedObject.width, (value) => updateObject(selectedObject.id, (object) => ({ ...object, clearWidth: value })), 0.01)}</>}
      {selectedObject?.type === "obstacle" && <><label className="flex items-center justify-between gap-2 text-sm">Hindernistyp<select aria-label="Hindernistyp" value={selectedObject.obstacleType} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, obstacleType: event.target.value as ObstacleObject["obstacleType"] }))} className="max-w-32 rounded border border-premium-beige"><option value="column">Säule</option><option value="stage">Bühne</option><option value="technical">Technik / Mischpult</option><option value="furniture">Festes Möbel</option><option value="restricted">Sperrfläche</option></select></label>{field("X (m)", selectedObject.x, (v) => updateObject(selectedObject.id, (o) => ({ ...o, x: v })))}{field("Y (m)", selectedObject.y, (v) => updateObject(selectedObject.id, (o) => ({ ...o, y: v })))}{field("Breite (m)", selectedObject.width, (v) => updateObject(selectedObject.id, (o) => ({ ...o, width: v })), 0.01)}{field("Tiefe (m)", selectedObject.depth, (v) => updateObject(selectedObject.id, (o) => ({ ...o, depth: v })), 0.01)}{field("Rotation (°)", selectedObject.rotation, (v) => updateObject(selectedObject.id, (o) => ({ ...o, rotation: v })))}</>}
      {(selectedObject?.type === "stage" || selectedObject?.type === "reservedArea" || selectedObject?.type === "front") && <><p className="text-sm font-semibold">{selectedObject.type === "front" ? "Front" : selectedObject.type === "stage" ? "Bühne" : "Reservierte Fläche"}</p>{selectedObject.type === "reservedArea" && <label className="flex items-center justify-between gap-2 text-sm">Name<input aria-label="Name der reservierten Fläche" maxLength={40} value={selectedObject.name ?? ""} onChange={(event) => updateObject(selectedObject.id, (object) => object.type === "reservedArea" ? { ...object, name: event.target.value } : object)} className="w-32 rounded border border-premium-beige px-2 py-1" /></label>}{field("X (m)", selectedObject.x, (v) => updateObject(selectedObject.id, (o) => ({ ...o, x: v })))}{field("Y (m)", selectedObject.y, (v) => updateObject(selectedObject.id, (o) => ({ ...o, y: v })))}{field("Breite (m)", selectedObject.width, (v) => updateObject(selectedObject.id, (o) => ({ ...o, width: v })), 0.01)}{selectedObject.type !== "front" && field("Tiefe (m)", selectedObject.depth, (v) => updateObject(selectedObject.id, (o) => o.type === "stage" || o.type === "reservedArea" ? { ...o, depth: v } : o), 0.01)}{field("Rotation (°)", selectedObject.rotation, (v) => updateObject(selectedObject.id, (o) => ({ ...o, rotation: v })))}{selectedObject.type === "stage" && <button type="button" onClick={() => { const existing = plan.objects.find((object) => object.type === "front"); const front = { id: existing?.id ?? `object-${nextId.current++}`, type: "front" as const, x: selectedObject.x, y: selectedObject.y, width: selectedObject.width, rotation: selectedObject.rotation }; add({ ...plan, objects: [...plan.objects.filter((object) => object.type !== "front"), front] }); setSelection({ type: "object", id: front.id }); }} className="rounded-lg border border-premium-beige px-3 py-2 text-sm">Als Front verwenden</button>}</>}
      {selectedObject?.type === "aisle" && <><p className="text-sm font-semibold">Gang / Freihaltezone</p><CommitNumberField label="Breite (m)" value={selectedObject.width} min={0.01} onCommit={(v) => updateObject(selectedObject.id, (o) => ({ ...o, width: v }))} /><CommitNumberField label="Länge (m)" value={Number(wallLength(selectedObject.start, selectedObject.end).toFixed(2))} min={0.01} onCommit={(value) => updateObject(selectedObject.id, (object) => { if (object.type !== "aisle") return object; const length = wallLength(object.start, object.end); return { ...object, end: { x: Number((object.start.x + (object.end.x - object.start.x) * value / length).toFixed(4)), y: Number((object.start.y + (object.end.y - object.start.y) * value / length).toFixed(4)) } }; })} /><p className="text-xs">Quelle: {selectedObject.source === "generated" ? "automatisch" : "manuell"}{selectedObject.edited ? " · bearbeitet" : ""}</p>{report?.checks.filter((check) => check.affectedIds.includes(selectedObject.id) && check.status !== "pass").map((check) => <p key={check.id} className="text-xs text-amber-800">{check.message}</p>)}{(["start", "end"] as const).flatMap((end) => (["x", "y"] as const).map((axis) => field(`${end === "start" ? "Start" : "Ende"} ${axis.toUpperCase()} (m)`, selectedObject[end][axis], (v) => updateObject(selectedObject.id, (o) => o.type === "aisle" ? { ...o, [end]: { ...o[end], [axis]: v } } : o))))}</>}
      {selectedObject && <button type="button" onClick={() => removeObject(selectedObject.id)} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-800">Objekt löschen</button>}
      {selectedBlock && seating && <div className="space-y-2 text-sm"><p className="font-semibold">Sitzblock {selectedBlock.id}</p><p>{selectedBlock.seats.length} Plätze · {selectedBlock.rowCount} Reihen</p><p>Quelle: {selectedBlock.source === "generated" ? "automatisch" : "manuell"}{selectedBlock.edited ? " · bearbeitet" : ""}</p><p className="text-xs text-premium-muted">Alt + Klick auf einen Sitz wählt ihn einzeln aus.</p><CommitNumberField label="Blockwinkel (°)" value={selectedBlock.rotation ?? selectedBlock.seats[0]?.rotation ?? 0} onCommit={(value) => applySeatingEdit(rotateBlock(plan, seating, selectedBlock.id, value))} />{report?.checks.filter((check) => check.affectedIds.includes(selectedBlock.id) && check.status !== "pass").map((check) => <p key={check.id} className="text-xs text-amber-800">{check.message}</p>)}<label className="flex items-center justify-between gap-2">Sitze je Schritt<input aria-label="Sitze je Schritt" type="number" min="1" step="1" value={rowEditCount} onChange={(event) => { const value = event.currentTarget.valueAsNumber; if (Number.isInteger(value) && value > 0) setRowEditCount(value); }} className="w-20 rounded border border-premium-beige px-2 py-1 text-right" /></label><div className="max-h-48 space-y-2 overflow-auto">{rowsOf(selectedBlock).map((row, index) => <div key={row.id} className="rounded border border-premium-beige p-2"><p>Reihe {index + 1}: {row.seats.length} Plätze</p>{(["left", "right"] as const).map((end) => <div key={end} className="flex gap-1"><button type="button" aria-label={`Reihe ${index + 1} ${end === "left" ? "links" : "rechts"} kürzen`} onClick={() => applySeatingEdit(editRow(plan, seating, selectedBlock.id, row.id, end, -rowEditCount))} className="rounded border px-2">−</button><button type="button" aria-label={`Reihe ${index + 1} ${end === "left" ? "links" : "rechts"} verlängern`} onClick={() => applySeatingEdit(editRow(plan, seating, selectedBlock.id, row.id, end, rowEditCount))} className="rounded border px-2">+</button><span>{end === "left" ? "links" : "rechts"}</span></div>)}</div>)}</div><button type="button" onClick={deleteSelection} className="rounded-lg border border-red-300 px-3 py-2 text-red-800">Block löschen</button></div>}
      {selectedSeat && <div className="space-y-2 text-sm"><p className="font-semibold">Sitz {selectedSeat.id}</p><p>Reihe {selectedSeat.row} · Position {selectedSeat.index}</p><p>Block {selectedSeatBlock?.id}</p>{plan.seating && <><CommitNumberField label="Sitz X (m)" value={selectedSeat.x} onCommit={(value) => applySeatingEdit(moveSeat(plan, plan.seating!, selectedSeat.id, value - selectedSeat.x, 0))} /><CommitNumberField label="Sitz Y (m)" value={selectedSeat.y} onCommit={(value) => applySeatingEdit(moveSeat(plan, plan.seating!, selectedSeat.id, 0, value - selectedSeat.y))} /></>}<button type="button" onClick={() => selectedSeatBlock && setSelection({ type: "block", id: selectedSeatBlock.id })} className="rounded border px-2 py-1">Block auswählen</button><button type="button" onClick={deleteSelection} className="rounded border border-red-300 px-2 py-1 text-red-800">Sitz entfernen</button></div>}
      {!selectedObject && !selectedBlock && !selectedSeat && !selectedTable && !selectedFurnitureChair && !selectedZone && !selectedPoint && !selectedWall && <><p className="text-sm text-premium-muted">Wählen Sie ein Objekt direkt im Grundriss.</p><button type="button" aria-expanded={advancedPanelOpen} onClick={() => setAdvancedPanelOpen((open) => !open)} className="w-full rounded border border-premium-beige px-2 py-1 text-sm">{advancedPanelOpen ? "Erweiterte Planung schließen" : "Erweiterte Planung"}</button></>}
      {(selectedPoint || selectedWall) && <><p className="text-sm font-semibold">Raumkontur</p><p className="text-xs text-premium-muted">Wandmaße lassen sich direkt über die Maßlabel im Plan bearbeiten.</p></>}
      </div></section>
      {!selection && advancedPanelOpen && <><div aria-label="Tischplanung" className="space-y-3 rounded border border-premium-beige p-3">
        <label className="block text-sm">Tischanordnung<select aria-label="Tischanordnung" value={tablePreset} onChange={event => setTablePreset(event.target.value as TablePresetId)} className="mt-1 w-full rounded border border-premium-beige p-1">{TABLE_PRESETS.map(preset => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
        <label className="block text-sm">Optimierungsziel<select aria-label="Optimierungsziel Tischplanung" value="complete" disabled className="mt-1 w-full rounded border border-premium-beige bg-[#f7f6f1] p-1"><option value="complete">Vollständig und kollisionsfrei</option></select></label>
        <div><h3 className="font-semibold">Tischanordnung</h3><p className="text-xs text-premium-muted">Erst als Entwurf ansehen, im Raum passend ziehen und dann übernehmen.</p></div>
        <label className="block text-sm">Modell<select aria-label="Tischmodell" value={selectedTableModelId} onChange={event => setSelectedTableModelId(event.target.value)} className="mt-1 w-full rounded border border-premium-beige p-1">{TABLE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
        <details className="rounded-lg border border-premium-beige p-2"><summary className="cursor-pointer text-xs font-semibold text-premium-forest">Erweitert</summary><div className="mt-2 space-y-2"><div className="grid grid-cols-2 gap-2">{field("Anzahl", tableCount, value => setTableCount(Math.max(1, Math.floor(value))), 1)}{field("Abstand (m)", tableSpacing, setTableSpacing, 0)}</div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={tableWithChairs} onChange={event => setTableWithChairs(event.target.checked)} />Stühle gleich mitplanen</label><label className="flex items-center justify-between gap-2 text-sm">Ausrichtung<select aria-label="Ausrichtung Tischplanung" value={tableRotation} onChange={event => setTableRotation(Number(event.target.value))} className="rounded border border-premium-beige px-2 py-1">{[0,45,90,135,180,225,270,315].map(value => <option key={value} value={value}>{value}°</option>)}</select></label></div></details>
        {!layoutDraft ? <div className="grid grid-cols-2 gap-2"><button type="button" aria-label="Tische berechnen · Automatisch einpassen" disabled={!room.closed} onClick={() => prepareTableDraft(true)} className="rounded-lg bg-premium-forest px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Tische berechnen</button><button type="button" disabled={!room.closed} onClick={() => prepareTableDraft(false)} className="rounded-lg border border-premium-forest px-3 py-2 text-sm font-semibold text-premium-forest disabled:opacity-40">Entwurf zeigen</button></div> : <div className="space-y-2 rounded-lg bg-[#f1f5ef] p-3">
          <p className="text-sm font-semibold">Entwurf: {transformedDraft?.tables.length} Tische {draftConflicts.size ? `· ${draftConflicts.size} Konflikte` : "· passt in den Raum"}</p>
          <label className="block text-xs">Anordnung verdichten / weiten<input aria-label="Anordnung skalieren" type="range" min="0.45" max="1.8" step="0.05" value={layoutTransform.spread} onChange={event => setLayoutTransform(current => ({ ...current, spread: Number(event.target.value) }))} className="w-full" /></label>
          <div className="flex gap-2"><button type="button" disabled={draftConflicts.size > 0} onClick={applyTableDraft} className="flex-1 rounded-lg bg-premium-forest px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Anordnung übernehmen</button><button type="button" onClick={() => { setLayoutDraft(null); setNotice(""); }} className="rounded-lg border border-premium-beige px-3 py-2 text-sm">Verwerfen</button></div>
          <p className="text-xs text-premium-muted">Gestrichelten Rahmen ziehen · Kreis dreht · Eckpunkt verändert die Abstände. Rot markierte Tische kollidieren.</p>
        </div>}
        <div className="rounded bg-[#f1f5ef] p-2 text-sm"><p><strong>{capacity.total}</strong> Plätze gesamt</p><p>{capacity.rowSeats} Reihenbestuhlung · {capacity.tableSeats} Tischbestuhlung</p><p>{shownPlan.tables.length} Tische</p></div>
      </div></>}
      {!selection && advancedPanelOpen && <><div aria-label="Bestuhlung" className="space-y-2 rounded border border-premium-beige p-2"><h3 className="font-semibold">Bestuhlung</h3>
        <label className="block text-sm">Anordnungsart<select aria-label="Anordnungsart" value="rows" disabled className="mt-1 w-full rounded border border-premium-beige bg-[#f7f6f1] p-1"><option value="rows">Reihenbestuhlung</option></select></label>
        <label className="block text-sm">Optimierungsziel<select aria-label="Optimierungsziel Bestuhlung" value={optimizationGoal} onChange={event => setOptimizationGoal(event.target.value as typeof optimizationGoal)} className="mt-1 w-full rounded border border-premium-beige p-1">{PLANNING_PROFILES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block text-sm">Stuhlmodell<select aria-label="Stuhlmodell" value={chairSelection.productId} onChange={(event) => { const product = chairProducts.find((item) => item.id === event.target.value)!; selectChair(product.id, product.variants[0].id); }} className="mt-1 w-full rounded border border-premium-beige p-1">{chairProducts.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}</select></label>
        <label className="block text-sm">Variante<select aria-label="Stuhlvariante" value={chairSelection.variantId} onChange={(event) => selectChair(chairSelection.productId, event.target.value)} className="mt-1 w-full rounded border border-premium-beige p-1">{(demand.product?.variants ?? []).map((variant) => <option key={variant.id} value={variant.id}>{variant.title}</option>)}</select></label>

        <details open className="rounded-lg border border-premium-beige p-2"><summary className="cursor-pointer text-xs font-semibold text-premium-forest">Planungsannahmen</summary><div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">{seatingField("Stuhlbreite (m)", "chairWidth", 0.1, "0.05")}
        {seatingField("Stuhltiefe (m)", "chairDepth", 0.1, "0.05")}
        {seatingField("Reihenabstand (m)", "rowPitch", 0.1, "0.05")}
        {seatingField("Max. Stühle pro Reihe", "maximumChairsPerRow", 1, "1")}</div>
        <label className="mt-2 flex items-center justify-between gap-2 text-sm">Ausrichtung<select aria-label="Ausrichtung" value={orientation} onChange={(event) => setOrientation(event.target.value as SeatingOrientation)} className="rounded border border-premium-beige px-2 py-1"><option value="horizontal">Horizontal</option><option value="vertical">Vertikal</option></select></label></details>
        <button data-planner-action="calculate-seating" type="button" disabled={!room.closed || errors.length > 0 || issues.some((issue) => issue.severity === "error") || seatingRules.rowPitch < seatingRules.chairDepth} onClick={() => { setActiveVariantId(null); if (plan.seating) { requestAutomaticSeating(); return; } const result = generateSeatingPlan(plan, seatingRules, orientation, gridOffset); setCalculated({ plan, rules: seatingRules, orientation, offset: gridOffset, result }); }} className="w-full rounded-lg bg-premium-forest px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">{plan.seating ? "Bestuhlung neu berechnen" : "Bestuhlung berechnen"}</button>
        {plan.seating && <button type="button" onClick={() => setReplanDialogOpen(true)} className="w-full rounded-lg border border-premium-beige px-3 py-2 text-sm font-semibold">Planung neu erstellen …</button>}
        {calculated?.plan === plan && !plan.seating && <button type="button" onClick={adoptCalculatedSeating} className="w-full rounded-lg border border-premium-forest px-3 py-2 text-sm font-semibold text-premium-forest">Bestuhlung übernehmen und bearbeiten</button>}
        {seatingRules.rowPitch < seatingRules.chairDepth && <p className="text-xs text-amber-800">Der Reihenabstand muss mindestens der Stuhltiefe entsprechen.</p>}
        {seating && <div aria-live="polite" className="space-y-1 rounded-lg bg-[#f1f5ef] p-3 text-sm"><p className="font-semibold">{seating.totalSeats} Sitzplätze · {seating.blocks.length} Sitzblöcke</p><p>{seating.totalRows} Reihen · längste Reihe: {seating.longestRow} Plätze</p><p>Stuhl: {formatMeters(seating.rules.chairWidth)} × {formatMeters(seating.rules.chairDepth)}</p><p>Reihenabstand: {formatMeters(seating.rules.rowPitch)}</p>{seating.hints.map((hint) => <p key={hint} className="text-amber-900">Hinweis: {hint}</p>)}</div>}
      </div>
       <div aria-label="Bedarf" aria-live="polite" className="rounded border border-premium-beige bg-[#f1f5ef] p-2 text-sm"><h3 className="font-display text-lg font-medium">Gesamtbedarf</h3><p className="text-xs text-premium-muted">{demand.product?.title} · {demand.variant?.title}</p><div className="flex items-baseline justify-between"><span>Geplante Stühle</span><strong className={`text-xl ${recommended.quantity > 0 ? "text-green-800" : "text-premium-charcoal"}`}>{recommended.quantity > 0 ? "✓ " : ""}{recommended.quantity}</strong></div><p className="text-xs text-premium-muted">{recommended.quantity} Stühle · {demand.rowQuantity} in Reihen · {demand.tableQuantity} an Tischen</p><label className="flex items-center justify-between gap-2">Stuhlreserve<select aria-label="Reserve in Prozent" value={reservePercent} onChange={(event) => setReservePercent(Number(event.target.value) as PlannerSettings["reservePercent"])} className="rounded border border-premium-beige bg-white p-1">{[0, 2, 5, 10].map((value) => <option key={value} value={value}>{value} %</option>)}</select></label><div className="flex items-baseline justify-between border-t border-premium-beige pt-1"><span className="font-semibold">Empfohlene Gesamtmenge</span><strong className="text-xl text-premium-forest">{recommended.recommendedQuantity}</strong></div><div className="border-t border-premium-beige pt-2"><p className="font-semibold">Tischbedarf: {plan.tables.length}</p>{tableDemand.length ? tableDemand.map(({ model, quantity }) => <p key={model.id} className="text-xs">{quantity} × {model.name}</p>) : <p className="text-xs text-premium-muted">Keine Tische geplant</p>}</div><details className="text-xs text-premium-muted"><summary className="cursor-pointer">Bedarfsdetails anzeigen</summary><p>Stuhl-Grundbedarf {recommended.quantity} · Reserve {recommended.reserveQuantity}. Die Reserve verändert den Raumplan nicht.</p><p>ⓘ Planungsmaße Stuhl {formatMeters(chairSelection.width)} × {formatMeters(chairSelection.depth)} · keine verifizierten Produktmaße. Regelprüfung ist keine behördliche Freigabe.</p></details></div>
       {currentAnalysis && <details aria-label="Aktueller Plan" className="space-y-1 rounded-lg border border-premium-beige p-3 text-sm"><summary className="cursor-pointer font-semibold">Aktueller Plan · {currentAnalysis.summary.seatCount} Plätze</summary><p>{currentAnalysis.summary.seatCount} Plätze · {currentAnalysis.summary.blockCount} Sitzblöcke · {currentAnalysis.summary.aisleCount} Gänge</p><p>{currentAnalysis.summary.usedExitCount} Ausgänge genutzt · {currentAnalysis.summary.unreachableSeatCount ? `${currentAnalysis.summary.unreachableSeatCount} Plätze ohne Weg` : "Alle Sitze erreichbar"}</p><p>Längster Weg: {currentAnalysis.summary.maxEgressDistance === undefined ? "nicht bestimmbar" : formatMeters(currentAnalysis.summary.maxEgressDistance)}</p><p>{currentAnalysis.summary.errors.length} Fehler · {currentAnalysis.summary.warnings.length} Warnungen</p>{currentAnalysis.summary.errors.filter((item) => item.id === "manual-seat-collisions").map((item) => <p key={item.id} className="text-red-800">{item.message}</p>)}</details>}
      <div aria-label="Regelprüfung" className="space-y-2 rounded border border-premium-beige p-2"><button type="button" onClick={() => setRulePanelOpen((open) => !open)} aria-expanded={rulePanelOpen} className="flex w-full items-center justify-between text-left"><span className="font-semibold">Regelprüfung</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${ruleStatus === "pass" ? "bg-green-100 text-green-900" : ruleStatus === "fail" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"}`}>{ruleStatus === "pass" ? "Keine Konflikte" : ruleStatus === "fail" ? `${ruleProblemCount} Probleme` : "Ausstehend"}{ruleWarningCount ? ` · ${ruleWarningCount} Hinweise` : ""}</span></button>
        <label className="block space-y-1 text-sm"><span>Regelprofil</span><select aria-label="Regelprofil" value={profileId} onChange={(event) => { setProfileId(event.target.value); setActiveCheckId(null); setActiveSuggestionId(null); }} className="w-full rounded border border-premium-beige px-2 py-1">{RULE_PROFILES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={applicabilityConfirmed} onChange={(event) => setApplicabilityConfirmed(event.target.checked)} className="mt-0.5" /><span>Anwendung dieses Regelprofils wurde fachlich geprüft</span></label>
        <details className="text-xs"><summary className="cursor-pointer font-semibold text-premium-forest">Details und Quelle anzeigen</summary>        <p className="text-xs text-premium-muted">{profile.applicability.description} Das Planungstool ersetzt keine bauordnungsrechtliche oder brandschutztechnische Prüfung. Anforderungen hängen von Gebäude, Nutzung, Genehmigung und örtlichen Vorgaben ab.</p>
        {profile.source && <a href={profile.source.url} target="_blank" rel="noreferrer" className="text-xs text-premium-forest underline">Quelle: {profile.source.title}, {profile.source.section}</a>}
</details>
        {!seating && <p className="text-sm text-premium-muted">Bestuhlung berechnen, um das gewählte Profil technisch zu prüfen.</p>}
        {report && analysis && <div aria-live="polite" className={`${rulePanelOpen ? "space-y-2" : "hidden"} text-sm`}><div className="grid grid-cols-2 gap-1 rounded-lg bg-[#f1f5ef] p-2"><span>Sitzplätze: <strong>{seating?.totalSeats}</strong></span><span>Bestanden: <strong>{report.counts.pass}</strong></span><span>Hinweise: <strong>{report.counts.warning}</strong></span><span>Probleme: <strong>{report.counts.fail}</strong></span><span>Nicht anwendbar: <strong>{report.counts.not_applicable}</strong></span></div>
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
              {activeVariantId === variant.id && <div className="mt-2 space-y-1 border-t border-premium-beige pt-2">{variant.reasons.map((reason) => <p key={reason}>{reason}</p>)}{s.unreachableBlockCount > 0 && <p>{s.unreachableBlockCount} ganze Sitzblöcke ohne Ausgangsweg.</p>}{s.exitCount > 1 && <p>Ausgangsnutzung: {s.exitLoads.map((load) => `${load.doorId}: ${load.seats} Plätze`).join(" · ")}</p>}{[...s.errors, ...s.warnings, ...s.hints].slice(0, 8).map((item) => <button key={item.id} type="button" onClick={() => { setActiveCheckId(item.id); const id = item.affectedIds.find((candidate) => variant.plan.objects.some((object) => object.id === candidate)) ?? item.affectedIds.find((candidate) => variant.seatingPlan.blocks.some((block) => block.id === candidate)); const object = variant.plan.objects.find((candidate) => candidate.id === id); const block = variant.seatingPlan.blocks.find((candidate) => candidate.id === id); const point = object && (object.type === "door" ? doorSegment(variant.plan.contour, object)?.start : object.type === "aisle" ? object.start : object) || block?.seats[0]; if (point) setCamera((current) => ({ ...current, x: point.x, y: point.y })); }} className={`block text-left ${item.category === "error" ? "text-red-800" : item.category === "warning" ? "text-amber-800" : "text-premium-muted"}`}>{item.category === "error" ? "Fehler" : item.category === "warning" ? "Warnung" : "Hinweis"}: {item.message}</button>)}<button type="button" onClick={() => adoptVariant(variant)} className="mt-1 rounded bg-premium-forest px-2 py-1 font-semibold text-white">{variant.feasible ? "Diese Variante übernehmen" : "Annäherung übernehmen und bearbeiten"}</button>{!variant.feasible && <p className="text-red-800">Diese Annäherung enthält Regelabweichungen. Nach der Übernahme bleiben sie in der Prüfung sichtbar.</p>}</div>}
            </div>;
          })}
          {!!variants.variants.length && <div className="overflow-x-auto"><table className="w-full border-collapse text-left"><caption className="mb-1 text-left font-semibold">Vergleich</caption><thead><tr><th className="pr-2">Kennzahl</th>{variants.variants.map((variant) => <th key={variant.id} className="pr-2">{PLANNING_PROFILES.find((item) => item.id === variant.profileId)?.name}</th>)}</tr></thead><tbody>{([
            ["Sitzplätze", (v: PlanVariant) => String(v.summary.seatCount)], ["Sitzblöcke", (v: PlanVariant) => String(v.summary.blockCount)], ["Gänge", (v: PlanVariant) => String(v.summary.aisleCount)], ["Erreichbare Plätze", (v: PlanVariant) => `${v.summary.reachableSeatCount}/${v.summary.seatCount}`], ["Genutzte Ausgänge", (v: PlanVariant) => `${v.summary.usedExitCount}/${v.summary.exitCount}`],
            ["Längster Weg", (v: PlanVariant) => v.summary.maxEgressDistance === undefined ? "–" : formatMeters(v.summary.maxEgressDistance)], ["Fehler", (v: PlanVariant) => String(v.summary.errors.length)], ["Warnungen", (v: PlanVariant) => String(v.summary.warnings.length)], ["Hinweise", (v: PlanVariant) => String(v.summary.hints.length)], ["Reihenabstand", (v: PlanVariant) => formatMeters(v.metrics.rowPitch)], ...(plan.objects.some((object) => object.type === "front") ? [["Abweichung zur Front", (v: PlanVariant) => `${v.metrics.frontDeviation ?? 0}°`] as [string, (v: PlanVariant) => string]] : []),
          ] as [string, (v: PlanVariant) => string][]).map(([label, get]) => <tr key={label} className="border-t border-premium-beige"><th className="py-1 pr-2 font-medium">{label}</th>{variants.variants.map((variant) => <td key={variant.id} className="pr-2">{get(variant)}</td>)}</tr>)}</tbody></table></div>}
        </div>}
        <p className="text-xs text-premium-muted">Die automatische Planung unterstützt die Raum- und Bestuhlungsplanung. Sie ersetzt keine erforderliche behördliche, brandschutztechnische oder fachplanerische Prüfung.</p>
      </div></>}
      <div className="planner-conversion mt-auto grid gap-1 border-t border-premium-beige bg-white py-2"><a className="btn-primary text-center text-xs" href={inquiryHref}>Angebot für diese Bestuhlung anfordern</a>{shopTarget && <a className="btn-secondary text-center text-xs" href={shopTarget.href}>Stuhl konfigurieren / Produkt ansehen</a>}</div>
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
    {zoneFillConfirm && <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"><div role="dialog" aria-modal="true" aria-labelledby="zone-fill-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><h2 id="zone-fill-title" className="font-display text-xl text-premium-ink">Tischbereich neu befüllen?</h2><p className="mt-2 text-sm text-premium-charcoal">{zoneFillConfirm.replaceableTableIds.length} unveränderte automatisch erzeugte Tische werden durch {zoneFillConfirm.tables.length} neue Tische ersetzt. {zoneFillConfirm.protectedTableIds.length} manuell bearbeitete oder geschützte Tische bleiben erhalten.</p><p className="mt-2 text-xs text-premium-muted">{zoneFillConfirm.assumption} Die Änderung kann vollständig rückgängig gemacht werden.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setZoneFillConfirm(null)} className="rounded-lg border border-premium-beige px-3 py-2 text-sm font-semibold">Abbrechen</button><button type="button" onClick={() => applyZoneFill(zoneFillConfirm)} className="rounded-lg bg-premium-forest px-3 py-2 text-sm font-semibold text-white">Ersetzen und befüllen</button></div></div></div>}
    {replanDialogOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"><div role="dialog" aria-modal="true" aria-labelledby="replan-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><h2 id="replan-title" className="font-display text-xl text-premium-ink">Planung neu erstellen?</h2><p className="mt-2 text-sm text-premium-charcoal">Die aktuelle Reihenbestuhlung mit {replanSummary.seatsRemoved} Sitzen wird ersetzt. Dazu gehören {replanSummary.protectedBlocks} manuelle oder manuell angepasste Blöcke. {replanSummary.generatedAislesReplaced} unveränderte automatisch erzeugte Gänge dürfen neu vorgeschlagen werden. Türen, Hindernisse, Tischbereiche, Tische und manuelle Gänge bleiben erhalten.</p><p className="mt-2 text-xs text-premium-muted">Abbrechen lässt den Originalzustand vollständig unverändert. Nach dem Erstellen kann die gesamte Änderung mit Rückgängig wiederhergestellt werden.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setReplanDialogOpen(false)} className="rounded-lg border border-premium-beige px-3 py-2 text-sm font-semibold">Abbrechen</button><button type="button" onClick={() => { setReplanDialogOpen(false); runAutomaticSeating(); }} className="rounded-lg bg-premium-forest px-3 py-2 text-sm font-semibold text-white">Ersetzen und neu bestuhlen</button></div></div></div>}
  </section>;
}

function CommitNumberField({ label, value, min, onCommit }: { label: string; value: number; min?: number; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return <label className="flex items-center justify-between gap-2 text-sm"><span>{label}</span><input aria-label={label} type="number" step="0.1" min={min} value={draft} onChange={(event) => setDraft(event.currentTarget.value)} onBlur={() => { const number = Number(draft); if (draft !== "" && Number.isFinite(number) && (min === undefined || number >= min) && number !== value) onCommit(number); else setDraft(String(value)); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="w-24 rounded border border-premium-beige px-2 py-1 text-right" /></label>;
}

function LiveNumberField({ label, value, min, onChange }: { label: string; value: number; min?: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return <label className="flex items-center justify-between gap-2 text-sm"><span>{label}</span><input aria-label={label} type="number" step="0.1" min={min} value={draft} onChange={(event) => { const nextDraft = event.currentTarget.value; setDraft(nextDraft); const number = Number(nextDraft); if (nextDraft !== "" && Number.isFinite(number) && (min === undefined || number >= min)) onChange(number); }} onBlur={() => { const number = Number(draft); if (draft === "" || !Number.isFinite(number) || min !== undefined && number < min) setDraft(String(value)); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="w-20 rounded border border-premium-beige px-1 py-1 text-right" /></label>;
}

function Dimension({ a, b, label, onClick }: { a: { x: number; y: number }; b: { x: number; y: number }; label: string; onClick?: (event: React.MouseEvent<SVGGElement>) => void }) {
  if (Math.hypot(b.x - a.x, b.y - a.y) < 30) return null;
  const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
  return <g role={onClick ? "button" : undefined} aria-label={onClick ? `Wandlänge ${label} bearbeiten` : undefined} tabIndex={onClick ? 0 : undefined} onPointerDown={onClick ? (event) => event.stopPropagation() : undefined} onClick={onClick} onKeyDown={onClick ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(event as unknown as React.MouseEvent<SVGGElement>); } } : undefined} pointerEvents={onClick ? "auto" : "none"} className={onClick ? "cursor-pointer" : undefined}><rect x={x - 30} y={y - 24} width="60" height="19" rx="5" fill="white" fillOpacity="0.92" /><text x={x} y={y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#405b49" pointerEvents="none">{label}</text></g>;
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
