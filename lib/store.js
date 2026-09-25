import { isJidGroup } from 'baileys';
import logger from './logger.js';

const GROUP_TTL_MS = 5 * 60 * 1000;

export default class MemoryStore {
  constructor() {
    this.messages = new Map();
    this.contacts = new Map();
    this.groups = new Map();
  }

  bind(ev) {
    ev.on('messages.upsert', ({ messages = [] }) => {
      for (const message of messages) {
        this.saveMessage(message);
      }
    });

    ev.on('contacts.upsert', (contacts = []) => {
      for (const contact of contacts) {
        if (contact?.id) this.contacts.set(contact.id, contact);
      }
    });

    ev.on('contacts.update', (contacts = []) => {
      for (const contact of contacts) {
        if (!contact?.id) continue;
        const current = this.contacts.get(contact.id) || {};
        this.contacts.set(contact.id, { ...current, ...contact });
      }
    });
  }

  saveMessage(message) {
    if (!message?.key?.id) return;
    const jid = message.key.remoteJid;
    if (!this.messages.has(jid)) this.messages.set(jid, new Map());
    const chat = this.messages.get(jid);
    chat.set(message.key.id, message);
    if (chat.size > 200) {
      const first = chat.keys().next().value;
      chat.delete(first);
    }
  }

  getMessage(key) {
    if (!key?.id) return undefined;
    return this.messages.get(key.remoteJid)?.get(key.id);
  }

  setGroup(jid, metadata) {
    this.groups.set(jid, { metadata, ts: Date.now() });
  }

  getCachedGroup(jid) {
    const entry = this.groups.get(jid);
    if (!entry) return null;
    if (Date.now() - entry.ts > GROUP_TTL_MS) {
      this.groups.delete(jid);
      return null;
    }
    return entry.metadata;
  }

  async getGroupMetadata(sock, jid) {
    if (!jid || !isJidGroup(jid)) return null;
    const cached = this.getCachedGroup(jid);
    if (cached) return cached;
    try {
      const metadata = await sock.groupMetadata(jid);
      this.setGroup(jid, metadata);
      return metadata;
    } catch (error) {
      logger.error('Failed to fetch group metadata', { error: error.message });
      return null;
    }
  }
}

export const store = new MemoryStore();
