export default {
  name: 'unmute',
  aliases: ['opengroup'],
  category: 'admin',
  description: 'Allow all members to send messages',
  usage: '.unmute',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  botAdmin: true,
  async execute(ctx) {
    try {
      await ctx.sock.groupSettingUpdate(ctx.chat, 'not_announcement');
      await ctx.reply('Group unmuted. All members can send messages.');
    } catch {
      await ctx.reply('Unable to unmute the group.');
    }
  }
};
