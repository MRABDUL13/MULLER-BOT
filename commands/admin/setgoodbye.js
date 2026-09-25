export default {
  name: 'setgoodbye',
  aliases: [],
  category: 'admin',
  description: 'Set a custom goodbye message',
  usage: '.setgoodbye Goodbye @user',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    if (!ctx.argText) {
      await ctx.reply('Provide a goodbye message. Placeholders: @user {group}');
      return;
    }
    await ctx.db.updateGroup(ctx.chat, { goodbyeMsg: ctx.argText, goodbye: true });
    await ctx.reply('Goodbye message updated.');
  }
};
