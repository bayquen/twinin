// eslint.config.mjs
// Flat config (ESLint 9+). Next.js ships its own shareable configs for this format.
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default [
  // Rules for React, Next.js, and web vitals
  ...nextVitals,
  // TypeScript-aware rules
  ...nextTs,
  {
    // Build output and dependencies should never be linted
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];