// Servidor local para desarrollo: sirve los archivos estaticos y las funciones de /api
// con la misma forma (req.query, res.status().json()) que usa Vercel.
// Uso: npm run dev   (lee las variables de .env si el archivo existe)

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const PUERTO = Number(process.env.PORT || 3000);

// Carga .env sin dependencias: lineas CLAVE=valor, ignora comentarios.
const archivoEnv = path.join(RAIZ, '.env');
if (fs.existsSync(archivoEnv)) {
  for (const linea of fs.readFileSync(archivoEnv, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const ESTATICOS = new Set(['/index.html', '/styles.css', '/app.js', '/favicon.svg']);

function leerCuerpo(req) {
  return new Promise((resolve) => {
    let datos = '';
    req.on('data', (c) => (datos += c));
    req.on('end', () => {
      try {
        resolve(datos ? JSON.parse(datos) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function adaptarRespuesta(res) {
  res.status = (codigo) => {
    res.statusCode = codigo;
    return res;
  };
  res.json = (cuerpo) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(cuerpo));
  };
  return res;
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PUERTO}`);

    const api = url.pathname.match(/^\/api\/(rates|history|alert)$/);
    if (api) {
      req.query = Object.fromEntries(url.searchParams);
      req.body = req.method === 'POST' ? await leerCuerpo(req) : {};
      try {
        await require(path.join(RAIZ, 'api', `${api[1]}.js`))(req, adaptarRespuesta(res));
      } catch (error) {
        adaptarRespuesta(res).status(500).json({ error: error.message });
      }
      return;
    }

    const ruta = url.pathname === '/' ? '/index.html' : url.pathname;
    if (!ESTATICOS.has(ruta)) {
      res.statusCode = 404;
      res.end('No encontrado');
      return;
    }
    res.setHeader('Content-Type', TIPOS[path.extname(ruta)] || 'application/octet-stream');
    fs.createReadStream(path.join(RAIZ, ruta)).pipe(res);
  })
  .listen(PUERTO, () => {
    const token = process.env.BCCR_TOKEN ? 'configurado' : 'NO configurado';
    console.log(`CambioYa en http://localhost:${PUERTO}  (BCCR_TOKEN ${token})`);
  });
