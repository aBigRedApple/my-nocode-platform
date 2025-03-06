import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { dev }) => {
    if (dev) {
      config.stats = {
        warningsFilter: [/antd: compatible/], // 过滤 Antd 兼容性警告
      };
    }
    return config;
  },
};

export default nextConfig;
