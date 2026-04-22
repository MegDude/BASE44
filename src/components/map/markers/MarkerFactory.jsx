import L from 'leaflet';

const COLORS = {
  accent: '#C6A85A',
  accentSoft: 'rgba(198,168,90,0.16)',
  accentLine: '#D7BF84',
  navy: '#0B1A2B',
  navySoft: 'rgba(11,26,43,0.14)',
  navyDeep: '#14263B',
  civic: '#18314A',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F4F8',
  stroke: 'rgba(11,26,43,0.16)',
};

const SHADOW = 'filter:drop-shadow(0 8px 16px rgba(11,26,43,0.12))';
const ACTIVE_SHADOW = 'filter:drop-shadow(0 12px 22px rgba(11,26,43,0.18))';

function wrapPin(
  innerSvg,
  {
    width = 32,
    height = 42,
    active = false,
    className = 'custom-marker',
    live = false,
    topRanked = false,
    trending = false,
  } = {}
) {
  return L.divIcon({
    className,
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:${width}px;height:${height}px;transform:${active ? 'translateY(-2px) scale(1.07)' : topRanked ? 'translateY(-1px) scale(1.03)' : 'translateY(0) scale(1)'};transition:transform .2s ease, filter .2s ease;">
      ${innerSvg}
    </div>`,
    iconSize: [width, height],
    iconAnchor: [Math.round(width / 2), Math.round(height * 0.84)],
    popupAnchor: [0, -Math.round(height * 0.84)],
  });
}

function makePerkIcon(active = false) {
  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${active ? COLORS.navyDeep : COLORS.surface}" stroke="${active ? COLORS.accentLine : COLORS.stroke}" stroke-width="1.2"/>
      <path d="M12 8.2L13.35 10.95L16.4 11.4L14.2 13.55L14.72 16.55L12 15.12L9.28 16.55L9.8 13.55L7.6 11.4L10.65 10.95L12 8.2Z" fill="${active ? COLORS.accentLine : COLORS.accent}"/>
    </svg>`,
    { active, className: 'custom-marker perk-marker-icon' }
  );
}

function makeEventIcon(active = false) {
  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${active ? COLORS.navyDeep : COLORS.surface}" stroke="${active ? COLORS.accentLine : COLORS.stroke}" stroke-width="1.2"/>
      <path d="M9 9.5H15V12.5H9z" fill="${active ? COLORS.surfaceAlt : COLORS.navy}" opacity="0.14"/>
      <path d="M9 7.8V10.2" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M15 7.8V10.2" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.4" stroke-linecap="round"/>
      <rect x="8.2" y="9.4" width="7.6" height="5.8" rx="1.4" fill="${active ? COLORS.accentLine : COLORS.navy}"/>
      <path d="M8.8 11.4H15.2" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
    </svg>`,
    { active, className: 'custom-marker event-marker-icon' }
  );
}

function makePlaceIcon(active = false) {
  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${active ? COLORS.navyDeep : COLORS.surface}" stroke="${active ? COLORS.accentLine : COLORS.stroke}" stroke-width="1.2"/>
      <circle cx="12" cy="10.5" r="3.1" fill="${active ? COLORS.accentLine : COLORS.navy}"/>
      <circle cx="12" cy="10.5" r="1.15" fill="${active ? COLORS.navyDeep : 'rgba(255,255,255,0.92)'}"/>
    </svg>`,
    { active, className: 'custom-marker place-marker-icon' }
  );
}

function makeDiningIcon(active = false) {
  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${active ? COLORS.navyDeep : COLORS.surface}" stroke="${active ? COLORS.accentLine : COLORS.stroke}" stroke-width="1.2"/>
      <path d="M10 8.2V12.7" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M12 8.2V12.7" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M14.6 8.2C14.6 9.7 13.8 10.5 13.1 10.9V12.8" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    { active, className: 'custom-marker dining-marker-icon' }
  );
}

