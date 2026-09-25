import { box } from '../../lib/utils.js';
import config from '../../config/config.js';

export default {
  name: 'ping',
  aliases: ['p'],
  category: 'general',
  description: 'Check bot response speed',
  usage: '.ping',
  permission: 'USER',
  async execute(ctx) {
    const start = Date.now();
    const sent = await ctx.reply('Pinging...');
    const speed = Date.now() - start;
    const text = box(config.botName, ['Pong!', `Speed: ${speed}ms`]);
    if (sent?.key) {
      await ctx.sock.sendMessage(ctx.chat, { text, edit: sent.key }).catch(() => ctx.reply(text));
    } else {
      await ctx.reply(text);
    }
  }
};
