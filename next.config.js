/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/walletconnect.txt",
        destination: "/api/walletconnect.txt"
      }
    ];
  },
};

module.exports = nextConfig;
