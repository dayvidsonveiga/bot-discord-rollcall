const fs = require('fs');
const path = './presencas.json';

function salvarPresenca(guildId, userId, data) {
  let presencas = {};

  if (fs.existsSync(path)) {
    presencas = JSON.parse(fs.readFileSync(path));
  }

  if (!presencas[guildId]) presencas[guildId] = {};
  if (!presencas[guildId][userId]) presencas[guildId][userId] = [];

  if (!presencas[guildId][userId].includes(data)) {
    presencas[guildId][userId].push(data);
  }

  fs.writeFileSync(path, JSON.stringify(presencas, null, 2));
}

module.exports = { salvarPresenca };
