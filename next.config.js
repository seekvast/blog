/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async rewrites() {
    return [
      // 排除 auth 相关的路径，这些由 NextAuth.js 处理
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*", // 保持原路径不变
      },
      // 其他 API 请求代理到后端服务器
      {
        source: "/api/:path*",
        destination: "http://api.kater.host/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
