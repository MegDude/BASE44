import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
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

function localApiRoutes() {
  async function runLocalHandler(req, res, handlerPath, logger, errorMessage) {
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", async () => {
      try {
        const { default: handler } = await import(pathToFileURL(`${process.cwd()}/${handlerPath}`).href);
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

    middlewares.use("/api/stripe/create-checkout-session", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      runLocalHandler(req, res, "./api/stripe/create-checkout-session-local.js", logger, "Local checkout handler failed");
    });
  };

  return {
    name: "downtown-perks-local-api-routes",
    configureServer(server) {
      attachMiddleware(server.middlewares, server.config.logger);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares, server.config.logger);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { googleMapsApiKey, googleMapsMapId } = normalizeGoogleMapsEnv(mode);

  return {
  logLevel: 'error', // Suppress warnings, only show errors
  define: {
    "import.meta.env.VITE_GOOGLE_MAPS_API_KEY": JSON.stringify(googleMapsApiKey),
    "import.meta.env.VITE_GOOGLE_MAP_ID": JSON.stringify(googleMapsMapId),
    "import.meta.env.VITE_GOOGLE_MAPS_MAP_ID": JSON.stringify(googleMapsMapId),
  },
  plugins: [
    localApiRoutes(),
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ]
  };
});
