const { pendiente } = require('./pendiente');

// TODO: conectar la fuente real de Popular. Mientras tanto no se publican montos.
async function scrapePopular() {
  return pendiente('Popular');
}

module.exports = { scrapePopular };
