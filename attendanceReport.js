const fs = require('fs');
const filePath = './attendance.json';

function generateReport(guildId) {
  if (!fs.existsSync(filePath)) return [];

  const data = JSON.parse(fs.readFileSync(filePath));
  const guildData = data[guildId];
  if (!guildData) return [];

  const report = Object.entries(guildData).map(([userId, dates]) => ({
    userId,
    count: dates.length,
  }));

  return report.sort((a, b) => b.count - a.count);
}

module.exports = { generateReport };
