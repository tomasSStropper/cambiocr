const nodemailer = require('nodemailer');

// Validacion simple y suficiente: algo@algo.algo, sin espacios, largo razonable.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const email = String((req.body && req.body.email) || '').trim();
  if (email.length > 254 || !EMAIL.test(email)) {
    res.status(400).json({ error: 'INVALID_EMAIL' });
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    // Sin SMTP configurado no se finge un envio.
    res.status(503).json({ error: 'ALERTS_NOT_CONFIGURED' });
    return;
  }

  try {
    const puerto = Number(process.env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: puerto,
      secure: puerto === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    // Se registra el interes en el buzon propio; NO se envia nada al correo ingresado.
    // Asi nadie puede usar este formulario para mandar correos a terceros.
    await transport.sendMail({
      from: process.env.ALERT_FROM || process.env.SMTP_USER,
      to: process.env.ALERT_INBOX || process.env.SMTP_USER,
      replyTo: email,
      subject: 'CambioYa: nuevo interesado en alertas',
      text: `Correo interesado en las alertas: ${email}`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('alert:', error.message); // el detalle queda en los logs, no va al navegador
    res.status(500).json({ error: 'ALERT_FAILED' });
  }
};
