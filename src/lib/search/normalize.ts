const pluralEndings = ["ern", "en", "er", "e", "n", "s"] as const;

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLocaleLowerCase("de-DE")
    .replace(/[×x]/g, " x ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/\s/g, "");
}

export function simpleTokenForms(token: string): string[] {
  const normalized = normalizeSearchText(token);
  const forms = new Set([normalized]);
  if (normalized.length < 6) return [...forms];

  for (const ending of pluralEndings) {
    if (normalized.endsWith(ending) && normalized.length - ending.length >= 5) {
      forms.add(normalized.slice(0, -ending.length));
    }
  }
  return [...forms];
}

export function tokenizeSearchText(value: string): string[] {
  return normalizeSearchText(value)
    .split(" ")
    .filter(Boolean)
    .flatMap(simpleTokenForms);
}
