import { firstTarget, toUserJid } from '../../lib/utils.js';

export default {
  name: 'unblock',
  aliases: [],
  category: 'owner',
  description: 'Unblock a user',
  usage: '.unblock @user',
  permission: 'OWNER',
  async execute(ctx) {
    const target = firstTarget(ctx) || toUserJid(ctx.args[0]);
    if (!target) {
      await ctx.reply('Provide a user to unblock.');
      return;
    }
    try {
      await ctx.sock.updateBlockStatus(target, 'unblock');
      await ctx.reply('User unblocked.');
    } catch {
      await ctx.reply('Unable to unblock that user.');
    }
  }
};
