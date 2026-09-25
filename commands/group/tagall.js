import { chunk } from '../../lib/utils.js';

export default {
  name: 'tagall',
  aliases: ['everyone', 'all'],
  category: 'group',
  description: 'Mention every group participant',
  usage: '.tagall [message]',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    const metadata = await ctx.store.getGroupMetadata(ctx.sock, ctx.chat);
    if (!metadata) {
      await ctx.reply('Unable to fetch group metadata.');
      return;
    }
    const participants = (metadata.participants || [])
      .map((p) => p.phoneNumber || p.id)
      .filter(Boolean);
    if (!participants.length) {
      await ctx.reply('No participants to mention.');
      return;
    }
    const header = ctx.argText || 'Attention everyone';
    const batches = chunk(participants, 50);
    for (const batch of batches) {
      const lines = batch.map((jid, i) => `${i + 1}. @${String(jid).split('@')[0]}`);
      await ctx.sock.sendMessage(ctx.chat, {
        text: `${header}\n\n${lines.join('\n')}`,
        mentions: batch
      });
    }
  }
};
