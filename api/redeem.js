export default function handler(_req, res) {
  res.setHeader("Deprecation", "true");
  return res.status(410).json({
    error: "This redemption route has been replaced by secure resident QR sessions and partner confirmation.",
  });
}
