import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'

function normalizeGoogleMapsEnv(mode) {
  const env = loadEnv(mode, process.cwd(), "");
  const googleMapsApiKey =
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    env.VITE_GOOGLE_MAPS_API_KEY ||
    "";
  const googleMapsMapId =
    process.env.VITE_GOOGLE_MAP_ID ||
    env.VITE_GOOGLE_MAP_ID ||
    process.env.VITE_GOOGLE_MAPS_MAP_ID ||
    env.VITE_GOOGLE_MAPS_MAP_ID ||
    "";

  process.env.VITE_GOOGLE_MAPS_API_KEY = googleMapsApiKey;
  process.env.VITE_GOOGLE_MAP_ID = googleMapsMapId;
  process.env.VITE_GOOGLE_MAPS_MAP_ID = googleMapsMapId;
  return { googleMapsApiKey, googleMapsMapId };
}

function assertProductionGoogleMapsEnv(mode, googleMapsApiKey) {
  if (mode !== "production") return;
  if (!/^AIza[0-9A-Za-z_-]{30,}$/.test(String(googleMapsApiKey || "").trim())) {
    throw new Error(
      "Production map build blocked: configure a valid VITE_GOOGLE_MAPS_API_KEY.",
    );
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { googleMapsApiKey, googleMapsMapId } = normalizeGoogleMapsEnv(mode);
  assertProductionGoogleMapsEnv(mode, googleMapsApiKey);

  return {
  logLevel: 'error', // Suppress warnings, only show errors
  publicDir: process.env.DP_SKIP_PUBLIC_COPY === "true" ? false : undefined,
  // Keep this app's optimized dependency graph isolated from stale preview chunks.
  cacheDir: 'node_modules/.vite-base44-single-react',
  resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },
  // Router hooks and the renderer must share one React module instance.
  dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
  // Prebundle the hook runtime and router together to prevent stale split chunks in HMR.
  include: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'],
  force: true,
  },
  define: {
    "import.meta.env.VITE_GOOGLE_MAPS_API_KEY": JSON.stringify(googleMapsApiKey),
    "import.meta.env.VITE_GOOGLE_MAP_ID": JSON.stringify(googleMapsMapId),
    "import.meta.env.VITE_GOOGLE_MAPS_MAP_ID": JSON.stringify(googleMapsMapId),
  },
  plugins: [
    react(),
  ]
  };
});
