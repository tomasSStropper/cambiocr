// CambioYa · cliente
// Organizado por capas, igual que en el backend:
//   1. Textos (i18n)   2. Estado   3. Datos (fetch a /api)   4. Reglas del negocio
//   5. Formato         6. Render (DOM)   7. Eventos e inicio
// Solo la capa de Datos sabe de URLs; solo Render toca el DOM.
// Los datos se pintan con textContent (nunca innerHTML) para evitar inyeccion de HTML.

/* ============ 1. Textos ============ */
const TEXTOS = {
  es: {
    skip: 'Saltar al contenido',
    nav_calc: 'Calculadora',
    nav_history: 'Historial',
    hero_title: 'El mejor cambio, sin buscar.',
    hero_sub: 'El tipo de cambio oficial del Banco Central, una calculadora clara y el historial del dólar.',
    hero_cta: 'Calcular',
    hero_cta2: 'Ver historial',
    ref_title: 'Referencia BCCR',
    ref_error: 'No pudimos conectar con el Banco Central. Intenta de nuevo en unos minutos.',
    retry: 'Reintentar',
    buy: 'Compra',
    sell: 'Venta',
    spread: 'Diferencial',
    vs_prev: 'frente a ayer',
    calc_title: 'Calculadora',
    calc_buy: 'Compro dólares',
    calc_sell: 'Vendo dólares',
    calc_label_usd: 'Monto en dólares',
    calc_label_crc: 'Monto en colones',
    swap_to_crc: 'Escribir en colones',
    swap_to_usd: 'Escribir en dólares',
    calc_you_sell: 'Necesitas vender',
    quick_label: 'Montos rápidos',
    copy: 'Copiar',
    share: 'Compartir',
    copied: 'Resultado copiado',
    link_copied: 'Enlace copiado',
    copy_error: 'No se pudo copiar',
    nothing_to_copy: 'Escribe un monto primero',
    csv: 'CSV',
    csv_label: 'Descargar historial en CSV',
    csv_done: 'Historial descargado',
    csv_empty: 'No hay historial para descargar',
    csv_head: 'fecha,compra,venta',
    live_loading: 'Consultando al Banco Central…',
    live_ready: 'Datos del BCCR · actualizado {t}',
    live_now: 'justo ahora',
    live_error: 'Sin conexión con el BCCR',
    features_label: 'Por qué CambioYa',
    feat1_title: 'Fuente oficial',
    feat1_text: 'Datos directos de la API del Banco Central de Costa Rica.',
    feat2_title: 'En ambas direcciones',
    feat2_text: 'Convierte de dólares a colones o de colones a dólares.',
    feat3_title: 'Comparte tu cálculo',
    feat3_text: 'Copia el resultado o envía un enlace con el monto listo.',
    calc_help: 'Usa coma o punto para los decimales, por ejemplo 1.250,50.',
    calc_invalid: 'Escribe un monto válido, por ejemplo 120,50.',
    calc_none: 'Sin datos',
    calc_you_pay: 'Pagas',
    calc_you_get: 'Recibes',
    calc_rule_buy: 'Calculado con el tipo de venta de referencia del BCCR ({tasa}), porque al comprar dólares te los venden. Tu banco puede usar un tipo distinto.',
    calc_rule_sell: 'Calculado con el tipo de compra de referencia del BCCR ({tasa}), porque al vender dólares te los compran. Tu banco puede usar un tipo distinto.',
    calc_no_data: 'La referencia del BCCR no está disponible en este momento.',
    chart_title: 'Historial del BCCR',
    chart_7: '7 días',
    chart_15: '15 días',
    chart_30: '30 días',
    history_error: 'El historial no está disponible en este momento.',
    stat_min: 'Venta mínima',
    stat_max: 'Venta máxima',
    stat_change: 'Cambio en el período',
    alert_title: 'Alertas del tipo de cambio',
    alert_sub: 'Las alertas automáticas están en construcción. Déjanos tu correo y te avisamos cuando estén listas.',
    alert_label: 'Correo electrónico',
    alert_btn: 'Avisarme',
    alert_invalid: 'Revisa el correo: parece incompleto.',
    alert_ok: 'Listo. Te escribimos cuando las alertas estén activas.',
    alert_error: 'No pudimos registrar tu correo. Intenta de nuevo.',
    footer_disclaimer: 'Los tipos de cambio son referenciales. CambioYa no es una entidad financiera.',
    footer_source: 'Fuente oficial:',
    theme: 'Cambiar tema',
    lang: 'EN, ver en inglés',
    brand_label: 'CambioYa, inicio',
    op_label: 'Operación',
    range_label: 'Rango del historial',
    chart_label: 'Gráfico del tipo de cambio de compra y venta del BCCR',
    refresh: 'Actualizar datos'
  },
  en: {
    skip: 'Skip to content',
    nav_calc: 'Calculator',
    nav_history: 'History',
    hero_title: 'The best rate, without searching.',
    hero_sub: 'The official Central Bank exchange rate, a clear calculator and the dollar history.',
    hero_cta: 'Calculate',
    hero_cta2: 'See history',
    ref_title: 'BCCR reference',
    ref_error: 'We could not reach the Central Bank. Please try again in a few minutes.',
    retry: 'Retry',
    buy: 'Buy',
    sell: 'Sell',
    spread: 'Spread',
    vs_prev: 'vs yesterday',
    calc_title: 'Calculator',
    calc_buy: "I'm buying dollars",
    calc_sell: "I'm selling dollars",
    calc_label_usd: 'Amount in dollars',
    calc_label_crc: 'Amount in colones',
    swap_to_crc: 'Type in colones',
    swap_to_usd: 'Type in dollars',
    calc_you_sell: 'You need to sell',
    quick_label: 'Quick amounts',
    copy: 'Copy',
    share: 'Share',
    copied: 'Result copied',
    link_copied: 'Link copied',
    copy_error: 'Could not copy',
    nothing_to_copy: 'Enter an amount first',
    csv: 'CSV',
    csv_label: 'Download history as CSV',
    csv_done: 'History downloaded',
    csv_empty: 'There is no history to download',
    csv_head: 'date,buy,sell',
    live_loading: 'Checking the Central Bank…',
    live_ready: 'BCCR data · updated {t}',
    live_now: 'just now',
    live_error: 'No connection to the BCCR',
    features_label: 'Why CambioYa',
    feat1_title: 'Official source',
    feat1_text: 'Data straight from the Central Bank of Costa Rica API.',
    feat2_title: 'Both directions',
    feat2_text: 'Convert dollars to colones or colones to dollars.',
    feat3_title: 'Share your result',
    feat3_text: 'Copy the result or send a link with the amount ready.',
    calc_help: 'Use a dot or a comma for decimals, for example 1,250.50.',
    calc_invalid: 'Enter a valid amount, for example 120.50.',
    calc_none: 'No data',
    calc_you_pay: 'You pay',
    calc_you_get: 'You get',
    calc_rule_buy: 'Calculated with the BCCR reference sell rate ({tasa}), because when you buy dollars they are sold to you. Your bank may use a different rate.',
    calc_rule_sell: 'Calculated with the BCCR reference buy rate ({tasa}), because when you sell dollars they are bought from you. Your bank may use a different rate.',
    calc_no_data: 'The BCCR reference is not available right now.',
    chart_title: 'BCCR history',
    chart_7: '7 days',
    chart_15: '15 days',
    chart_30: '30 days',
    history_error: 'The history is not available right now.',
    stat_min: 'Lowest sell',
    stat_max: 'Highest sell',
    stat_change: 'Change in period',
    alert_title: 'Exchange rate alerts',
    alert_sub: 'Automatic alerts are under construction. Leave your email and we will let you know when they are ready.',
    alert_label: 'Email',
    alert_btn: 'Notify me',
    alert_invalid: 'Check the email: it looks incomplete.',
    alert_ok: "Done. We'll write when alerts are live.",
    alert_error: 'We could not save your email. Please try again.',
    footer_disclaimer: 'Exchange rates are for reference only. CambioYa is not a financial institution.',
    footer_source: 'Official source:',
    theme: 'Toggle theme',
    lang: 'ES, ver en español',
    brand_label: 'CambioYa, home',
    op_label: 'Operation',
    range_label: 'History range',
    chart_label: 'Chart of the BCCR buy and sell exchange rate',
    refresh: 'Refresh data'
  }
};

