const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const dataDir = path.join(__dirname, '../../../data');
const filePath = path.join(dataDir, 'attendance.json');

const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

function filterDates(dates, days) {
  if (!days) return dates;
  
  const limitDate = new Date();
  limitDate.setUTCHours(0, 0, 0, 0);
  limitDate.setUTCDate(limitDate.getUTCDate() - days);
  
  return dates.filter(dateStr => {
    const entryDate = new Date(dateStr);
    entryDate.setUTCHours(0, 0, 0, 0);
    return entryDate >= limitDate;
  });
}

async function generateChart(guild, guildId, days = null) {
  try {
    if (!fs.existsSync(filePath)) return null;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const guildData = data[guildId];
    if (!guildData) return null;

    const filteredData = {};
    for (const [userId, dates] of Object.entries(guildData)) {
      const filteredDates = filterDates(dates, days);
      if (filteredDates.length > 0) filteredData[userId] = filteredDates.length;
    }

    if (Object.keys(filteredData).length === 0) return null;

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
            ticks: { stepSize: 1 },
            title: { display: true, text: 'Número de presenças' }
          },
          x: {
            title: { display: true, text: 'Participantes' }
          }
        }
      }
    };

    return await chartJSNodeCanvas.renderToBuffer(configuration);
  } catch (err) {
    console.error('❌ Erro ao gerar gráfico:', err);
    return null;
  }
}

module.exports = { generateChart };