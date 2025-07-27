/** @type {import('next').NextConfig} */
const nextConfig = {
  // 信任代理，正确处理X-Forwarded-* 头
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.katerimg.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
