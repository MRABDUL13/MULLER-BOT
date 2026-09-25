import config from '../../config/config.js';
import { box, memoryUsageMb, runtimeSinceStart } from '../../lib/utils.js';
import { listCommands } from '../../handler/commands.js';

export default {
  name: 'botinfo',
  aliases: ['info', 'about'],
  category: 'general',
  description: 'Show bot information',
  usage: '.botinfo',
  permission: 'USER',
  async execute(ctx) {
    const settings = ctx.db.getSettings();
    await ctx.reply(box('BOT INFO', [
      `Name     : ${config.botName}`,
      `Version  : ${config.version}`,
      `Runtime  : ${runtimeSinceStart()}`,
      `Commands : ${listCommands().length}`,
      `Prefix   : ${settings.prefix || config.prefix}`,
      `Mode     : ${(settings.mode || config.mode).toUpperCase()}`,
      `Memory   : ${memoryUsageMb()} MB`,
      `Node     : ${process.version}`,
      `Library  : Baileys 7.0.0-rc14`
    ]));
  }
};
