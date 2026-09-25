import config from '../../config/config.js';
import { box, runtimeSinceStart } from '../../lib/utils.js';

export default {
  name: 'status',
  aliases: ['stat'],
  category: 'general',
  description: 'Show current bot status',
  usage: '.status',
  permission: 'USER',
  async execute(ctx) {
    const settings = ctx.db.getSettings();
    await ctx.reply(box('STATUS', [
      'Connection : Online',
      `Mode       : ${(settings.mode || config.mode).toUpperCase()}`,
      `Prefix     : ${settings.prefix || config.prefix}`,
      `Uptime     : ${runtimeSinceStart()}`
    ]));
  }
};
