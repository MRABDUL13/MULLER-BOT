import { parseToggle } from '../../lib/utils.js';

export default {
  name: 'antilink',
  aliases: ['nolink'],
  category: 'admin',
  description: 'Toggle anti-link protection',
  usage: '.antilink on|off',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    const toggle = parseToggle(ctx.args[0]);
    const current = ctx.db.getGroup(ctx.chat);
    if (toggle === null) {
      await ctx.reply(`Antilink is currently ${current.antilink ? 'ON' : 'OFF'}.\nUsage: ${ctx.prefix}antilink on|off`);
      return;
    }
    await ctx.db.updateGroup(ctx.chat, { antilink: toggle });
    await ctx.reply(`Antilink ${toggle ? 'enabled' : 'disabled'}.`);
  }
};
