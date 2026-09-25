import config, { applyPersistedSettings } from '../../config/config.js';

export default {
  name: 'prefix',
  aliases: ['setprefix'],
  category: 'general',
  description: 'View or change the command prefix',
  usage: '.prefix [symbol]',
  permission: 'OWNER',
  async execute(ctx) {
    const next = (ctx.args[0] || '').trim();
    if (!next) {
      await ctx.reply(`Current prefix: ${ctx.prefix}`);
      return;
    }
    if (next.length > 3) {
      await ctx.reply('Prefix must be 1 to 3 characters.');
      return;
    }
    const settings = await ctx.db.updateSettings({ prefix: next });
    applyPersistedSettings(settings);
    config.prefix = next;
    await ctx.reply(`Prefix updated to: ${next}`);
  }
};
