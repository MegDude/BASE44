export default function handler(_req, res) {
  res.setHeader("Deprecation", "true");
  res.setHeader("Link", '</api/resident/saved>; rel="successor-version"');
  return res.status(410).json({
    error: "This save route has been replaced. Sign in and use the resident saved-items route.",
    successor: "/api/resident/saved",
  });
}
