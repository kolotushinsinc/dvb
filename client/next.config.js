/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to allow dynamic routes
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['api.dvberry.ru'],
  },
  // Add trailing slash for consistent routing
  trailingSlash: false,
  // Add rewrites to proxy image requests to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://api.dvberry.ru/uploads/:path*',
      },
    ];
  },
  // Experimental features to improve build
  experimental: {
    serverComponentsExternalPackages: [],
    // Disable server actions to prevent infinite requests
    serverActions: false,
  },
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
  // Disable React strict mode to prevent double rendering
  reactStrictMode: false,
};

module.exports = nextConfig;
