/**
 * Downtown Perks Marker Factory
 * Unified marker rendering system for all entity types
 * Sharp glass map marker language: base, ring, active pulse.
 */

import L from 'leaflet';

const MARKER_CONFIG = {
  'standard:restaurant': {
    color: '#C69532',
    icon: '•',
    size: 18,
    selectedScale: 1.45,
    label: 'Dining',
  },
  'standard:coffee': {
    color: '#8B6F47',
    icon: '•',
    size: 18,
    selectedScale: 1.45,
    label: 'Coffee',
  },
  'standard:bar': {
    color: '#8B4FA3',
    icon: '•',
    size: 18,
    selectedScale: 1.45,
    label: 'Nightlife',
  },
  'standard:fitness': {
    color: '#2E8B57',
    icon: '•',
    size: 18,
    selectedScale: 1.45,
    label: 'Fitness',
  },
  'standard:wellness': {
    color: '#5A8F78',
    icon: '•',
    size: 18,
    selectedScale: 1.45,
    label: 'Wellness',
  },
  'standard:retail': {
    color: '#7B5FA8',
    icon: '•',
    size: 18,
    selectedScale: 1.45,
    label: 'Retail',
  },
  'standard:entertainment': {
    color: '#B94545',
    icon: '•',
    size: 18,
    selectedScale: 1.45,
    label: 'Event',
  },
  'building:default': {
    color: '#071C2F',
    icon: '▪',
    size: 20,
    selectedScale: 1.42,
    label: 'Building',
  },
  'event:default': {
    color: '#B94545',
    icon: '•',
    size: 19,
    selectedScale: 1.5,
    label: 'Event',
  },
  'perk:default': {
    color: '#2E8B57',
    icon: '•',
    size: 19,
    selectedScale: 1.5,
    label: 'Perk',
  },
  'brand:default': {
    color: '#C69532',
    icon: '•',
    size: 19,
    selectedScale: 1.5,
    label: 'Brand',
  },
  'civic:default': {
    color: '#476A8E',
    icon: '•',
    size: 19,
    selectedScale: 1.5,
    label: 'Civic',
  },
};

function getMarkerConfig(entity) {
  const categoryKey = `${entity.markerType}:${entity.category || entity.type}`;
  if (MARKER_CONFIG[categoryKey]) return MARKER_CONFIG[categoryKey];

  const typeKey = `${entity.markerType}:default`;
  if (MARKER_CONFIG[typeKey]) return MARKER_CONFIG[typeKey];

  return MARKER_CONFIG['standard:restaurant'];
}

function markerHtml(entity, { selected = false, pill = false } = {}) {
  const config = getMarkerConfig(entity);
  const size = Math.round(config.size * (selected ? config.selectedScale : 1));
  const glow = selected || entity.isLive || entity.eventTiming?.isLive;
  const pulse = selected || entity.isLive || entity.eventTiming?.isLive;

  if (pill) {
    return `
      <div class="dp-marker-pill" style="--marker-color:${config.color};">
        <span class="dp-marker-dot"></span>
        <span>${entity.name || entity.title || config.label}</span>
      </div>
    `;
  }

  return `
    <div class="dp-marker-wrap ${selected ? 'is-selected' : ''} ${pulse ? 'is-live' : ''}" style="--marker-color:${config.color}; width:${size}px; height:${size}px;">
      <span class="dp-marker-ring"></span>
      <span class="dp-marker-core">${config.icon}</span>
    </div>
    <style>
      .dp-marker-wrap {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transform-origin: center;
        transition: transform 160ms ease, filter 160ms ease;
      }
      .dp-marker-wrap:hover { transform: scale(1.06); }
      .dp-marker-ring {
        position: absolute;
        inset: -5px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--marker-color) 16%, transparent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--marker-color) 28%, transparent), 0 8px 18px rgba(15,23,42,0.14);
      }
      .dp-marker-core {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--marker-color);
        border: 2px solid rgba(255,255,255,0.95);
        color: white;
        font-size: 12px;
        line-height: 1;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 4px 14px rgba(15,23,42,0.18);
      }
      .dp-marker-wrap.is-selected .dp-marker-ring {
        inset: -9px;
        background: color-mix(in srgb, var(--marker-color) 22%, transparent);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--marker-color) 34%, transparent), 0 0 24px color-mix(in srgb, var(--marker-color) 32%, transparent), 0 14px 28px rgba(15,23,42,0.18);
      }
      .dp-marker-wrap.is-live .dp-marker-ring { animation: dpMarkerPulse 1.8s ease-out infinite; }
      .dp-marker-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        border-radius: 999px;
        padding: 8px 12px;
        background: rgba(255,255,255,0.82);
        border: 1px solid rgba(15,23,42,0.10);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.64), 0 8px 20px rgba(15,23,42,0.12);
        backdrop-filter: blur(12px);
        color: #071c2f;
        font-size: 12px;
        font-weight: 800;
      }
      .dp-marker-dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: var(--marker-color);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--marker-color) 14%, transparent);
      }
      @keyframes dpMarkerPulse {
        0% { transform: scale(0.82); opacity: 0.64; }
        72% { transform: scale(1.35); opacity: 0; }
        100% { transform: scale(1.35); opacity: 0; }
      }
    </style>
  `;
}

export function createCompactMarker(entity) {
  const config = getMarkerConfig(entity);
  const html = markerHtml(entity);

  return L.divIcon({
    className: '',
    html,
    iconSize: [config.size, config.size],
    iconAnchor: [config.size / 2, config.size / 2],
    popupAnchor: [0, -config.size / 2],
  });
}

export function createSelectedMarker(entity) {
  const config = getMarkerConfig(entity);
  const selectedSize = config.size * config.selectedScale;
  const html = markerHtml(entity, { selected: true });

  return L.divIcon({
    className: '',
    html,
    iconSize: [selectedSize, selectedSize],
    iconAnchor: [selectedSize / 2, selectedSize / 2],
    popupAnchor: [0, -selectedSize / 2],
  });
}

export function createPillMarker(entity) {
  const html = markerHtml(entity, { pill: true });

  return L.divIcon({
    className: '',
    html,
    iconSize: [220, 36],
    iconAnchor: [110, 18],
    popupAnchor: [0, -34],
  });
}

export function createMarker(entity, options = {}) {
  if (options?.showPill) return createPillMarker(entity);
  if (options?.isSelected) return createSelectedMarker(entity);
  return createCompactMarker(entity);
}

export function getMarkerColors() {
  const colors = {};
  Object.entries(MARKER_CONFIG).forEach(([key, config]) => {
    const [markerType, category] = key.split(':');
    colors[`${markerType}:${category}`] = config.color;
  });
  return colors;
}

export function getMarkerVariant(entity) {
  if (entity.isLive || entity.eventTiming?.isLive) return 'live';
  if (entity.isSaved) return 'saved';
  if (entity.perk && entity.perk.isActive) return 'perk-active';
  return 'default';
}
