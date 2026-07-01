/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    isrMemoryCacheSize: 50 * 1024 * 1024,
  },
  serverRuntimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
    HELIUS_API_KEY: process.env.HELIUS_API_KEY,
    TOKEN_MINT: process.env.TOKEN_MINT,
  },
  publicRuntimeConfig: {
    TOKEN_MINT: process.env.TOKEN_MINT,
  },
};

module.exports = nextConfig;
