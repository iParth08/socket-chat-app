/** @type {import('next').NextConfig} */
const nextConfig = {
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
