import type { NextConfig } from "next";
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};

export default withBundleAnalyzer(nextConfig);