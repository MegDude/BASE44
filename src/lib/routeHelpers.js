export function createExploreLink({
  type,
  intent,
  time,
  radius,
  saved,
  district,
  category,
  q,
} = {}) {
  const params = new URLSearchParams();

  const entries = {
    type,
    intent,
    time,
    radius,
    district,
    category,
    q,
  };

  Object.entries(entries).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  if (saved) {
    params.set("saved", "true");
  }

  const query = params.toString();
  return query ? `/explore?${query}` : "/explore";
}
