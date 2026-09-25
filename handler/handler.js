import { isJidGroup } from 'baileys';
import config from '../config/config.js';
import { db } from '../lib/database.js';
import logger from '../lib/logger.js';
import {
  hasPermission,
  permissionDeniedMessage,
  resolvePermission
} from '../lib/permissions.js';
import { store } from '../lib/store.js';
import { getCommand } from './commands.js';
import { normalizeMessage, parseCommand } from './message.js';

const buckets = new Map();

function rateLimited(jid) {
  const now = Date.now();
  const bucket = buckets.get(jid) || [];
  const fresh = bucket.filter((ts) => now - ts < config.rateLimitWindowMs);
  if (fresh.length >= config.rateLimitMax) {
    buckets.set(jid, fresh);
    return true;
  }
  fresh.push(now);
  buckets.set(jid, fresh);
  return false;
}

export async function handleMessage(sock, raw) {
  const normalized = normalizeMessage(raw);
  if (!normalized) return;

  const settings = db.getSettings();
  const prefix = settings.prefix || config.prefix;
  const parsed = parseCommand(normalized.text, prefix);
  if (!parsed) return;

  const command = getCommand(parsed.name);
  if (!command) return;

  const sender = normalized.from;
  const perms = await resolvePermission({
    msg: raw,
    sock,
    metadata: normalized.isGroup ? await store.getGroupMetadata(sock, normalized.chat) : null
  });

  const mode = settings.mode || config.mode;
  if (mode === 'private' && !perms.isOwner && !raw.key.fromMe) {
    return;
  }

  if (rateLimited(sender) && !perms.isOwner) {
    return;
  }

  if (command.groupOnly && !isJidGroup(normalized.chat)) {
    await sock.sendMessage(normalized.chat, { text: 'This command can only be used in groups.' }, { quoted: raw });
    return;
  }

  if (!hasPermission(perms.level, command.permission)) {
    logger.warn('Unauthorized admin command', { command: command.name, sender });
    await sock.sendMessage(normalized.chat, { text: permissionDeniedMessage(command.permission) }, { quoted: raw });
    return;
  }

  if (command.botAdmin && !perms.botAdmin) {
    await sock.sendMessage(normalized.chat, { text: permissionDeniedMessage('BOT_ADMIN') }, { quoted: raw });
    return;
  }

  const ctx = {
    sock,
    msg: raw,
    normalized,
    args: parsed.args,
    argText: parsed.argText,
    prefix,
    command,
    sender,
    chat: normalized.chat,
    isGroup: normalized.isGroup,
    perms,
    db,
    store,
    reply: (text, extra = {}) =>
      sock.sendMessage(normalized.chat, { text, ...extra }, { quoted: raw })
  };

  logger.info(`Command: ${command.name}`);
  try {
    await command.execute(ctx);
  } catch (error) {
    logger.error('Command execution failed', { command: command.name, error: error.message });
    await ctx.reply('Something went wrong while processing that command.');
  }
}
