import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autorise le hostname de votre API externe
    domains: ["api.apiplaqueimmatriculation.com"],
    // Optionnel : vous pouvez affiner sur le chemin des logos
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.apiplaqueimmatriculation.com",
        port: "",
        pathname: "/public/storage/logos_marques/**",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
   images: {
    domains: ['api.apiplaqueimmatriculation.com'],
  },
};

export default nextConfig;
