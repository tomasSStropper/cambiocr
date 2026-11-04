// Pruebas del cliente SDDE sin internet: se reemplaza fetch por uno falso.
const test = require('node:test');
const assert = require('node:assert/strict');

const bccr = require('../lib/bccr');

function respuestaSdde(codigo, puntos) {
  return {
    estado: true,
    mensaje: 'Consulta exitosa',
    datos: [{ codigoIndicador: codigo, nombreIndicador: 'Tipo de cambio', series: puntos }]
  };
}

function conFetchFalso(manejador, fn) {
  const original = global.fetch;
  const llamadas = [];
  global.fetch = async (url, opciones) => {
    llamadas.push({ url: String(url), opciones });
    return manejador(String(url));
  };
  return Promise.resolve(fn(llamadas)).finally(() => {
    global.fetch = original;
  });
}

const ok = (json) => ({ ok: true, status: 200, json: async () => json });

test('parsearSerie ignora valores nulos y ordena por fecha', () => {
  const puntos = bccr.parsearSerie(
    respuestaSdde('318', [
      { fecha: '2026-11-03T00:00:00', valorDatoPorPeriodo: 513.4 },
      { fecha: '2026-11-02', valorDatoPorPeriodo: 512.75 },
      { fecha: '2026-11-01', valorDatoPorPeriodo: null }
    ])
  );
  assert.deepEqual(puntos, [
    { fecha: '2026-11-02', valor: 512.75 },
    { fecha: '2026-11-03', valor: 513.4 }
  ]);
});

test('parsearSerie lanza error cuando estado es false', () => {
  assert.throws(() => bccr.parsearSerie({ estado: false, mensaje: 'Token invalido' }), /Token invalido/);
});

test('unirCompraVenta solo deja dias con ambos valores', () => {
  const unidos = bccr.unirCompraVenta(
    [{ fecha: '2026-11-02', valor: 505.5 }, { fecha: '2026-11-03', valor: 506.25 }],
    [{ fecha: '2026-11-03', valor: 513.4 }]
  );
  assert.deepEqual(unidos, [{ date: '2026-11-03', buy: 506.25, sell: 513.4 }]);
});

test('sin BCCR_TOKEN no se llama a la red', async () => {
  delete process.env.BCCR_TOKEN;
  await conFetchFalso(
    () => assert.fail('no deberia llamar a fetch'),
    async () => {
      await assert.rejects(bccr.obtenerReferencia(), (e) => e.code === 'SIN_TOKEN');
    }
  );
});

test('obtenerReferencia usa Bearer, no pone el token en la URL y toma el dia mas reciente', async () => {
  process.env.BCCR_TOKEN = 'token-de-prueba';
  await conFetchFalso(
    (url) => {
      const compra = url.includes('/indicadoresEconomicos/317/');
      return ok(
        respuestaSdde(compra ? '317' : '318', [
          { fecha: '2026-11-02', valorDatoPorPeriodo: compra ? 505.5 : 512.75 },
          { fecha: '2026-11-03', valorDatoPorPeriodo: compra ? 506.25 : 513.4 }
        ])
      );
    },
    async (llamadas) => {
      const ref = await bccr.obtenerReferencia();
      assert.deepEqual(ref, { date: '2026-11-03', buy: 506.25, sell: 513.4 });
      assert.equal(llamadas.length, 2);
      for (const { url, opciones } of llamadas) {
        assert.ok(url.startsWith(bccr.SDDE_BASE));
        assert.match(url, /fechaInicio=\d{4}%2F\d{2}%2F\d{2}/);
        assert.ok(!url.includes('token-de-prueba'));
        assert.equal(opciones.headers.Authorization, 'Bearer token-de-prueba');
      }
    }
  );
  delete process.env.BCCR_TOKEN;
});

test('HTTP 401 se reporta como error HTTP', async () => {
  process.env.BCCR_TOKEN = 'vencido';
  await conFetchFalso(
    () => ({ ok: false, status: 401, json: async () => ({}) }),
    async () => {
      await assert.rejects(bccr.obtenerHistorial(7), (e) => e.code === 'HTTP' && /401/.test(e.message));
    }
  );
  delete process.env.BCCR_TOKEN;
});
