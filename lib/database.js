import fs from 'node:fs/promises';
import path from 'node:path';
import config from '../config/config.js';
import logger from './logger.js';

const DEFAULTS = {
  settings: {
    prefix: config.prefix,
    mode: config.mode,
    maxWarnings: config.maxWarnings
  },
  groups: {},
  warnings: {}
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default class JsonDatabase {
  constructor(dataDir = config.dataDir) {
    this.dataDir = dataDir;
    this.settingsPath = path.join(dataDir, 'settings.json');
    this.warningsPath = path.join(dataDir, 'warnings.json');
    this.data = clone(DEFAULTS);
    this.writeChain = Promise.resolve();
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
    const storedSettings = await this.#readFile(this.settingsPath, DEFAULTS.settings);
    this.data.groups = storedSettings.groups || {};
    const settings = { ...storedSettings };
    delete settings.groups;
    this.data.settings = { ...DEFAULTS.settings, ...settings };
    const storedWarnings = await this.#readFile(this.warningsPath, {});
    this.data.warnings = storedWarnings.warnings || storedWarnings;
    if (!this.data.settings.prefix) this.data.settings.prefix = config.prefix;
    if (!this.data.settings.mode) this.data.settings.mode = config.mode;
    if (!this.data.settings.maxWarnings) this.data.settings.maxWarnings = config.maxWarnings;
    if (!this.data.groups) this.data.groups = {};
    if (!this.data.warnings || Array.isArray(this.data.warnings)) this.data.warnings = {};
  }

  getSettings() {
    return clone(this.data.settings);
  }

  async updateSettings(patch) {
    this.data.settings = { ...this.data.settings, ...patch };
    await this.#persist();
    return this.getSettings();
  }

  defaultGroup() {
    return {
      antilink: false,
      antilinkKick: config.antilinkKick,
      welcome: false,
      goodbye: false,
      welcomeMsg: 'Welcome @user to {group}',
      goodbyeMsg: 'Goodbye @user'
    };
  }

  getGroup(jid) {
    if (!this.data.groups[jid]) {
      this.data.groups[jid] = this.defaultGroup();
    }
    return { ...this.defaultGroup(), ...this.data.groups[jid] };
  }

  async updateGroup(jid, patch) {
    const current = this.getGroup(jid);
    this.data.groups[jid] = { ...current, ...patch };
    await this.#persist();
    return this.getGroup(jid);
  }

  getWarnings(groupJid, userJid) {
    return this.data.warnings?.[groupJid]?.[userJid] || 0;
  }

  async setWarnings(groupJid, userJid, count) {
    if (!this.data.warnings[groupJid]) this.data.warnings[groupJid] = {};
    if (count <= 0) {
      delete this.data.warnings[groupJid][userJid];
    } else {
      this.data.warnings[groupJid][userJid] = count;
    }
    await this.#persist();
    return this.getWarnings(groupJid, userJid);
  }

  async incrementWarnings(groupJid, userJid) {
    const next = this.getWarnings(groupJid, userJid) + 1;
    return this.setWarnings(groupJid, userJid, next);
  }

  async resetWarnings(groupJid, userJid) {
    return this.setWarnings(groupJid, userJid, 0);
  }

  async #readFile(filePath, fallback) {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error('Failed to read database file', { file: path.basename(filePath), error: error.message });
      }
      return clone(fallback);
    }
  }

  #persist() {
    this.writeChain = this.writeChain.then(() => this.#flush(), () => this.#flush());
    return this.writeChain;
  }

  async #flush() {
    const settingsPayload = {
      ...this.data.settings,
      groups: this.data.groups
    };
    const warningsPayload = this.data.warnings;
    await fs.writeFile(this.settingsPath, JSON.stringify(settingsPayload, null, 2));
    await fs.writeFile(this.warningsPath, JSON.stringify(warningsPayload, null, 2));
  }
}

export const db = new JsonDatabase();
