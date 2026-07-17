/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
        protocol: "https",
      },
    ],
  },
  sassOptions: {
    includePaths: ["./src/styles"],
  },
  turbopack: {
    rules: {
      "*.svg": {
        type: "asset",
      },
    },
  },
};

module.exports = nextConfig;