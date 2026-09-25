import { firstTarget } from '../../lib/utils.js';
import { isOwnerJid } from '../../lib/permissions.js';

export default {
  name: 'demote',
  aliases: ['removeadmin'],
  category: 'group',
  description: 'Demote a group admin',
  usage: '.demote @user',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  botAdmin: true,
  async execute(ctx) {
    const target = firstTarget(ctx);
    if (!target) {
      await ctx.reply('Mention a user or reply to their message.');
      return;
    }
    if (isOwnerJid(target)) {
      await ctx.reply('I will not demote the bot owner.');
      return;
    }
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [target], 'demote');
      await ctx.reply('Member demoted.');
    } catch {
      await ctx.reply('Unable to demote that member.');
    }
  }
};