/* ============ 2. Estado ============ */
const estado = {
  idioma: 'es',
  modo: 'buy', // buy = compro dolares, sell = vendo dolares
  moneda: 'usd', // moneda en la que el usuario escribe el monto: usd | crc
  rango: 7,
  bccr: null, // { buy, sell, date } o null si no hay dato
  historial: [], // [{ date, buy, sell }]
  actualizadoEn: null, // momento (ms) de la ultima consulta exitosa
  grafico: null,
  claveGrafico: '', // tema|idioma|ancho: si cambia, el grafico se reconstruye
  pedidoHistorial: 0, // para descartar respuestas viejas si el usuario cambia de rango rapido
  ocupado: false
};

const MONTOS_RAPIDOS = {
  usd: [20, 50, 100, 500, 1000],
  crc: [10000, 25000, 50000, 100000, 500000]
};

const t = (clave) => TEXTOS[estado.idioma][clave] ?? clave;
const $ = (id) => document.getElementById(id);
const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ 3. Datos ============ */
async function pedirJson(url, opciones) {
  const respuesta = await fetch(url, opciones);
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(cuerpo.message || `HTTP ${respuesta.status}`);
    error.cuerpo = cuerpo;
    throw error;
  }
  return cuerpo;
}

const api = {
  tasas: () => pedirJson('/api/rates'),
  historial: (rango) => pedirJson(`/api/history?range=${rango}`),
  alerta: (email) =>
    pedirJson('/api/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
};

/* ============ 4. Reglas del negocio ============ */
// Misma regla que SIFAC: si compras dolares, te los VENDEN (tipo de venta);
// si vendes dolares, te los COMPRAN (tipo de compra).
function tasaPara(modo, tipoCambio) {
  return modo === 'buy' ? tipoCambio.sell : tipoCambio.buy;
}

const redondear = (n) => Math.round(n * 100) / 100;

function convertir(usd, tasa) {
  return redondear(usd * tasa);
}

// Conversion en cualquier direccion. La tasa depende solo de la operacion (compro/vendo),
// no de la moneda en que se escribe: asi ida y vuelta dan el mismo resultado.
function calcular(modo, moneda, monto, tipoCambio) {
  const tasa = tasaPara(modo, tipoCambio);
  return moneda === 'usd'
    ? { valor: convertir(monto, tasa), moneda: 'crc', tasa }
    : { valor: redondear(monto / tasa), moneda: 'usd', tasa };
}

// Que significa el resultado segun la operacion y la moneda de entrada.
function etiquetaResultado(modo, moneda) {
  if (modo === 'buy') return moneda === 'usd' ? 'calc_you_pay' : 'calc_you_get';
  return moneda === 'usd' ? 'calc_you_get' : 'calc_you_sell';
}

// Acepta formatos de Costa Rica y de EE. UU.: 1.000 | 1,000 | 1.250,50 | 1,250.50 | 120,5.
// El ultimo separador es decimal solo si lo siguen 1 o 2 digitos; los demas son de miles.
function leerMonto(texto) {
  const s = String(texto).replace(/\s/g, '');
  if (s === '') return 0;
  if (!/^\d[\d.,]*$/.test(s) || /[.,]{2}/.test(s)) return null;
  const [, entero, decimales] = s.match(/^(.*?)(?:[.,](\d{1,2}))?$/);
  const n = Number(entero.replace(/[.,]/g, '') + (decimales ? '.' + decimales : ''));
  return Number.isFinite(n) ? n : null;
}

// Lee ?monto=&modo=&moneda= de un enlace compartido. Ignora valores no validos.
function leerEnlace(busqueda) {
  const p = new URLSearchParams(busqueda);
  const r = {};
  if (['buy', 'sell'].includes(p.get('modo'))) r.modo = p.get('modo');
  if (['usd', 'crc'].includes(p.get('moneda'))) r.moneda = p.get('moneda');
  const monto = p.has('monto') ? leerMonto(p.get('monto')) : null;
  if (monto !== null && monto > 0) r.monto = monto;
  return r;
}

function historialCsv(puntos, encabezado) {
  return [encabezado, ...puntos.map((p) => `${p.date},${p.buy.toFixed(2)},${p.sell.toFixed(2)}`)].join('\n') + '\n';
}

/* ============ 5. Formato ============ */
const locale = () => (estado.idioma === 'es' ? 'es-CR' : 'en-US');
const numero = (n, decimales = 2) =>
  new Intl.NumberFormat(locale(), { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(n);
const colones = (n) => '₡' + numero(n);
const dolares = (n) => '$' + numero(n);
const enMoneda = (moneda, n) => (moneda === 'usd' ? dolares(n) : colones(n));
const conSigno = (n) => (n > 0 ? '+' : n < 0 ? '-' : '') + numero(Math.abs(n));
const coloneConSigno = (n) => (n > 0 ? '+' : n < 0 ? '-' : '') + colones(Math.abs(n));
const fechaLarga = (iso) =>
  new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`)
  );
const fechaCorta = (iso) =>
  new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`)
  );
function haceCuanto(ms) {
  const minutos = Math.floor((Date.now() - ms) / 60000);
  if (minutos < 1) return t('live_now');
  const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
  return minutos < 60 ? rtf.format(-minutos, 'minute') : rtf.format(-Math.floor(minutos / 60), 'hour');
}
// Color hex (#rrggbb) con transparencia, para los degradados del canvas.
function conAlfa(hex, alfa) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return hex;
  return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${alfa})`;
}

/* ============ 6. Render ============ */
function marcarActualizado(el, clase = 'is-updated') {
  el.classList.remove(clase);
  void el.offsetWidth; // reinicia la animacion
  el.classList.add(clase);
}

// Contador animado: el numero "corre" desde el valor anterior hasta el nuevo.
// Con movimiento reducido (o sin valor anterior y sin "entrada") se pinta directo.
const cuadrosActivos = new WeakMap();
function animarNumero(el, hasta, formato, { duracion = 650, entrada = false } = {}) {
  let desde = Number(el.dataset.valor);
  el.dataset.valor = String(hasta);
  cancelAnimationFrame(cuadrosActivos.get(el));
  if (!Number.isFinite(desde) && entrada) desde = hasta * 0.97;
  if (sinMovimiento() || !Number.isFinite(desde) || desde === hasta) {
    el.textContent = formato(hasta);
    return;
  }
  const inicio = performance.now();
  const paso = (ahora) => {
    const p = Math.min(1, (ahora - inicio) / duracion);
    const suave = 1 - Math.pow(1 - p, 3); // ease-out cubico
    el.textContent = formato(p === 1 ? hasta : desde + (hasta - desde) * suave);
    if (p < 1) cuadrosActivos.set(el, requestAnimationFrame(paso));
  };
  cuadrosActivos.set(el, requestAnimationFrame(paso));
}

function crear(tag, opciones = {}, hijos = []) {
  const el = document.createElement(tag);
  if (opciones.className) el.className = opciones.className;
  if (opciones.text !== undefined) el.textContent = opciones.text;
  for (const hijo of hijos) el.append(hijo);
  return el;
}

function icono(nombre) {
  const i = document.createElement('i');
  i.className = `ph ph-${nombre}`;
  i.setAttribute('aria-hidden', 'true');
  return i;
}

let temporizadorToast;
function avisar(texto, nombreIcono = 'check-circle') {
  const toast = $('toast');
  toast.replaceChildren(icono(nombreIcono), document.createTextNode(texto));
  toast.classList.add('is-visible');
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function renderTextos() {
  document.documentElement.lang = estado.idioma;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nLabel));
  });
  const otro = estado.idioma === 'es' ? 'en' : 'es';
  $('langToggle').textContent = otro.toUpperCase();
  $('langToggle').setAttribute('lang', otro);
  $('langToggle').setAttribute('aria-label', t('lang'));
  $('themeToggle').setAttribute('aria-label', t('theme'));
  $('refreshBtn').setAttribute('aria-label', t('refresh'));
  $('csvBtn').setAttribute('aria-label', t('csv_label'));
  $('csvBtn').title = t('csv_label');
  renderEnVivo();
  // Los textos cambian de ancho: la pastilla de los selectores se vuelve a medir.
  document.querySelectorAll('.segmented').forEach(moverPastilla);
}

function renderEnVivo() {
  const insignia = $('liveBadge');
  if (estado.actualizadoEn === null) {
    insignia.dataset.state = 'loading';
    $('liveText').textContent = t('live_loading');
  } else if (!estado.bccr) {
    insignia.dataset.state = 'error';
    $('liveText').textContent = t('live_error');
  } else {
    insignia.dataset.state = 'ready';
    $('liveText').textContent = t('live_ready').replace('{t}', haceCuanto(estado.actualizadoEn));
  }
}

function renderDelta(el, actual, anterior) {
  el.replaceChildren();
  if (!Number.isFinite(anterior)) return;
  const diferencia = actual - anterior;
  el.append(icono(diferencia > 0 ? 'arrow-up-right' : diferencia < 0 ? 'arrow-down-right' : 'minus'));
  el.append(document.createTextNode(conSigno(diferencia)));
  el.append(crear('small', { text: t('vs_prev') }));
}

// Sparkline en SVG con el ancho real del contenedor (sin deformar el punto final):
// area con degradado, linea que se dibuja y un punto que late en el ultimo dato.
function renderSparkline({ animar = true } = {}) {
  const contenedor = $('refSpark');
  contenedor.replaceChildren();
  contenedor.classList.toggle('is-static', !animar);
  const puntos = estado.historial.slice(-7);
  const ancho = Math.round(contenedor.clientWidth);
  if (puntos.length < 2 || !ancho) return;
  contenedor.dataset.ancho = String(ancho);

  const valores = puntos.map((p) => p.sell);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const alto = 56;
  const margen = 6;
  const x = (i) => (i / (puntos.length - 1)) * (ancho - margen);
  const y = (v) => (max === min ? alto / 2 : alto - margen - ((v - min) / (max - min)) * (alto - margen * 2));
  const coords = valores.map((v, i) => [x(i), y(v)]);

  const ns = 'http://www.w3.org/2000/svg';
  const nodo = (tag, attrs) => {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  };
  const svg = nodo('svg', { viewBox: `0 0 ${ancho} ${alto}`, width: ancho, height: alto });
  const degradado = nodo('linearGradient', { id: 'sparkRelleno', x1: '0', y1: '0', x2: '0', y2: '1' });
  degradado.append(
    nodo('stop', { offset: '0%', style: 'stop-color: var(--accent); stop-opacity: 0.28' }),
    nodo('stop', { offset: '100%', style: 'stop-color: var(--accent); stop-opacity: 0' })
  );
  const defs = nodo('defs', {});
  defs.append(degradado);

  const trazo = coords.map(([cx, cy]) => `${cx.toFixed(1)},${cy.toFixed(1)}`).join(' L');
  const [ux, uy] = coords.at(-1);
  const area = nodo('path', { class: 'spark-area', d: `M${trazo} L${ux},${alto} L0,${alto} Z`, fill: 'url(#sparkRelleno)' });
  const linea = nodo('path', {
    class: 'spark-line',
    d: `M${trazo}`,
    fill: 'none',
    stroke: 'var(--accent)',
    'stroke-width': '2',
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round'
  });
  const halo = nodo('circle', { class: 'spark-halo', cx: ux, cy: uy, r: '4' });
  const punto = nodo('circle', { class: 'spark-dot', cx: ux, cy: uy, r: '3.5' });
  svg.append(defs, area, linea, halo, punto);
  contenedor.append(svg);
  linea.style.setProperty('--len', String(Math.ceil(linea.getTotalLength())));
}

function renderReferencia() {
  const cuerpo = $('refBody');
  const error = $('refError');

  if (!estado.bccr) {
    cuerpo.hidden = true;
    error.hidden = false;
    $('refDate').textContent = '';
    return;
  }

  const primeraVez = cuerpo.dataset.state !== 'ready';
  cuerpo.hidden = false;
  error.hidden = true;
  cuerpo.dataset.state = 'ready';

  const { buy, sell, date } = estado.bccr;
  $('refDate').textContent = fechaLarga(date);
  animarNumero($('refBuy'), buy, colones, { duracion: 900, entrada: true });
  animarNumero($('refSell'), sell, colones, { duracion: 900, entrada: true });
  animarNumero($('refSpread'), sell - buy, colones, { duracion: 900 });

  const anterior = estado.historial.filter((p) => p.date < date).at(-1);
  renderDelta($('refBuyDelta'), buy, anterior?.buy);
  renderDelta($('refSellDelta'), sell, anterior?.sell);
  renderSparkline();
  if (!primeraVez) marcarActualizado(cuerpo);
}

function renderMontosRapidos(montoActual) {
  const contenedor = $('quickAmounts');
  const montos = MONTOS_RAPIDOS[estado.moneda];
  const claves = montos.join(',') + estado.idioma;
  if (contenedor.dataset.claves !== claves) {
    contenedor.dataset.claves = claves;
    contenedor.replaceChildren(
      ...montos.map((m) => {
        const b = crear('button', { className: 'chip', text: (estado.moneda === 'usd' ? '$' : '₡') + numero(m, 0) });
        b.type = 'button';
        b.dataset.monto = String(m);
        return b;
      })
    );
  }
  contenedor.querySelectorAll('.chip').forEach((b) => {
    b.setAttribute('aria-pressed', String(Number(b.dataset.monto) === montoActual));
  });
}

function renderCalculadora({ resaltar = false } = {}) {
  marcarRadios('[data-mode]', (b) => b.dataset.mode === estado.modo);
  const enDolares = estado.moneda === 'usd';
  $('amountLabel').textContent = t(enDolares ? 'calc_label_usd' : 'calc_label_crc');
  $('amountPrefix').textContent = enDolares ? '$' : '₡';
  $('swapText').textContent = t(enDolares ? 'swap_to_crc' : 'swap_to_usd');
  $('swapBtn').classList.toggle('is-flipped', !enDolares);
  $('calcLabel').textContent = t(etiquetaResultado(estado.modo, estado.moneda));

  const input = $('amountInput');
  const ayuda = $('amountHelp');
  const monto = leerMonto(input.value);
  const valido = monto !== null;
  input.setAttribute('aria-invalid', String(!valido));
  ayuda.textContent = t(valido ? 'calc_help' : 'calc_invalid');
  ayuda.classList.toggle('is-error', !valido);
  renderMontosRapidos(monto);

  const resultado = $('calcResult');
  if (!estado.bccr || !valido) {
    resultado.textContent = t('calc_none');
    delete resultado.dataset.valor;
    resultado.classList.add('is-empty');
    $('calcRule').textContent = estado.bccr ? '' : t('calc_no_data');
    return;
  }
  const { valor, moneda, tasa } = calcular(estado.modo, estado.moneda, monto, estado.bccr);
  const formato = (n) => enMoneda(moneda, n);
  // Si cambio la moneda del resultado, no tiene sentido "contar" desde la otra moneda.
  if (resultado.dataset.moneda !== moneda) delete resultado.dataset.valor;
  resultado.dataset.moneda = moneda;
  resultado.classList.remove('is-empty');
  animarNumero(resultado, valor, formato, { duracion: 420 });
  if (resaltar && !sinMovimiento()) marcarActualizado(resultado, 'is-pop');
  $('calcRule').textContent = t(estado.modo === 'buy' ? 'calc_rule_buy' : 'calc_rule_sell').replace('{tasa}', colones(tasa));
  anunciarResultado(`${$('calcLabel').textContent} ${formato(valor)}`);
}

// El lector de pantalla escucha el resultado cuando el usuario deja de escribir, no en cada tecla.
let temporizadorAnuncio;
function anunciarResultado(texto) {
  clearTimeout(temporizadorAnuncio);
  temporizadorAnuncio = setTimeout(() => {
    $('calcAnuncio').textContent = texto;
  }, 700);
}

// Radios con tabindex "roving": solo el marcado entra en el orden de Tab.
function marcarRadios(selector, esMarcado) {
  const grupos = new Set();
  document.querySelectorAll(selector).forEach((b) => {
    const marcado = esMarcado(b);
    b.setAttribute('aria-checked', String(marcado));
    b.tabIndex = marcado ? 0 : -1;
    grupos.add(b.closest('.segmented'));
  });
  grupos.forEach(moverPastilla);
}

// Coloca la pastilla deslizante del selector bajo la opcion marcada.
function moverPastilla(grupo) {
  const marcado = grupo && grupo.querySelector('[aria-checked="true"]');
  if (!marcado || !marcado.offsetWidth) return;
  grupo.style.setProperty('--thumb-x', `${marcado.offsetLeft}px`);
  grupo.style.setProperty('--thumb-w', `${marcado.offsetWidth}px`);
  grupo.classList.add('has-thumb');
}

function colorToken(nombre) {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
}

function renderEstadisticas() {
  const puntos = estado.historial;
  if (!puntos.length) {
    ['statMin', 'statMax', 'statChange'].forEach((id) => {
      $(id).textContent = '-';
      delete $(id).dataset.valor;
    });
    return;
  }
  const ventas = puntos.map((p) => p.sell);
  animarNumero($('statMin'), Math.min(...ventas), colones, { entrada: true });
  animarNumero($('statMax'), Math.max(...ventas), colones, { entrada: true });
  animarNumero($('statChange'), ventas.at(-1) - ventas[0], coloneConSigno);
}

// Linea vertical punteada que sigue al cursor en el grafico.
const lineaGuia = {
  id: 'lineaGuia',
  afterDatasetsDraw(chart, _args, opciones) {
    const activos = chart.tooltip?.getActiveElements?.() || [];
    if (!activos.length) return;
    const x = activos[0].element.x;
    const { top, bottom } = chart.chartArea;
    const ctx = chart.ctx;
    ctx.save();
    ctx.strokeStyle = opciones.color;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.restore();
  }
};

function renderGrafico() {
  const wrap = $('historyChartWrap');
  const vacio = $('historyEmpty');
  marcarRadios('[data-range]', (b) => Number(b.dataset.range) === estado.rango);
  renderEstadisticas();

  if (!estado.historial.length) {
    wrap.dataset.state = 'empty';
    vacio.hidden = false;
    if (estado.grafico) {
      estado.grafico.destroy();
      estado.grafico = null;
    }
    return;
  }
  wrap.dataset.state = 'ready';
  vacio.hidden = true;
  if (typeof Chart === 'undefined') return; // la libreria aun no carga

  const etiquetas = estado.historial.map((p) => fechaCorta(p.date));
  const ventas = estado.historial.map((p) => p.sell);
  const compras = estado.historial.map((p) => p.buy);
  const movil = window.innerWidth < 640;
  const clave = `${temaEfectivo()}|${estado.idioma}|${movil}`;

  // Mismo tema e idioma: se actualizan los datos y Chart.js anima la transicion de la linea.
  if (estado.grafico && estado.claveGrafico === clave) {
    estado.grafico.data.labels = etiquetas;
    estado.grafico.data.datasets[0].data = ventas;
    estado.grafico.data.datasets[1].data = compras;
    estado.grafico.update();
    return;
  }

  const acento = colorToken('--accent');
  const tenue = colorToken('--muted');
  const borde = colorToken('--border');
  const texto = colorToken('--text');
  const fondo = colorToken('--bg');
  const superficie = colorToken('--surface');
  const fuente = colorToken('--font-mono') || 'monospace';
  const relleno = ({ chart }) => {
    const area = chart.chartArea;
    if (!area) return conAlfa(acento, 0.1);
    const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, conAlfa(acento, 0.22));
    g.addColorStop(1, conAlfa(acento, 0));
    return g;
  };
  const puntoHover = { pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2, pointHoverBorderColor: superficie };
  const datos = {
    labels: etiquetas,
    datasets: [
      { label: t('sell'), data: ventas, borderColor: acento, backgroundColor: relleno, pointHoverBackgroundColor: acento, fill: 'start', tension: 0.35, borderWidth: 2.25, ...puntoHover },
      { label: t('buy'), data: compras, borderColor: tenue, backgroundColor: tenue, pointHoverBackgroundColor: tenue, fill: false, tension: 0.35, borderWidth: 1.5, borderDash: [4, 4], ...puntoHover }
    ]
  };

  if (estado.grafico) estado.grafico.destroy();
  estado.claveGrafico = clave;
  estado.grafico = new Chart($('historyChart'), {
    type: 'line',
    data: datos,
    plugins: [lineaGuia],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: sinMovimiento() ? false : { duration: 700, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        lineaGuia: { color: tenue },
        legend: {
          position: 'bottom',
          align: 'start',
          labels: { color: tenue, boxWidth: 12, boxHeight: 2, font: { family: fuente }, generateLabels: (chart) => chart.data.datasets.map((d, i) => ({ text: d.label, fillStyle: d.borderColor, strokeStyle: d.borderColor, lineWidth: 0, fontColor: tenue, hidden: !chart.isDatasetVisible(i), datasetIndex: i })) }
        },
        tooltip: {
          backgroundColor: texto,
          titleColor: fondo,
          bodyColor: fondo,
          padding: 10,
          cornerRadius: 8,
          boxPadding: 4,
          usePointStyle: true,
          titleFont: { family: fuente },
          bodyFont: { family: fuente },
          callbacks: { label: (c) => `${c.dataset.label}: ${colones(c.parsed.y)}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: tenue, maxRotation: 0, autoSkip: true, maxTicksLimit: movil ? 4 : 8, font: { family: fuente } } },
        y: { grid: { color: borde }, border: { display: false }, ticks: { color: tenue, maxTicksLimit: 5, font: { family: fuente }, callback: (v) => '₡' + numero(v, 0) } }
      }
    }
  });
}

