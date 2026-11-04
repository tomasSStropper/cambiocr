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
    calc_label: 'Monto en dólares',
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
    calc_label: 'Amount in dollars',
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
  rango: 7,
  bccr: null, // { buy, sell, date } o null si no hay dato
  historial: [], // [{ date, buy, sell }]
  grafico: null,
  pedidoHistorial: 0, // para descartar respuestas viejas si el usuario cambia de rango rapido
  ocupado: false
};

const t = (clave) => TEXTOS[estado.idioma][clave] ?? clave;
const $ = (id) => document.getElementById(id);

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

function convertir(usd, tasa) {
  return Math.round(usd * tasa * 100) / 100;
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

/* ============ 5. Formato ============ */
const locale = () => (estado.idioma === 'es' ? 'es-CR' : 'en-US');
const colones = (n) =>
  '₡' + new Intl.NumberFormat(locale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const conSigno = (n) =>
  (n > 0 ? '+' : n < 0 ? '-' : '') +
  new Intl.NumberFormat(locale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n));
const fechaLarga = (iso) =>
  new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`)
  );
const fechaCorta = (iso) =>
  new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`)
  );

/* ============ 6. Render ============ */
function marcarActualizado(el) {
  el.classList.remove('is-updated');
  void el.offsetWidth; // reinicia la animacion
  el.classList.add('is-updated');
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
}

function renderDelta(el, actual, anterior) {
  el.replaceChildren();
  if (!Number.isFinite(anterior)) return;
  const diferencia = actual - anterior;
  el.append(icono(diferencia > 0 ? 'arrow-up-right' : diferencia < 0 ? 'arrow-down-right' : 'minus'));
  el.append(document.createTextNode(conSigno(diferencia)));
  el.append(crear('small', { text: t('vs_prev') }));
}

function renderSparkline() {
  const contenedor = $('refSpark');
  contenedor.replaceChildren();
  const puntos = estado.historial.slice(-7);
  if (puntos.length < 2) return;

  const valores = puntos.map((p) => p.sell);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const ancho = 300;
  const alto = 56;
  const x = (i) => (i / (puntos.length - 1)) * ancho;
  const y = (v) => (max === min ? alto / 2 : alto - 4 - ((v - min) / (max - min)) * (alto - 8));

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const linea = document.createElementNS(ns, 'polyline');
  linea.setAttribute('points', valores.map((v, i) => `${x(i)},${y(v)}`).join(' '));
  linea.setAttribute('fill', 'none');
  linea.setAttribute('stroke', 'var(--accent)');
  linea.setAttribute('stroke-width', '2');
  linea.setAttribute('vector-effect', 'non-scaling-stroke');
  linea.setAttribute('stroke-linejoin', 'round');
  svg.append(linea);
  contenedor.append(svg);
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

  cuerpo.hidden = false;
  error.hidden = true;
  cuerpo.dataset.state = 'ready';

  const { buy, sell, date } = estado.bccr;
  $('refDate').textContent = fechaLarga(date);
  $('refBuy').textContent = colones(buy);
  $('refSell').textContent = colones(sell);
  $('refSpread').textContent = colones(sell - buy);

  const anterior = estado.historial.filter((p) => p.date < date).at(-1);
  renderDelta($('refBuyDelta'), buy, anterior?.buy);
  renderDelta($('refSellDelta'), sell, anterior?.sell);
  renderSparkline();
  marcarActualizado(cuerpo);
}

function renderCalculadora() {
  marcarRadios('[data-mode]', (b) => b.dataset.mode === estado.modo);
  $('calcLabel').textContent = t(estado.modo === 'buy' ? 'calc_you_pay' : 'calc_you_get');

  const input = $('amountInput');
  const ayuda = $('amountHelp');
  const monto = leerMonto(input.value);
  const valido = monto !== null;
  input.setAttribute('aria-invalid', String(!valido));
  ayuda.textContent = t(valido ? 'calc_help' : 'calc_invalid');
  ayuda.classList.toggle('is-error', !valido);

  const resultado = $('calcResult');
  if (!estado.bccr || !valido) {
    resultado.textContent = t('calc_none');
    resultado.classList.add('is-empty');
    $('calcRule').textContent = estado.bccr ? '' : t('calc_no_data');
    return;
  }
  const tasa = tasaPara(estado.modo, estado.bccr);
  resultado.textContent = colones(convertir(monto, tasa));
  resultado.classList.remove('is-empty');
  $('calcRule').textContent = t(estado.modo === 'buy' ? 'calc_rule_buy' : 'calc_rule_sell').replace('{tasa}', colones(tasa));
  anunciarResultado(`${$('calcLabel').textContent} ${resultado.textContent}`);
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
  document.querySelectorAll(selector).forEach((b) => {
    const marcado = esMarcado(b);
    b.setAttribute('aria-checked', String(marcado));
    b.tabIndex = marcado ? 0 : -1;
  });
}

function colorToken(nombre) {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
}

function renderEstadisticas() {
  const puntos = estado.historial;
  if (!puntos.length) {
    ['statMin', 'statMax', 'statChange'].forEach((id) => ($(id).textContent = '-'));
    return;
  }
  const ventas = puntos.map((p) => p.sell);
  $('statMin').textContent = colones(Math.min(...ventas));
  $('statMax').textContent = colones(Math.max(...ventas));
  const cambio = ventas.at(-1) - ventas[0];
  $('statChange').textContent = (cambio > 0 ? '+' : cambio < 0 ? '-' : '') + colones(Math.abs(cambio));
}

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

  const acento = colorToken('--accent');
  const tenue = colorToken('--muted');
  const borde = colorToken('--border');
  const fuente = colorToken('--font-mono') || 'monospace';
  const datos = {
    labels: estado.historial.map((p) => fechaCorta(p.date)),
    datasets: [
      { label: t('sell'), data: estado.historial.map((p) => p.sell), borderColor: acento, backgroundColor: acento, tension: 0.3, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2 },
      { label: t('buy'), data: estado.historial.map((p) => p.buy), borderColor: tenue, backgroundColor: tenue, tension: 0.3, pointRadius: 0, pointHoverRadius: 4, borderWidth: 1.5, borderDash: [4, 4] }
    ]
  };

  if (estado.grafico) estado.grafico.destroy();
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  estado.grafico = new Chart($('historyChart'), {
    type: 'line',
    data: datos,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducido ? false : { duration: 500 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', align: 'start', labels: { color: tenue, boxWidth: 12, boxHeight: 2, font: { family: fuente } } },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${colones(c.parsed.y)}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: tenue, maxRotation: 0, autoSkip: true, maxTicksLimit: window.innerWidth < 640 ? 4 : 8, font: { family: fuente } } },
        y: { grid: { color: borde }, border: { display: false }, ticks: { color: tenue, maxTicksLimit: 5, font: { family: fuente }, callback: (v) => '₡' + new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(v) } }
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
      estado.modo = b.dataset.mode;
      renderCalculadora();
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

  $('amountInput').addEventListener('input', renderCalculadora);

  document.querySelectorAll('[data-range]').forEach((b) =>
    b.addEventListener('click', async () => {
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

async function iniciar() {
  renderTextos();
  renderIconoTema();
  enlazarEventos();
  await actualizar();
  setInterval(actualizar, 15 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', iniciar);
