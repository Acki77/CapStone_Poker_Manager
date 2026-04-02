/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true, // Dies sorgt dafür, dass Server und Client dieselben IDs nutzen
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google Profilbilder
      },
    ],
  },
};

export default nextConfig;
