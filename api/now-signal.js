export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const districts = ['Rainey', 'Seaholm', 'Congress', 'Waterloo', 'Downtown Core'];
  let tick = 0;

  const send = () => {
    const district = districts[tick % districts.length];
    const payload = {
      district,
      moment: tick % 2 === 0 ? 'after-work' : 'tonight',
      nearbyActivityCount: 120 + ((tick * 17) % 80),
      timestamp: new Date().toISOString(),
    };
    res.write(`event: now-signal\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    tick += 1;
  };

  send();
  const timer = setInterval(send, 5000);
  req.on('close', () => clearInterval(timer));
}

