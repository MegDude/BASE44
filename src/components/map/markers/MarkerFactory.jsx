/**
 * Downtown Perks Marker Factory
 * Unified marker rendering system for all entity types
 * Uses the shared mapIconRegistry SVG icon system through resolveEntityPin.
 */

import L from 'leaflet';
import { resolveEntityPin } from '@/lib/map/entityPinResolver';
import { getCanonicalMapGlyph } from '@/lib/map/mapIconRegistry';

const SIZES = {
  default: 32,
  building: 32,
  selected: 1,
};

/**
 * Inline styles for the SVG inside a pin.
 * SVG pins sit directly on the map, so the icon uses navy by default.
 */
const PIN_SVG_STYLE = `
  width: 15px;
  height: 15px;
  display: block;
  flex-shrink: 0;
  stroke: #C8A96A;
  fill: none;
`;

const PIN_SVG_STYLE_LG = `
  width: 15px;
  height: 15px;
  display: block;
  flex-shrink: 0;
  stroke: #0B1F33;
  fill: none;
`;

/**
 * Inject inline style onto the SVG string returned by pinAssetRegistry.
 * The registry SVGs use currentColor; we set stroke directly for consistency.
 */
function styledGlyph(pin, large = false) {
  if (!pin?.glyph) return '';
  const style = large ? PIN_SVG_STYLE_LG : PIN_SVG_STYLE;
  return getCanonicalMapGlyph(pin).replace(
    '<svg ',
    `<svg style="${style}" `
  );
}

/**
 * Create a compact marker icon (unselected state)
 * Circular location pin using the shared icon registry.
 */
export function createCompactMarker(entity) {
  const pin = resolveEntityPin(entity);
  const size = entity.markerType === 'building' ? SIZES.building : SIZES.default;
  const glyph = styledGlyph(pin);

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 12px;
      background: #0B1F33;
      border: 1.25px solid rgba(200,169,106,0.92);
      box-shadow: 0 5px 14px rgba(11,31,51,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      overflow: hidden;
      color: #C8A96A;
    ">
      ${glyph}
    </div>
  `;

  return L.divIcon({
    className: '',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

/**
 * Create a selected marker icon with the same footprint and a reversed palette.
 */
export function createSelectedMarker(entity) {
  const pin = resolveEntityPin(entity);
  const baseSize = entity.markerType === 'building' ? SIZES.building : SIZES.default;
  const size = Math.round(baseSize * SIZES.selected);
  const glyph = styledGlyph(pin, true);

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 12px;
      background: #C8A96A;
      border: 1.25px solid #0B1F33;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.94), 0 7px 16px rgba(11,31,51,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: none;
      overflow: hidden;
      color: #0B1F33;
    ">
      ${glyph}
    </div>
  `;

  return L.divIcon({
    className: '',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

/**
 * Expanded marker requests reuse the same selected pin footprint.
 */
export function createPillMarker(entity) {
  return createSelectedMarker(entity);
}

/**
 * Marker factory function
 * Returns appropriate marker based on state and entity type
 */
export function createMarker(entity, options = {}) {
  if (options?.showPill) {
    return createPillMarker(entity);
  }

  if (options?.isSelected) {
    return createSelectedMarker(entity);
  }

  return createCompactMarker(entity);
}

/**
 * Get all available marker colors (for legend, filters, etc.)
 */
export function getMarkerColors() {
  // All pins are navy — category distinguished by icon only
  return { default: '#0B1F33' };
}

/**
 * Check if entity should have a special marker variant
 */
export function getMarkerVariant(entity) {
  if (entity.isLive) return 'live';
  if (entity.isSaved) return 'saved';
  if (entity.perk && entity.perk.isActive) return 'perk-active';
  return 'default';
}
