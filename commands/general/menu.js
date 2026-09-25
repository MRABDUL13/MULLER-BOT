import config from '../../config/config.js';
import { commandsByCategory } from '../../handler/commands.js';
import { displayName } from '../../lib/utils.js';

const TITLES = {
  general: 'GENERAL',
  group: 'GROUP',
  admin: 'SECURITY',
  media: 'MEDIA',
  owner: 'OWNER'
};

function section(title, lines) {
  if (!lines.length) return '';
  return [
    `╭━━━〔 ${title} 〕━━━╮`,
    '┃',
    ...lines.map((line) => `┃ ${line}`),
    '╰━━━━━━━━━━━━━━━━━━━━━━╯'
  ].join('\n');
}

export default {
  name: 'menu',
    aliases: ['list', 'commands'],
  category: 'general',
  description: 'Show available commands',
  usage: '.menu',
  permission: 'USER',
  async execute(ctx) {
    const prefix = ctx.prefix || config.prefix;
    const settings = ctx.db.getSettings();
    const grouped = commandsByCategory();
    const header = section(`✦ ${config.botName} ✦`, [
      config.botName,
      'Smart • Fast • Reliable',
      '',
      `User   : @${displayName(ctx.sender)}`,
      `Mode   : ${(settings.mode || config.mode).toUpperCase()}`,
      'Status : Online'
    ]);

    const blocks = [header];
    for (const [category, title] of Object.entries(TITLES)) {
      const cmds = grouped.get(category) || [];
      if (!cmds.length) continue;
      blocks.push(section(`✦ ${title} ✦`, cmds.map((cmd) => `› ${prefix}${cmd.name}`)));
    }

    blocks.push([
      '╭━━━━━━━━━━━━━━━━━━━━━━╮',
      `┃ ${config.botName}`,
      `┃ Built by ${config.author}`,
      '╰━━━━━━━━━━━━━━━━━━━━━━╯'
    ].join('\n'));
    await ctx.sock.sendMessage(ctx.chat, {
      text: blocks.filter(Boolean).join('\n\n'),
      mentions: [ctx.sender]
    }, { quoted: ctx.msg });
  }
};
