export default {
  name: 'mute',
  aliases: ['closegroup'],
  category: 'admin',
  description: 'Allow only admins to send messages',
  usage: '.mute',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  botAdmin: true,
  async execute(ctx) {
    try {
      await ctx.sock.groupSettingUpdate(ctx.chat, 'announcement');
      await ctx.reply('Group muted. Only admins can send messages.');
    } catch {
      await ctx.reply('Unable to mute the group.');
    }
  }
};
