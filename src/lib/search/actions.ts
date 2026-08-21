export type SearchActionName =
  | "search_open"
  | "search_query"
  | "search_result_click"
  | "search_no_results";

export interface SearchActionDetail {
  action: SearchActionName;
  query?: string;
  resultId?: string;
  resultType?: string;
}

/** Central integration point for a future consent-aware analytics adapter. */
export function recordSearchAction(detail: SearchActionDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<SearchActionDetail>("dlmns:search", { detail }));
}
