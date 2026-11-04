// Entidad cuya fuente real todavia no esta conectada.
// No devuelve numeros: un tipo de cambio inventado es informacion financiera falsa.
function pendiente(bank) {
  return { bank, pending: true, status: 'PENDIENTE' };
}

module.exports = { pendiente };
