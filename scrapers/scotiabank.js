const { pendiente } = require('./pendiente');

// TODO: conectar la fuente real de Scotiabank. Mientras tanto no se publican montos.
async function scrapeScotiabank() {
  return pendiente('Scotiabank');
}

module.exports = { scrapeScotiabank };
