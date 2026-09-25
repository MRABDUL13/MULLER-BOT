import { box } from '../../lib/utils.js';

export default {
  name: 'speed',
  aliases: ['latency'],
  category: 'general',
  description: 'Measure actual response latency',
  usage: '.speed',
  permission: 'USER',
  async execute(ctx) {
    const started = Date.now();
    await ctx.reply(box('SPEED', [`Latency: ${Date.now() - started}ms`]));
  }
};
