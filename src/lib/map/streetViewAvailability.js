export function streetViewUrl({ lat, lng, pano } = {}) {
  const params = new URLSearchParams({ api: "1", map_action: "pano" });
  if (pano) params.set("pano", String(pano));
  if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    params.set("viewpoint", `${Number(lat)},${Number(lng)}`);
  }
  return `https://www.google.com/maps/@?${params.toString()}`;
}

export function getStreetViewCoverage(maps, position, { radius = 50 } = {}) {
  const lat = Number(position?.lat);
  const lng = Number(position?.lng);
  if (!maps?.StreetViewService || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const service = new maps.StreetViewService();
    const request = {
      location: { lat, lng },
      radius,
      ...(maps.StreetViewSource?.OUTDOOR ? { source: maps.StreetViewSource.OUTDOOR } : {}),
    };

    service.getPanorama(request, (data, status) => {
      const okStatus = maps.StreetViewStatus?.OK || "OK";
      const pano = data?.location?.pano || "";
      if (status === okStatus && pano) {
        resolve({
          pano,
          lat,
          lng,
          url: streetViewUrl({ lat, lng, pano }),
        });
        return;
      }
      resolve(null);
    });
  });
}
