const i18n = {
  es: {
    hero_label: 'Tipo de cambio — Costa Rica',
    hero_title: 'El mejor cambio,<br>sin buscar.',

    buy: 'Compra',
    sell: 'Venta',
    updated: 'Actualizado',
    best_buy: 'Mejor para comprar',
    best_sell: 'Mejor para vender',
    diff_vs_bccr: 'vs referencia BCCR',
    calc_title: 'Calculadora',
    calc_label: '¿Cuánto recibes?',
    calc_placeholder: 'Monto en dólares',
    calc_toggle_buy: 'Compro dólares',
    calc_toggle_sell: 'Vendo dólares',

    chart_title: 'Historial del tipo de cambio',
    chart_7: '7 días',
    chart_15: '15 días',
    chart_30: '30 días',
    alert_label: 'Alertas de tipo de cambio',
    alert_title: 'Sé el primero en saber.',

    alert_placeholder: 'tu@correo.com',
    alert_btn: 'Activar alerta',
    alert_success: 'Listo. Te avisamos cuando llegue.',
    alert_error: 'Algo salió mal. Intenta de nuevo.',
    footer_source: 'Fuente oficial',
    footer_disclaimer: 'Los tipos de cambio son referenciales. CambioYa no es una entidad financiera.',
    footer_copy: 'CambioYa 2026',
    refresh: 'Actualizar',
    error_banner: 'Los datos pueden no estar actualizados.',
    unavailable: 'No disponible'
  },
  en: {
    hero_label: 'Exchange Rate — Costa Rica',
    hero_title: 'The best rate,<br>without searching.',

    buy: 'Buy',
    sell: 'Sell',
    updated: 'Updated',
    best_buy: 'Best to buy',
    best_sell: 'Best to sell',
    diff_vs_bccr: 'vs BCCR reference',
    calc_title: 'Calculator',
    calc_label: 'How much do you get?',
    calc_placeholder: 'Amount in dollars',
    calc_toggle_buy: "I'm buying dollars",
    calc_toggle_sell: "I'm selling dollars",

    chart_title: 'Exchange rate history',
    chart_7: '7 days',
    chart_15: '15 days',
    chart_30: '30 days',
    alert_label: 'Exchange rate alerts',
    alert_title: 'Be the first to know.',

    alert_placeholder: 'your@email.com',
    alert_btn: 'Activate alert',
    alert_success: "Done. We'll notify you when it arrives.",
    alert_error: 'Something went wrong. Try again.',
    footer_source: 'Official source',
    footer_disclaimer: 'Exchange rates are for reference only. CambioYa is not a financial institution.',
    footer_copy: 'CambioYa 2026',
    refresh: 'Refresh',
    error_banner: 'Data may not be up to date.',
    unavailable: 'Unavailable'
  }
};

const state = {
  lang: 'es',
  rates: [],
  bccr: { buy: 510.5, sell: 520.3, updatedAt: new Date().toISOString() },
  historyRange: 7,
  mode: 'buy',
  chart: null
};

const formatter = new Intl.NumberFormat('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function t(key) {
  return i18n[state.lang][key] ?? key;
}

async function fetchRates() {
  try {
    document.getElementById('errorBanner').hidden = true;
    const response = await fetch('/api/rates');
    if (!response.ok) throw new Error('Rates API error');
    const payload = await response.json();
    state.rates = payload.rates || [];
    state.bccr = payload.bccr || state.bccr;
    renderHero();
    renderTable();
    initCalc();
  } catch (error) {
    document.getElementById('errorBanner').hidden = false;
    renderTable();
  }
}

