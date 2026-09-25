import { firstTarget } from '../../lib/utils.js';

export default {
  name: 'promote',
  aliases: ['makeadmin'],
  category: 'group',
  description: 'Promote a member to admin',
  usage: '.promote @user',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  botAdmin: true,
  async execute(ctx) {
    const target = firstTarget(ctx);
    if (!target) {
      await ctx.reply('Mention a user or reply to their message.');
      return;
    }
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [target], 'promote');
      await ctx.reply('Member promoted.');
    } catch {
      await ctx.reply('Unable to promote that member.');
    }
  }
};
