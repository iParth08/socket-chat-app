/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "https://socket-chat-app-pi.vercel.app/", // Ensure this matches the deployment
  trailingSlash: false,
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
