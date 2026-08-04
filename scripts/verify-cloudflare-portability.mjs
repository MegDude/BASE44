import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const entry = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const redirects = await readFile(new URL("../public/_redirects", import.meta.url), "utf8");
const wrangler = await readFile(new URL("../wrangler.toml", import.meta.url), "utf8");

const failures = [];
if (JSON.stringify(packageJson.dependencies || {}).includes("@vercel/")) failures.push("Vercel runtime package remains in dependencies.");
if (entry.includes("@vercel/")) failures.push("Vercel runtime import remains in the application entry point.");
if (!redirects.includes("/index.html 200")) failures.push("Cloudflare Pages SPA fallback is missing.");
if (!wrangler.includes("pages_build_output_dir = \"dist\"")) failures.push("Cloudflare Pages output directory is missing.");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Cloudflare portability contract passed.");
