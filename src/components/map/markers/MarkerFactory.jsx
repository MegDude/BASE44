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
    color: '#C8973A', // Gold
    icon: '🍽️',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(200, 151, 58, 0.4)',
  },
  'standard:coffee': {
    color: '#8B6F47', // Deep brown
    icon: '☕',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(139, 111, 71, 0.4)',
  },
  'standard:bar': {
    color: '#9C5BA3', // Wine/purple
    icon: '🍷',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(156, 91, 163, 0.4)',
  },
  'standard:fitness': {
    color: '#2ECC71', // Teal/green
    icon: '💪',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(46, 204, 113, 0.4)',
  },
  'standard:wellness': {
    color: '#A67BC4', // Soft purple
    icon: '🧘',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(166, 123, 196, 0.4)',
  },
  'standard:retail': {
    color: '#7D7D7D', // Neutral gray
    icon: '🛍️',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(125, 125, 125, 0.4)',
  },
  'standard:entertainment': {
    color: '#3498DB', // Light blue
    icon: '🎭',
    size: 12,
    iconSize: 8,
    selectedScale: 2.2,
    shadowBlur: '0 2px 6px rgba(52, 152, 219, 0.4)',
  },

  // Buildings and properties (navy with building icon)
  'building:default': {
    color: '#1A3A52', // Navy
    icon: '🏢',
    size: 16,
    iconSize: 10,
    selectedScale: 1.8,
    shadowBlur: '0 4px 12px rgba(26, 58, 82, 0.5)',
  },

  // Events (light blue with calendar)
  'event:default': {
    color: '#4A90E2', // Event blue
    icon: '📅',
    size: 14,
    iconSize: 8,
    selectedScale: 2.0,
    shadowBlur: '0 3px 8px rgba(74, 144, 226, 0.4)',
  },

  // Perks (green with tag)
  'perk:default': {
    color: '#27AE60', // Perk green
    icon: '🏷️',
    size: 14,
    iconSize: 8,
    selectedScale: 2.0,
    shadowBlur: '0 3px 8px rgba(39, 174, 96, 0.4)',
  },

  // Brands (orange with star)
  'brand:default': {
    color: '#E67E22', // Brand orange
    icon: '⭐',
    size: 14,
    iconSize: 8,
    selectedScale: 2.0,
    shadowBlur: '0 3px 8px rgba(230, 126, 34, 0.4)',
  },

  // Civic (red with landmark)
  'civic:default': {
    color: '#C0392B', // Civic red
    icon: '🏛️',
    size: 14,
    iconSize: 8,
    selectedScale: 2.0,
    shadowBlur: '0 3px 8px rgba(192, 57, 43, 0.4)',
  },

  'insight:engagement': {
    color: '#C8973A',
    icon: '',
    size: 16,
    iconSize: 0,
    selectedScale: 1.9,
    shadowBlur: '0 0 0 5px rgba(200, 151, 58, 0.18), 0 10px 24px rgba(11, 31, 51, 0.18)',
  },
  'insight:campaign': {
    color: '#315E7E',
    icon: '',
    size: 16,
    iconSize: 0,
    selectedScale: 1.9,
    shadowBlur: '0 0 0 5px rgba(49, 94, 126, 0.16), 0 10px 24px rgba(11, 31, 51, 0.18)',
  },
  'insight:opportunity': {
    color: '#2F6F55',
    icon: '',
    size: 16,
    iconSize: 0,
    selectedScale: 1.9,
    shadowBlur: '0 0 0 5px rgba(47, 111, 85, 0.16), 0 10px 24px rgba(11, 31, 51, 0.18)',
  },
  'insight:coverage': {
    color: '#7B6B4F',
    icon: '',
    size: 16,
    iconSize: 0,
    selectedScale: 1.9,
    shadowBlur: '0 0 0 5px rgba(123, 107, 79, 0.16), 0 10px 24px rgba(11, 31, 51, 0.18)',
  },
  'insight:performance': {
    color: '#0B1F33',
    icon: '',
    size: 16,
    iconSize: 0,
    selectedScale: 1.9,
    shadowBlur: '0 0 0 5px rgba(11, 31, 51, 0.14), 0 10px 24px rgba(11, 31, 51, 0.18)',
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
      color: #1a3a52;
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
