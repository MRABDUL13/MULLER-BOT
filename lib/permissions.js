import { isJidGroup } from 'baileys';
import config from '../config/config.js';
import { digitsOf, safeJid } from './utils.js';

export const LEVELS = {
  USER: 0,
  GROUP_ADMIN: 1,
  BOT_ADMIN: 2,
  OWNER: 3
};

export function isOwnerJid(jid) {
  if (!config.ownerNumber) return false;
  return digitsOf(jid) === digitsOf(config.ownerNumber);
}

export function senderJid(msg) {
  const candidates = [
    msg?.key?.participantAlt,
    msg?.key?.remoteJidAlt,
    msg?.key?.participant,
    msg?.key?.remoteJid
  ].filter(Boolean);
  for (const jid of candidates) {
    if (isOwnerJid(jid)) return safeJid(jid);
  }
  return safeJid(candidates[0] || '');
}

function participantId(participant) {
  return participant?.phoneNumber || participant?.id || participant?.jid || '';
}

export function isGroupAdmin(metadata, jid) {
  if (!metadata?.participants) return false;
  const digits = digitsOf(jid);
  return metadata.participants.some((participant) => {
    const id = participantId(participant);
    const admin = participant.admin === 'admin' || participant.admin === 'superadmin';
    return admin && (id === jid || digitsOf(id) === digits);
  });
}

export function botJid(sock) {
  return safeJid(sock.user?.id || sock.user?.lid || '');
}

export function isBotAdmin(metadata, sock) {
  return isGroupAdmin(metadata, botJid(sock));
}

export async function resolvePermission(ctx) {
  const { msg, sock, metadata } = ctx;
  const sender = senderJid(msg);
  if (isOwnerJid(sender) || msg.key.fromMe) {
    return { level: 'OWNER', numeric: LEVELS.OWNER, sender, isOwner: true, isAdmin: true, botAdmin: isBotAdmin(metadata, sock) };
  }

  const inGroup = isJidGroup(msg.key.remoteJid);
  const admin = inGroup && isGroupAdmin(metadata, sender);
  const botAdmin = inGroup && isBotAdmin(metadata, sock);

  if (admin) {
    return { level: 'GROUP_ADMIN', numeric: LEVELS.GROUP_ADMIN, sender, isOwner: false, isAdmin: true, botAdmin };
  }

  return { level: 'USER', numeric: LEVELS.USER, sender, isOwner: false, isAdmin: false, botAdmin };
}

export function hasPermission(userLevel, required = 'USER') {
  const needed = LEVELS[required] ?? LEVELS.USER;
  const current = LEVELS[userLevel] ?? LEVELS.USER;
  return current >= needed;
}

export function permissionDeniedMessage(required) {
  if (required === 'OWNER') return 'This command is restricted to the bot owner.';
  if (required === 'GROUP_ADMIN') return 'This command is restricted to group admins.';
  if (required === 'BOT_ADMIN') return 'I need to be a group admin to run that command.';
  return 'You are not allowed to use this command.';
}
