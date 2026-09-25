import config from '../../config/config.js';
import { box, runtimeSinceStart } from '../../lib/utils.js';

export default {
  name: 'alive',
  aliases: ['online'],
  category: 'general',
  description: 'Show bot status',
  usage: '.alive',
  permission: 'USER',
  async execute(ctx) {
    const settings = ctx.db.getSettings();
    await ctx.reply(box(config.botName, [
      `Bot    : ${config.botName}`,
      'Status : Online',
      `Uptime : ${runtimeSinceStart()}`,
      `Mode   : ${(settings.mode || config.mode).toUpperCase()}`,
      `Prefix : ${settings.prefix || config.prefix}`
    ]));
  }
};
