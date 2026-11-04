const { obtenerReferencia } = require('../lib/bccr');
const { scrapeBac } = require('../scrapers/bac');
const { scrapeBcr } = require('../scrapers/bcr');
const { scrapeScotiabank } = require('../scrapers/scotiabank');
const { scrapeMoneyfex } = require('../scrapers/moneyfex');
const { scrapeAri } = require('../scrapers/ari');
const { scrapeBncr } = require('../scrapers/bncr');
const { scrapePopular } = require('../scrapers/popular');

const SCRAPERS = [scrapeBac, scrapeBcr, scrapeScotiabank, scrapeMoneyfex, scrapeAri, scrapeBncr, scrapePopular];

// Si un banco falla, no tumba a los demas: se marca como no disponible.
async function correrScraper(scraper) {
  try {
    return await scraper();
  } catch (error) {
    return { bank: scraper.name.replace(/^scrape/, ''), error: true, status: 'ERROR' };
  }
}

async function referenciaBccr() {
  try {
    const ref = await obtenerReferencia();
    return { available: true, buy: ref.buy, sell: ref.sell, date: ref.date };
  } catch (error) {
    return { available: false, reason: error.code || 'ERROR', message: error.message };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const [bccr, ...rates] = await Promise.all([referenciaBccr(), ...SCRAPERS.map(correrScraper)]);

  res.status(200).json({
    updatedAt: new Date().toISOString(),
    bccr,
    rates
  });
};
