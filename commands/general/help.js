import { getCommand, listCommands } from '../../handler/commands.js';
import config from '../../config/config.js';

export default {
  name: 'help',
  aliases: ['h'],
  category: 'general',
  description: 'Show command help',
  usage: '.help [command]',
  permission: 'USER',
  async execute(ctx) {
    const prefix = ctx.prefix || config.prefix;
    if (ctx.args[0]) {
      const command = getCommand(ctx.args[0].replace(/^\./, ''));
      if (!command) {
        await ctx.reply('Unknown command.');
        return;
      }
      await ctx.reply(
        [
          `Command : ${prefix}${command.name}`,
          `Usage   : ${command.usage}`,
          `Category: ${command.category}`,
          `Access  : ${command.permission}`,
          `About   : ${command.description || 'No description'}`
        ].join('\n')
      );
      return;
    }

    const names = listCommands().map((cmd) => `${prefix}${cmd.name}`);
    await ctx.reply(`Available commands (${names.length}):\n${names.join(', ')}\n\nUse ${prefix}menu for the full menu or ${prefix}help <command> for details.`);
  }
};
