const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../data');
const filePath = path.join(dataDir, 'attendance.json');

function generateReport(guildId) {
  try {
    if (!fs.existsSync(filePath)) return [];

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const guildData = data[guildId];
    if (!guildData) return [];

    const report = Object.entries(guildData).map(([userId, dates]) => ({
      userId,
      count: dates.length,
    }));

    return report.sort((a, b) => b.count - a.count);
  } catch (err) {
    console.error('❌ Erro ao gerar relatório:', err);
    return [];
  }
}

module.exports = { generateReport };