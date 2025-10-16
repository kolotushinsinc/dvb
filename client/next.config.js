/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to allow dynamic routes
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Add trailing slash for consistent routing
  trailingSlash: true,
  // Add rewrites to proxy image requests to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://api.dvberry.ru/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
