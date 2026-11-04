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
    nav_compare: 'Comparador',
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
    vs_prev: 'vs anterior',
    calc_title: 'Calculadora',
    calc_buy: 'Compro dólares',
    calc_sell: 'Vendo dólares',
    calc_label: 'Monto en dólares',
    calc_help: 'Puedes usar punto o coma para los decimales.',
    calc_invalid: 'Escribe un monto válido, por ejemplo 120,50.',
    calc_entity: 'Entidad',
    calc_you_pay: 'Pagas',
    calc_you_get: 'Recibes',
    calc_rule_buy: 'Usa la tasa de venta ({tasa}): la entidad te vende los dólares.',
    calc_rule_sell: 'Usa la tasa de compra ({tasa}): la entidad te compra los dólares.',
    calc_no_data: 'La referencia del BCCR no está disponible en este momento.',
    bccr_option: 'BCCR (referencia oficial)',
    compare_title: 'Comparador de entidades',
    demo_notice: 'Estamos conectando cada banco. Por ahora solo publicamos la referencia oficial del BCCR: preferimos no mostrar montos que no podemos verificar.',
    col_entity: 'Entidad',
    col_vs: 'Venta vs BCCR',
    tag_official: 'Oficial',
    tag_pending: 'Pendiente',
    tag_unavailable: 'No disponible',
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
    lang: 'Cambiar idioma',
    refresh: 'Actualizar datos'
  },
  en: {
    skip: 'Skip to content',
    nav_calc: 'Calculator',
    nav_compare: 'Compare',
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
    vs_prev: 'vs previous',
    calc_title: 'Calculator',
    calc_buy: "I'm buying dollars",
    calc_sell: "I'm selling dollars",
    calc_label: 'Amount in dollars',
    calc_help: 'You can use a dot or a comma for decimals.',
    calc_invalid: 'Enter a valid amount, for example 120.50.',
    calc_entity: 'Institution',
    calc_you_pay: 'You pay',
    calc_you_get: 'You get',
    calc_rule_buy: 'Uses the sell rate ({tasa}): the institution sells you the dollars.',
    calc_rule_sell: 'Uses the buy rate ({tasa}): the institution buys the dollars from you.',
    calc_no_data: 'The BCCR reference is not available right now.',
    bccr_option: 'BCCR (official reference)',
    compare_title: 'Compare institutions',
    demo_notice: 'We are connecting each bank. For now we only publish the official BCCR reference: we would rather not show amounts we cannot verify.',
    col_entity: 'Institution',
    col_vs: 'Sell vs BCCR',
    tag_official: 'Official',
    tag_pending: 'Pending',
    tag_unavailable: 'Unavailable',
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
    lang: 'Change language',
    refresh: 'Refresh data'
  }
};

