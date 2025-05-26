const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates, // Para ver quem está na call
    GatewayIntentBits.GuildMembers       // Para acessar membros do canal
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName('call')
    .setDescription('Mostra quem está com você na chamada'),
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('🚀 Slash command /call registrado com sucesso');
  } catch (err) {
    console.error('❌ Erro ao registrar comandos:', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'call') {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({
        content: '❌ Você precisa estar em um canal de voz para usar esse comando.',
        ephemeral: true,
      });
      return;
    }

    const members = voiceChannel.members.map(m => m.user.username);
    const message = members.length
      ? `🎙️ Pessoas presentes na chamada: ${members.join(', ')}`
      : '🔇 Ninguém mais está na chamada.';

    await interaction.reply({ content: message, ephemeral: true });
  }
});

client.login(process.env.BOT_TOKEN);
