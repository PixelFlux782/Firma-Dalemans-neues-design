export type PlannerChairConfig = {
  id: string;
  productHandle: string | null;
  fallbackName: string;
  modelPath: string;
  width: number;
  depth: number;
};

export type PlannerChair = PlannerChairConfig & {
  productName: string;
  productUrl: string | null;
};

/** Product-facing data is resolved from the shop catalog by productHandle. */
export const plannerChairConfig: PlannerChairConfig[] = [
  {
    id: "dalemans-chair",
    productHandle: null,
    fallbackName: "Dalemans Planungsstuhl",
    modelPath: "/models/dalemans-chair.glb",
    width: 0.5,
    depth: 0.55,
  },
];
