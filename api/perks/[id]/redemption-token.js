export default function handler(_req, res) {
  res.setHeader("Deprecation", "true");
  res.setHeader("Link", '</api/resident/qr-session>; rel="successor-version"');
  return res.status(410).json({
    error: "Permanent redemption payloads are no longer accepted. Refresh the perk to create a short-lived resident QR.",
    successor: "/api/resident/qr-session",
  });
}
