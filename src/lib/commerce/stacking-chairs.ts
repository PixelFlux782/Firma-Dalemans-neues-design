import type {
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";

export type ChairUpholstery = "none" | "seat" | "seat-back";
export type ChairFabricGroup = 2 | 3 | 4;

export interface ChairConfiguration {
  upholstery: ChairUpholstery;
  fabricGroup?: ChairFabricGroup;
  rowConnector: boolean;
}

export const CHAIR_OPTION_NAMES = {
  upholstery: "Polsterung",
  fabricGroup: "Stoffgruppe",
  rowConnector: "Reihenverbindung",
} as const;

export const CHAIR_OPTION_VALUES = {
  upholstery: {
    none: "Ungepolstert",
    seat: "Sitzpolster",
    "seat-back": "Sitz- und Rückenpolster",
  },
  rowConnector: {
    false: "Ohne Reihenverbindung",
    true: "Mit Reihenverbindung",
  },
} as const;

export function isStackingChairProduct(product: CommerceProduct) {
  return Boolean(product.stackingChair);
}

export function chairConfigurationFromVariant(
  variant: CommerceProductVariant,
): ChairConfiguration | null {
  const options = Object.fromEntries(
    variant.selectedOptions.map((option) => [option.name, option.value]),
  );
  const upholsteryEntry = Object.entries(CHAIR_OPTION_VALUES.upholstery).find(
    ([, label]) => label === options[CHAIR_OPTION_NAMES.upholstery],
  );
  const rowConnectorEntry = Object.entries(CHAIR_OPTION_VALUES.rowConnector).find(
    ([, label]) => label === options[CHAIR_OPTION_NAMES.rowConnector],
  );

  if (!upholsteryEntry || !rowConnectorEntry) return null;

  const upholstery = upholsteryEntry[0] as ChairUpholstery;
  const fabricGroupValue = options[CHAIR_OPTION_NAMES.fabricGroup];
  const fabricGroup = fabricGroupValue
    ? Number(fabricGroupValue.replace("Gruppe ", "")) as ChairFabricGroup
    : undefined;

  if (upholstery === "none" && fabricGroup !== undefined) return null;
  if (upholstery !== "none" && ![2, 3, 4].includes(fabricGroup ?? 0)) return null;

  return {
    upholstery,
    ...(fabricGroup ? { fabricGroup } : {}),
    rowConnector: rowConnectorEntry[0] === "true",
  };
}

export function resolveChairVariant(
  product: CommerceProduct,
  configuration: ChairConfiguration,
) {
  if (!product.stackingChair) return null;
  if (configuration.upholstery === "none" && configuration.fabricGroup !== undefined) {
    return null;
  }
  if (configuration.upholstery !== "none" && !configuration.fabricGroup) {
    return null;
  }

  return product.variants.find((variant) => {
    const candidate = chairConfigurationFromVariant(variant);
    return candidate
      && candidate.upholstery === configuration.upholstery
      && candidate.fabricGroup === configuration.fabricGroup
      && candidate.rowConnector === configuration.rowConnector;
  }) ?? null;
}

export function chairConfigurationFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ChairConfiguration {
  const rawUpholstery = Array.isArray(searchParams.polster)
    ? searchParams.polster[0]
    : searchParams.polster;
  const rawFabricGroup = Array.isArray(searchParams.gruppe)
    ? searchParams.gruppe[0]
    : searchParams.gruppe;
  const rawRowConnector = Array.isArray(searchParams.reihe)
    ? searchParams.reihe[0]
    : searchParams.reihe;
  const upholstery: ChairUpholstery = rawUpholstery === "sitz"
    ? "seat"
    : rawUpholstery === "sitz-ruecken"
      ? "seat-back"
      : "none";
  const parsedFabricGroup = Number(rawFabricGroup);
  const fabricGroup = [2, 3, 4].includes(parsedFabricGroup)
    ? parsedFabricGroup as ChairFabricGroup
    : 2;

  return {
    upholstery,
    ...(upholstery === "none" ? {} : { fabricGroup }),
    rowConnector: rawRowConnector === "ja",
  };
}
