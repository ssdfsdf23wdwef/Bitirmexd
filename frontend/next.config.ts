import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic configuration to avoid module conflicts
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  // Minimal webpack config to avoid conflicts
  webpack: (config, { dev, isServer }) => {
    // Resolve alias for easier imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    return config;
  },
  
  // Basic image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
