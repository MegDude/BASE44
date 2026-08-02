export const PANEL_MEDIA_FALLBACK = "/images/imported/perks/places-nearby.png";

export function handlePanelMediaError(event, fallbackSrc = PANEL_MEDIA_FALLBACK) {
  const media = event.currentTarget;
  if (!media) return;

  if (media.dataset.panelFallbackApplied === "true") {
    media.hidden = true;
    media.removeAttribute("src");
    media.closest("figure")?.setAttribute("data-media-unavailable", "true");
    return;
  }

  const fallback = media.dataset.fallbackSrc || fallbackSrc;
  if (!fallback || fallback === media.currentSrc || fallback === media.getAttribute("src")) {
    media.dataset.panelFallbackApplied = "true";
    media.hidden = true;
    media.removeAttribute("src");
    media.closest("figure")?.setAttribute("data-media-unavailable", "true");
    return;
  }

  media.dataset.panelFallbackApplied = "true";
  media.src = fallback;
}
