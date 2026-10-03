const commerceHandles: Record<string, string> = {
  "klapptisch-310c": "klapptisch-310c",
  "trapezklapptisch-310c": "trapez-klapptisch-310c",
  "seminar-klapptisch": "seminarklapptisch-210c",
  tischtransportwagen: "tischtransportwagen",
  stuhltransportwagen: "stuhltransportwagen",
  buchablage: "buchablage-nachruesten",
  bistrotisch: "bistrotisch",
};

export function productPath(slug: string) {
  const handle = commerceHandles[slug];
  return handle ? `/produkte/artikel/${handle}` : `/produkte/${slug}`;
}

export function isCommerceLegacyProduct(slug: string) {
  return slug in commerceHandles;
}