function renderHero() {
  document.getElementById('heroBccrBuy').textContent = `₡${formatter.format(state.bccr.buy)}`;
  document.getElementById('heroBccrSell').textContent = `₡${formatter.format(state.bccr.sell)}`;

  const date = new Date(state.bccr.updatedAt);
  const time = date.toLocaleTimeString(state.lang === 'es' ? 'es-CR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById('heroUpdatedLine').textContent =
    state.lang === 'es'
      ? `Fuente: Banco Central de Costa Rica — actualizado ${time}`
      : `Source: Central Bank of Costa Rica — updated ${time}`;
}

function renderTable() {
  const tableWrap = document.getElementById('tableWrap');
  const skeleton = document.getElementById('tableSkeleton');
  const tbody = document.getElementById('ratesTableBody');

  tbody.innerHTML = '';

  if (!state.rates.length) {
    skeleton.hidden = false;
    tableWrap.hidden = true;
    return;
  }

  const bestBuy = Math.max(...state.rates.filter((r) => !r.error).map((r) => r.buy));
  const bestSell = Math.min(...state.rates.filter((r) => !r.error).map((r) => r.sell));

  state.rates.forEach((rate) => {
    const row = document.createElement('tr');

    if (rate.error) {
      row.innerHTML = `
        <td class="table__subtle">${rate.bank}</td>
        <td class="table__subtle">${t('unavailable')}</td>
        <td class="table__subtle">${t('unavailable')}</td>
        <td class="table__subtle">—</td>
        <td><span class="badge">Sin datos</span></td>
      `;
    } else {
      const diffBuy = rate.buy - state.bccr.buy;
      const diffSell = rate.sell - state.bccr.sell;
      row.innerHTML = `
        <td>${rate.bank}</td>
        <td class="${rate.buy === bestBuy ? 'table__green' : ''}">₡${formatter.format(rate.buy)}</td>
        <td class="${rate.sell === bestSell ? 'table__green' : ''}">₡${formatter.format(rate.sell)}</td>
        <td>Compra ${diffBuy >= 0 ? '+' : ''}${diffBuy.toFixed(2)} / Venta ${diffSell >= 0 ? '+' : ''}${diffSell.toFixed(2)}</td>
        <td>${rate.status || 'OK'}</td>
      `;
    }

    tbody.appendChild(row);
  });

  skeleton.hidden = true;
  tableWrap.hidden = false;
}

function initCalc() {
  const amountInput = document.getElementById('amountInput');
  const bankSelect = document.getElementById('bankSelect');
  const modeBuy = document.getElementById('modeBuy');
  const modeSell = document.getElementById('modeSell');

  const validRates = state.rates.filter((rate) => !rate.error);
  bankSelect.innerHTML = '';
  validRates.forEach((rate, index) => {
    const option = document.createElement('option');
    option.value = rate.bank;
    option.textContent = rate.bank;
    if (index === 0) option.selected = true;
    bankSelect.appendChild(option);
  });

  const updateResult = () => {
    const amount = Number(amountInput.value || 0);
    const selected = validRates.find((rate) => rate.bank === bankSelect.value) || validRates[0];
    if (!selected) return;

    const rate = state.mode === 'buy' ? selected.sell : selected.buy;
    const result = amount * rate;

    document.getElementById('calcResult').textContent = `₡${formatter.format(result)}`;
    document.getElementById('calcBank').textContent = selected.bank;
    document.getElementById('calcRate').textContent = `${t(state.mode === 'buy' ? 'sell' : 'buy')}: ₡${formatter.format(rate)}`;
  };

  modeBuy.onclick = () => {
    state.mode = 'buy';
    modeBuy.classList.add('toggle__btn--active');
    modeSell.classList.remove('toggle__btn--active');
    updateResult();
  };

  modeSell.onclick = () => {
    state.mode = 'sell';
    modeSell.classList.add('toggle__btn--active');
    modeBuy.classList.remove('toggle__btn--active');
    updateResult();
  };

  amountInput.oninput = updateResult;
  bankSelect.onchange = updateResult;
  updateResult();
}

async function initChart(range = 7) {
  state.historyRange = range;
  const response = await fetch(`/api/history?range=${range}`);
  const payload = await response.json();

  const ctx = document.getElementById('historyChart');
  if (state.chart) state.chart.destroy();

  state.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: payload.points.map((point) => point.date),
      datasets: [
        {
          label: 'Venta',
          data: payload.points.map((point) => point.sell),
          borderColor: '#00e676',
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f0f0f',
          borderColor: '#1a1a1a',
          borderWidth: 1,
          titleColor: '#ededed',
          bodyColor: '#ededed'
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#555555' } },
        y: { grid: { color: '#1a1a1a', lineWidth: 1 }, ticks: { color: '#555555' } }
      }
    }
  });
}

function initAlerts() {
  const form = document.getElementById('alertForm');
  const message = document.getElementById('alertMessage');
  const thresholdInput = document.getElementById('alertThreshold');

  document.getElementById('customizeBtn').addEventListener('click', () => {
    thresholdInput.hidden = !thresholdInput.hidden;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('alertEmail').value,
          threshold: thresholdInput.hidden ? null : Number(thresholdInput.value || 0)
        })
      });

      if (!response.ok) throw new Error('Alert error');
      form.hidden = true;
      message.hidden = false;
      message.textContent = t('alert_success');
    } catch (error) {
      message.hidden = false;
      message.textContent = t('alert_error');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.getElementById('alertsSection').classList.add('alerts--visible');
        observer.disconnect();
      }
    });
  });

  observer.observe(document.getElementById('alertsSection'));
}

function initI18n() {
  const applyLanguage = () => {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.innerHTML = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(key));
    });

    renderHero();
    renderTable();
    initCalc();
  };

  document.getElementById('langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'es' ? 'en' : 'es';
    applyLanguage();
  });

  applyLanguage();
}

function bindBaseEvents() {
  document.getElementById('refreshBtn').addEventListener('click', fetchRates);

  document.querySelectorAll('.range-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.range-btn').forEach((item) => item.classList.remove('range-btn--active'));
      btn.classList.add('range-btn--active');
      initChart(Number(btn.dataset.range));
    });
  });

  setInterval(fetchRates, 15 * 60 * 1000);
}

async function init() {
  initI18n();
  bindBaseEvents();
  await fetchRates();
  await initChart(7);
  initAlerts();
}

document.addEventListener('DOMContentLoaded', init);
