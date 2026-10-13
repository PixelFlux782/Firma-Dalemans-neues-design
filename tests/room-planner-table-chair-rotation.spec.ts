import { expect, test } from "@playwright/test";
import type { RoomPlan } from "../src/lib/room-planner/objects";
import { emptyPlan } from "../src/lib/room-planner/objects";
import { createProject, parseProject } from "../src/lib/room-planner/projects";
import { chairDisplayAngle } from "../src/lib/room-planner/visualization3d";
import { generateTableLayout, moveTableGroup, seatTable, type FurnitureChair, type TableInstance } from "../src/lib/room-planner/tables";

const room = (): RoomPlan => ({
  ...emptyPlan(),
  contour: {
    closed: true,
    points: [{ id: "p1", x: 0, y: 0 }, { id: "p2", x: 12, y: 0 }, { id: "p3", x: 12, y: 10 }, { id: "p4", x: 0, y: 10 }],
    walls: [{ id: "w1", startPointId: "p1", endPointId: "p2" }, { id: "w2", startPointId: "p2", endPointId: "p3" }, { id: "w3", startPointId: "p3", endPointId: "p4" }, { id: "w4", startPointId: "p4", endPointId: "p1" }],
  },
});

const facingVector2D = (rotation: number) => {
  const angle = rotation * Math.PI / 180;
  return { x: Math.sin(angle), y: -Math.cos(angle) };
};

// The GLB's front is local +Z; this is its world X/Z direction after rendering.
const modelFacingVector3D = (rotation: number) => {
  const angle = chairDisplayAngle(rotation);
  return { x: Math.sin(angle), y: Math.cos(angle) };
};

function expectFacesTable(chair: FurnitureChair, table: TableInstance) {
  const toward = { x: table.x - chair.x, y: table.y - chair.y };
  const planFacing = facingVector2D(chair.rotation);
  const modelFacing = modelFacingVector3D(chair.rotation);
  expect(planFacing.x * toward.x + planFacing.y * toward.y).toBeGreaterThan(0);
  expect(modelFacing.x * toward.x + modelFacing.y * toward.y).toBeGreaterThan(0);
}

for (const count of [4, 6, 8]) {
  for (const rotation of [0, 90, 180]) {
    test(`Tisch mit ${count} Stühlen bei ${rotation}° richtet 2D und 3D zum Tisch aus`, () => {
      const table: TableInstance = { id: "table-1", modelId: "table-310c-180x80", x: 6, y: 5, rotation, width: 1.8, depth: .8, groupId: "group-1", source: "manual" };
      const result = seatTable({ ...room(), tables: [table] }, table.id, count);
      expect(result.chairs).toHaveLength(count);
      result.chairs.forEach((chair) => expectFacesTable(chair, table));
      if (count === 8) {
        const angle = -table.rotation * Math.PI / 180;
        const local = result.chairs.map((chair) => ({
          x: (chair.x - table.x) * Math.cos(angle) - (chair.y - table.y) * Math.sin(angle),
          y: (chair.x - table.x) * Math.sin(angle) + (chair.y - table.y) * Math.cos(angle),
        }));
        expect(local.some((chair) => chair.y < -table.depth / 2)).toBe(true);
        expect(local.some((chair) => chair.y > table.depth / 2)).toBe(true);
        expect(local.some((chair) => chair.x < -table.width / 2)).toBe(true);
        expect(local.some((chair) => chair.x > table.width / 2)).toBe(true);
      }
    });
  }
}

test("verbundene Tischgruppen drehen Tisch und Stühle gemeinsam", () => {
  const layout = generateTableLayout({ preset: "single", modelId: "table-310c-180x80", count: 1, spacing: 1, rotation: 0, withChairs: true, chairsPerTable: 8, center: { x: 6, y: 5 } }, "rotation-group");
  const plan = moveTableGroup({ ...room(), tables: layout.tables, chairs: layout.chairs, tableGroups: layout.groups }, layout.groups[0].id, 0, 0, 90);
  plan.chairs!.forEach((chair) => expectFacesTable(chair, plan.tables![0]));
});

test("manuelle Tischstuhlrotation bleibt beim Speichern und Laden unverändert", () => {
  const table: TableInstance = { id: "table-1", modelId: "table-310c-180x80", x: 6, y: 5, rotation: 0, width: 1.8, depth: .8, groupId: "group-1", source: "manual" };
  const generated = seatTable({ ...room(), tables: [table] }, table.id, 4).chairs;
  const chairs = generated.map((chair, index) => index === 0 ? { ...chair, rotation: 45, edited: true } : chair);
  const loaded = parseProject(JSON.stringify(createProject("Rotation", { ...room(), tables: [table], chairs, tableGroups: [{ id: "group-1", tableIds: [table.id], chairIds: chairs.map((chair) => chair.id) }] })));
  expect(loaded.plan.chairs![0]).toMatchObject({ rotation: 45, edited: true });
});

test("GLB-Korrektur und Reihenbestuhlungswinkel bleiben unverändert", () => {
  expect(chairDisplayAngle(0)).toBeCloseTo(Math.PI);
  expect(chairDisplayAngle(90)).toBeCloseTo(Math.PI / 2);
  expect(chairDisplayAngle(180)).toBeCloseTo(0);
});
