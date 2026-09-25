export default {
  name: 'leave',
  aliases: ['leavegc'],
  category: 'owner',
  description: 'Leave the current group',
  usage: '.leave',
  permission: 'OWNER',
  groupOnly: true,
  async execute(ctx) {
    await ctx.reply('Leaving this group.');
    try {
      await ctx.sock.groupLeave(ctx.chat);
    } catch {
      await ctx.reply('Unable to leave this group.');
    }
  }
};
