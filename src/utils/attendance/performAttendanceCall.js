const { saveAttendance } = require('./attendanceRegister');

async function performAttendanceCall(guild, textChannelName) {
  const textChannel = guild.channels.cache.find(
    c => c.name === textChannelName && c.isTextBased()
  );

  const voiceChannel = guild.channels.cache.find(
    c => c.isVoiceBased() && c.members.size > 0
  );

  if (!voiceChannel) {
    console.log('🔇 Nenhum canal de voz com membros ativos');
    return false;
  }

  const presentUsers = voiceChannel.members.map(m => `✅ ${m.user.displayName}`);
  const userIds = voiceChannel.members.map(m => m.user.id);
  const today = new Date().toISOString().slice(0, 10);

  userIds.forEach(id => saveAttendance(guild.id, id, today));

  const attendanceList = presentUsers.length
    ? `🎙️ **Presentes na chamada \`${voiceChannel.name}\`**:\n${presentUsers.join('\n')}`
    : '🔇 Ninguém além de você está na chamada.';

  if (textChannel) {
    await textChannel.send(attendanceList);
  }

  return true;
}

module.exports = { performAttendanceCall };
