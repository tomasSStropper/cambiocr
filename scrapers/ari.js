const { pendiente } = require('./pendiente');

// TODO: conectar la fuente real de ARI. Mientras tanto no se publican montos.
async function scrapeAri() {
  return pendiente('ARI');
}

module.exports = { scrapeAri };
