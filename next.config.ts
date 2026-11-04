import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents sengaja tidak dinyalakan: hampir semua halaman bergantung
  // pada sesi login dan jam server, jadi memang harus dirender per permintaan.
  reactCompiler: true,
  turbopack: {
    // Ada package-lock.json lain di folder home, jadi akar proyek ditulis eksplisit.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
