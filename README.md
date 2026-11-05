# CambioYa

Tipo de cambio del dólar en Costa Rica con datos oficiales del Banco Central (BCCR): referencia del día, calculadora de dólares a colones e historial de hasta 30 días.

> Este repositorio también contiene **SIFAC**, el módulo de tipo de cambio en Java por capas: ver [`sifac/README.md`](sifac/README.md).

## Requisitos

- Node.js 20+
- Un token de la API SDDE del BCCR: en el [sitio de Indicadores Económicos](https://sdd.bccr.fi.cr/es/IndicadoresEconomicos/Inicio/), **Mi Perfil → Generar**.

## Correr en local

```bash
cp .env.example .env      # pegue su token en BCCR_TOKEN
npm install
npm run dev               # http://localhost:3000
npm test                  # pruebas del cliente del BCCR y de las reglas de app.js (sin internet)
```

`.env` está en `.gitignore`: el token nunca se sube al repositorio.

## Funciones del sitio

- Referencia del BCCR con contadores animados, variación frente a ayer y sparkline de 7 días.
- Calculadora en ambas direcciones (dólares → colones o colones → dólares), montos rápidos, copiar resultado y compartir un enlace con el cálculo (`?monto=250&modo=sell&moneda=usd`).
- Historial de 7, 15 o 30 días con transición animada entre rangos y descarga en CSV.
- Tema claro/oscuro, español/inglés y respeto a `prefers-reduced-motion`: sin animaciones si el sistema lo pide.

## Variables de entorno

| Variable | Uso |
|---|---|
| `BCCR_TOKEN` | Token Bearer de la API SDDE del BCCR (obligatorio) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Correo para registrar interesados en alertas (opcional) |
| `ALERT_FROM`, `ALERT_INBOX` | Remitente y buzón que recibe los registros (opcional) |

En Vercel se configuran en *Project → Settings → Environment Variables* y requieren un redeploy.

## Endpoints

- `GET /api/rates`: referencia del BCCR más reciente `{ bccr: { available, buy, sell, date } }`.
- `GET /api/history?range=7|15|30`: serie diaria de compra y venta.
- `POST /api/alert`: registra un correo interesado en las alertas.

## Arquitectura

| Capa | Archivos | Responsabilidad |
|---|---|---|
| Datos | `lib/bccr.js` | Único lugar que habla con el BCCR (URL, token Bearer, indicadores 317/318, forma del JSON). |
| API | `api/*.js` | Expone los datos, define caché y errores; no conoce detalles del BCCR. |
| Cliente | `index.html`, `styles.css`, `app.js` | `app.js` está ordenado por capas: textos, estado, datos, reglas, formato, render y eventos. |
| Imágenes | `og-image.png`, `icon-*.png`, `apple-touch-icon.png`, `site.webmanifest` | Vista previa al compartir e íconos de la app instalable. Se regeneran con `node scripts/generar-imagenes.js` (requiere Playwright). |

Si el BCCR cambia su API, solo se modifica `lib/bccr.js`.
