import fs from 'node:fs/promises';
import path from 'node:path';
import { downloadMediaMessage } from 'baileys';
import config from '../../config/config.js';
import { randomId } from '../../lib/utils.js';
import { unwrapMessage } from '../../handler/message.js';

const MAX_BYTES = 8 * 1024 * 1024;

export default {
  name: 'toimg',
  aliases: ['toimage', 'img'],
  category: 'media',
  description: 'Convert a sticker into an image',
  usage: '.toimg',
  permission: 'USER',
  async execute(ctx) {
    const source = ctx.normalized.quoted
      ? { key: ctx.normalized.quotedKey || ctx.msg.key, message: ctx.normalized.quoted }
      : ctx.msg;
    const content = unwrapMessage(source.message);
    if (!content?.stickerMessage) {
      await ctx.reply('Reply to a sticker.');
      return;
    }
    if (Number(content.stickerMessage.fileLength) > MAX_BYTES) {
      await ctx.reply('Sticker is too large.');
      return;
    }
    const tmp = path.join(config.tmpDir, `${randomId()}.webp`);
    try {
      const buffer = await downloadMediaMessage(source, 'buffer', {}, {
        reuploadRequest: ctx.sock.updateMediaMessage
      });
      if (!buffer) {
        await ctx.reply('Unable to download that sticker.');
        return;
      }
      await fs.writeFile(tmp, buffer);
      await ctx.sock.sendMessage(ctx.chat, {
        image: buffer,
        caption: 'Converted sticker'
      }, { quoted: ctx.msg });
    } catch {
      await ctx.reply('Failed to convert sticker.');
    } finally {
      await fs.unlink(tmp).catch(() => {});
    }
  }
};
