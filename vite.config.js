import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'
import { cp, mkdir, readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const DEFAULT_BASE44_APP_ID = "cbef744a8545c389ef439ea6";
const DEFAULT_BASE44_APP_BASE_URL = "https://downtown-perks-live.base44.app";

process.env.VITE_BASE44_APP_ID ||= DEFAULT_BASE44_APP_ID;
process.env.VITE_BASE44_APP_BASE_URL ||= DEFAULT_BASE44_APP_BASE_URL;

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

function localApiRoutes() {
  async function runLocalHandler(req, res, handlerPath, logger, errorMessage) {
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", async () => {
      try {
        const handlerUrl = `${pathToFileURL(`${process.cwd()}/${handlerPath}`).href}?t=${Date.now()}`;
        const { default: handler } = await import(handlerUrl);
        req.body = rawBody ? JSON.parse(rawBody) : {};
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (payload) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
        };
        await handler(req, res);
      } catch (error) {
        logger?.error?.(error);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: errorMessage }));
      }
    });
  }

  const attachMiddleware = (middlewares, logger) => {
    middlewares.use("/api/ask-map", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/ask-map.js", logger, "Local ask-map handler failed");
    });

    middlewares.use("/api/map/results", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/map/results.js", logger, "Local map results handler failed");
    });

    middlewares.use("/api/agent/query", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/agent/query.js", logger, "Local agent query handler failed");
    });

    middlewares.use("/api/agent/stream", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/agent/stream.js", logger, "Local agent stream handler failed");
    });

    middlewares.use("/api/contact", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/contact.js", logger, "Local contact handler failed");
    });

    middlewares.use("/api/campaign-requests", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/campaign-requests.js", logger, "Local campaign request handler failed");
    });

    middlewares.use("/api/daa/check-in", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/daa/check-in.js", logger, "Local DAA check-in handler failed");
    });

    middlewares.use("/api/events", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/events.js", logger, "Local platform event handler failed");
    });

    middlewares.use("/api/map-actions", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/map-actions.js", logger, "Local map action handler failed");
    });

    middlewares.use("/api/listing-interest", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/listing-interest.js", logger, "Local listing interest handler failed");
    });

    middlewares.use("/api/redeem", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/redeem.js", logger, "Local redeem handler failed");
    });

    middlewares.use("/api/stripe/create-checkout-session", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/stripe/create-checkout-session-local.js", logger, "Local checkout handler failed");
    });

    middlewares.use("/api/resident-access", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/resident-access.js", logger, "Local resident access handler failed");
    });

    middlewares.use("/api/integrations/luxury-presence/seo-report", async (req, res) => {
      if (req.method !== "GET") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/integrations/luxury-presence/seo-report.js", logger, "Local Luxury Presence SEO report handler failed");
    });

    middlewares.use("/api/production-readiness", async (req, res) => {
      if (req.method !== "GET") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/production-readiness.js", logger, "Local production readiness handler failed");
    });

    middlewares.use("/api/research-intelligence/summary", async (req, res) => {
      if (req.method !== "GET") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/research-intelligence/summary.js", logger, "Local research coverage request failed");
    });
  };

  return {
    name: "downtown-perks-local-api-routes",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (
          req.url === "/founding-partners"
          || req.url === "/founding-partner-collection"
          || req.url === "/founding-partners.html"
        ) {
          req.url = "/founding-partners.html";
        }
        next();
      });
      server.middlewares.use("/founding-partners.html", async (_req, res) => {
        const page = await readFile("public/founding-partners.html", "utf8");
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(page);
      });
      attachMiddleware(server.middlewares, server.config.logger);
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/founding-partners" || req.url === "/founding-partner-collection") {
          req.url = "/founding-partners.html";
        }
        next();
      });
      server.middlewares.use("/founding-partners.html", async (_req, res) => {
        const page = await readFile("dist/founding-partners.html", "utf8");
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(page);
      });
      attachMiddleware(server.middlewares, server.config.logger);
    },
  };
}

function cloudflareAssetLimit() {
  const oversizedOriginals = new Set([
    "assets-originals/buildings/404-rio-grande.pdf",
    "assets-originals/buildings/quincy.pdf",
  ]);

  return {
    name: "downtown-perks-cloudflare-asset-limit",
    enforce: "post",
    async writeBundle() {
      await mkdir("dist", { recursive: true });
      await cp("public", "dist", {
        recursive: true,
        filter: (source) => {
          const relative = source.replace(/^public\//, "").replace(`${process.cwd()}/public/`, "");
          return !oversizedOriginals.has(relative);
        },
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { googleMapsApiKey, googleMapsMapId } = normalizeGoogleMapsEnv(mode);
  assertProductionGoogleMapsEnv(mode, googleMapsApiKey);

  return {
  logLevel: 'error', // Suppress warnings, only show errors
  publicDir: mode === 'production' ? false : 'public',
  // Keep this app's optimized dependency graph isolated from stale preview chunks.
  cacheDir: 'node_modules/.vite-base44-single-react',
  resolve: {
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
    cloudflareAssetLimit(),
    localApiRoutes(),
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      // visualEditAgent uses @babel/generator which deoptimises files >500KB (Map.jsx is ~950KB).
      // Disabled to prevent the ~90s cold-start stall on every dev server restart.
      visualEditAgent: false
    }),
    react(),
  ]
  };
});
