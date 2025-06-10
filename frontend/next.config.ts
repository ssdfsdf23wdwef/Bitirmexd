import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ULTRA FAST Performance optimizations */
  
  // Turbopack optimizations for fastest compilation
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Experimental optimizations for fastest builds
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    // Reduce bundle size
    optimizePackageImports: ['react-icons', '@nextui-org/react', 'framer-motion'],
  },
  
  // External packages that should be bundled on the server
  serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Build optimizations  
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
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

  // Asset optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600, // 1 hour cache
  },

  // Webpack optimizations for faster compilation
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Development için ULTRA FAST compilation
      config.optimization = {
        ...config.optimization,
        // Disable compression in development for speed
        minimize: false,
        // Fast source maps
        splitChunks: {
          chunks: 'all',
          minSize: 10000,     // Smaller chunks for faster builds
          maxSize: 100000,    // Limit chunk size
          cacheGroups: {
            default: {
              minChunks: 1,    // Lower threshold
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
            // Separate heavy libraries
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
      
      // Faster builds with caching
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: false,
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    // Resolve optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      // Faster resolution
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    return config;
  },
};

export default nextConfig;
