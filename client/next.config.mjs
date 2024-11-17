/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // -Enforces best practices
  trailingSlash: false, // Ensures URLs don't have a trailing slash unless necessary
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This allows any domain
        port: "", // Leave empty if there's no specific port
        pathname: "/**", // Allow all paths under any domain
      },
    ],
  },
};

export default nextConfig;
