/**
 * Downtown Perks Marker Factory
 * Unified marker rendering system for all entity types
 * Uses the pinAssetRegistry SVG icon system — no emoji.
 */

import L from 'leaflet';
import { resolveEntityPin } from '@/lib/map/entityPinResolver';

// Design system: pins are the icon/logo itself. No filled circles, boxes,
// cards, or solid backplates behind map pins.
const SIZES = {
  default: 28,
  building: 30,
  selected: 1.25, // scale multiplier
};

/**
 * Inline styles for the SVG inside a pin.
 * SVG pins sit directly on the map, so the icon uses navy by default.
 */
const PIN_SVG_STYLE = `
  width: 14px;
  height: 14px;
  display: block;
  flex-shrink: 0;
  stroke: #0B1F33;
  fill: none;
`;

const PIN_SVG_STYLE_LG = `
  width: 17px;
  height: 17px;
  display: block;
  flex-shrink: 0;
  stroke: #C8A96A;
  fill: none;
`;

/**
 * Inject inline style onto the SVG string returned by pinAssetRegistry.
 * The registry SVGs use currentColor; we set stroke directly for consistency.
 */
function styledGlyph(glyph, large = false) {
  if (!glyph) return '';
  // Replace the opening <svg tag to add inline style
  const style = large ? PIN_SVG_STYLE_LG : PIN_SVG_STYLE;
  return glyph.replace(
    '<svg ',
    `<svg style="${style}" `
  );
}

/**
 * Create a compact marker icon (unselected state)
 * Transparent hit area with only the SVG/icon visible on the map.
 */
export function createCompactMarker(entity) {
  const pin = resolveEntityPin(entity);
  const size = entity.markerType === 'building' ? SIZES.building : SIZES.default;
  const iconSize = size - 14; // padding inside circle
  const glyph = styledGlyph(pin.glyph);

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 0;
      background: transparent;
      border: 0;
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      overflow: hidden;
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
 * Create a selected marker icon (slightly larger, gold ring accent)
 * Selected pins use the gold icon color only. No halo, ring, or filled backplate.
 */
export function createSelectedMarker(entity) {
  const pin = resolveEntityPin(entity);
  const baseSize = entity.markerType === 'building' ? SIZES.building : SIZES.default;
  const size = Math.round(baseSize * SIZES.selected);
  const glyph = styledGlyph(pin.glyph, true);

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 0;
      background: transparent;
      border: 0;
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: translateY(-1px);
      animation: dpPinSelect 0.2s cubic-bezier(0.22,1,0.36,1);
      overflow: hidden;
    ">
      ${glyph}
    </div>
    <style>
      @keyframes dpPinSelect {
        from { transform: scale(0.85) translateY(0); opacity: 0.6; }
        to   { transform: scale(1) translateY(-1px); opacity: 1; }
      }
    </style>
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
 * Create a pill marker (for detail/expanded state)
 * Shows entity name and category icon
 */
export function createPillMarker(entity) {
  const pin = resolveEntityPin(entity);
  const pillGlyph = pin.glyph.replace(
    '<svg ',
    `<svg style="width:14px;height:14px;display:block;flex-shrink:0;stroke:#0B1F33;fill:none;" `
  );

  const html = `
    <div style="
      background: white;
      border: 2px solid #0B1F33;
      border-radius: 20px;
      padding: 6px 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 600;
      color: #0B1F33;
      display: flex;
      align-items: center;
      gap: 6px;
    ">
      ${pillGlyph}
      <span>${entity.name}</span>
    </div>
  `;

  return L.divIcon({
    className: '',
    html,
    iconSize: [200, 32],
    iconAnchor: [100, 16],
    popupAnchor: [0, -32],
  });
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
