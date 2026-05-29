/**
 * Downtown Perks Marker Factory
 * Unified marker rendering system for all entity types
 * Ensures consistent visual language across the product
 */

import L from 'leaflet';

/**
 * Marker configuration library
 * Aligned with Downtown Perks brand system
 */
const MARKER_CONFIG = {
  // Standard venues (coffee, dining, retail, etc.)
  'standard:restaurant': {
    color: '#B38F4F', // Gold
    icon: '🍽️',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(200, 151, 58, 0.4)',
  },
  'standard:coffee': {
    color: '#B38F4F',
    icon: '☕',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(11, 31, 51, 0.18)',
  },
  'standard:bar': {
    color: '#0B1F33',
    icon: '🍷',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(11, 31, 51, 0.18)',
  },
  'standard:fitness': {
    color: '#081521',
    icon: '💪',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(11, 31, 51, 0.18)',
  },
  'standard:wellness': {
    color: '#B38F4F',
    icon: '🧘',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(11, 31, 51, 0.18)',
  },
  'standard:retail': {
    color: '#081521',
    icon: '🛍️',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(11, 31, 51, 0.18)',
  },
  'standard:entertainment': {
    color: '#0B1F33',
    icon: '🎭',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(11, 31, 51, 0.18)',
  },

  // Buildings and properties (navy with building icon)
  'building:default': {
    color: '#0B1F33',
    icon: '🏢',
    size: 16,
    iconSize: 10,
    selectedScale: 1.8,
    shadowBlur: '0 4px 12px rgba(11, 31, 51, 0.18)',
  },

  // Events
  'event:default': {
    color: '#B38F4F',
    icon: '📅',
    size: 14,
    iconSize: 8,
    selectedScale: 2.0,
    shadowBlur: '0 3px 8px rgba(11, 31, 51, 0.18)',
  },

  // Perks
  'perk:default': {
    color: '#B38F4F',
    icon: '🏷️',
    size: 14,
    iconSize: 8,
    selectedScale: 2.0,
    shadowBlur: '0 3px 8px rgba(11, 31, 51, 0.18)',
  },

  // Brands
  'brand:default': {
    color: '#B38F4F',
    icon: '⭐',
    size: 14,
    iconSize: 8,
    selectedScale: 2.0,
    shadowBlur: '0 3px 8px rgba(11, 31, 51, 0.18)',
  },

  // Civic
  'civic:default': {
    color: '#081521',
    icon: '🏛️',
    size: 14,
    iconSize: 8,
    selectedScale: 2.0,
    shadowBlur: '0 3px 8px rgba(11, 31, 51, 0.18)',
  },
};

/**
 * Get marker configuration for an entity
 */
function getMarkerConfig(entity) {
  // Try category-specific config first
  const categoryKey = `${entity.markerType}:${entity.category || entity.type}`;
  if (MARKER_CONFIG[categoryKey]) {
    return MARKER_CONFIG[categoryKey];
  }

  // Fall back to type-specific config
  const typeKey = `${entity.markerType}:default`;
  if (MARKER_CONFIG[typeKey]) {
    return MARKER_CONFIG[typeKey];
  }

  // Ultimate fallback
  return MARKER_CONFIG['standard:restaurant'];
}

/**
 * Create a compact marker icon (unselected state)
 */
export function createCompactMarker(entity) {
  const config = getMarkerConfig(entity);

  const html = `
    <div style="
      width: ${config.size}px;
      height: ${config.size}px;
      border-radius: 50%;
      background-color: ${config.color};
      border: 2px solid white;
      box-shadow: ${config.shadowBlur};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${config.iconSize}px;
      cursor: pointer;
      transition: transform 0.2s ease;
    ">
      ${config.icon}
    </div>
  `;

  return L.divIcon({
    className: '',
    html,
    iconSize: [config.size, config.size],
    iconAnchor: [config.size / 2, config.size / 2],
    popupAnchor: [0, -config.size / 2],
  });
}

/**
 * Create a selected marker icon (larger, highlighted)
 */
export function createSelectedMarker(entity) {
  const config = getMarkerConfig(entity);
  const selectedSize = config.size * config.selectedScale;
  const selectedIconSize = config.iconSize * config.selectedScale;

  const html = `
    <div style="
      width: ${selectedSize}px;
      height: ${selectedSize}px;
      border-radius: 50%;
      background-color: ${config.color};
      border: 3px solid white;
      box-shadow: 
        0 0 0 2px ${config.color}40,
        ${config.shadowBlur};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${selectedIconSize}px;
      cursor: pointer;
      animation: markerPulse 0.5s ease-out;
    ">
      ${config.icon}
    </div>
    <style>
      @keyframes markerPulse {
        0% {
          transform: scale(0.8);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    </style>
  `;

  return L.divIcon({
    className: '',
    html,
    iconSize: [selectedSize, selectedSize],
    iconAnchor: [selectedSize / 2, selectedSize / 2],
    popupAnchor: [0, -selectedSize / 2],
  });
}

/**
 * Create a pill marker (for detail/expanded state)
 * Shows entity name and category
 */
export function createPillMarker(entity) {
  const config = getMarkerConfig(entity);

  const html = `
    <div style="
      background: white;
      border: 2px solid ${config.color};
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
      <span style="font-size: 14px;">${config.icon}</span>
      <span>${entity.name}</span>
    </div>
  `;

  return L.divIcon({
    className: '',
    html,
    iconSize: [200, 32], // Approximate, will auto-size
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
  const colors = {};

  Object.entries(MARKER_CONFIG).forEach(([key, config]) => {
    const [markerType, category] = key.split(':');
    colors[`${markerType}:${category}`] = config.color;
  });

  return colors;
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
