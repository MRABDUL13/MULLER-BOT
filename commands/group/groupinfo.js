import { box, displayName } from '../../lib/utils.js';

export default {
  name: 'groupinfo',
  aliases: ['ginfo', 'gi'],
  category: 'group',
  description: 'Show group information',
  usage: '.groupinfo',
  permission: 'USER',
  groupOnly: true,
  async execute(ctx) {
    const metadata = await ctx.store.getGroupMetadata(ctx.sock, ctx.chat);
    if (!metadata) {
      await ctx.reply('Unable to fetch group metadata.');
      return;
    }
    const admins = (metadata.participants || []).filter(
      (p) => p.admin === 'admin' || p.admin === 'superadmin'
    );
    await ctx.reply(box('GROUP INFO', [
      `Name   : ${metadata.subject || 'Unknown'}`,
      `Owner  : ${displayName(metadata.ownerPn || metadata.owner || 'unknown')}`,
      `Members: ${(metadata.participants || []).length}`,
      `Admins : ${admins.length}`,
      `Created: ${metadata.creation ? new Date(metadata.creation * 1000).toISOString().slice(0, 10) : 'unknown'}`,
      `Desc   : ${metadata.desc ? String(metadata.desc).slice(0, 200) : 'None'}`
    ]));
  }
};
