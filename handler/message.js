import { extractMessageContent, getContentType, isJidGroup } from 'baileys';
import { senderJid } from '../lib/permissions.js';

export function unwrapMessage(message) {
  if (!message) return null;
  return (
    message.ephemeralMessage?.message ||
    message.viewOnceMessage?.message ||
    message.viewOnceMessageV2?.message ||
    message.viewOnceMessageV2Extension?.message ||
    message.documentWithCaptionMessage?.message ||
    message.editedMessage?.message ||
    message
  );
}

export function getText(message) {
  const unwrapped = unwrapMessage(message) || {};
  return (
    unwrapped.conversation ||
    unwrapped.extendedTextMessage?.text ||
    unwrapped.imageMessage?.caption ||
    unwrapped.videoMessage?.caption ||
    unwrapped.documentMessage?.caption ||
    unwrapped.buttonsResponseMessage?.selectedButtonId ||
    unwrapped.listResponseMessage?.singleSelectReply?.selectedRowId ||
    unwrapped.templateButtonReplyMessage?.selectedId ||
    ''
  ).trim();
}

export function getQuoted(message) {
  const unwrapped = unwrapMessage(message);
  return unwrapped?.extendedTextMessage?.contextInfo?.quotedMessage
    || unwrapped?.imageMessage?.contextInfo?.quotedMessage
    || unwrapped?.videoMessage?.contextInfo?.quotedMessage
    || null;
}

export function getMentions(message) {
  const unwrapped = unwrapMessage(message);
  const context =
    unwrapped?.extendedTextMessage?.contextInfo ||
    unwrapped?.imageMessage?.contextInfo ||
    unwrapped?.videoMessage?.contextInfo ||
    {};
  return context.mentionedJid || [];
}

export function getQuotedKey(message) {
  const unwrapped = unwrapMessage(message);
  const context =
    unwrapped?.extendedTextMessage?.contextInfo ||
    unwrapped?.imageMessage?.contextInfo ||
    unwrapped?.videoMessage?.contextInfo ||
    {};
  if (!context.stanzaId) return null;
  return {
    remoteJid: context.remoteJid || message?.key?.remoteJid,
    fromMe: Boolean(context.fromMe),
    id: context.stanzaId,
    participant: context.participant
  };
}

export function normalizeMessage(raw) {
  if (!raw?.message && !raw?.key) return null;
  const content = extractMessageContent(raw.message) || unwrapMessage(raw.message);
  const type = content ? getContentType(content) : null;
  const text = getText(raw.message);
  const chat = raw.key?.remoteJid || '';

  return {
    raw,
    key: raw.key,
    chat,
    from: senderJid(raw),
    fromMe: Boolean(raw.key?.fromMe),
    isGroup: isJidGroup(chat),
    type,
    text,
    mentions: getMentions(raw.message),
    quoted: getQuoted(raw.message),
    quotedKey: getQuotedKey({ ...raw, message: raw.message }),
    content,
    timestamp: Number(raw.messageTimestamp || Date.now() / 1000) * 1000
  };
}

export function parseCommand(text, prefix) {
  if (!text || !prefix || !text.startsWith(prefix)) return null;
  const body = text.slice(prefix.length).trim();
  if (!body) return null;
  const [name, ...rest] = body.split(/\s+/);
  return {
    name: name.toLowerCase(),
    args: rest,
    argText: rest.join(' ').trim(),
    body
  };
}
