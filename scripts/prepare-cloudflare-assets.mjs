import { rm, stat } from "node:fs/promises";

const unusedSourceDocuments = [
  "dist/assets-originals/buildings/404-rio-grande.pdf",
  "dist/assets-originals/buildings/quincy.pdf",
];

for (const file of unusedSourceDocuments) {
  const details = await stat(file).catch(() => null);
  if (details?.isFile()) await rm(file);
}
