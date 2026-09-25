import config from '../../config/config.js';
import { firstTarget } from '../../lib/utils.js';

export default {
  name: 'warnings',
  aliases: ['warns'],
  category: 'admin',
  description: 'Check warning count for a user',
  usage: '.warnings @user',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    const target = firstTarget(ctx) || ctx.sender;
    const count = ctx.db.getWarnings(ctx.chat, target);
    const max = ctx.db.getSettings().maxWarnings || config.maxWarnings;
    await ctx.sock.sendMessage(ctx.chat, {
      text: `@${String(target).split('@')[0]} has ${count}/${max} warnings.`,
      mentions: [target]
    }, { quoted: ctx.msg });
  }
};
