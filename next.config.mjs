/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
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
        source: "/produkte/kategorien/gemeindestuehle-bankettmoebel",
        destination: "/produkte",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
