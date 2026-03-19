# CambioYa

Comparador minimalista de tipos de cambio USD/CRC en Costa Rica con frontend en HTML/CSS/JS y endpoints serverless.

## Requisitos

- Node.js 20+
- Variables de entorno configuradas

## Setup local

1. Copia variables:

```bash
cp .env.example .env
```

2. Instala dependencias:

```bash
npm install
```

3. Sirve el proyecto con tu runtime favorito (Vercel recomendado) para exponer rutas `/api/*`.

## Variables de entorno

- `BCCR_TOKEN`: token gratuito de gee.bccr.fi.cr
- `SMTP_HOST`: host SMTP
- `SMTP_PORT`: puerto SMTP
- `SMTP_USER`: usuario SMTP
- `SMTP_PASS`: contraseña SMTP
- `ALERT_FROM`: remitente de correo para alertas (default `alertas@cambioya.com`)

## Deploy

### Vercel

1. Importa el repositorio en Vercel.
2. Configura variables de entorno del `.env.example`.
3. Deploy con framework preset `Other`.
4. Verifica endpoints:
   - `GET /api/rates`
   - `GET /api/history?range=7`
   - `POST /api/alert`

## Arquitectura

- `index.html`, `styles.css`, `app.js`: UI y lógica cliente.
- `api/rates.js`, `api/history.js`, `api/alert.js`: endpoints serverless.
- `scrapers/*`: módulos de captura por entidad.
