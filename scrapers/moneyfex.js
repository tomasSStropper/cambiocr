const { pendiente } = require('./pendiente');

// TODO: conectar la fuente real de Moneyfex. Mientras tanto no se publican montos.
async function scrapeMoneyfex() {
  return pendiente('Moneyfex');
}

module.exports = { scrapeMoneyfex };
