import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import config from '../config/config.js';
import logger from '../lib/logger.js';

const commands = new Map();
const aliases = new Map();

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

export async function loadCommands() {
  commands.clear();
  aliases.clear();
  const files = await walk(config.commandsDir);
  for (const file of files) {
    try {
      const module = await import(`${pathToFileURL(file).href}?v=${Date.now()}`);
      const command = module.default;
      if (!command?.name || typeof command.execute !== 'function') {
        logger.warn('Skipped invalid command file', { file: path.relative(config.commandsDir, file) });
        continue;
      }
      const record = {
        name: String(command.name).toLowerCase(),
        aliases: (command.aliases || []).map((alias) => String(alias).toLowerCase()),
        category: command.category || 'general',
        description: command.description || '',
        usage: command.usage || `${config.prefix}${command.name}`,
        permission: command.permission || 'USER',
        groupOnly: Boolean(command.groupOnly),
        botAdmin: Boolean(command.botAdmin),
        execute: command.execute
      };
      commands.set(record.name, record);
      for (const alias of record.aliases) {
        aliases.set(alias, record.name);
      }
    } catch (error) {
      logger.error('Failed to load command', { file: path.basename(file), error: error.message });
    }
  }
  logger.info(`Loaded ${commands.size} commands`);
  return commands;
}

export function getCommand(name) {
  const key = String(name || '').toLowerCase();
  return commands.get(key) || commands.get(aliases.get(key));
}

export function listCommands() {
  return [...commands.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function commandsByCategory() {
  const grouped = new Map();
  for (const command of listCommands()) {
    if (!grouped.has(command.category)) grouped.set(command.category, []);
    grouped.get(command.category).push(command);
  }
  return grouped;
}

export { commands };
