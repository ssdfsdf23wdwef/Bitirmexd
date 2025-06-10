import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  
  // Experimental optimizations
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    // Reduce bundle size with optimized package imports
    optimizePackageImports: [
      'react-icons', 
      '@nextui-org/react', 
      'framer-motion',
      '@mui/material',
      '@mui/icons-material',
      'chart.js',
      'react-chartjs-2',
      'lucide-react'
    ],
  },
  
  // Move external packages to serverExternalPackages (new location)
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Build optimizations with enhanced tree-shaking
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
    '@nextui-org/react': {
      transform: '@nextui-org/react/dist/{{member}}',
    },
    'framer-motion': {
      transform: 'framer-motion/dist/es/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  
  // Caching and performance - AGGRESSIVE
  devIndicators: {
    position: 'bottom-right',
  },
  
  onDemandEntries: {
    // Çok agresif caching - bellekte daha uzun tut
    maxInactiveAge: 1000 * 60 * 10,    // 10 dakika
    // Daha fazla sayfa bellekte tut
    pagesBufferLength: 25,             // en son 25 sayfa
  },

  // Fastest compilation settings
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    // Enable SWC minification
    styledComponents: true,
  },

  
  // Enhanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600, // 1 hour cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Development optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 10000,
          maxSize: 100000,
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              maxSize: 200000,
            },
            nextui: {
              test: /[\\/]node_modules[\\/]@nextui-org[\\/]/,
              name: 'nextui',
              priority: 10,
              chunks: 'all',
            },
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              priority: 10,
              chunks: 'all',
            },
            icons: {
              test: /[\\/]node_modules[\\/]react-icons[\\/]/,
              name: 'icons',
              priority: 10,
              chunks: 'all',
            },
          },
        },
      };
      
      // Filesystem caching for faster builds
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: false,
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    return config;
  },
};

// Bundle analyzer integration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
