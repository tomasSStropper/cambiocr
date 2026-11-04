const { obtenerHistorial } = require('../lib/bccr');

const RANGOS = new Set([7, 15, 30]);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pedido = Number((req.query && req.query.range) || 7);
  const range = RANGOS.has(pedido) ? pedido : 7;

  try {
    const points = await obtenerHistorial(range);
    res.status(200).json({ range, points });
  } catch (error) {
    // Sin token o sin conexion: se dice claramente, no se inventan datos.
    res.status(503).json({ range, points: [], error: error.code || 'ERROR', message: error.message });
  }
};