function makeHotelIcon(active = false) {
  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${active ? COLORS.navyDeep : COLORS.surface}" stroke="${active ? COLORS.accentLine : COLORS.stroke}" stroke-width="1.2"/>
      <path d="M10 8.3V12.8" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M14 8.3V12.8" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M10 10.55H14" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.9" stroke-linecap="round"/>
    </svg>`,
    { active, className: 'custom-marker hotel-marker-icon' }
  );
}

function makeCivicIcon(active = false) {
  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${active ? COLORS.civic : COLORS.surface}" stroke="${active ? COLORS.accentLine : COLORS.stroke}" stroke-width="1.2"/>
      <path d="M8.5 13.7H15.5" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M9.3 13.7V10.2L12 8.5L14.7 10.2V13.7" stroke="${active ? COLORS.accentLine : COLORS.navy}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    { active, className: 'custom-marker civic-marker-icon' }
  );
}

function makeBuildingIcon(active = false) {
  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${active ? COLORS.navyDeep : COLORS.surfaceAlt}" stroke="${active ? COLORS.accentLine : COLORS.stroke}" stroke-width="1.2"/>
      <circle cx="12" cy="10.5" r="2.5" fill="${active ? COLORS.accentLine : COLORS.navy}"/>
    </svg>`,
    { active, className: 'custom-marker building-marker-icon' }
  );
}

function makeBrandIcon(active = false) {
  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${active ? COLORS.navyDeep : COLORS.surface}" stroke="${active ? COLORS.accentLine : COLORS.stroke}" stroke-width="1.2"/>
      <path d="M12 8.2L13.35 10.95L16.4 11.4L14.2 13.55L14.72 16.55L12 15.12L9.28 16.55L9.8 13.55L7.6 11.4L10.65 10.95L12 8.2Z" fill="${active ? COLORS.accentLine : COLORS.accent}"/>
    </svg>`,
    { active, className: 'custom-marker brand-marker-icon' }
  );
}

function makeMomentIcon(active = false) {
  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${active ? COLORS.navyDeep : COLORS.surface}" stroke="${active ? COLORS.accentLine : COLORS.stroke}" stroke-width="1.2"/>
      <path d="M12.9 8.2L9.6 12.1H12.05L11.1 15.95L14.45 11.95H12.05L12.9 8.2Z" fill="${active ? COLORS.accentLine : COLORS.navy}"/>
    </svg>`,
    { active, className: 'custom-marker moment-marker-icon' }
  );
}

function makeInsightIcon(active = false, state = 'medium') {
  const stateFill = {
    high: '#0B1A2B',
    medium: '#22405C',
    low: '#8AA0B6',
    spike: '#C6A85A',
    opportunity: '#2F6F55',
  }[state] || '#22405C';

  const coreFill = active ? '#F7F9FC' : '#FFFFFF';

  return wrapPin(
    `<svg width="28" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;${active ? ACTIVE_SHADOW : SHADOW}">
      <path d="M12 21C12 21 18 15.6 18 10.5C18 7.46243 15.3137 5 12 5C8.68629 5 6 7.46243 6 10.5C6 15.6 12 21 12 21Z" fill="${stateFill}" stroke="${active ? COLORS.accentLine : 'rgba(255,255,255,0.92)'}" stroke-width="1.2"/>
      <circle cx="12" cy="10.5" r="3.1" fill="${coreFill}"/>
      <circle cx="12" cy="10.5" r="1.3" fill="${stateFill}"/>
    </svg>`,
    { active, className: `custom-marker insight-marker-icon insight-${state}` }
  );
}

function createPillMarker(entity) {
  const label = String(entity?.name || entity?.title || 'Downtown place');
  const bg = entity?.type === 'building' || entity?.type === 'hotel' || entity?.type === 'property'
    ? 'rgba(20,38,59,0.95)'
    : 'rgba(255,255,255,0.96)';
  const border = entity?.type === 'building' || entity?.type === 'hotel' || entity?.type === 'property'
    ? 'rgba(198,168,90,0.64)'
    : 'rgba(11,26,43,0.10)';
  const textColor = bg.includes('255') ? COLORS.navy : '#F7F9FC';
  const dot = bg.includes('255') ? COLORS.accent : COLORS.accentLine;

  return L.divIcon({
    className: 'pill-marker',
    html: `<div style="position:relative;display:inline-flex;align-items:center;gap:5px;padding:6px 11px 6px 9px;background:${bg};border:1.5px solid ${border};border-radius:22px;box-shadow:0 6px 18px rgba(11,31,51,0.16);white-space:nowrap;font-family:Inter,system-ui,sans-serif;font-size:11px;font-weight:600;color:${textColor};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);">
      <span style="width:6px;height:6px;border-radius:50%;background:${dot};flex-shrink:0;display:inline-block"></span>
      <span>${label}</span>
    </div>`,
    iconSize: null,
    iconAnchor: [0, 0],
    popupAnchor: [0, -32],
  });
}

