/**
 * Stable adapter between commerce option values and the central knowledge model.
 * A trigger only becomes visible when an entry with the returned option ID exists.
 */
export function getKnowledgeOptionIdForProductOption(
  optionName: string,
  optionValue: string,
) {
  if (optionName === "Stoffgruppe") {
    const group = optionValue.replace(/^Gruppe\s+/i, "");
    return /^\d+$/.test(group) ? `fabric-group-${group}` : undefined;
  }

  if (optionName === "Kantenart") {
    const tableEdgeOptionIds: Record<string, string> = {
      ABS: "table-edge-abs",
      "Buche natur": "table-edge-beech-natural",
    };
    return tableEdgeOptionIds[optionValue];
  }

  return undefined;
}
