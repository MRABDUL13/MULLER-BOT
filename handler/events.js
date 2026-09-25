import { isJidGroup } from 'baileys';
import { db } from '../lib/database.js';
import logger from '../lib/logger.js';
import { store } from '../lib/store.js';
import { containsGroupLink } from '../lib/utils.js';
import { botJid, isGroupAdmin, isOwnerJid, senderJid } from '../lib/permissions.js';
import { normalizeMessage } from './message.js';
import { handleMessage } from './handler.js';
import config from '../config/config.js';

function mentionText(jid, template, groupName) {
  return String(template || '')
    .replaceAll('{group}', groupName || 'this group')
    .replaceAll('@user', `@${String(jid).split('@')[0]}`);
}

async function handleAntilink(sock, raw) {
  const normalized = normalizeMessage(raw);
  if (!normalized?.isGroup || !normalized.text) return false;
  if (!containsGroupLink(normalized.text)) return false;

  const settings = db.getGroup(normalized.chat);
  if (!settings.antilink) return false;

  const sender = senderJid(raw);
  if (raw.key.fromMe || isOwnerJid(sender) || sender === botJid(sock)) return false;

  const metadata = await store.getGroupMetadata(sock, normalized.chat);
  if (config.antilinkIgnoreAdmins && isGroupAdmin(metadata, sender)) return false;

  try {
    await sock.sendMessage(normalized.chat, { delete: raw.key });
  } catch (error) {
    logger.warn('Failed to delete antilink message', { error: error.message });
  }

  const count = await db.incrementWarnings(normalized.chat, sender);
  const max = db.getSettings().maxWarnings || config.maxWarnings;
  await sock.sendMessage(normalized.chat, {
    text: `Group links are not allowed.\nWarning ${count}/${max}`,
    mentions: [sender]
  });

  if ((settings.antilinkKick || config.antilinkKick) && count >= max) {
    try {
      await sock.groupParticipantsUpdate(normalized.chat, [sender], 'remove');
      await db.resetWarnings(normalized.chat, sender);
    } catch (error) {
      logger.warn('Failed to remove user after antilink threshold', { error: error.message });
    }
  }
  return true;
}

export function bindEvents(sock) {
  sock.ev.on('messages.upsert', async ({ messages = [], type }) => {
    if (type !== 'notify' && type !== 'append') return;
    for (const raw of messages) {
      try {
        if (!raw?.message || raw.key?.remoteJid === 'status@broadcast') continue;
        store.saveMessage(raw);
        const blocked = await handleAntilink(sock, raw);
        if (blocked) continue;
        await handleMessage(sock, raw);
      } catch (error) {
        logger.error('Failed to process incoming message', { error: error.message });
      }
    }
  });

  sock.ev.on('group-participants.update', async (event) => {
    try {
      if (!event?.id || !isJidGroup(event.id)) return;
      const metadata = await store.getGroupMetadata(sock, event.id);
      if (metadata) store.setGroup(event.id, metadata);
      const settings = db.getGroup(event.id);
      const groupName = metadata?.subject || 'the group';
      const participants = event.participants || [];

      if (event.action === 'add' && settings.welcome) {
        for (const user of participants) {
          const text = mentionText(user, settings.welcomeMsg, groupName);
          await sock.sendMessage(event.id, { text, mentions: [user] });
        }
      }

      if (event.action === 'remove' && settings.goodbye) {
        for (const user of participants) {
          const text = mentionText(user, settings.goodbyeMsg, groupName);
          await sock.sendMessage(event.id, { text, mentions: [user] });
        }
      }
    } catch (error) {
      logger.error('Failed to handle group participant update', { error: error.message });
    }
  });

  sock.ev.on('groups.update', async (updates = []) => {
    for (const update of updates) {
      if (!update?.id) continue;
      const metadata = await store.getGroupMetadata(sock, update.id);
      if (metadata) store.setGroup(update.id, metadata);
    }
  });

}
