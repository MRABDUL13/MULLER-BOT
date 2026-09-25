import config from '../../config/config.js';
import { firstTarget } from '../../lib/utils.js';
import { isOwnerJid } from '../../lib/permissions.js';

export default {
  name: 'warn',
  aliases: [],
  category: 'admin',
  description: 'Warn a group member',
  usage: '.warn @user',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    const target = firstTarget(ctx);
    if (!target) {
      await ctx.reply('Mention a user or reply to their message.');
      return;
    }
    if (isOwnerJid(target)) {
      await ctx.reply('I will not warn the bot owner.');
      return;
    }
    const count = await ctx.db.incrementWarnings(ctx.chat, target);
    const max = ctx.db.getSettings().maxWarnings || config.maxWarnings;
    await ctx.sock.sendMessage(ctx.chat, {
      text: `Warning issued.\nUser: @${String(target).split('@')[0]}\nWarnings: ${count}/${max}`,
      mentions: [target]
    }, { quoted: ctx.msg });
  }
};
