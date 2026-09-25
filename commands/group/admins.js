export default {
  name: 'admins',
  aliases: ['adminlist'],
  category: 'group',
  description: 'List group admins',
  usage: '.admins',
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
    if (!admins.length) {
      await ctx.reply('No admins found.');
      return;
    }
    const mentions = admins.map((p) => p.phoneNumber || p.id);
    const lines = mentions.map((jid, i) => `${i + 1}. @${String(jid).split('@')[0]}`);
    await ctx.sock.sendMessage(ctx.chat, {
      text: `Group admins:\n${lines.join('\n')}`,
      mentions
    }, { quoted: ctx.msg });
  }
};
