/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
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
