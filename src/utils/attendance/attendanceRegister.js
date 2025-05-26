const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../data');
const filePath = path.join(dataDir, 'attendance.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function saveAttendance(guildId, userId, date) {
  let data = {};

  try {
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error('❌ Erro ao ler arquivo:', err);
    return;
  }

  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = [];

  if (!data[guildId][userId].includes(date)) {
    data[guildId][userId].push(date);
    console.log(`📝 Registrando presença: Guild ${guildId}, User ${userId}, Data ${date}`);
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Erro ao salvar presença:', err);
  }
}

module.exports = { saveAttendance };