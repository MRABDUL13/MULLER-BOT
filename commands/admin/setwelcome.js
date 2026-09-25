export default {
  name: 'setwelcome',
  aliases: [],
  category: 'admin',
  description: 'Set a custom welcome message',
  usage: '.setwelcome Welcome @user to {group}',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    if (!ctx.argText) {
      await ctx.reply('Provide a welcome message. Placeholders: @user {group}');
      return;
    }
    await ctx.db.updateGroup(ctx.chat, { welcomeMsg: ctx.argText, welcome: true });
    await ctx.reply('Welcome message updated.');
  }
};
