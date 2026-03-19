module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const range = Math.min(Number(req.query.range || 7), 30);
  const points = Array.from({ length: range }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (range - index - 1));
    return {
      date: d.toISOString().slice(5, 10),
      buy: Number((509.5 + Math.random() * 2).toFixed(2)),
      sell: Number((520.2 + Math.random() * 2).toFixed(2))
    };
  });

  res.status(200).json({ range, points });
};
