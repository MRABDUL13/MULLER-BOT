import { randomBytes } from 'node:crypto';
import { jidNormalizedUser } from 'baileys';
import config from '../config/config.js';

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeNumber(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

export function digitsOf(jid = '') {
  return String(jid).split('@')[0].split(':')[0].replace(/[^\d]/g, '');
}

export function toUserJid(input) {
  const number = normalizeNumber(input);
  return number ? `${number}@s.whatsapp.net` : '';
}

export function safeJid(jid) {
  try {
    return jidNormalizedUser(jid) || String(jid || '');
  } catch {
    return String(jid || '');
  }
}

export function formatUptime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

export function runtimeSinceStart() {
  return formatUptime(Date.now() - config.startedAt);
}

export function box(title, lines = []) {
  const content = lines.filter((line) => line !== null && line !== undefined);
  const width = Math.max(
    title.length + 4,
    ...content.map((line) => String(line).replace(/\s+$/g, '').length),
    22
  );
  const top = `╭━━━〔 ${title} 〕${'━'.repeat(Math.max(1, width - title.length - 6))}╮`;
  const bottom = `╰${'━'.repeat(Math.max(3, top.length - 2))}╯`;
  const body = content.map((line) => {
    const text = String(line);
    return `┃ ${text}`;
  });
  return [top, ...body, bottom].join('\n');
}

export function randomId(size = 8) {
  return randomBytes(size).toString('hex');
}

export function parseToggle(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['on', 'enable', 'enabled', 'true', '1', 'yes'].includes(normalized)) return true;
  if (['off', 'disable', 'disabled', 'false', '0', 'no'].includes(normalized)) return false;
  return null;
}

export function extractInviteCode(text = '') {
  const match = String(text).match(/(?:https?:\/\/)?(?:chat\.whatsapp\.com\/)?([A-Za-z0-9]{18,})/);
  return match ? match[1] : '';
}

export function containsGroupLink(text = '') {
  return /(https?:\/\/)?(chat\.whatsapp\.com|wa\.me\/[A-Za-z0-9]+|whatsapp\.com\/invite)\//i.test(
    String(text)
  );
}

export function chunk(list, size) {
  const result = [];
  for (let i = 0; i < list.length; i += size) {
    result.push(list.slice(i, i + size));
  }
  return result;
}

export function displayName(jid) {
  const digits = digitsOf(jid);
  if (digits.length < 4) return 'user';
  return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
}

export function memoryUsageMb() {
  return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
}

export function clampText(text, max = 4000) {
  const value = String(text || '');
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

export function resolveTargets(ctx) {
  const mentioned = (ctx.normalized?.mentions || []).filter(Boolean);
  if (mentioned.length) return mentioned.map(safeJid);
  const quotedParticipant = ctx.normalized?.quotedKey?.participant;
  if (quotedParticipant) return [safeJid(quotedParticipant)];
  return (ctx.args || []).map((arg) => toUserJid(arg)).filter(Boolean);
}

export function firstTarget(ctx) {
  return resolveTargets(ctx)[0] || '';
}
