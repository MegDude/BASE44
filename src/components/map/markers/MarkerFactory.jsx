/**
 * Downtown Perks Marker Factory
 * Unified marker rendering system for all entity types
 * Uses the shared mapIconRegistry SVG icon system through resolveEntityPin.
 */

import L from 'leaflet';
import { resolveEntityPin } from '@/lib/map/entityPinResolver';

const SIZES = {
  default: 34,
  building: 36,
  selected: 1.25, // scale multiplier
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
  stroke: #0B1F33;
  fill: none;
`;

const PIN_SVG_STYLE_LG = `
  width: 18px;
  height: 18px;
  display: block;
  flex-shrink: 0;
  stroke: #BFA46A;
  fill: none;
`;

/**
 * Inject inline style onto the SVG string returned by pinAssetRegistry.
 * The registry SVGs use currentColor; we set stroke directly for consistency.
 */
function styledGlyph(pin, large = false) {
  if (!pin?.glyph) return '';
  if (pin.asset) {
    return `<img class="dp-pin-logo dp-live-pin__legends-logo" src="${pin.asset}" alt="" aria-hidden="true" style="width:${large ? 22 : 19}px;height:${large ? 22 : 19}px;display:block;object-fit:contain;" />`;
  }

  // Replace the opening <svg tag to add inline style
  const style = large ? PIN_SVG_STYLE_LG : PIN_SVG_STYLE;
  return pin.glyph.replace(
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
      border-radius: 999px;
      background: rgba(255,255,255,0.96);
      border: 1px solid rgba(191,164,106,0.72);
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
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
 * Create a selected marker icon (slightly larger, gold ring accent)
 * Selected pins keep the same circular style with a stronger gold edge.
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
      border-radius: 999px;
      background: #0B1F33;
      border: 1px solid #BFA46A;
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: translateY(-1px);
      animation: dpPinSelect 0.2s cubic-bezier(0.22,1,0.36,1);
      overflow: hidden;
      color: #BFA46A;
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
  const pillGlyph = pin.asset
    ? `<img class="dp-pin-logo dp-live-pin__legends-logo" src="${pin.asset}" alt="" aria-hidden="true" style="width:16px;height:16px;display:block;object-fit:contain;" />`
    : pin.glyph.replace(
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
