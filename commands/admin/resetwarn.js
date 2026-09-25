import { firstTarget } from '../../lib/utils.js';

export default {
  name: 'resetwarn',
  aliases: ['unwarn', 'clearwarn'],
  category: 'admin',
  description: 'Reset warnings for a user',
  usage: '.resetwarn @user',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    const target = firstTarget(ctx);
    if (!target) {
      await ctx.reply('Mention a user or reply to their message.');
      return;
    }
    await ctx.db.resetWarnings(ctx.chat, target);
    await ctx.sock.sendMessage(ctx.chat, {
      text: `Warnings reset for @${String(target).split('@')[0]}.`,
      mentions: [target]
    }, { quoted: ctx.msg });
  }
};
