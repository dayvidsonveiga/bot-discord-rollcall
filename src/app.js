const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const cron = require('node-cron');
const { DateTime } = require('luxon');
require('dotenv').config();

const { generateReport } = require('./utils/attendance/attendanceReport');
const { generateChart } = require('./utils/attendance/attendanceChart');
const { performAttendanceCall } = require('./utils/attendance/performAttendanceCall');

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const TEXT_CHANNEL_NAME = process.env.TEXT_CHANNEL_NAME;
const ENABLE_AUTOMATIC_CALLS = process.env.ENABLE_AUTOMATIC_CALLS === 'true';
const AUTO_CALL_TIME = process.env.AUTO_CALL_TIME || '18:30';
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName('chamada')
    .setDescription('Mostra quem está com você na chamada e registra presença'),
  new SlashCommandBuilder()
    .setName('relatorio')
    .setDescription('Mostra quem mais participou das chamadas'),
  new SlashCommandBuilder()
    .setName('grafico')
    .setDescription('Gera um gráfico com a frequência de presença dos participantes')
    .addIntegerOption(option =>
      option.setName('periodo')
        .setDescription('Quantidade de dias (ex: 7, 30...)')
        .setRequired(false)
    ),
].map(cmd => cmd.toJSON());

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('🚀 Comandos registrados com sucesso');
  } catch (err) {
    console.error('❌ Erro ao registrar comandos:', err);
  }

  scheduleAutomaticCall();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const guild = interaction.guild;

  if (interaction.commandName === 'chamada') {
    const member = interaction.member;

    if (!member.voice.channel) {
      return interaction.reply({
        content: '❌ Você precisa estar em um canal de voz para usar este comando.',
        ephemeral: true,
      });
    }

    await performAttendanceCall(guild, TEXT_CHANNEL_NAME);

    return interaction.reply({
      content: '✅ Lista de presença registrada.',
      ephemeral: true,
    });
  }

  if (interaction.commandName === 'relatorio') {
    const report = generateReport(guild.id);

    if (report.length === 0) {
      return interaction.reply({
        content: '📭 Nenhum dado de presença registrado ainda.',
        ephemeral: true,
      });
    }

    const lines = await Promise.all(
      report.map(async (entry, index) => {
        const user = await guild.members.fetch(entry.userId).catch(() => null);
        const name = user?.user.displayName || 'Usuário desconhecido';
        return `${index + 1}. **${name}** - ${entry.count} presença(s)`;
      })
    );

    const reply = `📊 **Relatório de Presenças:**\n\n${lines.join('\n')}`;
    interaction.reply({ content: reply });
  }

  if (interaction.commandName === 'grafico') {
    await interaction.deferReply();

    const days = interaction.options.getInteger('periodo') || null;

    const chartBuffer = await generateChart(guild, guild.id, days);

    if (!chartBuffer) {
      return interaction.editReply('📭 Nenhum dado de presença no período selecionado.');
    }

    const label = days ? `últimos ${days} dias` : 'todos os tempos';

    await interaction.editReply({
      content: `📊 Gráfico de presenças (${label}):`,
      files: [{ attachment: chartBuffer, name: 'grafico-presencas.png' }],
    });
  }
});

function scheduleAutomaticCall() {
  if (!ENABLE_AUTOMATIC_CALLS) {
    console.log('⏸️ Chamada automática desativada via .env');
    return;
  }

  const [hour, minute] = AUTO_CALL_TIME.split(':').map(Number);
  const cronExpr = `${minute} ${hour} * * *`; // min hora dia mês dia-da-semana

  cron.schedule(cronExpr, async () => {
    const now = DateTime.now().setZone('America/Sao_Paulo');
    console.log(`⏰ Executando chamada automática em ${now.toISOTime()}`);

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error(`❌ Guild com ID ${GUILD_ID} não encontrada`);
      return;
    }

    const sucesso = await performAttendanceCall(guild, TEXT_CHANNEL_NAME);
    if (sucesso) {
      console.log('✅ Chamada automática registrada');
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });

  console.log(`📅 Chamada automática agendada para ${AUTO_CALL_TIME} (GMT-3)`);
}

client.login(TOKEN);
