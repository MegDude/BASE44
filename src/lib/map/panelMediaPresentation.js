export const PANEL_MEDIA_FALLBACK = "/images/imported/perks/places-nearby.png";

export function handlePanelMediaError(event, fallbackSrc = PANEL_MEDIA_FALLBACK) {
  const media = event.currentTarget;
  if (!media || media.dataset.panelFallbackApplied === "true") return;

  media.dataset.panelFallbackApplied = "true";
  media.src = media.dataset.fallbackSrc || fallbackSrc;
}
