export const imageMigrations = [
  { source: "public/neue bilder/produkte-hero.png", target: "public/images/website/produkte-hero.webp", quality: 90 },
  { source: "public/neue bilder/kontakt-hero.png", target: "public/images/website/kontakt-hero.webp", quality: 90 },
  { source: "public/neue bilder/raum-im-alltag.png", target: "public/images/website/gemeinderaum-alltag.webp", quality: 90 },
  { source: "public/neue bilder/Sonderlösungen/Räume-u-Planung.png", target: "public/images/raumplaner/raeume-planung.webp", quality: 90 },
  { source: "public/neue bilder/planung-schritt-3.png", target: "public/images/raumplaner/planung-cad.webp", quality: 90 },
  { source: "public/neue bilder/stefan-dalemans-portrait.png", target: "public/images/unternehmen/stefan-dalemans.webp", quality: 90 },
  { source: "public/neue bilder/Hubert_Dalemans_gruender.png", target: "public/images/unternehmen/hubert-dalemans.webp", quality: 90 },
  { source: "public/neue bilder/Produktion-Lager/Schalenlager-Montage2.png", target: "public/images/unternehmen/schalenlager-montage.webp", quality: 90 },
  { source: "public/neue bilder/referenz1.png", target: "public/images/referenzen/referenzraum-1.webp", quality: 90 },
  { source: "public/neue bilder/referenz2.png", target: "public/images/referenzen/referenzraum-2.webp", quality: 90 },
  { source: "public/neue bilder/Stapelstühle/collage_stapelstuehle.png", target: "public/images/kategorien/stapelstuehle-collage.webp", quality: 92 },
  { source: "public/neue bilder/Tische/Klapptisch-collage-detail.png", target: "public/images/kategorien/klapptische-collage.webp", quality: 92 },
  { source: "public/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA_1.png", target: "public/images/produkte/rednerpult-acrylglas-typ-a.webp", quality: 92 },
  { source: "public/neue bilder/Zubehör/Tischtransportwagen_03.png", target: "public/images/produkte/tischtransportwagen.webp", quality: 92 },
  { source: "public/neue bilder/Stapelstühle/hero-bestuhlung.png", target: "public/images/kategorien/stapelstuehle-bestuhlung.webp", quality: 90 },
  { source: "public/neue bilder/Tische/t210_01.png", target: "public/images/produkte/seminarklapptisch-210c.webp", quality: 92 },
  { source: "public/Logos/logo_transp.png", target: "public/images/branding/dalemans-logo.webp", lossless: true, width: 1024 },
  { source: "public/pictures/Über uns/CAD-Entwicklung.png", target: "public/images/raumplaner/cad-entwicklung.webp", quality: 92 },
  { source: "public/pictures/Über uns/Realisierte-11.jpg", target: "public/images/referenzen/gemeindesaal-referenz.webp", quality: 90 },
  { source: "public/neue bilder/Tische/hero-klapptische.png", target: "public/images/kategorien/klapptische-hero.webp", quality: 90 },
];

export const mediaDirectories = [
  "produkte",
  "kategorien",
  "unternehmen",
  "referenzen",
  "website",
  "raumplaner",
  "branding",
];

export function publicUrl(filePath) {
  return `/${filePath.replace(/^public[\\/]/, "").replaceAll("\\", "/")}`;
}
