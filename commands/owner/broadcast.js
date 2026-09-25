import { clampText, sleep } from '../../lib/utils.js';

export default {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'owner',
  description: 'Broadcast a message to groups the bot is in',
  usage: '.broadcast message',
  permission: 'OWNER',
  async execute(ctx) {
    if (!ctx.argText) {
      await ctx.reply('Provide a broadcast message.');
      return;
    }
    const text = clampText(ctx.argText, 2000);
    let groups = {};
    try {
      groups = await ctx.sock.groupFetchAllParticipating();
    } catch {
      await ctx.reply('Unable to fetch group list.');
      return;
    }
    const ids = Object.keys(groups);
    let sent = 0;
    for (const id of ids) {
      try {
        await ctx.sock.sendMessage(id, { text: `Broadcast\n\n${text}` });
        sent += 1;
        await sleep(1500);
      } catch {
        // skip failed chats
      }
    }
    await ctx.reply(`Broadcast sent to ${sent}/${ids.length} groups.`);
  }
};
