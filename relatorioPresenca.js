const fs = require('fs');
const path = './presencas.json';

function gerarRelatorio(guildId) {
  if (!fs.existsSync(path)) return [];

  const presencas = JSON.parse(fs.readFileSync(path));
  const dadosGuild = presencas[guildId];
  if (!dadosGuild) return [];

  const ranking = Object.entries(dadosGuild).map(([userId, datas]) => ({
    userId,
    quantidade: datas.length,
  }));

  return ranking.sort((a, b) => b.quantidade - a.quantidade);
}

module.exports = { gerarRelatorio };
