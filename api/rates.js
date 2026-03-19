const { scrapeBccr } = require('../scrapers/bccr');
const { scrapeBac } = require('../scrapers/bac');
const { scrapeBcr } = require('../scrapers/bcr');
const { scrapeScotiabank } = require('../scrapers/scotiabank');
const { scrapeMoneyfex } = require('../scrapers/moneyfex');
const { scrapeAri } = require('../scrapers/ari');
const { scrapeBncr } = require('../scrapers/bncr');
const { scrapePopular } = require('../scrapers/popular');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const [bccr, bac, bcr, scotiabank, moneyfex, ari, bncr, popular] = await Promise.all([
      scrapeBccr(),
      scrapeBac(),
      scrapeBcr(),
      scrapeScotiabank(),
      scrapeMoneyfex(),
      scrapeAri(),
      scrapeBncr(),
      scrapePopular()
    ]);

    res.status(200).json({
      updatedAt: new Date().toISOString(),
      bccr: {
        buy: bccr.buy,
        sell: bccr.sell,
        updatedAt: bccr.updatedAt
      },
      rates: [bac, bcr, scotiabank, moneyfex, ari, bncr, popular]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Unable to fetch rates',
      details: error.message
    });
  }
};
