import { parseToggle } from '../../lib/utils.js';

export default {
  name: 'goodbye',
  aliases: ['bye'],
  category: 'admin',
  description: 'Toggle goodbye messages',
  usage: '.goodbye on|off',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    const toggle = parseToggle(ctx.args[0]);
    const current = ctx.db.getGroup(ctx.chat);
    if (toggle === null) {
      await ctx.reply(`Goodbye is currently ${current.goodbye ? 'ON' : 'OFF'}.`);
      return;
    }
    await ctx.db.updateGroup(ctx.chat, { goodbye: toggle });
    await ctx.reply(`Goodbye messages ${toggle ? 'enabled' : 'disabled'}.`);
  }
};
