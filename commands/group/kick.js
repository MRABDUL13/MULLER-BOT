import { firstTarget } from '../../lib/utils.js';
import { isOwnerJid } from '../../lib/permissions.js';

export default {
  name: 'kick',
  aliases: ['remove'],
  category: 'group',
  description: 'Remove a member from the group',
  usage: '.kick @user',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  botAdmin: true,
  async execute(ctx) {
    const target = firstTarget(ctx);
    if (!target) {
      await ctx.reply('Mention a user, reply to their message, or provide a number.');
      return;
    }
    if (isOwnerJid(target)) {
      await ctx.reply('I will not remove the bot owner.');
      return;
    }
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [target], 'remove');
      await ctx.reply('Member removed.');
    } catch (error) {
      await ctx.reply('Unable to remove that member. Check my admin permissions.');
    }
  }
};
