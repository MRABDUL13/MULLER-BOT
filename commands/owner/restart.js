import logger from '../../lib/logger.js';

export default {
  name: 'restart',
  aliases: ['reboot'],
  category: 'owner',
  description: 'Restart the bot process',
  usage: '.restart',
  permission: 'OWNER',
  async execute(ctx) {
    await ctx.reply('Restarting...');
    logger.info('Owner requested restart');
    setTimeout(() => process.exit(0), 500);
  }
};
