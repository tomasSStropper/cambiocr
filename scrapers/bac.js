const { pendiente } = require('./pendiente');

// TODO: conectar la fuente real de BAC. Mientras tanto no se publican montos.
async function scrapeBac() {
  return pendiente('BAC');
}

module.exports = { scrapeBac };
