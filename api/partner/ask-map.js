function parsePartnerQuestion(question = '') {
  const text = String(question).toLowerCase();
  return {
    district: ['rainey', 'seaholm', 'congress', 'waterloo'].find((district) => text.includes(district)) || 'Downtown Core',
    timeWindow: text.includes('tonight') ? 'tonight' : text.includes('lunch') ? 'lunch' : 'today',
    entityType: text.includes('hotel') ? 'hotel' : text.includes('building') ? 'property' : text.includes('event') ? 'event' : 'venue',
    campaignType: text.includes('perk') || text.includes('offer') ? 'perk' : text.includes('event') ? 'event' : 'visibility',
    moment: text.includes('after work') ? 'after-work' : text.includes('weekend') ? 'this-weekend' : 'around-the-corner',
    radius: text.includes('5-minute') ? 400 : 800,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const { partnerId, question } = req.body || {};
  if (!partnerId) return res.status(401).json({ error: 'partnerId is required' });
  const params = parsePartnerQuestion(question);
  return res.status(200).json({
    partnerId,
    params,
    answer: 'Start with one clear offer or event near the strongest walking area, then review saves, scans, and directions.',
  });
}