/* ============ 2. Estado ============ */
const estado = {
  idioma: 'es',
  modo: 'buy', // buy = compro dolares, sell = vendo dolares
  rango: 7,
  bccr: null, // { buy, sell, date } o null si no hay dato
  entidades: [], // respuesta de /api/rates.rates
  historial: [], // [{ date, buy, sell }]
  grafico: null
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
// Misma regla que SIFAC: si compras dolares, la entidad te los VENDE (tasa de venta);
// si vendes dolares, la entidad te los COMPRA (tasa de compra).
function tasaPara(modo, entidad) {
  return modo === 'buy' ? entidad.sell : entidad.buy;
}

function convertir(usd, tasa) {
  return Math.round(usd * tasa * 100) / 100;
}

function leerMonto(texto) {
  const limpio = String(texto).trim().replace(/\s/g, '').replace(',', '.');
  if (limpio === '') return 0;
  const n = Number(limpio);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Entidades con datos reales para la calculadora: el BCCR primero.
function entidadesConDatos() {
  const lista = [];
  if (estado.bccr) lista.push({ id: 'BCCR', nombre: t('bccr_option'), buy: estado.bccr.buy, sell: estado.bccr.sell });
  for (const e of estado.entidades) {
    if (Number.isFinite(e.buy) && Number.isFinite(e.sell) && !e.pending && !e.error) {
      lista.push({ id: e.bank, nombre: e.bank, buy: e.buy, sell: e.sell });
    }
  }
  return lista;
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
  $('langToggle').textContent = estado.idioma === 'es' ? 'EN' : 'ES';
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

function renderTabla() {
  const cuerpo = $('ratesTableBody');
  cuerpo.replaceChildren();

  const filas = [];
  if (estado.bccr) {
    filas.push({ nombre: 'BCCR', buy: estado.bccr.buy, sell: estado.bccr.sell, tag: 'official' });
  }
  for (const e of estado.entidades) {
    const tieneDatos = Number.isFinite(e.buy) && Number.isFinite(e.sell) && !e.pending && !e.error;
    filas.push({ nombre: e.bank, buy: e.buy, sell: e.sell, tag: tieneDatos ? null : e.pending ? 'pending' : 'unavailable' });
  }

  const reales = filas.filter((f) => f.tag !== 'pending' && f.tag !== 'unavailable');
  const mejorVenta = reales.length > 1 ? Math.min(...reales.map((f) => f.sell)) : null;
  // La columna "vs BCCR" solo tiene sentido cuando hay otra entidad real con que comparar.
  $('ratesTable').classList.toggle('sin-comparacion', reales.length < 2);

  for (const f of filas) {
    const tr = document.createElement('tr');
    const entidad = crear('td', {}, [crear('span', { className: 'table__entity', text: f.nombre })]);
    if (f.tag) {
      const clase = f.tag === 'official' ? 'tag tag--accent' : 'tag';
      entidad.firstChild.append(crear('span', { className: clase, text: t(`tag_${f.tag}`) }));
    }
    tr.append(entidad);

    if (f.tag === 'pending' || f.tag === 'unavailable') {
      for (const clase of ['num table__muted', 'num table__muted', 'num table__muted col-vs']) {
        tr.append(crear('td', { className: clase, text: '-' }));
      }
    } else {
      tr.append(crear('td', { className: 'num', text: colones(f.buy) }));
      tr.append(crear('td', { className: `num${f.sell === mejorVenta ? ' table__best' : ''}`, text: colones(f.sell) }));
      const vs = estado.bccr && f.nombre !== 'BCCR' ? conSigno(f.sell - estado.bccr.sell) : '-';
      tr.append(crear('td', { className: 'num table__muted col-vs', text: vs }));
    }
    cuerpo.append(tr);
  }
}

function renderSelectorEntidad() {
  const select = $('bankSelect');
  const previo = select.value;
  select.replaceChildren();
  for (const e of entidadesConDatos()) {
    const opcion = crear('option', { text: e.nombre });
    opcion.value = e.id;
    select.append(opcion);
  }
  if ([...select.options].some((o) => o.value === previo)) select.value = previo;
}

function renderCalculadora() {
  document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === estado.modo)));
  $('calcLabel').textContent = t(estado.modo === 'buy' ? 'calc_you_pay' : 'calc_you_get');

  const input = $('amountInput');
  const ayuda = $('amountHelp');
  const monto = leerMonto(input.value);
  const valido = monto !== null;
  input.setAttribute('aria-invalid', String(!valido));
  ayuda.textContent = t(valido ? 'calc_help' : 'calc_invalid');
  ayuda.classList.toggle('is-error', !valido);

  const entidad = entidadesConDatos().find((e) => e.id === $('bankSelect').value);
  if (!entidad) {
    $('calcResult').textContent = '-';
    $('calcRule').textContent = t('calc_no_data');
    return;
  }
  const tasa = tasaPara(estado.modo, entidad);
  $('calcResult').textContent = valido ? colones(convertir(monto, tasa)) : '-';
  $('calcRule').textContent = t(estado.modo === 'buy' ? 'calc_rule_buy' : 'calc_rule_sell').replace('{tasa}', colones(tasa));
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
  $('statChange').textContent = conSigno(ventas.at(-1) - ventas[0]);
}

function renderGrafico() {
  const wrap = $('historyChartWrap');
  const vacio = $('historyEmpty');
  document
    .querySelectorAll('[data-range]')
    .forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.range) === estado.rango)));
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
        y: { grid: { color: borde }, border: { display: false }, ticks: { color: tenue, font: { family: fuente }, callback: (v) => colones(v) } }
      }
    }
  });
}

function renderTodo() {
  renderTextos();
  renderReferencia();
  renderTabla();
  renderSelectorEntidad();
  renderCalculadora();
  renderGrafico();
}

/* ============ 7. Eventos e inicio ============ */
async function cargarTasas() {
  try {
    const datos = await api.tasas();
    estado.bccr = datos.bccr && datos.bccr.available ? datos.bccr : null;
    estado.entidades = Array.isArray(datos.rates) ? datos.rates : [];
  } catch {
    estado.bccr = null;
    estado.entidades = [];
  }
}

async function cargarHistorial() {
  try {
    const datos = await api.historial(estado.rango);
    estado.historial = Array.isArray(datos.points) ? datos.points : [];
  } catch {
    estado.historial = [];
  }
}

async function actualizar() {
  const boton = $('refreshBtn');
  boton.classList.add('is-spinning');
  boton.disabled = true;
  await Promise.all([cargarTasas(), cargarHistorial()]);
  renderTodo();
  boton.classList.remove('is-spinning');
  boton.disabled = false;
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
  $('amountInput').addEventListener('input', renderCalculadora);
  $('bankSelect').addEventListener('change', renderCalculadora);

  document.querySelectorAll('[data-range]').forEach((b) =>
    b.addEventListener('click', async () => {
      estado.rango = Number(b.dataset.range);
      $('historyChartWrap').dataset.state = 'loading';
      await cargarHistorial();
      renderGrafico();
      renderReferencia();
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
    boton.disabled = true;
    try {
      await api.alerta(input.value.trim());
      mensaje.textContent = t('alert_ok');
      mensaje.classList.add('is-ok');
      input.value = '';
    } catch {
      mensaje.textContent = t('alert_error');
      mensaje.classList.add('is-error');
    } finally {
      boton.disabled = false;
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
