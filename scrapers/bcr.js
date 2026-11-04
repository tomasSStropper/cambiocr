const { pendiente } = require('./pendiente');

// TODO: conectar la fuente real de BCR. Mientras tanto no se publican montos.
async function scrapeBcr() {
  return pendiente('BCR');
}

module.exports = { scrapeBcr };
