/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true, // Dies sorgt dafür, dass Server und Client dieselben IDs nutzen
  },
  reactStrictMode: true,
};

export default nextConfig;
