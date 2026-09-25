import { firstTarget, toUserJid } from '../../lib/utils.js';

export default {
  name: 'block',
  aliases: [],
  category: 'owner',
  description: 'Block a user',
  usage: '.block @user',
  permission: 'OWNER',
  async execute(ctx) {
    const target = firstTarget(ctx) || toUserJid(ctx.args[0]);
    if (!target) {
      await ctx.reply('Provide a user to block.');
      return;
    }
    try {
      await ctx.sock.updateBlockStatus(target, 'block');
      await ctx.reply('User blocked.');
    } catch {
      await ctx.reply('Unable to block that user.');
    }
  }
};
