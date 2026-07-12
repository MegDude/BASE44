export const viewportMatrix = [
  { name: "compact-phone", width: 320, height: 700 },
  { name: "iphone-15", width: 393, height: 852 },
  { name: "large-phone", width: 430, height: 932 },
  { name: "compact-embed", width: 480, height: 720 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "compact-desktop", width: 1024, height: 720 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide-desktop", width: 1728, height: 1117 },
] as const;

export type ViewportMatrixItem = (typeof viewportMatrix)[number];