function getVenueVariant(entity) {
  const raw = `${entity?.iconType || entity?.category || entity?.subcategory || ''}`.toLowerCase();
  if (raw.includes('coffee') || raw.includes('cafe')) return 'coffee';
  if (
    raw.includes('restaurant') ||
    raw.includes('dining') ||
    raw.includes('food') ||
    raw.includes('bar') ||
    raw.includes('nightlife')
  ) {
    return 'dining';
  }
  if (raw.includes('hotel')) return 'hotel';
  if (raw.includes('civic') || raw.includes('landmark')) return 'civic';
  return 'place';
}

export function createCompactMarker(entity) {
  const active = false;
  if (entity?.performanceState) return makeInsightIcon(active, entity.performanceState);
  if (entity?.markerType === 'moment' || entity?.type === 'moment') return makeMomentIcon(active);
  if (entity?.markerType === 'perk' || entity?.type === 'perk' || entity?.perk || entity?.perk_value) return makePerkIcon(active);
  if (entity?.markerType === 'event' || entity?.type === 'event') return makeEventIcon(active);
  if (entity?.type === 'hotel') return makeHotelIcon(active);
  if (entity?.markerType === 'building' || ['building', 'property'].includes(entity?.type)) return makeBuildingIcon(active);
  if (entity?.markerType === 'brand' || entity?.type === 'brand') return makeBrandIcon(active);
  if (entity?.markerType === 'civic' || entity?.type === 'civic') return makeCivicIcon(active);

  const venueVariant = getVenueVariant(entity);
  if (venueVariant === 'coffee') return makePlaceIcon(active);
  if (venueVariant === 'dining') return makeDiningIcon(active);
  if (venueVariant === 'hotel') return makeHotelIcon(active);
  if (venueVariant === 'civic') return makeCivicIcon(active);
  return makePlaceIcon(active);
}

export function createSelectedMarker(entity) {
  if (entity?.performanceState) return makeInsightIcon(true, entity.performanceState);
  if (entity?.markerType === 'moment' || entity?.type === 'moment') return makeMomentIcon(true);
  if (entity?.markerType === 'perk' || entity?.type === 'perk' || entity?.perk || entity?.perk_value) return makePerkIcon(true);
  if (entity?.markerType === 'event' || entity?.type === 'event') return makeEventIcon(true);
  if (entity?.type === 'hotel') return makeHotelIcon(true);
  if (entity?.markerType === 'building' || ['building', 'property'].includes(entity?.type)) return makeBuildingIcon(true);
  if (entity?.markerType === 'brand' || entity?.type === 'brand') return makeBrandIcon(true);
  if (entity?.markerType === 'civic' || entity?.type === 'civic') return makeCivicIcon(true);

  const venueVariant = getVenueVariant(entity);
  if (venueVariant === 'coffee') return makePlaceIcon(true);
  if (venueVariant === 'dining') return makeDiningIcon(true);
  if (venueVariant === 'hotel') return makeHotelIcon(true);
  if (venueVariant === 'civic') return makeCivicIcon(true);
  return makePlaceIcon(true);
}

export function createMarker(entity, options = {}) {
  if (options?.showPill) return createPillMarker(entity);
  if (options?.isSelected) return createSelectedMarker(entity);
  return createCompactMarker(entity);
}

export function getMarkerColors() {
  return {
    standard: COLORS.navy,
    building: COLORS.navy,
    event: COLORS.accent,
    perk: COLORS.accent,
    brand: COLORS.navyDeep,
    civic: COLORS.civic,
  };
}

export function getMarkerVariant(entity) {
  if (entity?.isLive) return 'live';
  if (entity?.isSaved) return 'saved';
  if (entity?.perk?.isActive) return 'perk-active';
  return 'default';
}
