import { toUserJid } from '../../lib/utils.js';

export default {
  name: 'add',
  aliases: ['invite'],
  category: 'group',
  description: 'Add a member by phone number',
  usage: '.add 234xxxxxxxxxx',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  botAdmin: true,
  async execute(ctx) {
    const number = String(ctx.args[0] || '').replace(/[^\d]/g, '');
    if (!number) {
      await ctx.reply('Provide a phone number with country code.');
      return;
    }
    const jid = toUserJid(number);
    try {
      const result = await ctx.sock.groupParticipantsUpdate(ctx.chat, [jid], 'add');
      const status = result?.[0]?.status || result?.[0]?.content?.attrs?.error;
      if (String(status) === '403') {
        await ctx.reply('Invite privacy is enabled for that user. Send a group invite instead.');
        return;
      }
      await ctx.reply('Add request sent.');
    } catch {
      await ctx.reply('Unable to add that number.');
    }
  }
};
