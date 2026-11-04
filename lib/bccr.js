// Capa de datos: cliente de la API SDDE del Banco Central de Costa Rica.
//
// Es el UNICO archivo de CambioYa que sabe como se habla con el BCCR
// (URL, encabezado Bearer, formato de fechas y forma del JSON).
// Los endpoints de /api solo llaman a obtenerReferencia() y obtenerHistorial().

const SDDE_BASE = 'https://apim.bccr.fi.cr/SDDE/api/Bccr.GE.SDDE.Publico.Indicadores.API';
const INDICADOR_COMPRA = '317';
const INDICADOR_VENTA = '318';
const ZONA_CR = 'America/Costa_Rica';

class BccrError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'BccrError';
    this.code = code; // SIN_TOKEN | HTTP | RESPUESTA | SIN_DATOS | RED
  }
}

function leerToken() {
  const token = (process.env.BCCR_TOKEN || '').trim();
  if (!token) {
    throw new BccrError('BCCR_TOKEN no esta configurado', 'SIN_TOKEN');
  }
  return token;
}

// Fecha de hoy en Costa Rica como AAAA-MM-DD (en-CA da ese formato).
function hoyCR() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_CR }).format(new Date());
}

function restarDias(fechaIso, dias) {
  const d = new Date(`${fechaIso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

// La API pide aaaa/mm/dd.
const aFormatoBccr = (fechaIso) => fechaIso.replace(/-/g, '/');

// Convierte { estado, mensaje, datos: [ { series: [ { fecha, valorDatoPorPeriodo } ] } ] }
// en [{ fecha: 'AAAA-MM-DD', valor: Number }] ordenado por fecha.
function parsearSerie(json) {
  if (!json || typeof json !== 'object') {
    throw new BccrError('Respuesta del BCCR invalida', 'RESPUESTA');
  }
  if (json.estado === false) {
    throw new BccrError(`BCCR: ${json.mensaje || 'consulta sin exito'}`, 'RESPUESTA');
  }
  const puntos = [];
  for (const indicador of Array.isArray(json.datos) ? json.datos : []) {
    for (const p of Array.isArray(indicador.series) ? indicador.series : []) {
      const valor = Number(p.valorDatoPorPeriodo);
      if (p.fecha && p.valorDatoPorPeriodo !== null && Number.isFinite(valor)) {
        puntos.push({ fecha: String(p.fecha).slice(0, 10), valor });
      }
    }
  }
  return puntos.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

async function obtenerSerie(indicador, desde, hasta) {
  const token = leerToken();
  const params = new URLSearchParams({
    fechaInicio: aFormatoBccr(desde),
    fechaFin: aFormatoBccr(hasta),
    idioma: 'ES'
  });
  const url = `${SDDE_BASE}/indicadoresEconomicos/${indicador}/series?${params}`;

  let respuesta;
  try {
    // El token viaja en el encabezado, nunca en la URL (las URLs quedan en logs).
    respuesta = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
  } catch (error) {
    throw new BccrError(`No se pudo contactar al BCCR: ${error.message}`, 'RED');
  }
  if (!respuesta.ok) {
    throw new BccrError(`El BCCR respondio HTTP ${respuesta.status}`, 'HTTP');
  }
  return parsearSerie(await respuesta.json());
}

// Une compra y venta por fecha; solo quedan los dias que tienen ambos valores.
function unirCompraVenta(compras, ventas) {
  const ventaPorFecha = new Map(ventas.map((p) => [p.fecha, p.valor]));
  return compras
    .filter((p) => ventaPorFecha.has(p.fecha))
    .map((p) => ({ date: p.fecha, buy: p.valor, sell: ventaPorFecha.get(p.fecha) }));
}

async function obtenerHistorial(dias) {
  const hasta = hoyCR();
  const desde = restarDias(hasta, dias - 1);
  const [compras, ventas] = await Promise.all([
    obtenerSerie(INDICADOR_COMPRA, desde, hasta),
    obtenerSerie(INDICADOR_VENTA, desde, hasta)
  ]);
  return unirCompraVenta(compras, ventas);
}

// Tipo de cambio de referencia mas reciente (busca hasta 10 dias atras por fines de semana).
async function obtenerReferencia() {
  const puntos = await obtenerHistorial(10);
  if (!puntos.length) {
    throw new BccrError('El BCCR no tiene datos para los ultimos dias', 'SIN_DATOS');
  }
  return puntos[puntos.length - 1];
}

module.exports = {
  obtenerReferencia,
  obtenerHistorial,
  BccrError,
  // expuestos para pruebas
  parsearSerie,
  unirCompraVenta,
  SDDE_BASE
};
