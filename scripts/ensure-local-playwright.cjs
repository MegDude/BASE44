const fs = require("fs");
const path = require("path");

const localPlaywright = path.join(
  process.cwd(),
  "node_modules",
  "@playwright",
  "test",
);

if (!fs.existsSync(localPlaywright)) {
  throw new Error(
    "Local Playwright is not installed. Run `npm install` followed by `npx playwright install`.",
  );
}
