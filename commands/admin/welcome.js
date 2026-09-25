import { parseToggle } from '../../lib/utils.js';

export default {
  name: 'welcome',
  aliases: [],
  category: 'admin',
  description: 'Toggle welcome messages',
  usage: '.welcome on|off',
  permission: 'GROUP_ADMIN',
  groupOnly: true,
  async execute(ctx) {
    const toggle = parseToggle(ctx.args[0]);
    const current = ctx.db.getGroup(ctx.chat);
    if (toggle === null) {
      await ctx.reply(`Welcome is currently ${current.welcome ? 'ON' : 'OFF'}.`);
      return;
    }
    await ctx.db.updateGroup(ctx.chat, { welcome: toggle });
    await ctx.reply(`Welcome messages ${toggle ? 'enabled' : 'disabled'}.`);
  }
};
