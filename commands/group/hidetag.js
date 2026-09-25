export default {
  name: 'hidetag',
  aliases: ['htag', 'hide'],
  category: 'group',
  description: 'Mention participants without listing numbers',
  usage: '.hidetag [message]',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    const metadata = await ctx.store.getGroupMetadata(ctx.sock, ctx.chat);
    if (!metadata) {
      await ctx.reply('Unable to fetch group metadata.');
      return;
    }
    const mentions = (metadata.participants || [])
      .map((p) => p.phoneNumber || p.id)
      .filter(Boolean);
    const text = ctx.argText || 'Announcement';
    await ctx.sock.sendMessage(ctx.chat, { text, mentions }, { quoted: ctx.msg });
  }
};
