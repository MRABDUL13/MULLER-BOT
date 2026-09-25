import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '..');

function env(name, fallback = '') {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function envBool(name, fallback = false) {
  const value = env(name, '');
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function envInt(name, fallback) {
  const parsed = Number.parseInt(env(name, ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeNumber(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

const ownerNumber = normalizeNumber(env('OWNER_NUMBER', ''));
const phoneNumber = normalizeNumber(env('PHONE_NUMBER', ownerNumber));

const config = {
  botName: env('BOT_NAME', 'MULLER BOT'),
  ownerNumber,
  phoneNumber,
  prefix: env('PREFIX', '.'),
  mode: env('MODE', 'public').toLowerCase() === 'private' ? 'private' : 'public',
  sessionDir: path.resolve(ROOT_DIR, env('SESSION_DIR', './sessions')),
  logLevel: env('LOG_LEVEL', 'info'),
  authMethod: env('AUTH_METHOD', 'pairing').toLowerCase() === 'qr' ? 'qr' : 'pairing',
  maxWarnings: envInt('MAX_WARNINGS', 3),
  antilinkIgnoreAdmins: envBool('ANTILINK_IGNORE_ADMINS', true),
  antilinkKick: envBool('ANTILINK_KICK', false),
  rateLimitMax: envInt('RATE_LIMIT_MAX', 8),
  rateLimitWindowMs: envInt('RATE_LIMIT_WINDOW_MS', 10000),
  dataDir: path.join(ROOT_DIR, 'data'),
  tmpDir: path.join(ROOT_DIR, 'tmp'),
  commandsDir: path.join(ROOT_DIR, 'commands'),
  version: '1.0.0',
  author: 'MULLER TECH',
  startedAt: Date.now()
};

export function applyPersistedSettings(settings = {}) {
  if (typeof settings.prefix === 'string' && settings.prefix.length > 0) {
    config.prefix = settings.prefix;
  }
  if (settings.mode === 'private' || settings.mode === 'public') {
    config.mode = settings.mode;
  }
  if (Number.isFinite(settings.maxWarnings) && settings.maxWarnings > 0) {
    config.maxWarnings = settings.maxWarnings;
  }
}

export default config;
