/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.sahasralk.me/api/:path*",
      },
      {
        source: "/health",
        destination: "https://api.sahasralk.me/health",
      },
      {
        source: "/readiness",
        destination: "https://api.sahasralk.me/readiness",
      },
      {
        source: "/health/services",
        destination: "https://api.sahasralk.me/health/services",
      },
      {
        source: "/.well-known/:path*",
        destination: "https://api.sahasralk.me/.well-known/:path*",
      },
    ];
  },
};

export default nextConfig;
