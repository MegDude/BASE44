import { workspaceModules } from "@/config/workspaceModuleRegistry";

export const partnerWorkspaceRouteRegistry = workspaceModules.map((module) => ({
  id: module.id,
  path: module.href,
  destination: module.destination,
  requiredPermission: module.permissions?.[0] || "workspace:view",
  preservesScope: true,
}));

export function getPartnerWorkspaceRoute(moduleId: string) {
  return partnerWorkspaceRouteRegistry.find((route) => route.id === moduleId);
}
