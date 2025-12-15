/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to allow dynamic routes
  // output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dvberry.ru',
      },
    ],
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
  // External packages for server components
  serverExternalPackages: [],
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
  // Disable React strict mode to prevent double rendering
  reactStrictMode: false,
};

module.exports = nextConfig;
