import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptRules from "eslint-config-next/typescript";

/**
 * eslint-config-next ships flat config arrays directly on these entry points,
 * so there is nothing to wrap in FlatCompat — and wrapping them in it fails
 * on a circular reference in the react plugin.
 */
const config = [
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescriptRules,
];

export default config;
