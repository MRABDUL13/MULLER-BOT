import { box, runtimeSinceStart } from '../../lib/utils.js';

export default {
  name: 'runtime',
  aliases: ['uptime'],
  category: 'general',
  description: 'Display formatted uptime',
  usage: '.runtime',
  permission: 'USER',
  async execute(ctx) {
    await ctx.reply(box('RUNTIME', [`Uptime: ${runtimeSinceStart()}`]));
  }
};
