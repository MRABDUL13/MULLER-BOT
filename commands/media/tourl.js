import { downloadMediaMessage } from 'baileys';
import { unwrapMessage } from '../../handler/message.js';

const MAX_BYTES = 5 * 1024 * 1024;

export default {
  name: 'tourl',
  aliases: ['url'],
  category: 'media',
  description: 'Show media metadata for a replied file',
  usage: '.tourl',
  permission: 'USER',
  async execute(ctx) {
    const source = ctx.normalized.quoted
      ? { key: ctx.normalized.quotedKey || ctx.msg.key, message: ctx.normalized.quoted }
      : ctx.msg;
    const content = unwrapMessage(source.message);
    const media =
      content?.imageMessage ||
      content?.videoMessage ||
      content?.audioMessage ||
      content?.documentMessage ||
      content?.stickerMessage;
    if (!media) {
      await ctx.reply('Reply to an image, video, audio, document, or sticker.');
      return;
    }
    if (Number(media.fileLength) > MAX_BYTES) {
      await ctx.reply('Media is too large (max 5MB).');
      return;
    }
    try {
      const buffer = await downloadMediaMessage(source, 'buffer', {}, {
        reuploadRequest: ctx.sock.updateMediaMessage
      });
      if (!buffer) {
        await ctx.reply('Unable to download that media.');
        return;
      }
      const mime = media.mimetype || 'application/octet-stream';
      await ctx.reply(
        `Media captured locally.\nType: ${mime}\nSize: ${buffer.length} bytes\nDirect public upload is disabled for safety.`
      );
    } catch {
      await ctx.reply('Failed to process media.');
    }
  }
};
