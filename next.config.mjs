const imageRedirects = [
  ["/neue bilder/produkte-hero.png", "/images/website/produkte-hero.webp"],
  ["/neue bilder/kontakt-hero.png", "/images/website/kontakt-hero.webp"],
  ["/neue bilder/raum-im-alltag.png", "/images/website/gemeinderaum-alltag.webp"],
  ["/neue bilder/Sonderlösungen/Räume-u-Planung.png", "/images/raumplaner/raeume-planung.webp"],
  ["/neue bilder/planung-schritt-3.png", "/images/raumplaner/planung-cad.webp"],
  ["/neue bilder/stefan-dalemans-portrait.png", "/images/unternehmen/stefan-dalemans.webp"],
  ["/neue bilder/Hubert_Dalemans_gruender.png", "/images/unternehmen/hubert-dalemans.webp"],
  ["/neue bilder/Produktion-Lager/Schalenlager-Montage2.png", "/images/unternehmen/schalenlager-montage.webp"],
  ["/neue bilder/referenz1.png", "/images/referenzen/referenzraum-1.webp"],
  ["/neue bilder/referenz2.png", "/images/referenzen/referenzraum-2.webp"],
  ["/neue bilder/Stapelstühle/collage_stapelstuehle.png", "/images/kategorien/stapelstuehle-collage.webp"],
  ["/neue bilder/Tische/Klapptisch-collage-detail.png", "/images/kategorien/klapptische-collage.webp"],
  ["/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA_1.png", "/images/produkte/rednerpult-acrylglas-typ-a.webp"],
  ["/neue bilder/Zubehör/Tischtransportwagen_03.png", "/images/produkte/tischtransportwagen.webp"],
  ["/neue bilder/Stapelstühle/hero-bestuhlung.png", "/images/kategorien/stapelstuehle-bestuhlung.webp"],
  ["/neue bilder/Tische/t210_01.png", "/images/produkte/seminarklapptisch-210c.webp"],
  ["/Logos/logo_transp.png", "/images/branding/dalemans-logo.webp"],
  ["/pictures/Über uns/CAD-Entwicklung.png", "/images/raumplaner/cad-entwicklung.webp"],
  ["/pictures/Über uns/Realisierte-11.jpg", "/images/referenzen/gemeindesaal-referenz.webp"],
  ["/neue bilder/Tische/hero-klapptische.png", "/images/kategorien/klapptische-hero.webp"],
].map(([source, destination]) => ({ source: encodeURI(source), destination, permanent: true }));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "worker-src 'self' blob:",
    ].join("; ");

    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
        { key: "Strict-Transport-Security", value: "max-age=31536000" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      ],
    }];
  },
  async redirects() {
    return [
      ...imageRedirects,
      { source: "/produkte/kategorien/klapptische", destination: "/produkte/sortiment/klapptische", statusCode: 301 },
      { source: "/produkte/rednerpulte", destination: "/produkte/sortiment/rednerpulte", statusCode: 301 },
      { source: "/produkte/bistrotisch", destination: "/produkte/artikel/bistrotisch", statusCode: 301 },
      ...[
        ["klapptisch-310c", "klapptisch-310c"],
        ["trapezklapptisch-310c", "trapez-klapptisch-310c"],
        ["seminar-klapptisch", "seminarklapptisch-210c"],
        ["tischtransportwagen", "tischtransportwagen"],
        ["stuhltransportwagen", "stuhltransportwagen"],
        ["buchablage", "buchablage-nachruesten"],
      ].map(([legacy, handle]) => ({
        source: `/produkte/${legacy}`,
        destination: `/produkte/artikel/${handle}`,
        statusCode: 301,
      })),
      {
        source: "/produkte/kategorien/stapelstuehle",
        destination: "/produkte/stapelstuehle",
        permanent: true,
      },
      {
        source: "/produkte/stapelstuhl-mod-1021c",
        destination: "/produkte/stapelstuehle/1021",
        permanent: true,
      },
      {
        source: "/produkte/stapelstuhl-mod-1021c-buende",
        destination: "/produkte/stapelstuehle/buende",
        permanent: true,
      },
      {
        source: "/produkte/:legacy(stapelstuhl-1010i|stapelstuhl-1010a|stapelstuhl-1010b|stapelstuhl-e1000)",
        destination: "/produkte/stapelstuehle",
        permanent: true,
      },
      {
        source: "/shop/stapelstuehle",
        destination: "/produkte/stapelstuehle",
        permanent: true,
      },
      {
        source: "/shop/produkt/:chair(1021|buende|coburg|nuernberg|erfurt)",
        destination: "/produkte/stapelstuehle/:chair",
        permanent: true,
      },
      {
        source: "/shop",
        destination: "/produkte",
        permanent: true,
      },
      {
        source: "/shop/gleiter-finder",
        destination: "/produkte/gleiter-finder",
        permanent: true,
      },
      {
        source: "/shop/suche",
        destination: "/produkte/suche",
        permanent: true,
      },
      {
        source: "/shop/produkt/:handle",
        destination: "/produkte/artikel/:handle",
        permanent: true,
      },
      {
        source: "/shop/:collection",
        destination: "/produkte/sortiment/:collection",
        permanent: true,
      },
      {
        source: "/produkte/sortiment/stapelstuehle",
        destination: "/produkte/stapelstuehle",
        permanent: true,
      },
      {
        source: "/produkte/kategorien/gemeindestuehle-bankettmoebel",
        destination: "/produkte",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
