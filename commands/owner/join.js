import { extractInviteCode } from '../../lib/utils.js';

export default {
  name: 'join',
  aliases: ['joingc'],
  category: 'owner',
  description: 'Join a group via invite link or code',
  usage: '.join https://chat.whatsapp.com/XXXX',
  permission: 'OWNER',
  async execute(ctx) {
    const code = extractInviteCode(ctx.argText);
    if (!code) {
      await ctx.reply('Provide a valid group invite link or code.');
      return;
    }
    try {
      const result = await ctx.sock.groupAcceptInvite(code);
      await ctx.reply(`Joined group: ${result || 'ok'}`);
    } catch {
      await ctx.reply('Unable to join that group.');
    }
  }
};
