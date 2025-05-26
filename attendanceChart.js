const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const filePath = './attendance.json';

const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

function filterDates(dates, days) {
  if (!days) return dates;
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - days);
  return dates.filter(dateStr => new Date(dateStr) >= limitDate);
}

async function generateChart(guild, guildId, days = null) {
  if (!fs.existsSync(filePath)) return null;

  const data = JSON.parse(fs.readFileSync(filePath));
  const guildData = data[guildId];
  if (!guildData) return null;

  // Monta os dados filtrando datas por período, se fornecido
  const filteredData = {};
  for (const [userId, dates] of Object.entries(guildData)) {
    const filteredDates = filterDates(dates, days);
    if (filteredDates.length > 0) filteredData[userId] = filteredDates.length;
  }

  if (Object.keys(filteredData).length === 0) return null;

  // Pega nomes dos usuários
  const labels = [];
  const counts = [];

  for (const userId of Object.keys(filteredData)) {
    try {
      const member = await guild.members.fetch(userId);
      labels.push(member.user.username);
      counts.push(filteredData[userId]);
    } catch {
      labels.push('Usuário desconhecido');
      counts.push(filteredData[userId]);
    }
  }

  // Configura gráfico
  const configuration = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Presenças',
        data: counts,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      }],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: days
            ? `Presenças nos últimos ${days} dias`
            : 'Presenças no período completo',
          font: { size: 18 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          precision: 0,
          ticks: { stepSize: 1 },
          title: {
            display: true,
            text: 'Número de presenças'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Participantes'
          }
        }
      }
    }
  };

  // Gera o gráfico e retorna buffer
  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

module.exports = { generateChart };
