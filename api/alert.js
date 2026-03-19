const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, threshold } = req.body || {};

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transport.sendMail({
      from: process.env.ALERT_FROM || 'alertas@cambioya.com',
      to: email,
      subject: 'Alerta activada en CambioYa',
      text: threshold
        ? `Tu alerta se activó para umbral ₡${threshold}.`
        : 'Tu alerta de tipo de cambio está activa.'
    });

    res.status(200).json({ success: true, email, threshold: threshold ?? null });
  } catch (error) {
    res.status(500).json({ error: 'Unable to create alert', details: error.message });
  }
};
