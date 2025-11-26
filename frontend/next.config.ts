import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Docker環境で動作するように設定
  output: 'standalone',
};

export default nextConfig;
