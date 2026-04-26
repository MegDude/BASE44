import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");
const port = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(filePath).pipe(res);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });
}

async function parseRequestBody(req) {
  const rawBody = await readRequestBody(req);
  if (!rawBody) return {};

  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  return rawBody;
}

function attachResponseHelpers(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (payload) => {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    res.end(JSON.stringify(payload));
    return res;
  };

  res.send = (payload) => {
    if (typeof payload === "object" && payload !== null) {
      return res.json(payload);
    }
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
    }
    res.end(String(payload));
    return res;
  };

  return res;
}

const API_ROUTE_MAP = new Map([
  ["/api/archive-manifest", "./api/archive-manifest.js"],
  ["/api/archive-search", "./api/archive-search.js"],
  ["/api/ask-map", "./api/ask-map.js"],
  ["/api/card-capture", "./api/card-capture.js"],
  ["/api/civic-dashboard", "./api/civic-dashboard.js"],
  ["/api/dashboard-snapshot", "./api/dashboard-snapshot.js"],
  ["/api/impression", "./api/impression.js"],
  ["/api/partner-intake", "./api/partner-intake.js"],
  ["/api/partner-insights", "./api/partner-insights.js"],
  ["/api/places", "./api/places.js"],
  ["/api/redeem", "./api/redeem.js"],
  ["/api/save", "./api/save.js"],
  ["/api/search-log", "./api/search-log.js"],
  ["/api/venue-intel-capture", "./api/venue-intel-capture.js"],
  ["/api/visit", "./api/visit.js"],
  ["/api/heatmap", "./api/heatmap.js"],
  ["/api/track", "./api/track.js"],
  ["/api/submissions", "./api/submissions.js"],
  ["/api/map-data", "./api/map-data.js"],
]);

async function handleApiRoute(req, res, requestUrl) {
  const routeModule = API_ROUTE_MAP.get(requestUrl.pathname);
  if (!routeModule) {
    return false;
  }

  try {
    const moduleUrl = new URL(routeModule, import.meta.url);
    const { default: handler } = await import(moduleUrl.href);
    req.query = Object.fromEntries(requestUrl.searchParams.entries());
    req.body = await parseRequestBody(req);
    attachResponseHelpers(res);
    await handler(req, res);
    if (!res.writableEnded) {
      res.end();
    }
  } catch (error) {
    console.error(`API route failed for ${requestUrl.pathname}:`, error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    }
    if (!res.writableEnded) {
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown API error",
        })
      );
    }
  }

  return true;
}

async function resolvePath(urlPath) {
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(distPath, safePath);

  if (existsSync(requestedPath)) {
    const requestedStat = await stat(requestedPath);
    if (requestedStat.isFile()) return requestedPath;
  }

  return path.join(distPath, "index.html");
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const handledApi = await handleApiRoute(req, res, requestUrl);
    if (handledApi) {
      return;
    }
    const filePath = await resolvePath(requestUrl.pathname);
    sendFile(res, filePath);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Server error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on ${port}`);
});
