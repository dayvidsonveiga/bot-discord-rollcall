const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const { saveAttendance } = require('./attendanceRegister');
const { generateReport } = require('./attendanceReport');
const { generateChart } = require('./attendanceChart');

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const TEXT_CHANNEL_NAME = process.env.TEXT_CHANNEL_NAME;

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
    console.log('🚀 Comandos /chamada, /relatorio e /grafico registrados com sucesso');
  } catch (err) {
    console.error('❌ Erro ao registrar comandos:', err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const guild = interaction.guild;
  const guildId = guild.id;
  const member = interaction.member;

  const textChannel = guild.channels.cache.find(
    c => c.name === TEXT_CHANNEL_NAME && c.isTextBased()
  );

  if (interaction.commandName === 'chamada') {
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Você precisa estar em um canal de voz para usar este comando.',
        ephemeral: true,
      });
    }

    const presentUsers = voiceChannel.members.map(m => `✅ ${m.user.username}`);
    const userIds = voiceChannel.members.map(m => m.user.id);
    const today = new Date().toISOString().slice(0, 10);

    userIds.forEach(id => saveAttendance(guildId, id, today));

    const attendanceList = presentUsers.length
      ? `🎙️ **Presentes na chamada \`${voiceChannel.name}\`**:\n${presentUsers.join('\n')}`
      : '🔇 Ninguém além de você está na chamada.';

    if (textChannel) {
      await textChannel.send(attendanceList);
    }

    await interaction.reply({
      content: '✅ Lista de presença registrada.',
      ephemeral: true,
    });
  }

  if (interaction.commandName === 'relatorio') {
    const report = generateReport(guildId);

    if (report.length === 0) {
      return interaction.reply({
        content: '📭 Nenhum dado de presença registrado ainda.',
        ephemeral: true,
      });
    }

    const lines = await Promise.all(
      report.map(async (entry, index) => {
        const user = await guild.members.fetch(entry.userId).catch(() => null);
        const name = user?.user.username || 'Usuário desconhecido';
        return `${index + 1}. **${name}** - ${entry.count} presença(s)`;
      })
    );

    const reply = `📊 **Relatório de Presenças:**\n\n${lines.join('\n')}`;
    interaction.reply({ content: reply });
  }

  if (interaction.commandName === 'grafico') {
    await interaction.deferReply();

    const days = interaction.options.getInteger('periodo') || null;

    const chartBuffer = await generateChart(guild, guildId, days);

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

client.login(TOKEN);