function renderTodo() {
  renderTextos();
  renderReferencia();
  renderCalculadora();
  renderGrafico();
}

/* ============ 7. Eventos e inicio ============ */
async function cargarTasas() {
  try {
    const datos = await api.tasas();
    estado.bccr = datos.bccr && datos.bccr.available ? datos.bccr : null;
  } catch {
    estado.bccr = null;
  }
}

async function cargarHistorial() {
  const pedido = ++estado.pedidoHistorial;
  let puntos = [];
  try {
    const datos = await api.historial(estado.rango);
    puntos = Array.isArray(datos.points) ? datos.points : [];
  } catch {
    puntos = [];
  }
  // Si mientras esperabamos se pidio otro rango, esta respuesta ya no sirve.
  if (pedido !== estado.pedidoHistorial) return false;
  estado.historial = puntos;
  return true;
}

// No se usa "disabled": quitaria el foco del boton. Se marca aria-busy y se ignoran clics repetidos.
async function actualizar() {
  if (estado.ocupado) return;
  estado.ocupado = true;
  const botones = [$('refreshBtn'), $('refRetry')];
  botones.forEach((b) => b.setAttribute('aria-busy', 'true'));
  try {
    await Promise.all([cargarTasas(), cargarHistorial()]);
    estado.actualizadoEn = Date.now();
    renderTodo();
  } finally {
    botones.forEach((b) => b.removeAttribute('aria-busy'));
    estado.ocupado = false;
  }
}

