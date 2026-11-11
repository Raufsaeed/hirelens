/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Stop `next dev` from writing its own block into our AGENTS.md.
  agentRules: false,
  // pdf-parse loads its PDF worker file at run time, which breaks when bundled; load it from node_modules.
  serverExternalPackages: ["pdf-parse"],
  // Files read from disk at run time that the build can't find by itself, so Vercel bundles them with every
  // server function: the AI prompts (lib/ai/prompts.js) and the PDF.js worker, which PDF.js loads by file path.
  outputFileTracingIncludes: {
    "/**": ["./prompts/*.txt", "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
  },
  // The saved fake Gemini answers are for local tests only (lib/ai/test-mode.js is off in production).
  outputFileTracingExcludes: {
    "/**": ["./tests/**"],
  },
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
