async function scrapeBccr() {
  return {
    bank: 'BCCR',
    buy: 510.5,
    sell: 520.3,
    status: 'OK',
    updatedAt: new Date().toISOString()
  };
}

module.exports = { scrapeBccr };
