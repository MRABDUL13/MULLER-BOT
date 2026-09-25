import config from '../../config/config.js';
import { box, toUserJid } from '../../lib/utils.js';

export default {
  name: 'owner',
  aliases: ['creator'],
  category: 'general',
  description: 'Show the configured owner contact',
  usage: '.owner',
  permission: 'USER',
  async execute(ctx) {
    if (!config.ownerNumber) {
      await ctx.reply('Owner number is not configured. Set OWNER_NUMBER in your environment.');
      return;
    }
    const jid = toUserJid(config.ownerNumber);
    await ctx.reply(box('OWNER', [
      `Name : ${config.author}`,
      `User : @${config.ownerNumber}`
    ]), { mentions: [jid] });
  }
};
