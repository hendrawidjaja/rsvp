/** @type {import('next').NextConfig} */
const nextConfig = {
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