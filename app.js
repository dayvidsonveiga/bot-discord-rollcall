const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
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
    console.log('🚀 Comando /call registrado com sucesso');
  } catch (err) {
    console.error('❌ Erro ao registrar comandos:', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'call') {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Você precisa estar em um canal de voz para usar esse comando.',
        ephemeral: true,
      });
    }

    const members = voiceChannel.members.map(m => `✅ ${m.user.username}`);
    const listMessage = `🎙️ **Pessoas presentes na chamada \`${voiceChannel.name}\`**:\n${members.join('\n')}`;

    // Obter nome do canal a partir do .env
    const textChannelName = process.env.TEXT_CHANNEL_NAME;

    const targetChannel = interaction.guild.channels.cache.find(
      ch => ch.name === textChannelName && ch.type === ChannelType.GuildText
    );

    if (!targetChannel) {
      return interaction.reply({
        content: `❌ Não encontrei o canal de texto \`#${textChannelName}\`.`,
        ephemeral: true,
      });
    }

    try {
      await targetChannel.send({ content: listMessage });
      await interaction.reply({
        content: `✅ Lista de participantes enviada para \`#${textChannelName}\`.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao tentar enviar a lista para o canal de texto.',
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.BOT_TOKEN);
