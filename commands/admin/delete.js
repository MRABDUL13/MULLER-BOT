export default {
  name: 'delete',
  aliases: ['del', 'd'],
  category: 'admin',
  description: 'Delete a replied message',
  usage: '.delete',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  botAdmin: true,
  async execute(ctx) {
    const key = ctx.normalized.quotedKey;
    if (!key?.id) {
      await ctx.reply('Reply to the message you want to delete.');
      return;
    }
    try {
      await ctx.sock.sendMessage(ctx.chat, { delete: key });
    } catch {
      await ctx.reply('Unable to delete that message.');
    }
  }
};
