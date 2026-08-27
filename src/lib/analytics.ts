export type ChairActionName =
  | "chair_model_view"
  | "chair_variant_change"
  | "chair_compare"
  | "chair_quantity_change"
  | "chair_add_to_cart"
  | "chair_quote_request"
  | "chair_sample_request"
  | "chair_planning_request";

export interface ChairActionDetail {
  action: ChairActionName;
  model?: string;
  variantId?: string;
  quantity?: number;
  comparedModels?: string[];
}

/** Central, consent-neutral handoff point for a future analytics adapter. */
export function recordChairAction(detail: ChairActionDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ChairActionDetail>("dlmns:chair", { detail }));
}
