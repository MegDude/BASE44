const RESIDENTIAL_DOMAIN = /^[a-z0-9.-]+\.(residents|living|apartments|condos|homes|building)$/i;
const APPROVED_DOMAINS = new Set([
  'springaustin.com',
  'theindependentaustin.com',
  'seaholmresidences.com',
]);

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const { email = '', buildingDomain = '' } = req.body || {};
  const domain = String(buildingDomain || email.split('@')[1] || '').toLowerCase().trim();
  const verified = APPROVED_DOMAINS.has(domain) || RESIDENTIAL_DOMAIN.test(domain);
  return res.status(200).json({ verified, domain });
}

