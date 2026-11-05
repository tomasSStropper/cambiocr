// Genera las imagenes del sitio a partir de HTML (asi el diseno vive en codigo y se puede regenerar):
//   og-image.png          1200x630  vista previa al compartir en WhatsApp, redes, Slack...
//   apple-touch-icon.png  180x180   icono al "Agregar a inicio" en iPhone
//   icon-192.png / icon-512.png     iconos de la app instalable (site.webmanifest)
//
// Requiere Playwright con Chromium:  npx playwright install chromium
// Uso:                                 node scripts/generar-imagenes.js

const path = require('node:path');
const { chromium } = require('playwright');

const RAIZ = path.join(__dirname, '..');
const ACENTO = '#0f7a55';
const ACENTO_OSCURO = '#3ccf91';
const FUENTES =
  '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@500;600;700&family=Geist+Mono:wght@500&display=block" rel="stylesheet">';

// Icono: fondo completo (sin esquinas redondeadas): iOS y Android aplican su propia mascara.
const icono = (lado) => `<!doctype html><html><head>${FUENTES}<style>
  html,body{margin:0;width:${lado}px;height:${lado}px}
  body{display:grid;place-items:center;background:linear-gradient(145deg,#12936a,${ACENTO} 55%,#0b5e42);
       font:700 ${Math.round(lado * 0.58)}px Geist,sans-serif;color:#f4f8f6}
  span{transform:translateY(-2%)}
</style></head><body><span>₡</span></body></html>`;

// Sparkline decorativo (forma ilustrativa, no datos reales).
const sparkline = (() => {
  const v = [40, 46, 38, 52, 48, 60, 56, 70, 64, 78, 74, 88];
  const pts = v.map((y, i) => `${(i / (v.length - 1)) * 340},${120 - y}`).join(' L');
  return `<svg width="340" height="130" viewBox="0 0 340 130" fill="none" style="overflow:visible">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${ACENTO_OSCURO}" stop-opacity=".35"/><stop offset="1" stop-color="${ACENTO_OSCURO}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="M${pts} L340,130 L0,130 Z" fill="url(#g)"/>
    <path d="M${pts}" stroke="${ACENTO_OSCURO}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="340" cy="${120 - v.at(-1)}" r="16" fill="${ACENTO_OSCURO}" opacity=".25"/>
    <circle cx="340" cy="${120 - v.at(-1)}" r="7" fill="${ACENTO_OSCURO}"/>
  </svg>`;
})();

const og = `<!doctype html><html lang="es"><head><meta charset="utf-8">${FUENTES}<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden}
  body{position:relative;background:#0b0d0c;color:#e8ece9;font-family:Geist,sans-serif}
  .grid{position:absolute;inset:0;background-image:radial-gradient(rgb(232 236 233/.10) 1.2px,transparent 1.6px);
        background-size:26px 26px;-webkit-mask-image:radial-gradient(ellipse 75% 75% at 70% 40%,#000 25%,transparent 75%)}
  .glow{position:absolute;width:760px;height:760px;right:-160px;top:-260px;border-radius:50%;
        background:radial-gradient(circle,rgb(60 207 145/.22),transparent 62%)}
  .glow2{position:absolute;width:520px;height:520px;left:-200px;bottom:-280px;border-radius:50%;
        background:radial-gradient(circle,rgb(60 207 145/.12),transparent 62%)}
  .wrap{position:relative;height:100%;padding:72px 80px;box-sizing:border-box;display:flex;flex-direction:column}
  .brand{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:600;letter-spacing:-.01em}
  .mark{display:grid;place-items:center;width:58px;height:58px;border-radius:15px;background:${ACENTO};color:#f4f8f6;font-weight:700;font-size:34px}
  h1{margin:auto 0 0;font-size:70px;line-height:1.04;letter-spacing:-.035em;font-weight:700;max-width:600px}
  p{margin:24px 0 0;font-size:28px;color:#97a29c;max-width:600px}
  .pill{display:inline-flex;align-items:center;gap:12px;margin-top:28px;padding:10px 20px;border:1px solid #313a35;border-radius:999px;
        font:500 22px 'Geist Mono',monospace;color:#e8ece9;background:rgb(18 21 20/.8)}
  .dot{width:12px;height:12px;border-radius:50%;background:${ACENTO_OSCURO};box-shadow:0 0 0 6px rgb(60 207 145/.2)}
  .card{position:absolute;right:80px;top:120px;width:340px;padding:32px 36px 36px;border:1px solid #232a26;border-radius:24px;
        background:linear-gradient(180deg,#151917,#121514);box-shadow:0 30px 80px rgb(0 0 0/.45)}
  .card h2{margin:0 0 24px;font-size:22px;font-weight:600;color:#97a29c}
  .swap{display:flex;align-items:center;gap:18px;margin-top:26px;font:600 44px Geist,sans-serif}
  .swap span{display:grid;place-items:center;width:84px;height:84px;border-radius:20px;background:#181c1a;border:1px solid #313a35}
  .swap i{font-style:normal;color:${ACENTO_OSCURO};font-size:40px}
</style></head><body>
  <div class="grid"></div><div class="glow"></div><div class="glow2"></div>
  <div class="card">
    <h2>Referencia BCCR</h2>
    ${sparkline}
    <div class="swap"><span>$</span><i>⇄</i><span>₡</span></div>
  </div>
  <div class="wrap">
    <div class="brand"><span class="mark">₡</span>CambioYa</div>
    <h1>Tipo de cambio del dólar en Costa Rica</h1>
    <p>Referencia oficial · Calculadora · Historial</p>
    <div><span class="pill"><span class="dot"></span>Datos del Banco Central de Costa Rica</span></div>
  </div>
</body></html>`;

async function capturar(navegador, html, ancho, alto, archivo) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  await pagina.setContent(html, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: path.join(RAIZ, archivo) });
  await pagina.close();
  console.log('generado', archivo);
}

(async () => {
  const navegador = await chromium.launch();
  await capturar(navegador, og, 1200, 630, 'og-image.png');
  await capturar(navegador, icono(180), 180, 180, 'apple-touch-icon.png');
  await capturar(navegador, icono(192), 192, 192, 'icon-192.png');
  await capturar(navegador, icono(512), 512, 512, 'icon-512.png');
  await navegador.close();
})();
