// Pruebas de las reglas puras del cliente (app.js). No necesitan navegador ni internet.
const test = require('node:test');
const assert = require('node:assert/strict');
const { calcular, etiquetaResultado, leerMonto, leerEnlace, historialCsv } = require('../app.js');

const tc = { buy: 503.77, sell: 510.47 };

test('compro dolares escribiendo en dolares: paga colones al tipo de venta', () => {
  assert.deepEqual(calcular('buy', 'usd', 100, tc), { valor: 51047, moneda: 'crc', tasa: 510.47 });
});

test('vendo dolares escribiendo en dolares: recibe colones al tipo de compra', () => {
  assert.equal(calcular('sell', 'usd', 250, tc).valor, 125942.5);
});

test('escribiendo en colones se obtiene el monto en dolares con la misma tasa', () => {
  assert.deepEqual(calcular('buy', 'crc', 50000, tc), { valor: 97.95, moneda: 'usd', tasa: 510.47 });
  assert.equal(calcular('sell', 'crc', 50000, tc).valor, 99.25);
});

test('ida y vuelta (intercambiar) devuelve el monto original', () => {
  const ida = calcular('sell', 'usd', 250, tc).valor;
  assert.equal(calcular('sell', 'crc', ida, tc).valor, 250);
});

test('la etiqueta del resultado depende de la operacion y la moneda', () => {
  assert.equal(etiquetaResultado('buy', 'usd'), 'calc_you_pay');
  assert.equal(etiquetaResultado('buy', 'crc'), 'calc_you_get');
  assert.equal(etiquetaResultado('sell', 'usd'), 'calc_you_get');
  assert.equal(etiquetaResultado('sell', 'crc'), 'calc_you_sell');
});

test('leerMonto acepta formatos de Costa Rica y de EE. UU.', () => {
  assert.equal(leerMonto('1.250,50'), 1250.5);
  assert.equal(leerMonto('1,250.50'), 1250.5);
  assert.equal(leerMonto('120,5'), 120.5);
  assert.equal(leerMonto(''), 0);
  assert.equal(leerMonto('abc'), null);
});

test('leerEnlace toma solo valores validos del enlace compartido', () => {
  assert.deepEqual(leerEnlace('?monto=250&modo=sell&moneda=crc'), { monto: 250, modo: 'sell', moneda: 'crc' });
  assert.deepEqual(leerEnlace('?monto=-5&modo=robar&moneda=eur'), {});
  assert.deepEqual(leerEnlace(''), {});
});

test('historialCsv usa punto decimal y una fila por dia', () => {
  const csv = historialCsv([{ date: '2026-11-05', buy: 503.7, sell: 510.47 }], 'fecha,compra,venta');
  assert.equal(csv, 'fecha,compra,venta\n2026-11-05,503.70,510.47\n');
});
