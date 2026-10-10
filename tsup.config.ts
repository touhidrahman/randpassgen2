import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    // ESM + CJS for Node.js/bundlers, IIFE for direct <script> usage.
    format: ["esm", "cjs", "iife"],
    globalName: "randpassgen2",
    target: "es2020",
    dts: true,
    sourcemap: true,
    clean: true,
    minify: false,
});
