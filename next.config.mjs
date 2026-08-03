/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/produkte/kategorien/gemeindestuehle-bankettmoebel",
        destination: "/produkte",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
