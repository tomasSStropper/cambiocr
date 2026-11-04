const { obtenerReferencia } = require('../lib/bccr');

// Tipo de cambio de referencia del BCCR (unica fuente que el sitio publica).
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let bccr;
  try {
    const ref = await obtenerReferencia();
    bccr = { available: true, buy: ref.buy, sell: ref.sell, date: ref.date };
  } catch (error) {
    bccr = { available: false, reason: error.code || 'ERROR', message: error.message };
  }

  // Cache en el borde de Vercel: el BCCR publica una vez al dia; 10 min es de sobra fresco.
  res.setHeader('Cache-Control', bccr.available ? 'public, s-maxage=600, stale-while-revalidate=3600' : 'no-store');
  res.status(200).json({ updatedAt: new Date().toISOString(), bccr });
};
