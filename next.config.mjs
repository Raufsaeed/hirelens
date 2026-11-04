/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Stop `next dev` from writing its own block into our AGENTS.md.
  agentRules: false,
  // pdf-parse loads its PDF worker file at run time, which breaks when bundled; load it from node_modules.
  serverExternalPackages: ["pdf-parse"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
