const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const { salvarPresenca } = require('./registroPresenca');
const { gerarRelatorio } = require('./relatorioPresenca');

// Configurações
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const NOME_CANAL_TEXTO = process.env.TEXT_CHANNEL_NAME; // exemplo: planejamento-de-sessoes

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

// Comandos
const commands = [
  new SlashCommandBuilder()
    .setName('call')
    .setDescription('Mostra quem está com você na chamada e registra presença'),
  new SlashCommandBuilder()
    .setName('relatorio')
    .setDescription('Mostra quem mais participou das chamadas'),
].map(cmd => cmd.toJSON());

// Registra os comandos no Discord
client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('🚀 Comandos /call e /relatorio registrados com sucesso');
  } catch (err) {
    console.error('❌ Erro ao registrar comandos:', err);
  }
});

// Manipulador de comandos
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const guild = interaction.guild;
  const guildId = guild.id;
  const member = interaction.member;

  // Busca o canal de texto de destino
  const canalTexto = guild.channels.cache.find(c => c.name === NOME_CANAL_TEXTO && c.isTextBased());

  if (interaction.commandName === 'call') {
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Você precisa estar em um canal de voz para usar este comando.',
        ephemeral: true,
      });
    }

    const membros = voiceChannel.members.map(m => m.user.username);
    const ids = voiceChannel.members.map(m => m.user.id);
    const hoje = new Date().toISOString().slice(0, 10);

    ids.forEach(id => salvarPresenca(guildId, id, hoje));

    const lista = membros.length
      ? `🎙️ Presentes na chamada: ${membros.join(', ')}`
      : '🔇 Ninguém além de você está na chamada.';

    if (canalTexto) {
      await canalTexto.send(lista);
    }

    await interaction.reply({ content: '✅ Lista de presença registrada.', ephemeral: true });
  }

  if (interaction.commandName === 'relatorio') {
    const relatorio = gerarRelatorio(guildId);

    if (relatorio.length === 0) {
      return interaction.reply({ content: '📭 Nenhum dado de presença registrado ainda.', ephemeral: true });
    }

    const linhas = await Promise.all(
      relatorio.map(async (item, index) => {
        const usuario = await guild.members.fetch(item.userId).catch(() => null);
        const nome = usuario?.user.username || 'Usuário desconhecido';
        return `${index + 1}. **${nome}** - ${item.quantidade} presença(s)`;
      })
    );

    const resposta = `📊 **Relatório de Presenças:**\n\n${linhas.join('\n')}`;
    interaction.reply({ content: resposta });
  }
});

client.login(TOKEN);
