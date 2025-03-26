/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.openai.com',
      },
      {
        protocol: 'https',
        hostname: '**.oaistatic.com',
      },
      {
        protocol: 'https', 
        hostname: '**.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      }
    ],
  },
};

module.exports = nextConfig;
