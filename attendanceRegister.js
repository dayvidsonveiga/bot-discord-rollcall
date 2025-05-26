const fs = require('fs');
const filePath = './attendance.json';

function saveAttendance(guildId, userId, date) {
  let data = {};

  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath));
  }

  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = [];

  if (!data[guildId][userId].includes(date)) {
    data[guildId][userId].push(date);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { saveAttendance };