function temaEfectivo() {
  const forzado = document.documentElement.dataset.theme;
  if (forzado) return forzado;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function renderIconoTema() {
  const i = $('themeToggle').querySelector('i');
  i.className = `ph ${temaEfectivo() === 'dark' ? 'ph-sun' : 'ph-moon'}`;
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Respaldo para navegadores sin la API del portapapeles (o sin HTTPS).
    const area = crear('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {}
    area.remove();
    return ok;
  }
}

// Texto y enlace del calculo actual, o null si no hay un resultado valido.
function calculoActual() {
  const monto = leerMonto($('amountInput').value);
  if (!estado.bccr || monto === null || monto <= 0) return null;
  const { valor, moneda } = calcular(estado.modo, estado.moneda, monto, estado.bccr);
  const url = new URL(window.location.href);
  url.search = new URLSearchParams({ monto: String(monto), modo: estado.modo, moneda: estado.moneda }).toString();
  url.hash = 'calculadora';
  const texto = `${enMoneda(estado.moneda, monto)} → ${enMoneda(moneda, valor)} (BCCR, ${fechaLarga(estado.bccr.date)})`;
  return { texto, url: url.toString() };
}

function descargarCsv() {
  if (!estado.historial.length) {
    avisar(t('csv_empty'), 'warning-circle');
    return;
  }
  const blob = new Blob([historialCsv(estado.historial, t('csv_head'))], { type: 'text/csv;charset=utf-8' });
  const enlace = crear('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `cambioya-historial-${estado.rango}d.csv`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  avisar(t('csv_done'), 'download-simple');
}

// Las secciones aparecen suavemente la primera vez que entran en pantalla.
function activarAparicion() {
  const elementos = document.querySelectorAll('.reveal-on-scroll');
  document.querySelectorAll('.features .reveal-on-scroll').forEach((el, i) => el.style.setProperty('--delay', `${i * 90}ms`));
  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observador = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        observador.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  elementos.forEach((el) => observador.observe(el));
}

// Resalta en el menu la seccion que se esta viendo.
function activarMenuActivo() {
  if (!('IntersectionObserver' in window)) return;
  const enlaces = [...document.querySelectorAll('.nav__links a')];
  const observador = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        enlaces.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${e.target.id}`)));
      }),
    { rootMargin: '-45% 0px -50% 0px' }
  );
  document.querySelectorAll('main > section[id], main .hero').forEach((s) => observador.observe(s));
}

function enlazarEventos() {
  $('refreshBtn').addEventListener('click', actualizar);
  $('refRetry').addEventListener('click', actualizar);

  $('langToggle').addEventListener('click', () => {
    estado.idioma = estado.idioma === 'es' ? 'en' : 'es';
    renderTodo();
  });

  $('themeToggle').addEventListener('click', () => {
    const nuevo = temaEfectivo() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    try {
      localStorage.setItem('cambioya-tema', nuevo);
    } catch {}
    renderIconoTema();
    renderGrafico(); // el grafico lee los colores del tema
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    renderIconoTema();
    renderGrafico();
  });

  document.querySelectorAll('[data-mode]').forEach((b) =>
    b.addEventListener('click', () => {
      if (estado.modo === b.dataset.mode) return;
      estado.modo = b.dataset.mode;
      renderCalculadora({ resaltar: true });
    })
  );
  // Patron de teclado de radiogroup: flechas mueven y seleccionan.
  document.querySelectorAll('[role="radiogroup"]').forEach((grupo) =>
    grupo.addEventListener('keydown', (e) => {
      const radios = [...grupo.querySelectorAll('[role="radio"]')];
      const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      const i = radios.indexOf(document.activeElement);
      if (!paso || i < 0) return;
      e.preventDefault();
      const siguiente = radios[(i + paso + radios.length) % radios.length];
      siguiente.focus();
      siguiente.click();
    })
  );

  $('amountInput').addEventListener('input', () => renderCalculadora());

  // Intercambiar: el resultado actual pasa a ser el monto en la otra moneda.
  $('swapBtn').addEventListener('click', () => {
    const input = $('amountInput');
    const monto = leerMonto(input.value);
    if (estado.bccr && monto) input.value = String(calcular(estado.modo, estado.moneda, monto, estado.bccr).valor);
    estado.moneda = estado.moneda === 'usd' ? 'crc' : 'usd';
    renderCalculadora({ resaltar: true });
  });

  $('quickAmounts').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $('amountInput').value = chip.dataset.monto;
    renderCalculadora({ resaltar: true });
  });

  $('copyBtn').addEventListener('click', async () => {
    const calculo = calculoActual();
    if (!calculo) return avisar(t('nothing_to_copy'), 'warning-circle');
    const ok = await copiarTexto(calculo.texto);
    avisar(t(ok ? 'copied' : 'copy_error'), ok ? 'check-circle' : 'warning-circle');
  });

  $('shareBtn').addEventListener('click', async () => {
    const calculo = calculoActual();
    if (!calculo) return avisar(t('nothing_to_copy'), 'warning-circle');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CambioYa', text: calculo.texto, url: calculo.url });
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return; // el usuario cerro el menu
      }
    }
    const ok = await copiarTexto(calculo.url);
    avisar(t(ok ? 'link_copied' : 'copy_error'), ok ? 'link' : 'warning-circle');
  });

  $('csvBtn').addEventListener('click', descargarCsv);

  document.querySelectorAll('[data-range]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (estado.rango === Number(b.dataset.range)) return;
      estado.rango = Number(b.dataset.range);
      const wrap = $('historyChartWrap');
      wrap.dataset.state = 'loading';
      wrap.setAttribute('aria-busy', 'true');
      marcarRadios('[data-range]', (r) => Number(r.dataset.range) === estado.rango);
      const vigente = await cargarHistorial();
      if (!vigente) return;
      wrap.removeAttribute('aria-busy');
      renderGrafico();
    })
  );

  // La pastilla se vuelve a medir si cambia el tamano (fuentes que cargan, rotacion del telefono).
  if ('ResizeObserver' in window) {
    const observador = new ResizeObserver((entradas) => entradas.forEach((e) => moverPastilla(e.target)));
    document.querySelectorAll('.segmented').forEach((g) => observador.observe(g));
    // El sparkline se redibuja sin animacion si cambia el ancho de la tarjeta.
    new ResizeObserver(() => {
      const spark = $('refSpark');
      if (spark.dataset.ancho && Number(spark.dataset.ancho) !== Math.round(spark.clientWidth)) renderSparkline({ animar: false });
    }).observe($('refSpark'));
  }

  $('alertForm').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const input = $('alertEmail');
    const mensaje = $('alertMessage');
    const boton = $('alertSubmit');
    mensaje.classList.remove('is-ok', 'is-error');

    if (!input.checkValidity() || !input.value.trim()) {
      input.setAttribute('aria-invalid', 'true');
      mensaje.textContent = t('alert_invalid');
      mensaje.classList.add('is-error');
      return;
    }
    input.setAttribute('aria-invalid', 'false');
    if (boton.getAttribute('aria-busy') === 'true') return;
    boton.setAttribute('aria-busy', 'true');
    try {
      await api.alerta(input.value.trim());
      mensaje.textContent = t('alert_ok');
      mensaje.classList.add('is-ok');
      input.value = '';
    } catch {
      mensaje.textContent = t('alert_error');
      mensaje.classList.add('is-error');
    } finally {
      boton.removeAttribute('aria-busy');
    }
  });
}

// Un enlace compartido (?monto=250&modo=sell&moneda=usd) deja la calculadora lista.
function aplicarEnlace() {
  const enlace = leerEnlace(window.location.search);
  if (enlace.modo) estado.modo = enlace.modo;
  if (enlace.moneda) estado.moneda = enlace.moneda;
  if (enlace.monto) $('amountInput').value = String(enlace.monto);
}

async function iniciar() {
  aplicarEnlace();
  renderTextos();
  renderIconoTema();
  renderCalculadora();
  enlazarEventos();
  activarAparicion();
  activarMenuActivo();
  await actualizar();
  setInterval(actualizar, 15 * 60 * 1000);
  setInterval(renderEnVivo, 30 * 1000); // "actualizado hace X min" avanza solo
}

// Exporta las reglas puras para las pruebas en Node; en el navegador arranca la pagina.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { tasaPara, convertir, calcular, etiquetaResultado, leerMonto, leerEnlace, historialCsv };
} else {
  document.addEventListener('DOMContentLoaded', iniciar);
}
