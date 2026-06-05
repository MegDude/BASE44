import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function localAskMapApi() {
  const attachMiddleware = (middlewares, logger) => {
    middlewares.use("/api/ask-map", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      let rawBody = "";
      req.on("data", (chunk) => {
        rawBody += chunk;
      });
      req.on("end", async () => {
        try {
          const { default: handler } = await import("./api/ask-map.js");
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
          res.end(JSON.stringify({ error: "Local ask-map handler failed" }));
        }
      });
    });
  };

  return {
    name: "downtown-perks-local-ask-map-api",
    configureServer(server) {
      attachMiddleware(server.middlewares, server.config.logger);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares, server.config.logger);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    localAskMapApi(),
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
});
