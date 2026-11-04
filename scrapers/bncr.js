const { pendiente } = require('./pendiente');

// TODO: conectar la fuente real de BNCR. Mientras tanto no se publican montos.
async function scrapeBncr() {
  return pendiente('BNCR');
}

module.exports = { scrapeBncr };
