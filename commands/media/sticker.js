import fs from 'node:fs/promises';
import path from 'node:path';
import { downloadMediaMessage } from 'baileys';
import config from '../../config/config.js';
import { randomId } from '../../lib/utils.js';
import { unwrapMessage } from '../../handler/message.js';

const MAX_BYTES = 8 * 1024 * 1024;

export default {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  category: 'media',
  description: 'Convert an image or video into a sticker',
  usage: '.sticker',
  permission: 'USER',
  async execute(ctx) {
    const source = ctx.normalized.quoted
      ? { key: ctx.normalized.quotedKey || ctx.msg.key, message: ctx.normalized.quoted }
      : ctx.msg;
    const content = unwrapMessage(source.message);
    const media = content?.imageMessage || content?.videoMessage;
    if (!media) {
      await ctx.reply('Send or reply to an image or short video.');
      return;
    }
    if (Number(media.fileLength) > MAX_BYTES) {
      await ctx.reply('Media is too large (max 8MB).');
      return;
    }
    const tmp = path.join(config.tmpDir, `${randomId()}.bin`);
    try {
      const buffer = await downloadMediaMessage(source, 'buffer', {}, {
        reuploadRequest: ctx.sock.updateMediaMessage
      });
      if (!buffer || buffer.length > MAX_BYTES) {
        await ctx.reply('Unable to download that media.');
        return;
      }
      await fs.writeFile(tmp, buffer);
      await ctx.sock.sendMessage(ctx.chat, {
        sticker: buffer
      }, { quoted: ctx.msg });
    } catch {
      await ctx.reply('Failed to create sticker.');
    } finally {
      await fs.unlink(tmp).catch(() => {});
    }
  }
};
